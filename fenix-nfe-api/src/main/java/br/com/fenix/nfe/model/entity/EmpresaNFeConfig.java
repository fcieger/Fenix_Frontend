package br.com.fenix.nfe.model.entity;

import br.com.fenix.nfe.model.enums.NFeAmbienteEnum;
import br.com.fenix.nfe.model.enums.NFeEstadoEnum;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidade que representa a configuração de NFe por empresa
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Entity
@Table(name = "empresa_nfe_config", indexes = {
    @Index(name = "idx_empresa_config_empresa", columnList = "empresa_id"),
    @Index(name = "idx_empresa_config_cnpj", columnList = "cnpj"),
    @Index(name = "idx_empresa_config_ativa", columnList = "ativa")
})
public class EmpresaNFeConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotBlank(message = "ID da empresa é obrigatório")
    @Size(max = 20, message = "ID da empresa deve ter no máximo 20 caracteres")
    @Column(name = "empresa_id", nullable = false, unique = true, length = 20)
    private String empresaId;

    @NotBlank(message = "CNPJ é obrigatório")
    @Size(min = 14, max = 14, message = "CNPJ deve ter exatamente 14 caracteres")
    @Column(name = "cnpj", nullable = false, length = 14)
    private String cnpj;

    @NotBlank(message = "Razão social é obrigatória")
    @Size(max = 100, message = "Razão social deve ter no máximo 100 caracteres")
    @Column(name = "razao_social", nullable = false, length = 100)
    private String razaoSocial;

    @NotBlank(message = "Caminho do certificado é obrigatório")
    @Size(max = 500, message = "Caminho do certificado deve ter no máximo 500 caracteres")
    @Column(name = "certificado_path", nullable = false, length = 500)
    private String certificadoPath;

    @NotBlank(message = "Senha do certificado é obrigatória")
    @Size(max = 100, message = "Senha do certificado deve ter no máximo 100 caracteres")
    @Column(name = "certificado_senha", nullable = false, length = 100)
    private String certificadoSenha;

    @NotNull(message = "Estado é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 2)
    private NFeEstadoEnum estado;

    @NotNull(message = "Ambiente é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(name = "ambiente", nullable = false, length = 20)
    private NFeAmbienteEnum ambiente;

    @NotNull(message = "Série padrão é obrigatória")
    @Column(name = "serie_padrao", nullable = false)
    private Integer seriePadrao;

    @NotNull(message = "Próximo número é obrigatório")
    @Column(name = "proximo_numero", nullable = false)
    private Integer proximoNumero;

    @Column(name = "ativa", nullable = false)
    private Boolean ativa = true;

    @Column(name = "configuracao_adicional", columnDefinition = "JSONB")
    private String configuracaoAdicional;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Construtores
    public EmpresaNFeConfig() {
    }

    public EmpresaNFeConfig(String empresaId, String cnpj, String razaoSocial, 
                           String certificadoPath, String certificadoSenha,
                           NFeEstadoEnum estado, NFeAmbienteEnum ambiente,
                           Integer seriePadrao, Integer proximoNumero) {
        this.empresaId = empresaId;
        this.cnpj = cnpj;
        this.razaoSocial = razaoSocial;
        this.certificadoPath = certificadoPath;
        this.certificadoSenha = certificadoSenha;
        this.estado = estado;
        this.ambiente = ambiente;
        this.seriePadrao = seriePadrao;
        this.proximoNumero = proximoNumero;
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

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getRazaoSocial() {
        return razaoSocial;
    }

    public void setRazaoSocial(String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }

    public String getCertificadoPath() {
        return certificadoPath;
    }

    public void setCertificadoPath(String certificadoPath) {
        this.certificadoPath = certificadoPath;
    }

    public String getCertificadoSenha() {
        return certificadoSenha;
    }

    public void setCertificadoSenha(String certificadoSenha) {
        this.certificadoSenha = certificadoSenha;
    }

    public NFeEstadoEnum getEstado() {
        return estado;
    }

    public void setEstado(NFeEstadoEnum estado) {
        this.estado = estado;
    }

    public NFeAmbienteEnum getAmbiente() {
        return ambiente;
    }

    public void setAmbiente(NFeAmbienteEnum ambiente) {
        this.ambiente = ambiente;
    }

    public Integer getSeriePadrao() {
        return seriePadrao;
    }

    public void setSeriePadrao(Integer seriePadrao) {
        this.seriePadrao = seriePadrao;
    }

    public Integer getProximoNumero() {
        return proximoNumero;
    }

    public void setProximoNumero(Integer proximoNumero) {
        this.proximoNumero = proximoNumero;
    }

    public Boolean getAtiva() {
        return ativa;
    }

    public void setAtiva(Boolean ativa) {
        this.ativa = ativa;
    }

    public String getConfiguracaoAdicional() {
        return configuracaoAdicional;
    }

    public void setConfiguracaoAdicional(String configuracaoAdicional) {
        this.configuracaoAdicional = configuracaoAdicional;
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
    public void incrementarProximoNumero() {
        this.proximoNumero = (this.proximoNumero == null ? 1 : this.proximoNumero) + 1;
    }

    public void ativar() {
        this.ativa = true;
    }

    public void desativar() {
        this.ativa = false;
    }

    public boolean isAtiva() {
        return Boolean.TRUE.equals(this.ativa);
    }

    public boolean isHomologacao() {
        return NFeAmbienteEnum.HOMOLOGACAO.equals(this.ambiente);
    }

    public boolean isProducao() {
        return NFeAmbienteEnum.PRODUCAO.equals(this.ambiente);
    }

    @Override
    public String toString() {
        return "EmpresaNFeConfig{" +
                "id=" + id +
                ", empresaId='" + empresaId + '\'' +
                ", cnpj='" + cnpj + '\'' +
                ", razaoSocial='" + razaoSocial + '\'' +
                ", estado=" + estado +
                ", ambiente=" + ambiente +
                ", seriePadrao=" + seriePadrao +
                ", proximoNumero=" + proximoNumero +
                ", ativa=" + ativa +
                '}';
    }
}


