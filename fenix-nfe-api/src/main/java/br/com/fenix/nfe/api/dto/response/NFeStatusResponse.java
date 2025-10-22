package br.com.fenix.nfe.api.dto.response;

import br.com.fenix.nfe.model.enums.NFeStatusEnum;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de resposta para status da NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public class NFeStatusResponse {

    private String chaveAcesso;
    private NFeStatusEnum status;
    private String statusDescricao;
    private String protocolo;
    
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
    private String xmlUrl;
    private String pdfUrl;
    private String danfeUrl;

    // Construtores
    public NFeStatusResponse() {
    }

    public NFeStatusResponse(String chaveAcesso, NFeStatusEnum status) {
        this.chaveAcesso = chaveAcesso;
        this.status = status;
        this.statusDescricao = status != null ? status.getDescricao() : "";
    }

    // Getters e Setters
    public String getChaveAcesso() {
        return chaveAcesso;
    }

    public void setChaveAcesso(String chaveAcesso) {
        this.chaveAcesso = chaveAcesso;
    }

    public NFeStatusEnum getStatus() {
        return status;
    }

    public void setStatus(NFeStatusEnum status) {
        this.status = status;
        this.statusDescricao = status != null ? status.getDescricao() : "";
    }

    public String getStatusDescricao() {
        return statusDescricao;
    }

    public void setStatusDescricao(String statusDescricao) {
        this.statusDescricao = statusDescricao;
    }

    public String getProtocolo() {
        return protocolo;
    }

    public void setProtocolo(String protocolo) {
        this.protocolo = protocolo;
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

    public String getXmlUrl() {
        return xmlUrl;
    }

    public void setXmlUrl(String xmlUrl) {
        this.xmlUrl = xmlUrl;
    }

    public String getPdfUrl() {
        return pdfUrl;
    }

    public void setPdfUrl(String pdfUrl) {
        this.pdfUrl = pdfUrl;
    }

    public String getDanfeUrl() {
        return danfeUrl;
    }

    public void setDanfeUrl(String danfeUrl) {
        this.danfeUrl = danfeUrl;
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

    public boolean isFinalizada() {
        return this.status != null && this.status.isFinalizado();
    }

    public boolean permiteCancelamento() {
        return this.status != null && this.status.permiteCancelamento();
    }

    public boolean permiteCartaCorrecao() {
        return this.status != null && this.status.permiteCartaCorrecao();
    }

    public boolean permiteInutilizacao() {
        return this.status != null && this.status.permiteInutilizacao();
    }

    public boolean temErros() {
        return this.erros != null && !this.erros.isEmpty();
    }

    public String getStatusDetalhes() {
        if (this.status == null) {
            return "Status não definido";
        }
        return this.status.getDetalhes();
    }

    @Override
    public String toString() {
        return "NFeStatusResponse{" +
                "chaveAcesso='" + chaveAcesso + '\'' +
                ", status=" + status +
                ", statusDescricao='" + statusDescricao + '\'' +
                ", protocolo='" + protocolo + '\'' +
                ", dataEmissao=" + dataEmissao +
                '}';
    }
}

