package br.com.fenix.nfe.worker;

import br.com.fenix.nfe.model.entity.NFeStatus;
import br.com.fenix.nfe.model.enums.NFeStatusEnum;
import br.com.fenix.nfe.model.queue.NFeQueueMessage;
import br.com.fenix.nfe.repository.NFeStatusRepository;
import br.com.fenix.nfe.service.NFeConfigurationService;
import br.com.fenix.nfe.service.NFeQueueService;
import br.com.fenix.nfe.service.NFeValidationService;
import br.com.fenix.nfe.util.NFeUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Worker para processamento de emissão de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Component
public class NFeEmitirWorker {

    private static final Logger logger = LoggerFactory.getLogger(NFeEmitirWorker.class);

    @Autowired
    private NFeStatusRepository nfeStatusRepository;

    @Autowired
    private NFeConfigurationService configService;

    @Autowired
    private NFeValidationService validationService;

    @Autowired
    private NFeQueueService queueService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Processa mensagens da fila de emissão de alta prioridade
     */
    @RabbitListener(queues = "nfe.emitir.alta", concurrency = "3-5")
    public void processarAltaPrioridade(NFeQueueMessage mensagem) {
        logger.info("Processando NFe de alta prioridade: {} empresa: {}", 
                   mensagem.getId(), mensagem.getEmpresaId());
        processarMensagem(mensagem);
    }

    /**
     * Processa mensagens da fila de emissão de prioridade normal
     */
    @RabbitListener(queues = "nfe.emitir.normal", concurrency = "5-10")
    public void processarPrioridadeNormal(NFeQueueMessage mensagem) {
        logger.info("Processando NFe de prioridade normal: {} empresa: {}", 
                   mensagem.getId(), mensagem.getEmpresaId());
        processarMensagem(mensagem);
    }

    /**
     * Processa mensagens da fila de emissão de baixa prioridade
     */
    @RabbitListener(queues = "nfe.emitir.baixa", concurrency = "2-3")
    public void processarBaixaPrioridade(NFeQueueMessage mensagem) {
        logger.info("Processando NFe de baixa prioridade: {} empresa: {}", 
                   mensagem.getId(), mensagem.getEmpresaId());
        processarMensagem(mensagem);
    }

    /**
     * Processa mensagem de emissão
     */
    private void processarMensagem(NFeQueueMessage mensagem) {
        try {
            // Atualizar status para processando
            atualizarStatus(mensagem, NFeStatusEnum.PROCESSANDO, "Iniciando processamento");

            // Validar empresa
            if (!configService.validarEmpresa(mensagem.getEmpresaId())) {
                throw new RuntimeException("Empresa não habilitada para emissão");
            }

            // Converter payload para NFeRequest
            Map<String, Object> payload = (Map<String, Object>) mensagem.getPayload();
            // Aqui seria feita a conversão do payload para NFeRequest
            // Por simplicidade, vamos simular o processamento

            // Simular geração do XML
            String xmlNfe = gerarXmlNfe(payload);

            // Simular assinatura digital
            String xmlAssinado = assinarXml(xmlNfe, mensagem.getEmpresaId());

            // Simular transmissão para SEFAZ
            String protocolo = transmitirParaSefaz(xmlAssinado, mensagem.getEmpresaId());

            // Atualizar status para autorizada
            atualizarStatusComSucesso(mensagem, xmlNfe, xmlAssinado, protocolo);

            logger.info("NFe processada com sucesso: {} protocolo: {}", 
                       mensagem.getChaveAcesso(), protocolo);

        } catch (Exception e) {
            logger.error("Erro ao processar NFe {}: {}", mensagem.getId(), e.getMessage(), e);
            tratarErro(mensagem, e);
        }
    }

    /**
     * Atualiza status da NFe
     */
    private void atualizarStatus(NFeQueueMessage mensagem, NFeStatusEnum status, String observacao) {
        try {
            NFeStatus nfeStatus = nfeStatusRepository.findByChaveAcesso(mensagem.getChaveAcesso())
                    .orElseThrow(() -> new RuntimeException("NFe não encontrada"));

            nfeStatus.setStatus(status);
            nfeStatus.setUpdatedAt(LocalDateTime.now());
            nfeStatus.addErro(observacao);

            nfeStatusRepository.save(nfeStatus);

        } catch (Exception e) {
            logger.error("Erro ao atualizar status da NFe {}: {}", mensagem.getId(), e.getMessage(), e);
        }
    }

