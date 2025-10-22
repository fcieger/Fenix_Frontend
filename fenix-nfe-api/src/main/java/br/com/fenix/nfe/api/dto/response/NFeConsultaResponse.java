package br.com.fenix.nfe.api.dto.response;

import br.com.fenix.nfe.model.enums.NFeOperacaoEnum;
import br.com.fenix.nfe.model.enums.NFeStatusEnum;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO de resposta para consultas de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public class NFeConsultaResponse {

    private String chaveAcesso;
    private NFeOperacaoEnum tipoConsulta;
    private String tipoConsultaDescricao;
    private NFeStatusEnum status;
    private String statusDescricao;
    private String protocolo;
    private String xml;
    private String pdf;
    private String danfe;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataConsulta;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataEmissao;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataAutorizacao;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataCancelamento;
    
    private String motivoCancelamento;
    private List<String> erros;
    private Map<String, Object> dadosAdicionais;
    private String observacoes;
    private Integer tentativas;
    private Boolean sucesso;

    // Construtores
    public NFeConsultaResponse() {
    }

    public NFeConsultaResponse(String chaveAcesso, NFeOperacaoEnum tipoConsulta, NFeStatusEnum status) {
        this.chaveAcesso = chaveAcesso;
        this.tipoConsulta = tipoConsulta;
        this.tipoConsultaDescricao = tipoConsulta != null ? tipoConsulta.getDescricao() : "";
        this.status = status;
        this.statusDescricao = status != null ? status.getDescricao() : "";
        this.dataConsulta = LocalDateTime.now();
    }

    // Getters e Setters
    public String getChaveAcesso() {
        return chaveAcesso;
    }

    public void setChaveAcesso(String chaveAcesso) {
        this.chaveAcesso = chaveAcesso;
    }

    public NFeOperacaoEnum getTipoConsulta() {
        return tipoConsulta;
    }

    public void setTipoConsulta(NFeOperacaoEnum tipoConsulta) {
        this.tipoConsulta = tipoConsulta;
        this.tipoConsultaDescricao = tipoConsulta != null ? tipoConsulta.getDescricao() : "";
    }

    public String getTipoConsultaDescricao() {
        return tipoConsultaDescricao;
    }

    public void setTipoConsultaDescricao(String tipoConsultaDescricao) {
        this.tipoConsultaDescricao = tipoConsultaDescricao;
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

    public String getXml() {
        return xml;
    }

    public void setXml(String xml) {
        this.xml = xml;
    }

    public String getPdf() {
        return pdf;
    }

    public void setPdf(String pdf) {
        this.pdf = pdf;
    }

    public String getDanfe() {
        return danfe;
    }

    public void setDanfe(String danfe) {
        this.danfe = danfe;
    }

    public LocalDateTime getDataConsulta() {
        return dataConsulta;
    }

    public void setDataConsulta(LocalDateTime dataConsulta) {
        this.dataConsulta = dataConsulta;
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

    public List<String> getErros() {
        return erros;
    }

    public void setErros(List<String> erros) {
        this.erros = erros;
    }

    public Map<String, Object> getDadosAdicionais() {
        return dadosAdicionais;
    }

    public void setDadosAdicionais(Map<String, Object> dadosAdicionais) {
        this.dadosAdicionais = dadosAdicionais;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public Integer getTentativas() {
        return tentativas;
    }

    public void setTentativas(Integer tentativas) {
        this.tentativas = tentativas;
    }

    public Boolean getSucesso() {
        return sucesso;
    }

    public void setSucesso(Boolean sucesso) {
        this.sucesso = sucesso;
    }

    // Métodos de negócio
    public boolean isSucesso() {
        return Boolean.TRUE.equals(this.sucesso);
    }

    public boolean isFalha() {
        return Boolean.FALSE.equals(this.sucesso);
    }

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

    public boolean temErros() {
        return this.erros != null && !this.erros.isEmpty();
    }

    public boolean temXml() {
        return this.xml != null && !this.xml.trim().isEmpty();
    }

    public boolean temPdf() {
        return this.pdf != null && !this.pdf.trim().isEmpty();
    }

    public boolean temDanfe() {
        return this.danfe != null && !this.danfe.trim().isEmpty();
    }

    public String getStatusDetalhes() {
        if (this.status == null) {
            return "Status não definido";
        }
        return this.status.getDetalhes();
    }

    public String getTipoConsultaDetalhes() {
        if (this.tipoConsulta == null) {
            return "Tipo de consulta não definido";
        }
        return this.tipoConsulta.getDetalhes();
    }

    @Override
    public String toString() {
        return "NFeConsultaResponse{" +
                "chaveAcesso='" + chaveAcesso + '\'' +
                ", tipoConsulta=" + tipoConsulta +
                ", status=" + status +
                ", protocolo='" + protocolo + '\'' +
                ", dataConsulta=" + dataConsulta +
                ", sucesso=" + sucesso +
                '}';
    }
}

