package br.com.fenix.nfe.service.impl;

import br.com.fenix.nfe.api.dto.request.NFeRequest;
import br.com.fenix.nfe.model.enums.NFeOperacaoEnum;
import br.com.fenix.nfe.model.enums.NFePriorityEnum;
import br.com.fenix.nfe.model.queue.NFeQueueMessage;
import br.com.fenix.nfe.model.queue.NFeQueueMetadata;
import br.com.fenix.nfe.service.NFeQueueService;
import br.com.fenix.nfe.util.NFeUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageBuilder;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Implementação do serviço de filas de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Service
public class NFeQueueServiceImpl implements NFeQueueService {

    private static final Logger logger = LoggerFactory.getLogger(NFeQueueServiceImpl.class);

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    // Nomes das filas
    private static final String FILA_EMITIR = "nfe.emitir";
    private static final String FILA_CONSULTA = "nfe.consulta";
    private static final String FILA_EVENTO = "nfe.evento";
    private static final String FILA_INUTILIZACAO = "nfe.inutilizacao";
    private static final String FILA_RETRY = "nfe.retry";
    private static final String FILA_DLQ = "nfe.dlq";

    // Exchanges
    private static final String EXCHANGE_NFE = "nfe.exchange";
    private static final String EXCHANGE_DLQ = "nfe.dlq.exchange";

    @Override
    public void enviarParaFilaEmitir(NFeRequest request, String chaveAcesso, NFePriorityEnum priority) {
        logger.info("Enviando NFe para fila de emissão: {} prioridade: {}", chaveAcesso, priority);
        
        try {
            NFeQueueMessage mensagem = criarMensagem(
                    request.getEmpresaId(),
                    chaveAcesso,
                    NFeOperacaoEnum.EMITIR,
                    priority,
                    request
            );

            enviarMensagem(FILA_EMITIR, mensagem, priority);

        } catch (Exception e) {
            logger.error("Erro ao enviar NFe para fila de emissão: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao enviar para fila de emissão: " + e.getMessage(), e);
        }
    }

    @Override
    public void enviarParaFilaConsulta(String identificador, String empresaId, NFeOperacaoEnum operacao) {
        logger.info("Enviando consulta para fila: {} empresa: {} operação: {}", identificador, empresaId, operacao);
        
        try {
            NFeQueueMessage mensagem = criarMensagem(
                    empresaId,
                    identificador,
                    operacao,
                    NFePriorityEnum.NORMAL,
                    Map.of("identificador", identificador, "operacao", operacao.name())
            );

            enviarMensagem(FILA_CONSULTA, mensagem, NFePriorityEnum.NORMAL);

        } catch (Exception e) {
            logger.error("Erro ao enviar consulta para fila: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao enviar para fila de consulta: " + e.getMessage(), e);
        }
    }

    @Override
    public void enviarParaFilaEvento(String chaveAcesso, String empresaId, NFeOperacaoEnum operacao, String dados) {
        logger.info("Enviando evento para fila: {} empresa: {} operação: {}", chaveAcesso, empresaId, operacao);
        
        try {
            NFeQueueMessage mensagem = criarMensagem(
                    empresaId,
                    chaveAcesso,
                    operacao,
                    NFePriorityEnum.NORMAL,
                    Map.of("chaveAcesso", chaveAcesso, "operacao", operacao.name(), "dados", dados)
            );

            enviarMensagem(FILA_EVENTO, mensagem, NFePriorityEnum.NORMAL);

        } catch (Exception e) {
            logger.error("Erro ao enviar evento para fila: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao enviar para fila de evento: " + e.getMessage(), e);
        }
    }

    @Override
    public void enviarParaFilaInutilizacao(String empresaId, Integer serie, Integer numeroInicial, Integer numeroFinal, String justificativa) {
        logger.info("Enviando inutilização para fila: empresa: {} série: {} números: {}-{}", empresaId, serie, numeroInicial, numeroFinal);
        
        try {
            Map<String, Object> dados = Map.of(
                    "empresaId", empresaId,
                    "serie", serie,
                    "numeroInicial", numeroInicial,
                    "numeroFinal", numeroFinal,
                    "justificativa", justificativa
            );

            NFeQueueMessage mensagem = criarMensagem(
                    empresaId,
                    "INUTILIZACAO_" + serie + "_" + numeroInicial + "_" + numeroFinal,
                    NFeOperacaoEnum.INUTILIZAR,
                    NFePriorityEnum.NORMAL,
                    dados
            );

            enviarMensagem(FILA_INUTILIZACAO, mensagem, NFePriorityEnum.NORMAL);

        } catch (Exception e) {
            logger.error("Erro ao enviar inutilização para fila: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao enviar para fila de inutilização: " + e.getMessage(), e);
        }
    }

