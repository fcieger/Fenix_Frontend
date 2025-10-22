package br.com.fenix.nfe.model.entity;

import br.com.fenix.nfe.model.enums.NFeStatusEnum;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entidade que representa o status de uma NFe emitida
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Entity
@Table(name = "nfe_status", indexes = {
    @Index(name = "idx_nfe_status_empresa", columnList = "empresa_id"),
    @Index(name = "idx_nfe_status_chave", columnList = "chave_acesso"),
    @Index(name = "idx_nfe_status_status", columnList = "status"),
    @Index(name = "idx_nfe_status_data_emissao", columnList = "data_emissao"),
    @Index(name = "idx_nfe_status_empresa_status", columnList = "empresa_id, status"),
    @Index(name = "idx_nfe_status_data_emissao_status", columnList = "data_emissao, status")
})
public class NFeStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotBlank(message = "ID da empresa é obrigatório")
    @Size(max = 20, message = "ID da empresa deve ter no máximo 20 caracteres")
    @Column(name = "empresa_id", nullable = false, length = 20)
    private String empresaId;

    @NotBlank(message = "Chave de acesso é obrigatória")
    @Size(min = 44, max = 44, message = "Chave de acesso deve ter exatamente 44 caracteres")
    @Column(name = "chave_acesso", nullable = false, unique = true, length = 44)
    private String chaveAcesso;

    @NotNull(message = "Número da NFe é obrigatório")
    @Column(name = "numero_nfe", nullable = false)
    private Integer numeroNfe;

    @NotNull(message = "Série é obrigatória")
    @Column(name = "serie", nullable = false)
    private Integer serie;

    @NotNull(message = "Status é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private NFeStatusEnum status;

    @Size(max = 20, message = "Protocolo deve ter no máximo 20 caracteres")
    @Column(name = "protocolo", length = 20)
    private String protocolo;

    @Column(name = "xml_nfe", columnDefinition = "TEXT")
    private String xmlNfe;

    @Column(name = "xml_autorizado", columnDefinition = "TEXT")
    private String xmlAutorizado;

    @NotNull(message = "Data de emissão é obrigatória")
    @Column(name = "data_emissao", nullable = false)
    private LocalDateTime dataEmissao;

    @Column(name = "data_autorizacao")
    private LocalDateTime dataAutorizacao;

    @Column(name = "data_cancelamento")
    private LocalDateTime dataCancelamento;

    @Column(name = "motivo_cancelamento", columnDefinition = "TEXT")
    private String motivoCancelamento;

    @Column(name = "tentativas", nullable = false)
    private Integer tentativas = 0;

    @Column(name = "proxima_tentativa")
    private LocalDateTime proximaTentativa;

    @ElementCollection
    @CollectionTable(name = "nfe_status_erros", joinColumns = @JoinColumn(name = "nfe_status_id"))
    @Column(name = "erro", columnDefinition = "TEXT")
    private List<String> erros = new ArrayList<>();

    @Column(name = "metadata", columnDefinition = "JSONB")
    private String metadata;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Construtores
    public NFeStatus() {
    }

    public NFeStatus(String empresaId, String chaveAcesso, Integer numeroNfe, Integer serie, 
                     NFeStatusEnum status, LocalDateTime dataEmissao) {
        this.empresaId = empresaId;
        this.chaveAcesso = chaveAcesso;
        this.numeroNfe = numeroNfe;
        this.serie = serie;
        this.status = status;
        this.dataEmissao = dataEmissao;
    }

    // Getters e Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
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

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
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
    public void adicionarErro(String erro) {
        if (this.erros == null) {
            this.erros = new ArrayList<>();
        }
        this.erros.add(erro);
    }

    public void incrementarTentativa() {
        this.tentativas = (this.tentativas == null ? 0 : this.tentativas) + 1;
    }

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

    @Override
    public String toString() {
        return "NFeStatus{" +
                "id=" + id +
                ", empresaId='" + empresaId + '\'' +
                ", chaveAcesso='" + chaveAcesso + '\'' +
                ", numeroNfe=" + numeroNfe +
                ", serie=" + serie +
                ", status=" + status +
                ", protocolo='" + protocolo + '\'' +
                ", dataEmissao=" + dataEmissao +
                ", tentativas=" + tentativas +
                '}';
    }
}


