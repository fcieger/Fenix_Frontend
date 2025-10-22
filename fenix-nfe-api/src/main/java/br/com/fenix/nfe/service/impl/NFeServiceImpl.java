package br.com.fenix.nfe.service.impl;

import br.com.fenix.nfe.api.dto.request.NFeConsultaRequest;
import br.com.fenix.nfe.api.dto.request.NFeRequest;
import br.com.fenix.nfe.api.dto.response.NFeConsultaResponse;
import br.com.fenix.nfe.api.dto.response.NFeResponse;
import br.com.fenix.nfe.api.dto.response.NFeStatusResponse;
import br.com.fenix.nfe.model.entity.EmpresaNFeConfig;
import br.com.fenix.nfe.model.entity.NFeLog;
import br.com.fenix.nfe.model.entity.NFeStatus;
import br.com.fenix.nfe.model.enums.NFeOperacaoEnum;
import br.com.fenix.nfe.model.enums.NFeStatusEnum;
import br.com.fenix.nfe.repository.EmpresaNFeConfigRepository;
import br.com.fenix.nfe.repository.NFeLogRepository;
import br.com.fenix.nfe.repository.NFeStatusRepository;
import br.com.fenix.nfe.service.NFeConfigurationService;
import br.com.fenix.nfe.service.NFeQueueService;
import br.com.fenix.nfe.service.NFeService;
import br.com.fenix.nfe.service.NFeValidationService;
import br.com.fenix.nfe.util.NFeUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementação do serviço principal de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Service
@Transactional
public class NFeServiceImpl implements NFeService {

    private static final Logger logger = LoggerFactory.getLogger(NFeServiceImpl.class);

    @Autowired
    private NFeStatusRepository nfeStatusRepository;

    @Autowired
    private EmpresaNFeConfigRepository empresaConfigRepository;

    @Autowired
    private NFeLogRepository nfeLogRepository;

    @Autowired
    private NFeConfigurationService configService;

    @Autowired
    private NFeValidationService validationService;

    @Autowired
    private NFeQueueService queueService;