    /**
     * Atualiza status com sucesso
     */
    private void atualizarStatusComSucesso(NFeQueueMessage mensagem, String xmlNfe, 
                                         String xmlAssinado, String protocolo) {
        try {
            NFeStatus nfeStatus = nfeStatusRepository.findByChaveAcesso(mensagem.getChaveAcesso())
                    .orElseThrow(() -> new RuntimeException("NFe não encontrada"));

            nfeStatus.setStatus(NFeStatusEnum.AUTORIZADA);
            nfeStatus.setXmlNfe(xmlNfe);
            nfeStatus.setXmlAutorizado(xmlAssinado);
            nfeStatus.setProtocolo(protocolo);
            nfeStatus.setDataAutorizacao(LocalDateTime.now());
            nfeStatus.setUpdatedAt(LocalDateTime.now());
            nfeStatus.clearErros();

            nfeStatusRepository.save(nfeStatus);

        } catch (Exception e) {
            logger.error("Erro ao atualizar status de sucesso da NFe {}: {}", 
                        mensagem.getId(), e.getMessage(), e);
        }
    }

    /**
     * Trata erro no processamento
     */
    private void tratarErro(NFeQueueMessage mensagem, Exception erro) {
        try {
            // Atualizar status para erro
            atualizarStatus(mensagem, NFeStatusEnum.ERRO, erro.getMessage());

            // Incrementar tentativas
            mensagem.setTentativas(mensagem.getTentativas() + 1);
            mensagem.setUpdatedAt(LocalDateTime.now());

            // Verificar se deve enviar para retry ou DLQ
            if (mensagem.getTentativas() < 3) {
                // Enviar para retry
                queueService.enviarParaRetry(mensagem, mensagem.getTentativas());
                logger.info("NFe {} enviada para retry (tentativa {})", 
                           mensagem.getId(), mensagem.getTentativas());
            } else {
                // Enviar para DLQ
                queueService.enviarParaDLQ(mensagem, "Máximo de tentativas excedido");
                logger.error("NFe {} enviada para DLQ após {} tentativas", 
                            mensagem.getId(), mensagem.getTentativas());
            }

        } catch (Exception e) {
            logger.error("Erro ao tratar erro da NFe {}: {}", mensagem.getId(), e.getMessage(), e);
        }
    }

    /**
     * Gera XML da NFe
     */
    private String gerarXmlNfe(Map<String, Object> payload) {
        // Aqui seria implementada a geração real do XML usando a biblioteca NFe
        // Por simplicidade, vamos retornar um XML simulado
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?><nfeProc>...</nfeProc>";
    }

    /**
     * Assina XML digitalmente
     */
    private String assinarXml(String xml, String empresaId) {
        try {
            // Obter configuração da empresa
            var config = configService.obterConfiguracaoEmpresa(empresaId);
            if (config.isEmpty()) {
                throw new RuntimeException("Configuração da empresa não encontrada");
            }

            // Aqui seria implementada a assinatura digital real
            // Por simplicidade, vamos retornar o XML com assinatura simulada
            return xml.replace("</nfeProc>", "<assinatura>assinado</assinatura></nfeProc>");

        } catch (Exception e) {
            logger.error("Erro ao assinar XML: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao assinar XML: " + e.getMessage(), e);
        }
    }

    /**
     * Transmite XML para SEFAZ
     */
    private String transmitirParaSefaz(String xmlAssinado, String empresaId) {
        try {
            // Obter configuração da empresa
            var config = configService.obterConfiguracaoEmpresa(empresaId);
            if (config.isEmpty()) {
                throw new RuntimeException("Configuração da empresa não encontrada");
            }

            // Aqui seria implementada a transmissão real para SEFAZ
            // Por simplicidade, vamos retornar um protocolo simulado
            return "12345678901234567890";

        } catch (Exception e) {
            logger.error("Erro ao transmitir para SEFAZ: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao transmitir para SEFAZ: " + e.getMessage(), e);
        }
    }
}
