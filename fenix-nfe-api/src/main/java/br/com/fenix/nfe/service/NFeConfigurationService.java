package br.com.fenix.nfe.service;

import br.com.fenix.nfe.model.entity.EmpresaNFeConfig;
import br.com.fenix.nfe.model.enums.NFeAmbienteEnum;
import br.com.fenix.nfe.model.enums.NFeEstadoEnum;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Interface para gerenciamento de configurações de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public interface NFeConfigurationService {

    /**
     * Obtém configuração da empresa
     * 
     * @param empresaId ID da empresa
     * @return Configuração da empresa
     */
    Optional<EmpresaNFeConfig> obterConfiguracaoEmpresa(String empresaId);

    /**
     * Cria nova configuração de empresa
     * 
     * @param empresaId ID da empresa
     * @param cnpj CNPJ da empresa
     * @param razaoSocial Razão social
     * @param estado Estado da empresa
     * @param ambiente Ambiente (homologação/produção)
     * @return Configuração criada
     */
    EmpresaNFeConfig criarConfiguracaoEmpresa(String empresaId, String cnpj, String razaoSocial, 
                                             NFeEstadoEnum estado, NFeAmbienteEnum ambiente);

    /**
     * Atualiza configuração da empresa
     * 
     * @param empresaId ID da empresa
     * @param configuracoes Configurações a serem atualizadas
     * @return Configuração atualizada
     */
    EmpresaNFeConfig atualizarConfiguracaoEmpresa(String empresaId, Map<String, Object> configuracoes);

    /**
     * Valida se a empresa está habilitada
     * 
     * @param empresaId ID da empresa
     * @return true se habilitada
     */
    boolean validarEmpresa(String empresaId);

    /**
     * Obtém próximo número de NFe para a empresa
     * 
     * @param empresaId ID da empresa
     * @param serie Série da NFe
     * @return Próximo número
     */
    Integer obterProximoNumero(String empresaId, Integer serie);

    /**
     * Incrementa próximo número de NFe
     * 
     * @param empresaId ID da empresa
     * @param serie Série da NFe
     * @return Novo número
     */
    Integer incrementarProximoNumero(String empresaId, Integer serie);

    /**
     * Lista todas as configurações de empresas
     * 
     * @return Lista de configurações
     */
    List<EmpresaNFeConfig> listarConfiguracoes();

    /**
     * Lista configurações por estado
     * 
     * @param estado Estado
     * @return Lista de configurações
     */
    List<EmpresaNFeConfig> listarConfiguracoesPorEstado(NFeEstadoEnum estado);

    /**
     * Lista configurações por ambiente
     * 
     * @param ambiente Ambiente
     * @return Lista de configurações
     */
    List<EmpresaNFeConfig> listarConfiguracoesPorAmbiente(NFeAmbienteEnum ambiente);

    /**
     * Habilita/desabilita empresa
     * 
     * @param empresaId ID da empresa
     * @param habilitada true para habilitar
     * @return Configuração atualizada
     */
    EmpresaNFeConfig alterarStatusEmpresa(String empresaId, boolean habilitada);

    /**
     * Atualiza certificado da empresa
     * 
     * @param empresaId ID da empresa
     * @param caminhoCertificado Caminho do certificado
     * @param senhaCertificado Senha do certificado
     * @return Configuração atualizada
     */
    EmpresaNFeConfig atualizarCertificado(String empresaId, String caminhoCertificado, String senhaCertificado);

    /**
     * Valida certificado da empresa
     * 
     * @param empresaId ID da empresa
     * @return true se válido
     */
    boolean validarCertificado(String empresaId);

    /**
     * Obtém estatísticas de configurações
     * 
     * @return Estatísticas
     */
    Map<String, Object> obterEstatisticas();

    /**
     * Obtém configurações por CNPJ
     * 
     * @param cnpj CNPJ da empresa
     * @return Configuração
     */
    Optional<EmpresaNFeConfig> obterConfiguracaoPorCnpj(String cnpj);

    /**
     * Sincroniza configurações com sistema externo
     * 
     * @param empresaId ID da empresa
     * @return true se sincronizado
     */
    boolean sincronizarConfiguracao(String empresaId);

    /**
     * Exporta configurações para backup
     * 
     * @param empresaId ID da empresa
     * @return Dados de backup
     */
    Map<String, Object> exportarConfiguracao(String empresaId);

    /**
     * Importa configurações de backup
     * 
     * @param dadosBackup Dados de backup
     * @return Configuração importada
     */
    EmpresaNFeConfig importarConfiguracao(Map<String, Object> dadosBackup);

    /**
     * Remove configuração da empresa
     * 
     * @param empresaId ID da empresa
     * @return true se removida
     */
    boolean removerConfiguracao(String empresaId);

    /**
     * Obtém configurações ativas
     * 
     * @return Lista de configurações ativas
     */
    List<EmpresaNFeConfig> obterConfiguracoesAtivas();

    /**
     * Obtém configurações por filtro
     * 
     * @param filtros Filtros de busca
     * @return Lista de configurações
     */
    List<EmpresaNFeConfig> buscarConfiguracoes(Map<String, Object> filtros);

    /**
     * Valida configuração antes de salvar
     * 
     * @param config Configuração a ser validada
     * @return true se válida
     */
    boolean validarConfiguracao(EmpresaNFeConfig config);

    /**
     * Obtém configuração padrão para nova empresa
     * 
     * @param estado Estado da empresa
     * @param ambiente Ambiente
     * @return Configuração padrão
     */
    EmpresaNFeConfig obterConfiguracaoPadrao(NFeEstadoEnum estado, NFeAmbienteEnum ambiente);
}