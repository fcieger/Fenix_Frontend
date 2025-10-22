package br.com.fenix.nfe.model.entity;

import br.com.fenix.nfe.model.enums.NFeOperacaoEnum;
import br.com.fenix.nfe.model.enums.NFeStatusEnum;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidade que representa os logs de operações da NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Entity
@Table(name = "nfe_log", indexes = {
    @Index(name = "idx_nfe_log_nfe_status", columnList = "nfe_status_id"),
    @Index(name = "idx_nfe_log_empresa", columnList = "empresa_id"),
    @Index(name = "idx_nfe_log_operacao", columnList = "operacao"),
    @Index(name = "idx_nfe_log_created_at", columnList = "created_at"),
    @Index(name = "idx_nfe_log_empresa_operacao", columnList = "empresa_id, operacao")
})
public class NFeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "nfe_status_id")
    private UUID nfeStatusId;

    @NotBlank(message = "ID da empresa é obrigatório")
    @Size(max = 20, message = "ID da empresa deve ter no máximo 20 caracteres")
    @Column(name = "empresa_id", nullable = false, length = 20)
    private String empresaId;

    @NotNull(message = "Operação é obrigatória")
    @Enumerated(EnumType.STRING)
    @Column(name = "operacao", nullable = false, length = 50)
    private NFeOperacaoEnum operacao;

    @NotNull(message = "Status é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private NFeStatusEnum status;

    @Column(name = "mensagem", columnDefinition = "TEXT")
    private String mensagem;

    @Column(name = "detalhes", columnDefinition = "JSONB")
    private String detalhes;

    @Column(name = "duracao_ms")
    private Integer duracaoMs;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Construtores
    public NFeLog() {
    }

    public NFeLog(UUID nfeStatusId, String empresaId, NFeOperacaoEnum operacao, 
                  NFeStatusEnum status, String mensagem) {
        this.nfeStatusId = nfeStatusId;
        this.empresaId = empresaId;
        this.operacao = operacao;
        this.status = status;
        this.mensagem = mensagem;
    }

    public NFeLog(UUID nfeStatusId, String empresaId, NFeOperacaoEnum operacao, 
                  NFeStatusEnum status, String mensagem, String detalhes, Integer duracaoMs) {
        this.nfeStatusId = nfeStatusId;
        this.empresaId = empresaId;
        this.operacao = operacao;
        this.status = status;
        this.mensagem = mensagem;
        this.detalhes = detalhes;
        this.duracaoMs = duracaoMs;
    }

    // Getters e Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getNfeStatusId() {
        return nfeStatusId;
    }

    public void setNfeStatusId(UUID nfeStatusId) {
        this.nfeStatusId = nfeStatusId;
    }

    public String getEmpresaId() {
        return empresaId;
    }

    public void setEmpresaId(String empresaId) {
        this.empresaId = empresaId;
    }

    public NFeOperacaoEnum getOperacao() {
        return operacao;
    }

    public void setOperacao(NFeOperacaoEnum operacao) {
        this.operacao = operacao;
    }

    public NFeStatusEnum getStatus() {
        return status;
    }

    public void setStatus(NFeStatusEnum status) {
        this.status = status;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public String getDetalhes() {
        return detalhes;
    }

    public void setDetalhes(String detalhes) {
        this.detalhes = detalhes;
    }

    public Integer getDuracaoMs() {
        return duracaoMs;
    }

    public void setDuracaoMs(Integer duracaoMs) {
        this.duracaoMs = duracaoMs;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Métodos de negócio
    public boolean isSucesso() {
        return NFeStatusEnum.AUTORIZADA.equals(this.status);
    }

    public boolean isErro() {
        return NFeStatusEnum.ERRO.equals(this.status) || 
               NFeStatusEnum.REJEITADA.equals(this.status);
    }

    public boolean isProcessando() {
        return NFeStatusEnum.PROCESSANDO.equals(this.status);
    }

    public String getOperacaoDescricao() {
        return this.operacao != null ? this.operacao.getDescricao() : "";
    }

    public String getStatusDescricao() {
        return this.status != null ? this.status.getDescricao() : "";
    }

    @Override
    public String toString() {
        return "NFeLog{" +
                "id=" + id +
                ", nfeStatusId=" + nfeStatusId +
                ", empresaId='" + empresaId + '\'' +
                ", operacao=" + operacao +
                ", status=" + status +
                ", mensagem='" + mensagem + '\'' +
                ", duracaoMs=" + duracaoMs +
                ", createdAt=" + createdAt +
                '}';
    }
}