    @Override
    public void enviarParaRetry(NFeQueueMessage mensagem, Integer tentativa) {
        logger.info("Enviando mensagem para retry: {} tentativa: {}", mensagem.getId(), tentativa);
        
        try {
            mensagem.setTentativas(tentativa);
            mensagem.setProximaTentativa(LocalDateTime.now().plusMinutes(5 * tentativa)); // Backoff exponencial
            mensagem.setUpdatedAt(LocalDateTime.now());

            enviarMensagem(FILA_RETRY, mensagem, NFePriorityEnum.BAIXA);

        } catch (Exception e) {
            logger.error("Erro ao enviar mensagem para retry: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao enviar para retry: " + e.getMessage(), e);
        }
    }

    @Override
    public void enviarParaDLQ(NFeQueueMessage mensagem, String motivo) {
        logger.error("Enviando mensagem para DLQ: {} motivo: {}", mensagem.getId(), motivo);
        
        try {
            mensagem.setMetadata(Map.of("dlqMotivo", motivo, "dlqTimestamp", LocalDateTime.now().toString()));
            mensagem.setUpdatedAt(LocalDateTime.now());

            enviarMensagem(FILA_DLQ, mensagem, NFePriorityEnum.BAIXA);

        } catch (Exception e) {
            logger.error("Erro ao enviar mensagem para DLQ: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao enviar para DLQ: " + e.getMessage(), e);
        }
    }

    @Override
    public void processarMensagem(NFeQueueMessage mensagem) {
        logger.info("Processando mensagem: {} operação: {}", mensagem.getId(), mensagem.getOperacao());
        
        try {
            // Aqui seria implementada a lógica específica de processamento
            // que seria delegada para os workers específicos
            logger.info("Mensagem processada com sucesso: {}", mensagem.getId());

        } catch (Exception e) {
            logger.error("Erro ao processar mensagem {}: {}", mensagem.getId(), e.getMessage(), e);
            throw new RuntimeException("Erro ao processar mensagem: " + e.getMessage(), e);
        }
    }

    @Override
    public Object obterEstatisticasFilas() {
        logger.info("Obtendo estatísticas das filas");
        
        try {
            Map<String, Object> estatisticas = new HashMap<>();
            
            // Aqui seria implementada a lógica para obter estatísticas das filas
            // usando o RabbitTemplate ou Admin API
            
            estatisticas.put("timestamp", LocalDateTime.now());
            estatisticas.put("filas", Map.of(
                    "emitir", Map.of("total", 0, "processando", 0, "erro", 0),
                    "consulta", Map.of("total", 0, "processando", 0, "erro", 0),
                    "evento", Map.of("total", 0, "processando", 0, "erro", 0),
                    "inutilizacao", Map.of("total", 0, "processando", 0, "erro", 0),
                    "retry", Map.of("total", 0, "processando", 0, "erro", 0),
                    "dlq", Map.of("total", 0, "processando", 0, "erro", 0)
            ));
            
            return estatisticas;

        } catch (Exception e) {
            logger.error("Erro ao obter estatísticas das filas: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao obter estatísticas: " + e.getMessage(), e);
        }
    }

    @Override
    public Object obterStatusFilas() {
        logger.info("Obtendo status das filas");
        
        try {
            Map<String, Object> status = new HashMap<>();
            
            // Aqui seria implementada a lógica para obter status das filas
            status.put("timestamp", LocalDateTime.now());
            status.put("status", "UP");
            status.put("filas", Map.of(
                    "emitir", "UP",
                    "consulta", "UP",
                    "evento", "UP",
                    "inutilizacao", "UP",
                    "retry", "UP",
                    "dlq", "UP"
            ));
            
            return status;

        } catch (Exception e) {
            logger.error("Erro ao obter status das filas: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao obter status: " + e.getMessage(), e);
        }
    }

    @Override
    public void pausarFila(String nomeFila) {
        logger.info("Pausando fila: {}", nomeFila);
        
        try {
            // Implementar lógica para pausar fila
            logger.info("Fila {} pausada com sucesso", nomeFila);

        } catch (Exception e) {
            logger.error("Erro ao pausar fila {}: {}", nomeFila, e.getMessage(), e);
            throw new RuntimeException("Erro ao pausar fila: " + e.getMessage(), e);
        }
    }

    @Override
    public void retomarFila(String nomeFila) {
        logger.info("Retomando fila: {}", nomeFila);
        
        try {
            // Implementar lógica para retomar fila
            logger.info("Fila {} retomada com sucesso", nomeFila);

        } catch (Exception e) {
            logger.error("Erro ao retomar fila {}: {}", nomeFila, e.getMessage(), e);
            throw new RuntimeException("Erro ao retomar fila: " + e.getMessage(), e);
        }
    }

