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
 * Worker para processamento de consultas de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Component
public class NFeConsultaWorker {

    private static final Logger logger = LoggerFactory.getLogger(NFeConsultaWorker.class);

    @Autowired
    private NFeStatusRepository nfeStatusRepository;

    @Autowired
    private NFeLogRepository nfeLogRepository;

    @Autowired
    private NFeConfigurationService configService;

    @Autowired
    private NFeQueueService queueService;

    /**
     * Processa mensagens da fila de consulta
     */
    @RabbitListener(queues = "nfe.consulta", concurrency = "3-5")
    public void processarConsulta(NFeQueueMessage mensagem) {
        logger.info("Processando consulta: {} empresa: {} operação: {}", 
                   mensagem.getId(), mensagem.getEmpresaId(), mensagem.getOperacao());
        
        try {
            switch (mensagem.getOperacao()) {
                case CONSULTAR_STATUS:
                    processarConsultaStatus(mensagem);
                    break;
                case CONSULTAR_XML:
                    processarConsultaXml(mensagem);
                    break;
                case CONSULTAR_CADASTRO:
                    processarConsultaCadastro(mensagem);
                    break;
                case CONSULTAR_DISTRIBUICAO:
                    processarConsultaDistribuicao(mensagem);
                    break;
                default:
                    throw new RuntimeException("Operação de consulta não suportada: " + mensagem.getOperacao());
            }

        } catch (Exception e) {
            logger.error("Erro ao processar consulta {}: {}", mensagem.getId(), e.getMessage(), e);
            tratarErroConsulta(mensagem, e);
        }
    }

    /**
     * Processa consulta de status
     */
    private void processarConsultaStatus(NFeQueueMessage mensagem) {
        try {
            String chaveAcesso = mensagem.getChaveAcesso();
            
            // Buscar NFe no banco
            NFeStatus nfeStatus = nfeStatusRepository.findByChaveAcesso(chaveAcesso)
                    .orElseThrow(() -> new RuntimeException("NFe não encontrada"));

            // Simular consulta na SEFAZ
            String statusSefaz = consultarStatusSefaz(chaveAcesso, mensagem.getEmpresaId());

            // Atualizar status se necessário
            if (!nfeStatus.getStatus().name().equals(statusSefaz)) {
                nfeStatus.setStatus(NFeStatusEnum.valueOf(statusSefaz));
                nfeStatus.setUpdatedAt(LocalDateTime.now());
                nfeStatusRepository.save(nfeStatus);
            }

            // Log da consulta
            NFeLog log = new NFeLog(
                    nfeStatus.getId(),
                    mensagem.getEmpresaId(),
                    NFeOperacaoEnum.CONSULTAR_STATUS,
                    nfeStatus.getStatus(),
                    "Consulta de status realizada com sucesso"
            );
            nfeLogRepository.save(log);

            logger.info("Consulta de status concluída: {} status: {}", chaveAcesso, statusSefaz);

        } catch (Exception e) {
            logger.error("Erro ao processar consulta de status: {}", e.getMessage(), e);
            throw new RuntimeException("Erro na consulta de status: " + e.getMessage(), e);
        }
    }

    /**
     * Processa consulta de XML
     */
    private void processarConsultaXml(NFeQueueMessage mensagem) {
        try {
            String chaveAcesso = mensagem.getChaveAcesso();
            
            // Buscar NFe no banco
            NFeStatus nfeStatus = nfeStatusRepository.findByChaveAcesso(chaveAcesso)
                    .orElseThrow(() -> new RuntimeException("NFe não encontrada"));

            if (nfeStatus.getXmlAutorizado() == null) {
                throw new RuntimeException("XML autorizado não disponível");
            }

            // Simular consulta na SEFAZ para obter XML atualizado
            String xmlAtualizado = consultarXmlSefaz(chaveAcesso, mensagem.getEmpresaId());

            // Atualizar XML se necessário
            if (!nfeStatus.getXmlAutorizado().equals(xmlAtualizado)) {
                nfeStatus.setXmlAutorizado(xmlAtualizado);
                nfeStatus.setUpdatedAt(LocalDateTime.now());
                nfeStatusRepository.save(nfeStatus);
            }

            // Log da consulta
            NFeLog log = new NFeLog(
                    nfeStatus.getId(),
                    mensagem.getEmpresaId(),
                    NFeOperacaoEnum.CONSULTAR_XML,
                    nfeStatus.getStatus(),
                    "Consulta de XML realizada com sucesso"
            );
            nfeLogRepository.save(log);

            logger.info("Consulta de XML concluída: {}", chaveAcesso);

        } catch (Exception e) {
            logger.error("Erro ao processar consulta de XML: {}", e.getMessage(), e);
            throw new RuntimeException("Erro na consulta de XML: " + e.getMessage(), e);
        }
    }

