package br.com.fenix.nfe.worker;

import br.com.fenix.nfe.model.entity.NFeLog;
import br.com.fenix.nfe.model.entity.NFeStatus;
import br.com.fenix.nfe.model.enums.NFeOperacaoEnum;
import br.com.fenix.nfe.model.enums.NFeStatusEnum;
import br.com.fenix.nfe.model.queue.NFeQueueMessage;
import br.com.fenix.nfe.repository.NFeLogRepository;
import br.com.fenix.nfe.repository.NFeStatusRepository;
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
 * Worker para processamento de eventos de NFe (cancelamento, carta correção, manifestação)
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Component
public class NFeEventoWorker {

    private static final Logger logger = LoggerFactory.getLogger(NFeEventoWorker.class);

    @Autowired
    private NFeStatusRepository nfeStatusRepository;

    @Autowired
    private NFeLogRepository nfeLogRepository;

    @Autowired
    private NFeConfigurationService configService;

    @Autowired
    private NFeQueueService queueService;

    /**
     * Processa mensagens da fila de eventos
     */
    @RabbitListener(queues = "nfe.evento", concurrency = "3-5")
    public void processarEvento(NFeQueueMessage mensagem) {
        logger.info("Processando evento: {} empresa: {} operação: {}", 
                   mensagem.getId(), mensagem.getEmpresaId(), mensagem.getOperacao());
        
        try {
            switch (mensagem.getOperacao()) {
                case CANCELAR:
                    processarCancelamento(mensagem);
                    break;
                case CARTA_CORRECAO:
                    processarCartaCorrecao(mensagem);
                    break;
                case MANIFESTACAO:
                    processarManifestacao(mensagem);
                    break;
                default:
                    throw new RuntimeException("Operação de evento não suportada: " + mensagem.getOperacao());
            }

        } catch (Exception e) {
            logger.error("Erro ao processar evento {}: {}", mensagem.getId(), e.getMessage(), e);
            tratarErroEvento(mensagem, e);
        }
    }

    /**
     * Processa cancelamento de NFe
     */
    private void processarCancelamento(NFeQueueMessage mensagem) {
        try {
            String chaveAcesso = mensagem.getChaveAcesso();
            Map<String, Object> payload = (Map<String, Object>) mensagem.getPayload();
            String motivoCancelamento = (String) payload.get("dados");

            // Buscar NFe no banco
            NFeStatus nfeStatus = nfeStatusRepository.findByChaveAcesso(chaveAcesso)
                    .orElseThrow(() -> new RuntimeException("NFe não encontrada"));

            // Verificar se pode ser cancelada
            if (!nfeStatus.permiteCancelamento()) {
                throw new RuntimeException("NFe não pode ser cancelada no status atual: " + nfeStatus.getStatus());
            }

            // Simular cancelamento na SEFAZ
            String protocoloCancelamento = cancelarNFeSefaz(chaveAcesso, motivoCancelamento, mensagem.getEmpresaId());

            // Atualizar status
            nfeStatus.setStatus(NFeStatusEnum.CANCELADA);
            nfeStatus.setMotivoCancelamento(motivoCancelamento);
            nfeStatus.setDataCancelamento(LocalDateTime.now());
            nfeStatus.setUpdatedAt(LocalDateTime.now());
            nfeStatusRepository.save(nfeStatus);

            // Log do cancelamento
            NFeLog log = new NFeLog(
                    nfeStatus.getId(),
                    mensagem.getEmpresaId(),
                    NFeOperacaoEnum.CANCELAR,
                    NFeStatusEnum.CANCELADA,
                    "NFe cancelada com sucesso. Protocolo: " + protocoloCancelamento
            );
            nfeLogRepository.save(log);

            logger.info("NFe cancelada com sucesso: {} protocolo: {}", chaveAcesso, protocoloCancelamento);

        } catch (Exception e) {
            logger.error("Erro ao processar cancelamento: {}", e.getMessage(), e);
            throw new RuntimeException("Erro no cancelamento: " + e.getMessage(), e);
        }
    }