    @Override
    public NFeResponse emitirNFe(NFeRequest request) {
        logger.info("Iniciando emissão de NFe para empresa: {}", request.getEmpresaId());
        
        try {
            // Validar empresa
            if (!validarEmpresaHabilitada(request.getEmpresaId())) {
                throw new RuntimeException("Empresa não habilitada para emissão");
            }

            // Validar dados da NFe
            validationService.validarNFeRequest(request);

            // Obter configuração da empresa
            EmpresaNFeConfig config = configService.obterConfiguracaoEmpresa(request.getEmpresaId())
                    .orElseThrow(() -> new RuntimeException("Configuração da empresa não encontrada"));

            // Gerar chave de acesso
            String chaveAcesso = NFeUtil.gerarChaveAcesso(
                    config.getEstado().getCodigoSefaz(),
                    request.getDataEmissao(),
                    config.getCnpj(),
                    request.getSerie(),
                    request.getNumeroNfe(),
                    request.getAmbiente().getCodigoSefaz()
            );

            // Verificar se já existe NFe com essa chave
            if (nfeStatusRepository.findByChaveAcesso(chaveAcesso).isPresent()) {
                throw new RuntimeException("NFe já existe com essa chave de acesso");
            }

            // Criar registro de status
            NFeStatus nfeStatus = new NFeStatus(
                    request.getEmpresaId(),
                    chaveAcesso,
                    request.getNumeroNfe(),
                    request.getSerie(),
                    NFeStatusEnum.PENDENTE,
                    request.getDataEmissao()
            );

            nfeStatus = nfeStatusRepository.save(nfeStatus);

            // Log da operação
            NFeLog log = new NFeLog(
                    nfeStatus.getId(),
                    request.getEmpresaId(),
                    NFeOperacaoEnum.EMITIR,
                    NFeStatusEnum.PENDENTE,
                    "NFe criada e enviada para fila de processamento"
            );
            nfeLogRepository.save(log);

            // Enviar para fila de processamento
            queueService.enviarParaFilaEmitir(request, chaveAcesso, request.getPriority());

            // Atualizar próximo número
            config.incrementarProximoNumero();
            empresaConfigRepository.save(config);

            logger.info("NFe {} enviada para processamento com sucesso", chaveAcesso);

            return converterParaResponse(nfeStatus);

        } catch (Exception e) {
            logger.error("Erro ao emitir NFe para empresa {}: {}", request.getEmpresaId(), e.getMessage(), e);
            throw new RuntimeException("Erro ao emitir NFe: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public NFeStatusResponse consultarStatus(String chaveAcesso, String empresaId) {
        logger.info("Consultando status da NFe: {} para empresa: {}", chaveAcesso, empresaId);
        
        try {
            Optional<NFeStatus> nfeStatus = nfeStatusRepository.findByEmpresaIdAndChaveAcesso(empresaId, chaveAcesso);
            
            if (nfeStatus.isEmpty()) {
                throw new RuntimeException("NFe não encontrada");
            }

            NFeStatus status = nfeStatus.get();
            
            // Log da consulta
            NFeLog log = new NFeLog(
                    status.getId(),
                    empresaId,
                    NFeOperacaoEnum.CONSULTAR_STATUS,
                    status.getStatus(),
                    "Consulta de status realizada"
            );
            nfeLogRepository.save(log);

            return converterParaStatusResponse(status);

        } catch (Exception e) {
            logger.error("Erro ao consultar status da NFe {}: {}", chaveAcesso, e.getMessage(), e);
            throw new RuntimeException("Erro ao consultar status: " + e.getMessage(), e);
        }
    }

    @Override
    public NFeConsultaResponse consultarXml(String chaveAcesso, String empresaId) {
        logger.info("Consultando XML da NFe: {} para empresa: {}", chaveAcesso, empresaId);
        
        try {
            Optional<NFeStatus> nfeStatus = nfeStatusRepository.findByEmpresaIdAndChaveAcesso(empresaId, chaveAcesso);
            
            if (nfeStatus.isEmpty()) {
                throw new RuntimeException("NFe não encontrada");
            }

            NFeStatus status = nfeStatus.get();
            
            if (status.getXmlAutorizado() == null) {
                throw new RuntimeException("XML autorizado não disponível");
            }

            // Log da consulta
            NFeLog log = new NFeLog(
                    status.getId(),
                    empresaId,
                    NFeOperacaoEnum.CONSULTAR_XML,
                    status.getStatus(),
                    "Consulta de XML realizada"
            );
            nfeLogRepository.save(log);

            NFeConsultaResponse response = new NFeConsultaResponse(chaveAcesso, NFeOperacaoEnum.CONSULTAR_XML, status.getStatus());
            response.setXml(status.getXmlAutorizado());
            response.setSucesso(true);
            response.setDataConsulta(LocalDateTime.now());

            return response;

        } catch (Exception e) {
            logger.error("Erro ao consultar XML da NFe {}: {}", chaveAcesso, e.getMessage(), e);
            throw new RuntimeException("Erro ao consultar XML: " + e.getMessage(), e);
        }
    }

    @Override
    public NFeConsultaResponse consultarCadastro(String cnpj, String empresaId) {
        logger.info("Consultando cadastro do CNPJ: {} para empresa: {}", cnpj, empresaId);
        
        try {
            // Enviar para fila de consulta
            queueService.enviarParaFilaConsulta(cnpj, empresaId, NFeOperacaoEnum.CONSULTAR_CADASTRO);

            NFeConsultaResponse response = new NFeConsultaResponse(cnpj, NFeOperacaoEnum.CONSULTAR_CADASTRO, NFeStatusEnum.PROCESSANDO);
            response.setSucesso(true);
            response.setDataConsulta(LocalDateTime.now());

            return response;

        } catch (Exception e) {
            logger.error("Erro ao consultar cadastro do CNPJ {}: {}", cnpj, e.getMessage(), e);
            throw new RuntimeException("Erro ao consultar cadastro: " + e.getMessage(), e);
        }
    }

    @Override
    public NFeConsultaResponse consultarDistribuicao(String cnpj, String empresaId) {
        logger.info("Consultando distribuição do CNPJ: {} para empresa: {}", cnpj, empresaId);
        
        try {
            // Enviar para fila de consulta
            queueService.enviarParaFilaConsulta(cnpj, empresaId, NFeOperacaoEnum.CONSULTAR_DISTRIBUICAO);

            NFeConsultaResponse response = new NFeConsultaResponse(cnpj, NFeOperacaoEnum.CONSULTAR_DISTRIBUICAO, NFeStatusEnum.PROCESSANDO);
            response.setSucesso(true);
            response.setDataConsulta(LocalDateTime.now());

            return response;

        } catch (Exception e) {
            logger.error("Erro ao consultar distribuição do CNPJ {}: {}", cnpj, e.getMessage(), e);
            throw new RuntimeException("Erro ao consultar distribuição: " + e.getMessage(), e);
        }
    }

    @Override
    public NFeResponse cancelarNFe(String chaveAcesso, String motivoCancelamento, String empresaId) {
        logger.info("Cancelando NFe: {} para empresa: {}", chaveAcesso, empresaId);
        
        try {
            Optional<NFeStatus> nfeStatus = nfeStatusRepository.findByEmpresaIdAndChaveAcesso(empresaId, chaveAcesso);
            
            if (nfeStatus.isEmpty()) {
                throw new RuntimeException("NFe não encontrada");
            }

            NFeStatus status = nfeStatus.get();
            
            if (!status.permiteCancelamento()) {
                throw new RuntimeException("NFe não pode ser cancelada no status atual");
            }

            // Enviar para fila de cancelamento
            queueService.enviarParaFilaEvento(chaveAcesso, empresaId, NFeOperacaoEnum.CANCELAR, motivoCancelamento);

            // Log da operação
            NFeLog log = new NFeLog(
                    status.getId(),
                    empresaId,
                    NFeOperacaoEnum.CANCELAR,
                    NFeStatusEnum.PROCESSANDO,
                    "Cancelamento enviado para processamento"
            );
            nfeLogRepository.save(log);

            return converterParaResponse(status);

        } catch (Exception e) {
            logger.error("Erro ao cancelar NFe {}: {}", chaveAcesso, e.getMessage(), e);
            throw new RuntimeException("Erro ao cancelar NFe: " + e.getMessage(), e);
        }
    }

    @Override
    public NFeResponse cartaCorrecao(String chaveAcesso, String correcao, String empresaId) {
        logger.info("Enviando carta de correção para NFe: {} da empresa: {}", chaveAcesso, empresaId);
        
        try {
            Optional<NFeStatus> nfeStatus = nfeStatusRepository.findByEmpresaIdAndChaveAcesso(empresaId, chaveAcesso);
            
            if (nfeStatus.isEmpty()) {
                throw new RuntimeException("NFe não encontrada");
            }

            NFeStatus status = nfeStatus.get();
            
            if (!status.permiteCartaCorrecao()) {
                throw new RuntimeException("NFe não permite carta de correção no status atual");
            }

            // Enviar para fila de evento
            queueService.enviarParaFilaEvento(chaveAcesso, empresaId, NFeOperacaoEnum.CARTA_CORRECAO, correcao);

            // Log da operação
            NFeLog log = new NFeLog(
                    status.getId(),
                    empresaId,
                    NFeOperacaoEnum.CARTA_CORRECAO,
                    NFeStatusEnum.PROCESSANDO,
                    "Carta de correção enviada para processamento"
            );
            nfeLogRepository.save(log);

            return converterParaResponse(status);

        } catch (Exception e) {
            logger.error("Erro ao enviar carta de correção para NFe {}: {}", chaveAcesso, e.getMessage(), e);
            throw new RuntimeException("Erro ao enviar carta de correção: " + e.getMessage(), e);
        }
    }

    @Override
    public NFeResponse manifestacao(String chaveAcesso, String tipoManifestacao, String justificativa, String empresaId) {
        logger.info("Enviando manifestação para NFe: {} da empresa: {}", chaveAcesso, empresaId);
        
        try {
            Optional<NFeStatus> nfeStatus = nfeStatusRepository.findByEmpresaIdAndChaveAcesso(empresaId, chaveAcesso);
            
            if (nfeStatus.isEmpty()) {
                throw new RuntimeException("NFe não encontrada");
            }

            NFeStatus status = nfeStatus.get();

            // Enviar para fila de evento
            queueService.enviarParaFilaEvento(chaveAcesso, empresaId, NFeOperacaoEnum.MANIFESTACAO, tipoManifestacao + "|" + justificativa);

            // Log da operação
            NFeLog log = new NFeLog(
                    status.getId(),
                    empresaId,
                    NFeOperacaoEnum.MANIFESTACAO,
                    NFeStatusEnum.PROCESSANDO,
                    "Manifestação enviada para processamento"
            );
            nfeLogRepository.save(log);

            return converterParaResponse(status);

        } catch (Exception e) {
            logger.error("Erro ao enviar manifestação para NFe {}: {}", chaveAcesso, e.getMessage(), e);
            throw new RuntimeException("Erro ao enviar manifestação: " + e.getMessage(), e);
        }
    }

    @Override
    public NFeResponse inutilizar(String empresaId, Integer serie, Integer numeroInicial, Integer numeroFinal, String justificativa) {
        logger.info("Inutilizando numeração da empresa: {} série: {} números: {}-{}", empresaId, serie, numeroInicial, numeroFinal);
        
        try {
            // Enviar para fila de inutilização
            queueService.enviarParaFilaInutilizacao(empresaId, serie, numeroInicial, numeroFinal, justificativa);

            // Log da operação
            NFeLog log = new NFeLog(
                    null,
                    empresaId,
                    NFeOperacaoEnum.INUTILIZAR,
                    NFeStatusEnum.PROCESSANDO,
                    "Inutilização enviada para processamento"
            );
            nfeLogRepository.save(log);

            NFeResponse response = new NFeResponse();
            response.setEmpresaId(empresaId);
            response.setStatus(NFeStatusEnum.PROCESSANDO);
            response.setCreatedAt(LocalDateTime.now());

            return response;

        } catch (Exception e) {
            logger.error("Erro ao inutilizar numeração da empresa {}: {}", empresaId, e.getMessage(), e);
            throw new RuntimeException("Erro ao inutilizar numeração: " + e.getMessage(), e);
        }
    }

    @Override
    public NFeConsultaResponse validarXml(String xml, String empresaId) {
        logger.info("Validando XML para empresa: {}", empresaId);
        
        try {
            // Validar XML
            validationService.validarXml(xml);

            NFeConsultaResponse response = new NFeConsultaResponse("VALIDACAO", NFeOperacaoEnum.VALIDAR, NFeStatusEnum.AUTORIZADA);
            response.setSucesso(true);
            response.setDataConsulta(LocalDateTime.now());
            response.setObservacoes("XML válido");

            return response;

        } catch (Exception e) {
            logger.error("Erro ao validar XML para empresa {}: {}", empresaId, e.getMessage(), e);
            
            NFeConsultaResponse response = new NFeConsultaResponse("VALIDACAO", NFeOperacaoEnum.VALIDAR, NFeStatusEnum.REJEITADA);
            response.setSucesso(false);
            response.setDataConsulta(LocalDateTime.now());
            response.setObservacoes("XML inválido: " + e.getMessage());
            
            return response;
        }
    }

    @Override
    public NFeConsultaResponse processarConsulta(NFeConsultaRequest request) {
        logger.info("Processando consulta: {} para empresa: {}", request.getTipoConsulta(), request.getEmpresaId());
        
        try {
            switch (request.getTipoConsulta()) {
                case CONSULTAR_STATUS:
                    NFeStatusResponse statusResponse = consultarStatus(request.getChaveAcesso(), request.getEmpresaId());
                    return converterStatusParaConsulta(statusResponse, request.getTipoConsulta());
                    
                case CONSULTAR_XML:
                    return consultarXml(request.getChaveAcesso(), request.getEmpresaId());
                    
                case CONSULTAR_CADASTRO:
                    return consultarCadastro(request.getCnpj(), request.getEmpresaId());
                    
                case CONSULTAR_DISTRIBUICAO:
                    return consultarDistribuicao(request.getCnpj(), request.getEmpresaId());
                    
                default:
                    throw new RuntimeException("Tipo de consulta não suportado");
            }

        } catch (Exception e) {
            logger.error("Erro ao processar consulta: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao processar consulta: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NFeResponse> listarNFe(String empresaId, int page, int size) {
        logger.info("Listando NFe da empresa: {} página: {} tamanho: {}", empresaId, page, size);
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<NFeStatus> nfeStatusPage = nfeStatusRepository.findByEmpresaId(empresaId, pageable);
            
            return nfeStatusPage.getContent().stream()
                    .map(this::converterParaResponse)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            logger.error("Erro ao listar NFe da empresa {}: {}", empresaId, e.getMessage(), e);
            throw new RuntimeException("Erro ao listar NFe: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public NFeResponse buscarPorId(UUID id, String empresaId) {
        logger.info("Buscando NFe por ID: {} da empresa: {}", id, empresaId);
        
        try {
            Optional<NFeStatus> nfeStatus = nfeStatusRepository.findById(id);
            
            if (nfeStatus.isEmpty() || !nfeStatus.get().getEmpresaId().equals(empresaId)) {
                throw new RuntimeException("NFe não encontrada");
            }

            return converterParaResponse(nfeStatus.get());

        } catch (Exception e) {
            logger.error("Erro ao buscar NFe por ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Erro ao buscar NFe: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public NFeResponse buscarPorChaveAcesso(String chaveAcesso, String empresaId) {
        logger.info("Buscando NFe por chave de acesso: {} da empresa: {}", chaveAcesso, empresaId);
        
        try {
            Optional<NFeStatus> nfeStatus = nfeStatusRepository.findByEmpresaIdAndChaveAcesso(empresaId, chaveAcesso);
            
            if (nfeStatus.isEmpty()) {
                throw new RuntimeException("NFe não encontrada");
            }

            return converterParaResponse(nfeStatus.get());

        } catch (Exception e) {
            logger.error("Erro ao buscar NFe por chave de acesso {}: {}", chaveAcesso, e.getMessage(), e);
            throw new RuntimeException("Erro ao buscar NFe: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "nfe:estatisticas", key = "#empresaId")
    public Object obterEstatisticas(String empresaId) {
        logger.info("Obtendo estatísticas da empresa: {}", empresaId);
        
        try {
            return nfeStatusRepository.findEstatisticasByEmpresaId(empresaId);

        } catch (Exception e) {
            logger.error("Erro ao obter estatísticas da empresa {}: {}", empresaId, e.getMessage(), e);
            throw new RuntimeException("Erro ao obter estatísticas: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "nfe:metricas", key = "#empresaId")
    public Object obterMetricasPerformance(String empresaId) {
        logger.info("Obtendo métricas de performance da empresa: {}", empresaId);
        
        try {
            return nfeLogRepository.findEstatisticasPerformanceByEmpresaId(empresaId);

        } catch (Exception e) {
            logger.error("Erro ao obter métricas de performance da empresa {}: {}", empresaId, e.getMessage(), e);
            throw new RuntimeException("Erro ao obter métricas: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Object obterLogs(String empresaId, int page, int size) {
        logger.info("Obtendo logs da empresa: {} página: {} tamanho: {}", empresaId, page, size);
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<NFeLog> logsPage = nfeLogRepository.findByEmpresaIdOrderByCreatedAtDesc(empresaId, pageable);
            
            return logsPage.getContent();

        } catch (Exception e) {
            logger.error("Erro ao obter logs da empresa {}: {}", empresaId, e.getMessage(), e);
            throw new RuntimeException("Erro ao obter logs: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Object obterLogsPorChaveAcesso(String chaveAcesso, String empresaId) {
        logger.info("Obtendo logs da NFe: {} da empresa: {}", chaveAcesso, empresaId);
        
        try {
            Optional<NFeStatus> nfeStatus = nfeStatusRepository.findByEmpresaIdAndChaveAcesso(empresaId, chaveAcesso);
            
            if (nfeStatus.isEmpty()) {
                throw new RuntimeException("NFe não encontrada");
            }

            return nfeLogRepository.findByNfeStatusIdOrderByCreatedAtDesc(nfeStatus.get().getId());

        } catch (Exception e) {
            logger.error("Erro ao obter logs da NFe {}: {}", chaveAcesso, e.getMessage(), e);
            throw new RuntimeException("Erro ao obter logs: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "nfe:configuracao", key = "#empresaId")
    public Object obterConfiguracaoEmpresa(String empresaId) {
        logger.info("Obtendo configuração da empresa: {}", empresaId);
        
        try {
            return configService.obterConfiguracaoEmpresa(empresaId);

        } catch (Exception e) {
            logger.error("Erro ao obter configuração da empresa {}: {}", empresaId, e.getMessage(), e);
            throw new RuntimeException("Erro ao obter configuração: " + e.getMessage(), e);
        }
    }

    @Override
    public Object atualizarConfiguracaoEmpresa(String empresaId, Object configuracoes) {
        logger.info("Atualizando configuração da empresa: {}", empresaId);
        
        try {
            return configService.atualizarConfiguracaoEmpresa(empresaId, configuracoes);

        } catch (Exception e) {
            logger.error("Erro ao atualizar configuração da empresa {}: {}", empresaId, e.getMessage(), e);
            throw new RuntimeException("Erro ao atualizar configuração: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validarEmpresaHabilitada(String empresaId) {
        logger.debug("Validando se empresa está habilitada: {}", empresaId);
        
        try {
            return configService.validarEmpresa(empresaId);

        } catch (Exception e) {
            logger.error("Erro ao validar empresa {}: {}", empresaId, e.getMessage(), e);
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Integer obterProximoNumero(String empresaId, Integer serie) {
        logger.info("Obtendo próximo número para empresa: {} série: {}", empresaId, serie);
        
        try {
            return configService.obterProximoNumero(empresaId, serie);

        } catch (Exception e) {
            logger.error("Erro ao obter próximo número da empresa {}: {}", empresaId, e.getMessage(), e);
            throw new RuntimeException("Erro ao obter próximo número: " + e.getMessage(), e);
        }
    }

    @Override
    public Object obterStatusSaude() {
        logger.info("Obtendo status de saúde do serviço");
        
        try {
            return Map.of(
                    "status", "UP",
                    "timestamp", LocalDateTime.now(),
                    "version", "1.0.0",
                    "database", "UP",
                    "queue", "UP",
                    "cache", "UP"
            );

        } catch (Exception e) {
            logger.error("Erro ao obter status de saúde: {}", e.getMessage(), e);
            return Map.of(
                    "status", "DOWN",
                    "timestamp", LocalDateTime.now(),
                    "error", e.getMessage()
            );
        }
    }

    @Override
    public Object obterVersao() {
        return Map.of(
                "version", "1.0.0",
                "build", "2025-10-22",
                "description", "Fenix NFe API"
        );
    }

    // Métodos auxiliares
    private NFeResponse converterParaResponse(NFeStatus nfeStatus) {
        NFeResponse response = new NFeResponse();
        response.setId(nfeStatus.getId().toString());
        response.setEmpresaId(nfeStatus.getEmpresaId());
        response.setChaveAcesso(nfeStatus.getChaveAcesso());
        response.setNumeroNfe(nfeStatus.getNumeroNfe());
        response.setSerie(nfeStatus.getSerie());
        response.setStatus(nfeStatus.getStatus());
        response.setProtocolo(nfeStatus.getProtocolo());
        response.setXmlNfe(nfeStatus.getXmlNfe());
        response.setXmlAutorizado(nfeStatus.getXmlAutorizado());
        response.setDataEmissao(nfeStatus.getDataEmissao());
        response.setDataAutorizacao(nfeStatus.getDataAutorizacao());
        response.setDataCancelamento(nfeStatus.getDataCancelamento());
        response.setMotivoCancelamento(nfeStatus.getMotivoCancelamento());
        response.setTentativas(nfeStatus.getTentativas());
        response.setProximaTentativa(nfeStatus.getProximaTentativa());
        response.setErros(nfeStatus.getErros());
        response.setCreatedAt(nfeStatus.getCreatedAt());
        response.setUpdatedAt(nfeStatus.getUpdatedAt());
        return response;
    }

    private NFeStatusResponse converterParaStatusResponse(NFeStatus nfeStatus) {
        NFeStatusResponse response = new NFeStatusResponse(nfeStatus.getChaveAcesso(), nfeStatus.getStatus());
        response.setProtocolo(nfeStatus.getProtocolo());
        response.setDataEmissao(nfeStatus.getDataEmissao());
        response.setDataAutorizacao(nfeStatus.getDataAutorizacao());
        response.setDataCancelamento(nfeStatus.getDataCancelamento());
        response.setMotivoCancelamento(nfeStatus.getMotivoCancelamento());
        response.setTentativas(nfeStatus.getTentativas());
        response.setProximaTentativa(nfeStatus.getProximaTentativa());
        response.setErros(nfeStatus.getErros());
        return response;
    }

    private NFeConsultaResponse converterStatusParaConsulta(NFeStatusResponse statusResponse, NFeOperacaoEnum tipoConsulta) {
        NFeConsultaResponse response = new NFeConsultaResponse(
                statusResponse.getChaveAcesso(),
                tipoConsulta,
                statusResponse.getStatus()
        );
        response.setProtocolo(statusResponse.getProtocolo());
        response.setDataEmissao(statusResponse.getDataEmissao());
        response.setDataAutorizacao(statusResponse.getDataAutorizacao());
        response.setDataCancelamento(statusResponse.getDataCancelamento());
        response.setMotivoCancelamento(statusResponse.getMotivoCancelamento());
        response.setErros(statusResponse.getErros());
        response.setSucesso(true);
        response.setDataConsulta(LocalDateTime.now());
        return response;
    }
}