    /**
     * Processa consulta de cadastro
     */
    private void processarConsultaCadastro(NFeQueueMessage mensagem) {
        try {
            Map<String, Object> payload = (Map<String, Object>) mensagem.getPayload();
            String cnpj = (String) payload.get("identificador");

            // Simular consulta de cadastro na SEFAZ
            String dadosCadastro = consultarCadastroSefaz(cnpj, mensagem.getEmpresaId());

            // Log da consulta
            NFeLog log = new NFeLog(
                    null,
                    mensagem.getEmpresaId(),
                    NFeOperacaoEnum.CONSULTAR_CADASTRO,
                    NFeStatusEnum.AUTORIZADA,
                    "Consulta de cadastro realizada com sucesso para CNPJ: " + cnpj
            );
            nfeLogRepository.save(log);

            logger.info("Consulta de cadastro concluída: {}", cnpj);

        } catch (Exception e) {
            logger.error("Erro ao processar consulta de cadastro: {}", e.getMessage(), e);
            throw new RuntimeException("Erro na consulta de cadastro: " + e.getMessage(), e);
        }
    }

    /**
     * Processa consulta de distribuição
     */
    private void processarConsultaDistribuicao(NFeQueueMessage mensagem) {
        try {
            Map<String, Object> payload = (Map<String, Object>) mensagem.getPayload();
            String cnpj = (String) payload.get("identificador");

            // Simular consulta de distribuição na SEFAZ
            String dadosDistribuicao = consultarDistribuicaoSefaz(cnpj, mensagem.getEmpresaId());

            // Log da consulta
            NFeLog log = new NFeLog(
                    null,
                    mensagem.getEmpresaId(),
                    NFeOperacaoEnum.CONSULTAR_DISTRIBUICAO,
                    NFeStatusEnum.AUTORIZADA,
                    "Consulta de distribuição realizada com sucesso para CNPJ: " + cnpj
            );
            nfeLogRepository.save(log);

            logger.info("Consulta de distribuição concluída: {}", cnpj);

        } catch (Exception e) {
            logger.error("Erro ao processar consulta de distribuição: {}", e.getMessage(), e);
            throw new RuntimeException("Erro na consulta de distribuição: " + e.getMessage(), e);
        }
    }

    /**
     * Trata erro na consulta
     */
    private void tratarErroConsulta(NFeQueueMessage mensagem, Exception erro) {
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
                    "Erro na consulta: " + erro.getMessage()
            );
            nfeLogRepository.save(log);

            // Verificar se deve enviar para retry ou DLQ
            if (mensagem.getTentativas() < 3) {
                queueService.enviarParaRetry(mensagem, mensagem.getTentativas());
                logger.info("Consulta {} enviada para retry (tentativa {})", 
                           mensagem.getId(), mensagem.getTentativas());
            } else {
                queueService.enviarParaDLQ(mensagem, "Máximo de tentativas excedido");
                logger.error("Consulta {} enviada para DLQ após {} tentativas", 
                            mensagem.getId(), mensagem.getTentativas());
            }

        } catch (Exception e) {
            logger.error("Erro ao tratar erro da consulta {}: {}", mensagem.getId(), e.getMessage(), e);
        }
    }

    // Métodos auxiliares para simulação de consultas SEFAZ
    private String consultarStatusSefaz(String chaveAcesso, String empresaId) {
        // Simular consulta na SEFAZ
        // Aqui seria implementada a consulta real
        return "AUTORIZADA";
    }

    private String consultarXmlSefaz(String chaveAcesso, String empresaId) {
        // Simular consulta de XML na SEFAZ
        // Aqui seria implementada a consulta real
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?><nfeProc>...</nfeProc>";
    }

    private String consultarCadastroSefaz(String cnpj, String empresaId) {
        // Simular consulta de cadastro na SEFAZ
        // Aqui seria implementada a consulta real
        return "{\"cnpj\":\"" + cnpj + "\",\"razaoSocial\":\"EMPRESA TESTE\"}";
    }

    private String consultarDistribuicaoSefaz(String cnpj, String empresaId) {
        // Simular consulta de distribuição na SEFAZ
        // Aqui seria implementada a consulta real
        return "{\"cnpj\":\"" + cnpj + "\",\"documentos\":[]}";
    }
}