    /**
     * Processa carta de correção
     */
    private void processarCartaCorrecao(NFeQueueMessage mensagem) {
        try {
            String chaveAcesso = mensagem.getChaveAcesso();
            Map<String, Object> payload = (Map<String, Object>) mensagem.getPayload();
            String correcao = (String) payload.get("dados");

            // Buscar NFe no banco
            NFeStatus nfeStatus = nfeStatusRepository.findByChaveAcesso(chaveAcesso)
                    .orElseThrow(() -> new RuntimeException("NFe não encontrada"));

            // Verificar se permite carta de correção
            if (!nfeStatus.permiteCartaCorrecao()) {
                throw new RuntimeException("NFe não permite carta de correção no status atual: " + nfeStatus.getStatus());
            }

            // Simular carta de correção na SEFAZ
            String protocoloCorrecao = enviarCartaCorrecaoSefaz(chaveAcesso, correcao, mensagem.getEmpresaId());

            // Atualizar status (mantém como autorizada, mas registra a correção)
            nfeStatus.setUpdatedAt(LocalDateTime.now());
            nfeStatus.addErro("Carta de correção enviada: " + correcao);
            nfeStatusRepository.save(nfeStatus);

            // Log da carta de correção
            NFeLog log = new NFeLog(
                    nfeStatus.getId(),
                    mensagem.getEmpresaId(),
                    NFeOperacaoEnum.CARTA_CORRECAO,
                    nfeStatus.getStatus(),
                    "Carta de correção enviada com sucesso. Protocolo: " + protocoloCorrecao
            );
            nfeLogRepository.save(log);

            logger.info("Carta de correção enviada com sucesso: {} protocolo: {}", chaveAcesso, protocoloCorrecao);

        } catch (Exception e) {
            logger.error("Erro ao processar carta de correção: {}", e.getMessage(), e);
            throw new RuntimeException("Erro na carta de correção: " + e.getMessage(), e);
        }
    }

    /**
     * Processa manifestação
     */
    private void processarManifestacao(NFeQueueMessage mensagem) {
        try {
            String chaveAcesso = mensagem.getChaveAcesso();
            Map<String, Object> payload = (Map<String, Object>) mensagem.getPayload();
            String dados = (String) payload.get("dados");
            
            // Separar tipo de manifestação e justificativa
            String[] partes = dados.split("\\|");
            String tipoManifestacao = partes[0];
            String justificativa = partes.length > 1 ? partes[1] : "";

            // Buscar NFe no banco
            NFeStatus nfeStatus = nfeStatusRepository.findByChaveAcesso(chaveAcesso)
                    .orElseThrow(() -> new RuntimeException("NFe não encontrada"));

            // Simular manifestação na SEFAZ
            String protocoloManifestacao = enviarManifestacaoSefaz(chaveAcesso, tipoManifestacao, 
                                                                  justificativa, mensagem.getEmpresaId());

            // Atualizar status
            nfeStatus.setUpdatedAt(LocalDateTime.now());
            nfeStatus.addErro("Manifestação enviada: " + tipoManifestacao + " - " + justificativa);
            nfeStatusRepository.save(nfeStatus);

            // Log da manifestação
            NFeLog log = new NFeLog(
                    nfeStatus.getId(),
                    mensagem.getEmpresaId(),
                    NFeOperacaoEnum.MANIFESTACAO,
                    nfeStatus.getStatus(),
                    "Manifestação enviada com sucesso. Tipo: " + tipoManifestacao + 
                    " Protocolo: " + protocoloManifestacao
            );
            nfeLogRepository.save(log);

            logger.info("Manifestação enviada com sucesso: {} tipo: {} protocolo: {}", 
                       chaveAcesso, tipoManifestacao, protocoloManifestacao);

        } catch (Exception e) {
            logger.error("Erro ao processar manifestação: {}", e.getMessage(), e);
            throw new RuntimeException("Erro na manifestação: " + e.getMessage(), e);
        }
    }

    /**
     * Trata erro no evento
     */
    private void tratarErroEvento(NFeQueueMessage mensagem, Exception erro) {
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
                    "Erro no evento: " + erro.getMessage()
            );
            nfeLogRepository.save(log);

            // Verificar se deve enviar para retry ou DLQ
            if (mensagem.getTentativas() < 3) {
                queueService.enviarParaRetry(mensagem, mensagem.getTentativas());
                logger.info("Evento {} enviado para retry (tentativa {})", 
                           mensagem.getId(), mensagem.getTentativas());
            } else {
                queueService.enviarParaDLQ(mensagem, "Máximo de tentativas excedido");
                logger.error("Evento {} enviado para DLQ após {} tentativas", 
                            mensagem.getId(), mensagem.getTentativas());
            }

        } catch (Exception e) {
            logger.error("Erro ao tratar erro do evento {}: {}", mensagem.getId(), e.getMessage(), e);
        }
    }

    // Métodos auxiliares para simulação de operações SEFAZ
    private String cancelarNFeSefaz(String chaveAcesso, String motivo, String empresaId) {
        // Simular cancelamento na SEFAZ
        // Aqui seria implementado o cancelamento real
        return "CANC" + System.currentTimeMillis();
    }

    private String enviarCartaCorrecaoSefaz(String chaveAcesso, String correcao, String empresaId) {
        // Simular carta de correção na SEFAZ
        // Aqui seria implementada a carta de correção real
        return "CCE" + System.currentTimeMillis();
    }

    private String enviarManifestacaoSefaz(String chaveAcesso, String tipo, String justificativa, String empresaId) {
        // Simular manifestação na SEFAZ
        // Aqui seria implementada a manifestação real
        return "MANIF" + System.currentTimeMillis();
    }
}
