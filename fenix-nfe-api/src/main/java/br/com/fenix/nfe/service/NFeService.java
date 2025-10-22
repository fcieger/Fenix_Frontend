package br.com.fenix.nfe.service;

import br.com.fenix.nfe.api.dto.request.NFeConsultaRequest;
import br.com.fenix.nfe.api.dto.request.NFeRequest;
import br.com.fenix.nfe.api.dto.response.NFeConsultaResponse;
import br.com.fenix.nfe.api.dto.response.NFeResponse;
import br.com.fenix.nfe.api.dto.response.NFeStatusResponse;
import br.com.fenix.nfe.model.enums.NFeOperacaoEnum;

import java.util.List;
import java.util.UUID;

/**
 * Interface principal para operações de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public interface NFeService {

    /**
     * Emite uma NFe
     * 
     * @param request DTO de entrada para emissão
     * @return DTO de resposta com informações da NFe
     */
    NFeResponse emitirNFe(NFeRequest request);

    /**
     * Consulta o status de uma NFe
     * 
     * @param chaveAcesso Chave de acesso da NFe
     * @param empresaId ID da empresa
     * @return DTO de resposta com status
     */
    NFeStatusResponse consultarStatus(String chaveAcesso, String empresaId);

    /**
     * Consulta o XML de uma NFe
     * 
     * @param chaveAcesso Chave de acesso da NFe
     * @param empresaId ID da empresa
     * @return DTO de resposta com XML
     */
    NFeConsultaResponse consultarXml(String chaveAcesso, String empresaId);

    /**
     * Consulta o cadastro de um contribuinte
     * 
     * @param cnpj CNPJ do contribuinte
     * @param empresaId ID da empresa
     * @return DTO de resposta com dados do cadastro
     */
    NFeConsultaResponse consultarCadastro(String cnpj, String empresaId);

    /**
     * Consulta a distribuição de DFe
     * 
     * @param cnpj CNPJ do contribuinte
     * @param empresaId ID da empresa
     * @return DTO de resposta com distribuição
     */
    NFeConsultaResponse consultarDistribuicao(String cnpj, String empresaId);

    /**
     * Cancela uma NFe
     * 
     * @param chaveAcesso Chave de acesso da NFe
     * @param motivoCancelamento Motivo do cancelamento
     * @param empresaId ID da empresa
     * @return DTO de resposta com resultado do cancelamento
     */
    NFeResponse cancelarNFe(String chaveAcesso, String motivoCancelamento, String empresaId);

    /**
     * Envia carta de correção
     * 
     * @param chaveAcesso Chave de acesso da NFe
     * @param correcao Texto da correção
     * @param empresaId ID da empresa
     * @return DTO de resposta com resultado da correção
     */
    NFeResponse cartaCorrecao(String chaveAcesso, String correcao, String empresaId);

    /**
     * Envia manifestação do destinatário
     * 
     * @param chaveAcesso Chave de acesso da NFe
     * @param tipoManifestacao Tipo da manifestação
     * @param justificativa Justificativa (se aplicável)
     * @param empresaId ID da empresa
     * @return DTO de resposta com resultado da manifestação
     */
    NFeResponse manifestacao(String chaveAcesso, String tipoManifestacao, String justificativa, String empresaId);

    /**
     * Inutiliza uma numeração de NFe
     * 
     * @param empresaId ID da empresa
     * @param serie Série da NFe
     * @param numeroInicial Número inicial
     * @param numeroFinal Número final
     * @param justificativa Justificativa da inutilização
     * @return DTO de resposta com resultado da inutilização
     */
    NFeResponse inutilizar(String empresaId, Integer serie, Integer numeroInicial, Integer numeroFinal, String justificativa);

    /**
     * Valida um XML de NFe
     * 
     * @param xml XML da NFe
     * @param empresaId ID da empresa
     * @return DTO de resposta com resultado da validação
     */
    NFeConsultaResponse validarXml(String xml, String empresaId);

    /**
     * Processa uma consulta genérica
     * 
     * @param request DTO de consulta
     * @return DTO de resposta
     */
    NFeConsultaResponse processarConsulta(NFeConsultaRequest request);

    /**
     * Lista NFe por empresa
     * 
     * @param empresaId ID da empresa
     * @param page Página
     * @param size Tamanho da página
     * @return Lista de NFe
     */
    List<NFeResponse> listarNFe(String empresaId, int page, int size);

    /**
     * Busca NFe por ID
     * 
     * @param id ID da NFe
     * @param empresaId ID da empresa
     * @return DTO de resposta
     */
    NFeResponse buscarPorId(UUID id, String empresaId);

    /**
     * Busca NFe por chave de acesso
     * 
     * @param chaveAcesso Chave de acesso
     * @param empresaId ID da empresa
     * @return DTO de resposta
     */
    NFeResponse buscarPorChaveAcesso(String chaveAcesso, String empresaId);

    /**
     * Retorna estatísticas de NFe por empresa
     * 
     * @param empresaId ID da empresa
     * @return Estatísticas
     */
    Object obterEstatisticas(String empresaId);

    /**
     * Retorna métricas de performance por empresa
     * 
     * @param empresaId ID da empresa
     * @return Métricas de performance
     */
    Object obterMetricasPerformance(String empresaId);

    /**
     * Retorna logs de NFe por empresa
     * 
     * @param empresaId ID da empresa
     * @param page Página
     * @param size Tamanho da página
     * @return Lista de logs
     */
    Object obterLogs(String empresaId, int page, int size);

    /**
     * Retorna logs de NFe por chave de acesso
     * 
     * @param chaveAcesso Chave de acesso
     * @param empresaId ID da empresa
     * @return Lista de logs
     */
    Object obterLogsPorChaveAcesso(String chaveAcesso, String empresaId);

    /**
     * Retorna configurações da empresa
     * 
     * @param empresaId ID da empresa
     * @return Configurações
     */
    Object obterConfiguracaoEmpresa(String empresaId);

    /**
     * Atualiza configurações da empresa
     * 
     * @param empresaId ID da empresa
     * @param configuracoes Configurações
     * @return Resultado da atualização
     */
    Object atualizarConfiguracaoEmpresa(String empresaId, Object configuracoes);

    /**
     * Valida se a empresa está habilitada para emissão
     * 
     * @param empresaId ID da empresa
     * @return true se habilitada
     */
    boolean validarEmpresaHabilitada(String empresaId);

    /**
     * Retorna próximo número de NFe para a empresa
     * 
     * @param empresaId ID da empresa
     * @param serie Série
     * @return Próximo número
     */
    Integer obterProximoNumero(String empresaId, Integer serie);

    /**
     * Retorna informações de saúde do serviço
     * 
     * @return Status de saúde
     */
    Object obterStatusSaude();

    /**
     * Retorna informações de versão
     * 
     * @return Informações de versão
     */
    Object obterVersao();
}

