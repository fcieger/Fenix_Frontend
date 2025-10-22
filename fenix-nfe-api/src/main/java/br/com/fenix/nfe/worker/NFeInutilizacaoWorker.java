package br.com.fenix.nfe.worker;

import br.com.fenix.nfe.model.entity.NFeLog;
import br.com.fenix.nfe.model.enums.NFeOperacaoEnum;
import br.com.fenix.nfe.model.enums.NFeStatusEnum;
import br.com.fenix.nfe.model.queue.NFeQueueMessage;
import br.com.fenix.nfe.repository.NFeLogRepository;
import br.com.fenix.nfe.service.NFeConfigurationService;
import br.com.fenix.nfe.service.NFeQueueService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Worker para processamento de inutilização de numeração de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Component
public class NFeInutilizacaoWorker {

    private static final Logger logger = LoggerFactory.getLogger(NFeInutilizacaoWorker.class);

    @Autowired
    private NFeLogRepository nfeLogRepository;

    @Autowired
    private NFeConfigurationService configService;

    @Autowired
    private NFeQueueService queueService;

    /**
     * Processa mensagens da fila de inutilização
     */
    @RabbitListener(queues = "nfe.inutilizacao", concurrency = "2-3")
    public void processarInutilizacao(NFeQueueMessage mensagem) {
        logger.info("Processando inutilização: {} empresa: {}", 
                   mensagem.getId(), mensagem.getEmpresaId());
        
        try {
            Map<String, Object> payload = (Map<String, Object>) mensagem.getPayload();
            
            String empresaId = (String) payload.get("empresaId");
            Integer serie = (Integer) payload.get("serie");
            Integer numeroInicial = (Integer) payload.get("numeroInicial");
            Integer numeroFinal = (Integer) payload.get("numeroFinal");
            String justificativa = (String) payload.get("justificativa");

            // Validar dados
            validarDadosInutilizacao(empresaId, serie, numeroInicial, numeroFinal, justificativa);

            // Simular inutilização na SEFAZ
            String protocoloInutilizacao = inutilizarNumeracaoSefaz(empresaId, serie, numeroInicial, 
                                                                   numeroFinal, justificativa);

            // Atualizar próximo número da empresa
            atualizarProximoNumero(empresaId, serie, numeroFinal);

            // Log da inutilização
            NFeLog log = new NFeLog(
                    null,
                    empresaId,
                    NFeOperacaoEnum.INUTILIZAR,
                    NFeStatusEnum.AUTORIZADA,
                    String.format("Inutilização realizada com sucesso. Série: %d, Números: %d-%d, Protocolo: %s", 
                                 serie, numeroInicial, numeroFinal, protocoloInutilizacao)
            );
            nfeLogRepository.save(log);

            logger.info("Inutilização realizada com sucesso: empresa: {} série: {} números: {}-{} protocolo: {}", 
                       empresaId, serie, numeroInicial, numeroFinal, protocoloInutilizacao);

        } catch (Exception e) {
            logger.error("Erro ao processar inutilização {}: {}", mensagem.getId(), e.getMessage(), e);
            tratarErroInutilizacao(mensagem, e);
        }
    }

    /**
     * Valida dados da inutilização
     */
    private void validarDadosInutilizacao(String empresaId, Integer serie, Integer numeroInicial, 
                                        Integer numeroFinal, String justificativa) {
        if (empresaId == null || empresaId.trim().isEmpty()) {
            throw new IllegalArgumentException("ID da empresa é obrigatório");
        }
        
        if (serie == null || serie <= 0) {
            throw new IllegalArgumentException("Série deve ser maior que zero");
        }
        
        if (numeroInicial == null || numeroInicial <= 0) {
            throw new IllegalArgumentException("Número inicial deve ser maior que zero");
        }
        
        if (numeroFinal == null || numeroFinal <= 0) {
            throw new IllegalArgumentException("Número final deve ser maior que zero");
        }
        
        if (numeroInicial > numeroFinal) {
            throw new IllegalArgumentException("Número inicial não pode ser maior que o final");
        }
        
        if (justificativa == null || justificativa.trim().isEmpty()) {
            throw new IllegalArgumentException("Justificativa é obrigatória");
        }
        
        if (justificativa.length() < 15) {
            throw new IllegalArgumentException("Justificativa deve ter pelo menos 15 caracteres");
        }
        
        if (justificativa.length() > 255) {
            throw new IllegalArgumentException("Justificativa deve ter no máximo 255 caracteres");
        }

        // Verificar se empresa está habilitada
        if (!configService.validarEmpresa(empresaId)) {
            throw new RuntimeException("Empresa não habilitada para inutilização");
        }
    }

