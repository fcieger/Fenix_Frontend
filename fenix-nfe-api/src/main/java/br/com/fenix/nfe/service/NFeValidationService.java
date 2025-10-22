package br.com.fenix.nfe.service;

import br.com.fenix.nfe.api.dto.request.NFeRequest;

/**
 * Interface para validações de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public interface NFeValidationService {

    /**
     * Valida dados da NFe
     * 
     * @param request DTO de entrada da NFe
     */
    void validarNFeRequest(NFeRequest request);

    /**
     * Valida XML da NFe
     * 
     * @param xml XML da NFe
     */
    void validarXml(String xml);

    /**
     * Valida CNPJ
     * 
     * @param cnpj CNPJ a ser validado
     * @return true se válido
     */
    boolean validarCnpj(String cnpj);

    /**
     * Valida CPF
     * 
     * @param cpf CPF a ser validado
     * @return true se válido
     */
    boolean validarCpf(String cpf);

    /**
     * Valida CEP
     * 
     * @param cep CEP a ser validado
     * @return true se válido
     */
    boolean validarCep(String cep);

    /**
     * Valida NCM
     * 
     * @param ncm NCM a ser validado
     * @return true se válido
     */
    boolean validarNcm(String ncm);

    /**
     * Valida CFOP
     * 
     * @param cfop CFOP a ser validado
     * @return true se válido
     */
    boolean validarCfop(String cfop);

    /**
     * Valida chave de acesso
     * 
     * @param chaveAcesso Chave de acesso a ser validada
     * @return true se válida
     */
    boolean validarChaveAcesso(String chaveAcesso);

    /**
     * Valida certificado digital
     * 
     * @param caminhoCertificado Caminho do certificado
     * @param senhaCertificado Senha do certificado
     * @return true se válido
     */
    boolean validarCertificado(String caminhoCertificado, String senhaCertificado);
}