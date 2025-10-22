package br.com.fenix.nfe.worker;

import br.com.fenix.nfe.model.entity.NFeLog;
import br.com.fenix.nfe.model.enums.NFeStatusEnum;
import br.com.fenix.nfe.model.queue.NFeQueueMessage;
import br.com.fenix.nfe.repository.NFeLogRepository;
import br.com.fenix.nfe.service.NFeQueueService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Worker para processamento de retry de mensagens
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Component
public class NFeRetryWorker {

    private static final Logger logger = LoggerFactory.getLogger(NFeRetryWorker.class);

    @Autowired
    private NFeLogRepository nfeLogRepository;

    @Autowired
    private NFeQueueService queueService;

    /**
     * Processa mensagens da fila de retry
     */
    @RabbitListener(queues = "nfe.retry", concurrency = "2-3")
    public void processarRetry(NFeQueueMessage mensagem) {
        logger.info("Processando retry: {} empresa: {} operação: {} tentativa: {}", 
                   mensagem.getId(), mensagem.getEmpresaId(), mensagem.getOperacao(), mensagem.getTentativas());
        
        try {
            // Verificar se ainda está dentro do prazo de retry
            if (mensagem.getProximaTentativa() != null && 
                LocalDateTime.now().isBefore(mensagem.getProximaTentativa())) {
                
                logger.info("Mensagem {} ainda não está no prazo de retry. Próxima tentativa: {}", 
                           mensagem.getId(), mensagem.getProximaTentativa());
                return;
            }

            // Log da tentativa de retry
            NFeLog log = new NFeLog(
                    null,
                    mensagem.getEmpresaId(),
                    mensagem.getOperacao(),
                    NFeStatusEnum.PROCESSANDO,
                    String.format("Tentativa de retry %d para mensagem %s", 
                                 mensagem.getTentativas(), mensagem.getId())
            );
            nfeLogRepository.save(log);

            // Reenviar para a fila original baseado no tipo de operação
            reenviarParaFilaOriginal(mensagem);

            logger.info("Mensagem {} reenviada para fila original (tentativa {})", 
                       mensagem.getId(), mensagem.getTentativas());

        } catch (Exception e) {
            logger.error("Erro ao processar retry {}: {}", mensagem.getId(), e.getMessage(), e);
            tratarErroRetry(mensagem, e);
        }
    }

    /**
     * Reenvia mensagem para fila original
     */
    private void reenviarParaFilaOriginal(NFeQueueMessage mensagem) {
        try {
            switch (mensagem.getOperacao()) {
                case EMITIR:
                    // Reenviar para fila de emissão baseado na prioridade
                    queueService.enviarParaFilaEmitir(
                        (br.com.fenix.nfe.api.dto.request.NFeRequest) mensagem.getPayload(),
                        mensagem.getChaveAcesso(),
                        mensagem.getPriority()
                    );
                    break;
                    
                case CONSULTAR_STATUS:
                case CONSULTAR_XML:
                case CONSULTAR_CADASTRO:
                case CONSULTAR_DISTRIBUICAO:
                    // Reenviar para fila de consulta
                    queueService.enviarParaFilaConsulta(
                        mensagem.getChaveAcesso(),
                        mensagem.getEmpresaId(),
                        mensagem.getOperacao()
                    );
                    break;
                    
                case CANCELAR:
                case CARTA_CORRECAO:
                case MANIFESTACAO:
                    // Reenviar para fila de evento
                    Map<String, Object> payload = (Map<String, Object>) mensagem.getPayload();
                    String dados = (String) payload.get("dados");
                    queueService.enviarParaFilaEvento(
                        mensagem.getChaveAcesso(),
                        mensagem.getEmpresaId(),
                        mensagem.getOperacao(),
                        dados
                    );
                    break;
                    
                case INUTILIZAR:
                    // Reenviar para fila de inutilização
                    Map<String, Object> inutilizacaoPayload = (Map<String, Object>) mensagem.getPayload();
                    queueService.enviarParaFilaInutilizacao(
                        (String) inutilizacaoPayload.get("empresaId"),
                        (Integer) inutilizacaoPayload.get("serie"),
                        (Integer) inutilizacaoPayload.get("numeroInicial"),
                        (Integer) inutilizacaoPayload.get("numeroFinal"),
                        (String) inutilizacaoPayload.get("justificativa")
                    );
                    break;
                    
                default:
                    throw new RuntimeException("Operação não suportada para retry: " + mensagem.getOperacao());
            }

        } catch (Exception e) {
            logger.error("Erro ao reenviar mensagem {} para fila original: {}", 
                        mensagem.getId(), e.getMessage(), e);
            throw new RuntimeException("Erro ao reenviar mensagem: " + e.getMessage(), e);
        }
    }

    /**
     * Trata erro no retry
     */
    private void tratarErroRetry(NFeQueueMessage mensagem, Exception erro) {
        try {
            // Incrementar tentativas
            mensagem.setTentativas(mensagem.getTentativas() + 1);
            mensagem.setUpdatedAt(LocalDateTime.now());

            // Log do erro
            NFeLog log = new NFeLog(
                    null,
                    mensagem.getEmpresaId(),
                    mensagem.getOperacao(),
                    NFeStatusEnum.ERRO,
                    String.format("Erro no retry %d: %s", mensagem.getTentativas(), erro.getMessage())
            );
            nfeLogRepository.save(log);

            // Verificar se deve enviar para DLQ
            if (mensagem.getTentativas() >= 5) { // Máximo de 5 tentativas no retry
                queueService.enviarParaDLQ(mensagem, "Máximo de tentativas de retry excedido");
                logger.error("Mensagem {} enviada para DLQ após {} tentativas de retry", 
                            mensagem.getId(), mensagem.getTentativas());
            } else {
                // Agendar próxima tentativa com backoff exponencial
                int delayMinutos = (int) Math.pow(2, mensagem.getTentativas()) * 5; // 5, 10, 20, 40 minutos
                mensagem.setProximaTentativa(LocalDateTime.now().plusMinutes(delayMinutos));
                
                // Reenviar para fila de retry
                queueService.enviarParaRetry(mensagem, mensagem.getTentativas());
                
                logger.info("Mensagem {} agendada para próxima tentativa em {} minutos (tentativa {})", 
                           mensagem.getId(), delayMinutos, mensagem.getTentativas());
            }

        } catch (Exception e) {
            logger.error("Erro ao tratar erro do retry {}: {}", mensagem.getId(), e.getMessage(), e);
        }
    }
}