    /**
     * Atualiza próximo número da empresa
     */
    private void atualizarProximoNumero(String empresaId, Integer serie, Integer numeroFinal) {
        try {
            // Obter próximo número atual
            Integer proximoNumero = configService.obterProximoNumero(empresaId, serie);
            
            // Se o número final é maior que o próximo, atualizar
            if (numeroFinal >= proximoNumero) {
                // Atualizar configuração para o próximo número após o final
                configService.incrementarProximoNumero(empresaId, serie);
                
                logger.info("Próximo número atualizado para empresa: {} série: {} novo número: {}", 
                           empresaId, serie, numeroFinal + 1);
            }

        } catch (Exception e) {
            logger.error("Erro ao atualizar próximo número da empresa {}: {}", empresaId, e.getMessage(), e);
            // Não falhar a inutilização por causa disso
        }
    }

    /**
     * Trata erro na inutilização
     */
    private void tratarErroInutilizacao(NFeQueueMessage mensagem, Exception erro) {
        try {
            // Incrementar tentativas
            mensagem.setTentativas(mensagem.getTentativas() + 1);
            mensagem.setUpdatedAt(LocalDateTime.now());

            // Log do erro
            NFeLog log = new NFeLog(
                    null,
                    mensagem.getEmpresaId(),
                    NFeOperacaoEnum.INUTILIZAR,
                    NFeStatusEnum.ERRO,
                    "Erro na inutilização: " + erro.getMessage()
            );
            nfeLogRepository.save(log);

            // Verificar se deve enviar para retry ou DLQ
            if (mensagem.getTentativas() < 3) {
                queueService.enviarParaRetry(mensagem, mensagem.getTentativas());
                logger.info("Inutilização {} enviada para retry (tentativa {})", 
                           mensagem.getId(), mensagem.getTentativas());
            } else {
                queueService.enviarParaDLQ(mensagem, "Máximo de tentativas excedido");
                logger.error("Inutilização {} enviada para DLQ após {} tentativas", 
                            mensagem.getId(), mensagem.getTentativas());
            }

        } catch (Exception e) {
            logger.error("Erro ao tratar erro da inutilização {}: {}", mensagem.getId(), e.getMessage(), e);
        }
    }

    /**
     * Simula inutilização na SEFAZ
     */
    private String inutilizarNumeracaoSefaz(String empresaId, Integer serie, Integer numeroInicial, 
                                          Integer numeroFinal, String justificativa) {
        try {
            // Obter configuração da empresa
            var config = configService.obterConfiguracaoEmpresa(empresaId);
            if (config.isEmpty()) {
                throw new RuntimeException("Configuração da empresa não encontrada");
            }

            // Aqui seria implementada a inutilização real na SEFAZ
            // Por simplicidade, vamos retornar um protocolo simulado
            String protocolo = "INUT" + System.currentTimeMillis();
            
            logger.info("Inutilização simulada na SEFAZ: empresa: {} série: {} números: {}-{} protocolo: {}", 
                       empresaId, serie, numeroInicial, numeroFinal, protocolo);
            
            return protocolo;

        } catch (Exception e) {
            logger.error("Erro ao inutilizar na SEFAZ: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao inutilizar na SEFAZ: " + e.getMessage(), e);
        }
    }
}
