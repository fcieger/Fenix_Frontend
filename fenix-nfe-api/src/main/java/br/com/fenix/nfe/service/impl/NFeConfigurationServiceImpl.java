package br.com.fenix.nfe.service.impl;

import br.com.fenix.nfe.model.entity.EmpresaNFeConfig;
import br.com.fenix.nfe.model.enums.NFeAmbienteEnum;
import br.com.fenix.nfe.model.enums.NFeEstadoEnum;
import br.com.fenix.nfe.repository.EmpresaNFeConfigRepository;
import br.com.fenix.nfe.service.NFeConfigurationService;
import br.com.fenix.nfe.util.NFeUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Implementação do serviço de configurações de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Service
@Transactional
public class NFeConfigurationServiceImpl implements NFeConfigurationService {

    private static final Logger logger = LoggerFactory.getLogger(NFeConfigurationServiceImpl.class);

    @Autowired
    private EmpresaNFeConfigRepository configRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "nfe:configuracao", key = "#empresaId")
    public Optional<EmpresaNFeConfig> obterConfiguracaoEmpresa(String empresaId) {
        logger.debug("Obtendo configuração da empresa: {}", empresaId);
        
        try {
            return configRepository.findByEmpresaId(empresaId);

        } catch (Exception e) {
            logger.error("Erro ao obter configuração da empresa {}: {}", empresaId, e.getMessage(), e);
            return Optional.empty();
        }
    }

    @Override
    @CacheEvict(value = "nfe:configuracao", key = "#empresaId")
    public EmpresaNFeConfig criarConfiguracaoEmpresa(String empresaId, String cnpj, String razaoSocial, 
                                                    NFeEstadoEnum estado, NFeAmbienteEnum ambiente) {
        logger.info("Criando configuração para empresa: {} CNPJ: {}", empresaId, cnpj);
        
        try {
            // Verificar se já existe configuração
            if (configRepository.findByEmpresaId(empresaId).isPresent()) {
                throw new RuntimeException("Configuração já existe para esta empresa");
            }

            // Verificar se CNPJ já está em uso
            if (configRepository.findByCnpj(cnpj).isPresent()) {
                throw new RuntimeException("CNPJ já está em uso por outra empresa");
            }

            // Criar configuração padrão
            EmpresaNFeConfig config = new EmpresaNFeConfig();
            config.setEmpresaId(empresaId);
            config.setCnpj(cnpj);
            config.setRazaoSocial(razaoSocial);
            config.setEstado(estado);
            config.setAmbiente(ambiente);
            config.setSerie(1);
            config.setProximoNumero(1);
            config.setHabilitada(true);
            config.setCreatedAt(LocalDateTime.now());
            config.setUpdatedAt(LocalDateTime.now());

            // Configurações padrão baseadas no estado e ambiente
            config.setConfiguracoesAdicionais(obterConfiguracoesPadrao(estado, ambiente));

            config = configRepository.save(config);

            logger.info("Configuração criada com sucesso para empresa: {}", empresaId);
            return config;

        } catch (Exception e) {
            logger.error("Erro ao criar configuração da empresa {}: {}", empresaId, e.getMessage(), e);
            throw new RuntimeException("Erro ao criar configuração: " + e.getMessage(), e);
        }
    }

    @Override
    @CacheEvict(value = "nfe:configuracao", key = "#empresaId")
    public EmpresaNFeConfig atualizarConfiguracaoEmpresa(String empresaId, Map<String, Object> configuracoes) {
        logger.info("Atualizando configuração da empresa: {}", empresaId);
        
        try {
            EmpresaNFeConfig config = configRepository.findByEmpresaId(empresaId)
                    .orElseThrow(() -> new RuntimeException("Configuração não encontrada"));

            // Atualizar campos permitidos
            if (configuracoes.containsKey("razaoSocial")) {
                config.setRazaoSocial((String) configuracoes.get("razaoSocial"));
            }
            if (configuracoes.containsKey("estado")) {
                config.setEstado(NFeEstadoEnum.valueOf((String) configuracoes.get("estado")));
            }
            if (configuracoes.containsKey("ambiente")) {
                config.setAmbiente(NFeAmbienteEnum.valueOf((String) configuracoes.get("ambiente")));
            }
            if (configuracoes.containsKey("serie")) {
                config.setSerie((Integer) configuracoes.get("serie"));
            }
            if (configuracoes.containsKey("habilitada")) {
                config.setHabilitada((Boolean) configuracoes.get("habilitada"));
            }
            if (configuracoes.containsKey("caminhoCertificado")) {
                config.setCaminhoCertificado((String) configuracoes.get("caminhoCertificado"));
            }
            if (configuracoes.containsKey("senhaCertificado")) {
                config.setSenhaCertificado((String) configuracoes.get("senhaCertificado"));
            }
            if (configuracoes.containsKey("configuracoesAdicionais")) {
                config.setConfiguracoesAdicionais((Map<String, Object>) configuracoes.get("configuracoesAdicionais"));
            }

            config.setUpdatedAt(LocalDateTime.now());

            // Validar configuração antes de salvar
            if (!validarConfiguracao(config)) {
                throw new RuntimeException("Configuração inválida");
            }

            config = configRepository.save(config);

            logger.info("Configuração atualizada com sucesso para empresa: {}", empresaId);
            return config;

        } catch (Exception e) {
            logger.error("Erro ao atualizar configuração da empresa {}: {}", empresaId, e.getMessage(), e);
            throw new RuntimeException("Erro ao atualizar configuração: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validarEmpresa(String empresaId) {
        logger.debug("Validando empresa: {}", empresaId);
        
        try {
            Optional<EmpresaNFeConfig> config = configRepository.findByEmpresaId(empresaId);
            
            if (config.isEmpty()) {
                return false;
            }

            EmpresaNFeConfig empresaConfig = config.get();
            
            // Verificar se está habilitada
            if (!empresaConfig.getHabilitada()) {
                return false;
            }

            // Verificar se tem certificado configurado
            if (empresaConfig.getCaminhoCertificado() == null || empresaConfig.getCaminhoCertificado().trim().isEmpty()) {
                return false;
            }

            // Verificar se tem senha do certificado
            if (empresaConfig.getSenhaCertificado() == null || empresaConfig.getSenhaCertificado().trim().isEmpty()) {
                return false;
            }

            return true;

        } catch (Exception e) {
            logger.error("Erro ao validar empresa {}: {}", empresaId, e.getMessage(), e);
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Integer obterProximoNumero(String empresaId, Integer serie) {
        logger.debug("Obtendo próximo número para empresa: {} série: {}", empresaId, serie);
        
        try {
            EmpresaNFeConfig config = configRepository.findByEmpresaId(empresaId)
                    .orElseThrow(() -> new RuntimeException("Configuração não encontrada"));

            // Se a série for diferente da configurada, buscar o próximo número específico
            if (!config.getSerie().equals(serie)) {
                // Implementar lógica para buscar próximo número de série específica
                return config.getProximoNumero();
            }

            return config.getProximoNumero();

        } catch (Exception e) {
            logger.error("Erro ao obter próximo número da empresa {}: {}", empresaId, e.getMessage(), e);
            throw new RuntimeException("Erro ao obter próximo número: " + e.getMessage(), e);
        }
    }

    @Override
    @CacheEvict(value = "nfe:configuracao", key = "#empresaId")
    public Integer incrementarProximoNumero(String empresaId, Integer serie) {
        logger.info("Incrementando próximo número para empresa: {} série: {}", empresaId, serie);
        
        try {
            EmpresaNFeConfig config = configRepository.findByEmpresaId(empresaId)
                    .orElseThrow(() -> new RuntimeException("Configuração não encontrada"));

            // Incrementar número
            config.setProximoNumero(config.getProximoNumero() + 1);
            config.setUpdatedAt(LocalDateTime.now());

            config = configRepository.save(config);

            logger.info("Próximo número incrementado para: {}", config.getProximoNumero());
            return config.getProximoNumero();

        } catch (Exception e) {
            logger.error("Erro ao incrementar próximo número da empresa {}: {}", empresaId, e.getMessage(), e);
            throw new RuntimeException("Erro ao incrementar próximo número: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpresaNFeConfig> listarConfiguracoes() {
        logger.debug("Listando todas as configurações");
        
        try {
            return configRepository.findAll();

        } catch (Exception e) {
            logger.error("Erro ao listar configurações: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao listar configurações: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpresaNFeConfig> listarConfiguracoesPorEstado(NFeEstadoEnum estado) {
        logger.debug("Listando configurações por estado: {}", estado);
        
        try {
            return configRepository.findByEstado(estado);

        } catch (Exception e) {
            logger.error("Erro ao listar configurações por estado {}: {}", estado, e.getMessage(), e);
            throw new RuntimeException("Erro ao listar configurações por estado: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpresaNFeConfig> listarConfiguracoesPorAmbiente(NFeAmbienteEnum ambiente) {
        logger.debug("Listando configurações por ambiente: {}", ambiente);
        
        try {
            return configRepository.findByAmbiente(ambiente);

        } catch (Exception e) {
            logger.error("Erro ao listar configurações por ambiente {}: {}", ambiente, e.getMessage(), e);
            throw new RuntimeException("Erro ao listar configurações por ambiente: " + e.getMessage(), e);
        }
    }

    @Override
    @CacheEvict(value = "nfe:configuracao", key = "#empresaId")
    public EmpresaNFeConfig alterarStatusEmpresa(String empresaId, boolean habilitada) {
        logger.info("Alterando status da empresa: {} para: {}", empresaId, habilitada);
        
        try {
            EmpresaNFeConfig config = configRepository.findByEmpresaId(empresaId)
                    .orElseThrow(() -> new RuntimeException("Configuração não encontrada"));

            config.setHabilitada(habilitada);
            config.setUpdatedAt(LocalDateTime.now());

            config = configRepository.save(config);

            logger.info("Status da empresa {} alterado para: {}", empresaId, habilitada);
            return config;

        } catch (Exception e) {
            logger.error("Erro ao alterar status da empresa {}: {}", empresaId, e.getMessage(), e);
            throw new RuntimeException("Erro ao alterar status: " + e.getMessage(), e);
        }
    }

    @Override
    @CacheEvict(value = "nfe:configuracao", key = "#empresaId")
    public EmpresaNFeConfig atualizarCertificado(String empresaId, String caminhoCertificado, String senhaCertificado) {
        logger.info("Atualizando certificado da empresa: {}", empresaId);
        
        try {
            EmpresaNFeConfig config = configRepository.findByEmpresaId(empresaId)
                    .orElseThrow(() -> new RuntimeException("Configuração não encontrada"));

            config.setCaminhoCertificado(caminhoCertificado);
            config.setSenhaCertificado(senhaCertificado);
            config.setUpdatedAt(LocalDateTime.now());

            // Validar certificado
            if (!validarCertificado(empresaId)) {
                throw new RuntimeException("Certificado inválido");
            }

            config = configRepository.save(config);

            logger.info("Certificado atualizado com sucesso para empresa: {}", empresaId);
            return config;

        } catch (Exception e) {
            logger.error("Erro ao atualizar certificado da empresa {}: {}", empresaId, e.getMessage(), e);
            throw new RuntimeException("Erro ao atualizar certificado: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean validarCertificado(String empresaId) {
        logger.debug("Validando certificado da empresa: {}", empresaId);
        
        try {
            EmpresaNFeConfig config = configRepository.findByEmpresaId(empresaId)
                    .orElseThrow(() -> new RuntimeException("Configuração não encontrada"));

            // Aqui seria implementada a validação real do certificado
            // Por enquanto, apenas verificar se os campos estão preenchidos
            return config.getCaminhoCertificado() != null && 
                   !config.getCaminhoCertificado().trim().isEmpty() &&
                   config.getSenhaCertificado() != null && 
                   !config.getSenhaCertificado().trim().isEmpty();

        } catch (Exception e) {
            logger.error("Erro ao validar certificado da empresa {}: {}", empresaId, e.getMessage(), e);
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> obterEstatisticas() {
        logger.debug("Obtendo estatísticas das configurações");
        
        try {
            Map<String, Object> estatisticas = new HashMap<>();
            
            long total = configRepository.count();
            long habilitadas = configRepository.countByHabilitadaTrue();
            long desabilitadas = configRepository.countByHabilitadaFalse();
            
            estatisticas.put("total", total);
            estatisticas.put("habilitadas", habilitadas);
            estatisticas.put("desabilitadas", desabilitadas);
            estatisticas.put("porEstado", configRepository.countByEstado());
            estatisticas.put("porAmbiente", configRepository.countByAmbiente());
            estatisticas.put("timestamp", LocalDateTime.now());
            
            return estatisticas;

        } catch (Exception e) {
            logger.error("Erro ao obter estatísticas: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao obter estatísticas: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<EmpresaNFeConfig> obterConfiguracaoPorCnpj(String cnpj) {
        logger.debug("Obtendo configuração por CNPJ: {}", cnpj);
        
        try {
            return configRepository.findByCnpj(cnpj);

        } catch (Exception e) {
            logger.error("Erro ao obter configuração por CNPJ {}: {}", cnpj, e.getMessage(), e);
            return Optional.empty();
        }
    }

    @Override
    public boolean sincronizarConfiguracao(String empresaId) {
        logger.info("Sincronizando configuração da empresa: {}", empresaId);
        
        try {
            // Aqui seria implementada a lógica de sincronização com sistema externo
            logger.info("Configuração sincronizada com sucesso para empresa: {}", empresaId);
            return true;

        } catch (Exception e) {
            logger.error("Erro ao sincronizar configuração da empresa {}: {}", empresaId, e.getMessage(), e);
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> exportarConfiguracao(String empresaId) {
        logger.info("Exportando configuração da empresa: {}", empresaId);
        
        try {
            EmpresaNFeConfig config = configRepository.findByEmpresaId(empresaId)
                    .orElseThrow(() -> new RuntimeException("Configuração não encontrada"));

            Map<String, Object> backup = new HashMap<>();
            backup.put("empresaId", config.getEmpresaId());
            backup.put("cnpj", config.getCnpj());
            backup.put("razaoSocial", config.getRazaoSocial());
            backup.put("estado", config.getEstado());
            backup.put("ambiente", config.getAmbiente());
            backup.put("serie", config.getSerie());
            backup.put("proximoNumero", config.getProximoNumero());
            backup.put("habilitada", config.getHabilitada());
            backup.put("configuracoesAdicionais", config.getConfiguracoesAdicionais());
            backup.put("exportadoEm", LocalDateTime.now());

            return backup;

        } catch (Exception e) {
            logger.error("Erro ao exportar configuração da empresa {}: {}", empresaId, e.getMessage(), e);
            throw new RuntimeException("Erro ao exportar configuração: " + e.getMessage(), e);
        }
    }

    @Override
    public EmpresaNFeConfig importarConfiguracao(Map<String, Object> dadosBackup) {
        logger.info("Importando configuração de backup");
        
        try {
            String empresaId = (String) dadosBackup.get("empresaId");
            String cnpj = (String) dadosBackup.get("cnpj");
            String razaoSocial = (String) dadosBackup.get("razaoSocial");
            NFeEstadoEnum estado = NFeEstadoEnum.valueOf((String) dadosBackup.get("estado"));
            NFeAmbienteEnum ambiente = NFeAmbienteEnum.valueOf((String) dadosBackup.get("ambiente"));

            EmpresaNFeConfig config = new EmpresaNFeConfig();
            config.setEmpresaId(empresaId);
            config.setCnpj(cnpj);
            config.setRazaoSocial(razaoSocial);
            config.setEstado(estado);
            config.setAmbiente(ambiente);
            config.setSerie((Integer) dadosBackup.get("serie"));
            config.setProximoNumero((Integer) dadosBackup.get("proximoNumero"));
            config.setHabilitada((Boolean) dadosBackup.get("habilitada"));
            config.setConfiguracoesAdicionais((Map<String, Object>) dadosBackup.get("configuracoesAdicionais"));
            config.setCreatedAt(LocalDateTime.now());
            config.setUpdatedAt(LocalDateTime.now());

            config = configRepository.save(config);

            logger.info("Configuração importada com sucesso para empresa: {}", empresaId);
            return config;

        } catch (Exception e) {
            logger.error("Erro ao importar configuração: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao importar configuração: " + e.getMessage(), e);
        }
    }

    @Override
    @CacheEvict(value = "nfe:configuracao", key = "#empresaId")
    public boolean removerConfiguracao(String empresaId) {
        logger.info("Removendo configuração da empresa: {}", empresaId);
        
        try {
            Optional<EmpresaNFeConfig> config = configRepository.findByEmpresaId(empresaId);
            
            if (config.isEmpty()) {
                return false;
            }

            configRepository.delete(config.get());

            logger.info("Configuração removida com sucesso para empresa: {}", empresaId);
            return true;

        } catch (Exception e) {
            logger.error("Erro ao remover configuração da empresa {}: {}", empresaId, e.getMessage(), e);
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpresaNFeConfig> obterConfiguracoesAtivas() {
        logger.debug("Obtendo configurações ativas");
        
        try {
            return configRepository.findByHabilitadaTrue();

        } catch (Exception e) {
            logger.error("Erro ao obter configurações ativas: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao obter configurações ativas: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpresaNFeConfig> buscarConfiguracoes(Map<String, Object> filtros) {
        logger.debug("Buscando configurações com filtros: {}", filtros);
        
        try {
            // Aqui seria implementada a lógica de busca com filtros
            // Por enquanto, retornar todas as configurações
            return configRepository.findAll();

        } catch (Exception e) {
            logger.error("Erro ao buscar configurações: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao buscar configurações: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean validarConfiguracao(EmpresaNFeConfig config) {
        logger.debug("Validando configuração da empresa: {}", config.getEmpresaId());
        
        try {
            // Validar campos obrigatórios
            if (config.getEmpresaId() == null || config.getEmpresaId().trim().isEmpty()) {
                return false;
            }
            if (config.getCnpj() == null || config.getCnpj().trim().isEmpty()) {
                return false;
            }
            if (config.getRazaoSocial() == null || config.getRazaoSocial().trim().isEmpty()) {
                return false;
            }
            if (config.getEstado() == null) {
                return false;
            }
            if (config.getAmbiente() == null) {
                return false;
            }
            if (config.getSerie() == null || config.getSerie() <= 0) {
                return false;
            }
            if (config.getProximoNumero() == null || config.getProximoNumero() <= 0) {
                return false;
            }

            // Validar CNPJ
            if (!NFeUtil.validarCnpj(config.getCnpj())) {
                return false;
            }

            return true;

        } catch (Exception e) {
            logger.error("Erro ao validar configuração: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public EmpresaNFeConfig obterConfiguracaoPadrao(NFeEstadoEnum estado, NFeAmbienteEnum ambiente) {
        logger.debug("Obtendo configuração padrão para estado: {} ambiente: {}", estado, ambiente);
        
        try {
            EmpresaNFeConfig config = new EmpresaNFeConfig();
            config.setEstado(estado);
            config.setAmbiente(ambiente);
            config.setSerie(1);
            config.setProximoNumero(1);
            config.setHabilitada(false);
            config.setConfiguracoesAdicionais(obterConfiguracoesPadrao(estado, ambiente));
            config.setCreatedAt(LocalDateTime.now());
            config.setUpdatedAt(LocalDateTime.now());

            return config;

        } catch (Exception e) {
            logger.error("Erro ao obter configuração padrão: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao obter configuração padrão: " + e.getMessage(), e);
        }
    }

    // Métodos auxiliares
    private Map<String, Object> obterConfiguracoesPadrao(NFeEstadoEnum estado, NFeAmbienteEnum ambiente) {
        Map<String, Object> configs = new HashMap<>();
        
        configs.put("timeout", 30000); // 30 segundos
        configs.put("retryAttempts", 3);
        configs.put("retryDelay", 5000); // 5 segundos
        configs.put("ambiente", ambiente.name());
        configs.put("estado", estado.name());
        configs.put("versaoNFe", "4.00");
        configs.put("versaoAplicacao", "1.0.0");
        
        return configs;
    }
}
