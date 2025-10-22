package br.com.fenix.nfe.api.dto.request;

import br.com.fenix.nfe.model.enums.NFeOperacaoEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO de entrada para consultas de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public class NFeConsultaRequest {

    @NotBlank(message = "ID da empresa é obrigatório")
    @Size(max = 20, message = "ID da empresa deve ter no máximo 20 caracteres")
    private String empresaId;

    @NotNull(message = "Tipo de consulta é obrigatório")
    private NFeOperacaoEnum tipoConsulta;

    @NotBlank(message = "Chave de acesso é obrigatória")
    @Pattern(regexp = "\\d{44}", message = "Chave de acesso deve ter exatamente 44 dígitos")
    private String chaveAcesso;

    private String cnpj;
    private String cpf;
    private String ie;
    private String protocolo;
    private String numeroNfe;
    private String serie;

    // Construtores
    public NFeConsultaRequest() {
    }

    public NFeConsultaRequest(String empresaId, NFeOperacaoEnum tipoConsulta, String chaveAcesso) {
        this.empresaId = empresaId;
        this.tipoConsulta = tipoConsulta;
        this.chaveAcesso = chaveAcesso;
    }

    // Getters e Setters
    public String getEmpresaId() {
        return empresaId;
    }

    public void setEmpresaId(String empresaId) {
        this.empresaId = empresaId;
    }

    public NFeOperacaoEnum getTipoConsulta() {
        return tipoConsulta;
    }

    public void setTipoConsulta(NFeOperacaoEnum tipoConsulta) {
        this.tipoConsulta = tipoConsulta;
    }

    public String getChaveAcesso() {
        return chaveAcesso;
    }

    public void setChaveAcesso(String chaveAcesso) {
        this.chaveAcesso = chaveAcesso;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getIe() {
        return ie;
    }

    public void setIe(String ie) {
        this.ie = ie;
    }

    public String getProtocolo() {
        return protocolo;
    }

    public void setProtocolo(String protocolo) {
        this.protocolo = protocolo;
    }

    public String getNumeroNfe() {
        return numeroNfe;
    }

    public void setNumeroNfe(String numeroNfe) {
        this.numeroNfe = numeroNfe;
    }

    public String getSerie() {
        return serie;
    }

    public void setSerie(String serie) {
        this.serie = serie;
    }

    // Métodos de negócio
    public boolean isConsultaStatus() {
        return NFeOperacaoEnum.CONSULTAR_STATUS.equals(this.tipoConsulta);
    }

    public boolean isConsultaXml() {
        return NFeOperacaoEnum.CONSULTAR_XML.equals(this.tipoConsulta);
    }

    public boolean isConsultaCadastro() {
        return NFeOperacaoEnum.CONSULTAR_CADASTRO.equals(this.tipoConsulta);
    }

    public boolean isConsultaDistribuicao() {
        return NFeOperacaoEnum.CONSULTAR_DISTRIBUICAO.equals(this.tipoConsulta);
    }

    public boolean isConsulta() {
        return this.tipoConsulta != null && this.tipoConsulta.isConsulta();
    }

    public String getTipoConsultaDescricao() {
        return this.tipoConsulta != null ? this.tipoConsulta.getDescricao() : "";
    }

    public String getIdentificador() {
        if (chaveAcesso != null && !chaveAcesso.trim().isEmpty()) {
            return chaveAcesso;
        }
        if (protocolo != null && !protocolo.trim().isEmpty()) {
            return protocolo;
        }
        if (cnpj != null && !cnpj.trim().isEmpty()) {
            return cnpj;
        }
        if (cpf != null && !cpf.trim().isEmpty()) {
            return cpf;
        }
        if (ie != null && !ie.trim().isEmpty()) {
            return ie;
        }
        return null;
    }

    @Override
    public String toString() {
        return "NFeConsultaRequest{" +
                "empresaId='" + empresaId + '\'' +
                ", tipoConsulta=" + tipoConsulta +
                ", chaveAcesso='" + chaveAcesso + '\'' +
                ", cnpj='" + cnpj + '\'' +
                ", cpf='" + cpf + '\'' +
                ", ie='" + ie + '\'' +
                ", protocolo='" + protocolo + '\'' +
                '}';
    }
}