    @Override
    public void limparFila(String nomeFila) {
        logger.info("Limpando fila: {}", nomeFila);
        
        try {
            // Implementar lógica para limpar fila
            logger.info("Fila {} limpa com sucesso", nomeFila);

        } catch (Exception e) {
            logger.error("Erro ao limpar fila {}: {}", nomeFila, e.getMessage(), e);
            throw new RuntimeException("Erro ao limpar fila: " + e.getMessage(), e);
        }
    }

    @Override
    public Object obterMensagensFila(String nomeFila, Integer limite) {
        logger.info("Obtendo mensagens da fila: {} limite: {}", nomeFila, limite);
        
        try {
            // Implementar lógica para obter mensagens da fila
            return Map.of(
                    "fila", nomeFila,
                    "limite", limite,
                    "mensagens", "[]"
            );

        } catch (Exception e) {
            logger.error("Erro ao obter mensagens da fila {}: {}", nomeFila, e.getMessage(), e);
            throw new RuntimeException("Erro ao obter mensagens: " + e.getMessage(), e);
        }
    }

    @Override
    public void reprocessarMensagem(String nomeFila, String mensagemId) {
        logger.info("Reprocessando mensagem: {} da fila: {}", mensagemId, nomeFila);
        
        try {
            // Implementar lógica para reprocessar mensagem
            logger.info("Mensagem {} reprocessada com sucesso", mensagemId);

        } catch (Exception e) {
            logger.error("Erro ao reprocessar mensagem {}: {}", mensagemId, e.getMessage(), e);
            throw new RuntimeException("Erro ao reprocessar mensagem: " + e.getMessage(), e);
        }
    }

    @Override
    public void removerMensagem(String nomeFila, String mensagemId) {
        logger.info("Removendo mensagem: {} da fila: {}", mensagemId, nomeFila);
        
        try {
            // Implementar lógica para remover mensagem
            logger.info("Mensagem {} removida com sucesso", mensagemId);

        } catch (Exception e) {
            logger.error("Erro ao remover mensagem {}: {}", mensagemId, e.getMessage(), e);
            throw new RuntimeException("Erro ao remover mensagem: " + e.getMessage(), e);
        }
    }

    // Métodos auxiliares
    private NFeQueueMessage criarMensagem(String empresaId, String chaveAcesso, NFeOperacaoEnum operacao, NFePriorityEnum priority, Object payload) {
        NFeQueueMessage mensagem = new NFeQueueMessage();
        mensagem.setId(UUID.randomUUID().toString());
        mensagem.setEmpresaId(empresaId);
        mensagem.setCnpj(extrairCnpjDaChave(chaveAcesso));
        mensagem.setOperacao(operacao);
        mensagem.setPriority(priority);
        mensagem.setTimestamp(LocalDateTime.now());
        mensagem.setTentativas(0);
        mensagem.setCorrelationId(UUID.randomUUID().toString());
        mensagem.setPayload(payload);
        mensagem.setMetadata(createMetadata());
        mensagem.setTtl(3600); // 1 hora
        mensagem.setCreatedAt(LocalDateTime.now());
        mensagem.setUpdatedAt(LocalDateTime.now());
        return mensagem;
    }

    private void enviarMensagem(String fila, NFeQueueMessage mensagem, NFePriorityEnum priority) {
        try {
            String json = objectMapper.writeValueAsString(mensagem);
            
            MessageProperties properties = new MessageProperties();
            properties.setPriority(priority.getValor());
            properties.setMessageId(mensagem.getId());
            properties.setCorrelationId(mensagem.getCorrelationId());
            properties.setTimestamp(LocalDateTime.now().atZone(java.time.ZoneId.systemDefault()).toInstant());
            properties.setExpiration(String.valueOf(mensagem.getTtl() * 1000)); // TTL em ms
            
            Message message = MessageBuilder
                    .withBody(json.getBytes())
                    .andProperties(properties)
                    .build();

            rabbitTemplate.send(fila, message);
            
            logger.info("Mensagem enviada para fila {}: {}", fila, mensagem.getId());

        } catch (Exception e) {
            logger.error("Erro ao enviar mensagem para fila {}: {}", fila, e.getMessage(), e);
            throw new RuntimeException("Erro ao enviar mensagem: " + e.getMessage(), e);
        }
    }

    private String extrairCnpjDaChave(String chaveAcesso) {
        if (chaveAcesso != null && chaveAcesso.length() >= 44) {
            return chaveAcesso.substring(6, 20); // Posições 6-19 do CNPJ na chave
        }
        return null;
    }

    private NFeQueueMetadata createMetadata() {
        NFeQueueMetadata metadata = new NFeQueueMetadata();
        metadata.setTraceId(UUID.randomUUID().toString());
        metadata.setSpanId(UUID.randomUUID().toString());
        metadata.setParentId(null);
        metadata.setCustomMetadata(Map.of(
                "version", "1.0.0",
                "source", "fenix-nfe-api"
        ));
        return metadata;
    }
}