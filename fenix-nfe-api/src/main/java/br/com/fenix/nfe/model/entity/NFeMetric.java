package br.com.fenix.nfe.model.entity;

import br.com.fenix.nfe.model.enums.NFeOperacaoEnum;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidade que representa métricas customizadas da NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Entity
@Table(name = "nfe_metric", indexes = {
    @Index(name = "idx_nfe_metric_empresa", columnList = "empresa_id"),
    @Index(name = "idx_nfe_metric_operacao", columnList = "operacao"),
    @Index(name = "idx_nfe_metric_created_at", columnList = "created_at"),
    @Index(name = "idx_nfe_metric_empresa_operacao", columnList = "empresa_id, operacao")
})
public class NFeMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotBlank(message = "ID da empresa é obrigatório")
    @Size(max = 20, message = "ID da empresa deve ter no máximo 20 caracteres")
    @Column(name = "empresa_id", nullable = false, length = 20)
    private String empresaId;

    @NotNull(message = "Operação é obrigatória")
    @Enumerated(EnumType.STRING)
    @Column(name = "operacao", nullable = false, length = 50)
    private NFeOperacaoEnum operacao;

    @NotBlank(message = "Nome da métrica é obrigatório")
    @Size(max = 100, message = "Nome da métrica deve ter no máximo 100 caracteres")
    @Column(name = "nome_metrica", nullable = false, length = 100)
    private String nomeMetrica;

    @NotNull(message = "Valor é obrigatório")
    @Column(name = "valor", nullable = false)
    private Double valor;

    @Size(max = 50, message = "Unidade deve ter no máximo 50 caracteres")
    @Column(name = "unidade", length = 50)
    private String unidade;

    @Column(name = "tags", columnDefinition = "JSONB")
    private String tags;

    @Column(name = "metadata", columnDefinition = "JSONB")
    private String metadata;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Construtores
    public NFeMetric() {
    }

    public NFeMetric(String empresaId, NFeOperacaoEnum operacao, String nomeMetrica, Double valor) {
        this.empresaId = empresaId;
        this.operacao = operacao;
        this.nomeMetrica = nomeMetrica;
        this.valor = valor;
    }

    public NFeMetric(String empresaId, NFeOperacaoEnum operacao, String nomeMetrica, 
                     Double valor, String unidade, String tags, String metadata) {
        this.empresaId = empresaId;
        this.operacao = operacao;
        this.nomeMetrica = nomeMetrica;
        this.valor = valor;
        this.unidade = unidade;
        this.tags = tags;
        this.metadata = metadata;
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

    public NFeOperacaoEnum getOperacao() {
        return operacao;
    }

    public void setOperacao(NFeOperacaoEnum operacao) {
        this.operacao = operacao;
    }

    public String getNomeMetrica() {
        return nomeMetrica;
    }

    public void setNomeMetrica(String nomeMetrica) {
        this.nomeMetrica = nomeMetrica;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }

    public String getUnidade() {
        return unidade;
    }

    public void setUnidade(String unidade) {
        this.unidade = unidade;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
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

    // Métodos de negócio
    public String getOperacaoDescricao() {
        return this.operacao != null ? this.operacao.getDescricao() : "";
    }

    public String getValorFormatado() {
        if (this.valor == null) {
            return "0";
        }
        return String.format("%.2f", this.valor);
    }

    public String getValorComUnidade() {
        String valorFormatado = getValorFormatado();
        if (this.unidade != null && !this.unidade.trim().isEmpty()) {
            return valorFormatado + " " + this.unidade;
        }
        return valorFormatado;
    }

    @Override
    public String toString() {
        return "NFeMetric{" +
                "id=" + id +
                ", empresaId='" + empresaId + '\'' +
                ", operacao=" + operacao +
                ", nomeMetrica='" + nomeMetrica + '\'' +
                ", valor=" + valor +
                ", unidade='" + unidade + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}


