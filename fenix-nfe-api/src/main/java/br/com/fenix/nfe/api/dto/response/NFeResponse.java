package br.com.fenix.nfe.api.dto.response;

import br.com.fenix.nfe.model.enums.NFeStatusEnum;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO de resposta geral para NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public class NFeResponse {

    private String id;
    private String empresaId;
    private String chaveAcesso;
    private Integer numeroNfe;
    private Integer serie;
    private NFeStatusEnum status;
    private String protocolo;
    private String xmlNfe;
    private String xmlAutorizado;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataEmissao;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataAutorizacao;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataCancelamento;
    
    private String motivoCancelamento;
    private Integer tentativas;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime proximaTentativa;
    
    private List<String> erros;
    private Map<String, Object> metadata;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    // Construtores
    public NFeResponse() {
    }

    public NFeResponse(String id, String empresaId, String chaveAcesso, Integer numeroNfe, 
                      Integer serie, NFeStatusEnum status) {
        this.id = id;
        this.empresaId = empresaId;
        this.chaveAcesso = chaveAcesso;
        this.numeroNfe = numeroNfe;
        this.serie = serie;
        this.status = status;
    }

    // Getters e Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmpresaId() {
        return empresaId;
    }

    public void setEmpresaId(String empresaId) {
        this.empresaId = empresaId;
    }

    public String getChaveAcesso() {
        return chaveAcesso;
    }

    public void setChaveAcesso(String chaveAcesso) {
        this.chaveAcesso = chaveAcesso;
    }

    public Integer getNumeroNfe() {
        return numeroNfe;
    }

    public void setNumeroNfe(Integer numeroNfe) {
        this.numeroNfe = numeroNfe;
    }

    public Integer getSerie() {
        return serie;
    }

    public void setSerie(Integer serie) {
        this.serie = serie;
    }

    public NFeStatusEnum getStatus() {
        return status;
    }

    public void setStatus(NFeStatusEnum status) {
        this.status = status;
    }

    public String getProtocolo() {
        return protocolo;
    }

    public void setProtocolo(String protocolo) {
        this.protocolo = protocolo;
    }

    public String getXmlNfe() {
        return xmlNfe;
    }

    public void setXmlNfe(String xmlNfe) {
        this.xmlNfe = xmlNfe;
    }

    public String getXmlAutorizado() {
        return xmlAutorizado;
    }

    public void setXmlAutorizado(String xmlAutorizado) {
        this.xmlAutorizado = xmlAutorizado;
    }

    public LocalDateTime getDataEmissao() {
        return dataEmissao;
    }

    public void setDataEmissao(LocalDateTime dataEmissao) {
        this.dataEmissao = dataEmissao;
    }

    public LocalDateTime getDataAutorizacao() {
        return dataAutorizacao;
    }

    public void setDataAutorizacao(LocalDateTime dataAutorizacao) {
        this.dataAutorizacao = dataAutorizacao;
    }

    public LocalDateTime getDataCancelamento() {
        return dataCancelamento;
    }

    public void setDataCancelamento(LocalDateTime dataCancelamento) {
        this.dataCancelamento = dataCancelamento;
    }

    public String getMotivoCancelamento() {
        return motivoCancelamento;
    }

    public void setMotivoCancelamento(String motivoCancelamento) {
        this.motivoCancelamento = motivoCancelamento;
    }

    public Integer getTentativas() {
        return tentativas;
    }

    public void setTentativas(Integer tentativas) {
        this.tentativas = tentativas;
    }

    public LocalDateTime getProximaTentativa() {
        return proximaTentativa;
    }

    public void setProximaTentativa(LocalDateTime proximaTentativa) {
        this.proximaTentativa = proximaTentativa;
    }

    public List<String> getErros() {
        return erros;
    }

    public void setErros(List<String> erros) {
        this.erros = erros;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Métodos de negócio
    public boolean isProcessando() {
        return NFeStatusEnum.PROCESSANDO.equals(this.status);
    }

    public boolean isAutorizada() {
        return NFeStatusEnum.AUTORIZADA.equals(this.status);
    }

    public boolean isRejeitada() {
        return NFeStatusEnum.REJEITADA.equals(this.status);
    }

    public boolean isCancelada() {
        return NFeStatusEnum.CANCELADA.equals(this.status);
    }

    public boolean isErro() {
        return NFeStatusEnum.ERRO.equals(this.status);
    }

    public String getStatusDescricao() {
        return this.status != null ? this.status.getDescricao() : "";
    }

    @Override
    public String toString() {
        return "NFeResponse{" +
                "id='" + id + '\'' +
                ", empresaId='" + empresaId + '\'' +
                ", chaveAcesso='" + chaveAcesso + '\'' +
                ", numeroNfe=" + numeroNfe +
                ", serie=" + serie +
                ", status=" + status +
                ", protocolo='" + protocolo + '\'' +
                ", dataEmissao=" + dataEmissao +
                '}';
    }
}

