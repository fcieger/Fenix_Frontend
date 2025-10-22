package br.com.fenix.nfe.model.queue;

import br.com.fenix.nfe.model.enums.NFeOperacaoEnum;
import br.com.fenix.nfe.model.enums.NFePriorityEnum;
import br.com.fenix.nfe.model.enums.NFeQueueTypeEnum;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Modelo que representa uma mensagem da fila de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public class NFeQueueMessage {

    @NotNull(message = "ID da mensagem é obrigatório")
    private UUID id;

    @NotBlank(message = "ID da empresa é obrigatório")
    @Size(max = 20, message = "ID da empresa deve ter no máximo 20 caracteres")
    private String empresaId;

    @NotBlank(message = "CNPJ do emitente é obrigatório")
    @Size(min = 14, max = 14, message = "CNPJ deve ter exatamente 14 caracteres")
    private String cnpjEmitente;

    @NotNull(message = "Operação é obrigatória")
    private NFeOperacaoEnum operacao;

    @NotNull(message = "Tipo de fila é obrigatório")
    private NFeQueueTypeEnum queueType;

    @NotNull(message = "Prioridade é obrigatória")
    private NFePriorityEnum priority;

    @NotNull(message = "Timestamp é obrigatório")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime timestamp;

    @NotNull(message = "Contagem de retry é obrigatória")
    private Integer retryCount = 0;

    @NotBlank(message = "ID de correlação é obrigatório")
    private String correlationId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime scheduledTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime expirationTime;

    private String payload;

    private Map<String, Object> metadata = new HashMap<>();

    // Construtores
    public NFeQueueMessage() {
        this.id = UUID.randomUUID();
        this.timestamp = LocalDateTime.now();
        this.correlationId = UUID.randomUUID().toString();
    }

    public NFeQueueMessage(String empresaId, String cnpjEmitente, NFeOperacaoEnum operacao, 
                           NFeQueueTypeEnum queueType, NFePriorityEnum priority) {
        this();
        this.empresaId = empresaId;
        this.cnpjEmitente = cnpjEmitente;
        this.operacao = operacao;
        this.queueType = queueType;
        this.priority = priority;
    }

    public NFeQueueMessage(String empresaId, String cnpjEmitente, NFeOperacaoEnum operacao, 
                           NFeQueueTypeEnum queueType, NFePriorityEnum priority, String payload) {
        this(empresaId, cnpjEmitente, operacao, queueType, priority);
        this.payload = payload;
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

    public String getCnpjEmitente() {
        return cnpjEmitente;
    }

    public void setCnpjEmitente(String cnpjEmitente) {
        this.cnpjEmitente = cnpjEmitente;
    }

    public NFeOperacaoEnum getOperacao() {
        return operacao;
    }

    public void setOperacao(NFeOperacaoEnum operacao) {
        this.operacao = operacao;
    }

    public NFeQueueTypeEnum getQueueType() {
        return queueType;
    }

    public void setQueueType(NFeQueueTypeEnum queueType) {
        this.queueType = queueType;
    }

    public NFePriorityEnum getPriority() {
        return priority;
    }

    public void setPriority(NFePriorityEnum priority) {
        this.priority = priority;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }

    public LocalDateTime getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(LocalDateTime scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

    public LocalDateTime getExpirationTime() {
        return expirationTime;
    }

    public void setExpirationTime(LocalDateTime expirationTime) {
        this.expirationTime = expirationTime;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    // Métodos de negócio
    public void incrementarRetry() {
        this.retryCount = (this.retryCount == null ? 0 : this.retryCount) + 1;
    }

    public void adicionarMetadata(String chave, Object valor) {
        if (this.metadata == null) {
            this.metadata = new HashMap<>();
        }
        this.metadata.put(chave, valor);
    }

    public Object obterMetadata(String chave) {
        return this.metadata != null ? this.metadata.get(chave) : null;
    }

    public boolean isExpired() {
        return this.expirationTime != null && LocalDateTime.now().isAfter(this.expirationTime);
    }

    public boolean isScheduled() {
        return this.scheduledTime != null && LocalDateTime.now().isBefore(this.scheduledTime);
    }

    public boolean canRetry(int maxRetries) {
        return this.retryCount < maxRetries;
    }

    public long getAgeInSeconds() {
        return java.time.Duration.between(this.timestamp, LocalDateTime.now()).getSeconds();
    }

    public String getQueueName() {
        return this.queueType != null ? this.queueType.getQueueName() : null;
    }

    public String getRoutingKey() {
        return this.queueType != null ? this.queueType.getRoutingKey() : null;
    }

    public String getExchange() {
        return this.queueType != null ? this.queueType.getExchange() : null;
    }

    @Override
    public String toString() {
        return "NFeQueueMessage{" +
                "id=" + id +
                ", empresaId='" + empresaId + '\'' +
                ", cnpjEmitente='" + cnpjEmitente + '\'' +
                ", operacao=" + operacao +
                ", queueType=" + queueType +
                ", priority=" + priority +
                ", retryCount=" + retryCount +
                ", correlationId='" + correlationId + '\'' +
                '}';
    }
}


