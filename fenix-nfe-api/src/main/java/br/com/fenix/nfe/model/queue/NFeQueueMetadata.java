package br.com.fenix.nfe.model.queue;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Classe que representa metadados de uma fila de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class NFeQueueMetadata {

    private String source;
    private String version;
    private String environment;
    private String region;
    private String instanceId;
    private String threadName;
    private String userId;
    private String sessionId;
    private String requestId;
    private String traceId;
    private String spanId;
    private String parentSpanId;
    private String baggage;
    private Map<String, String> tags = new HashMap<>();
    private Map<String, Object> custom = new HashMap<>();

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime updatedAt;

    // Construtores
    public NFeQueueMetadata() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public NFeQueueMetadata(String source, String version, String environment) {
        this();
        this.source = source;
        this.version = version;
        this.environment = environment;
    }

    // Getters e Setters
    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getInstanceId() {
        return instanceId;
    }

    public void setInstanceId(String instanceId) {
        this.instanceId = instanceId;
    }

    public String getThreadName() {
        return threadName;
    }

    public void setThreadName(String threadName) {
        this.threadName = threadName;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getTraceId() {
        return traceId;
    }

    public void setTraceId(String traceId) {
        this.traceId = traceId;
    }

    public String getSpanId() {
        return spanId;
    }

    public void setSpanId(String spanId) {
        this.spanId = spanId;
    }

    public String getParentSpanId() {
        return parentSpanId;
    }

    public void setParentSpanId(String parentSpanId) {
        this.parentSpanId = parentSpanId;
    }

    public String getBaggage() {
        return baggage;
    }

    public void setBaggage(String baggage) {
        this.baggage = baggage;
    }

    public Map<String, String> getTags() {
        return tags;
    }

    public void setTags(Map<String, String> tags) {
        this.tags = tags;
    }

    public Map<String, Object> getCustom() {
        return custom;
    }

    public void setCustom(Map<String, Object> custom) {
        this.custom = custom;
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
    public void adicionarTag(String chave, String valor) {
        if (this.tags == null) {
            this.tags = new HashMap<>();
        }
        this.tags.put(chave, valor);
    }

    public String obterTag(String chave) {
        return this.tags != null ? this.tags.get(chave) : null;
    }

    public void adicionarCustom(String chave, Object valor) {
        if (this.custom == null) {
            this.custom = new HashMap<>();
        }
        this.custom.put(chave, valor);
    }

    public Object obterCustom(String chave) {
        return this.custom != null ? this.custom.get(chave) : null;
    }

    public void atualizarTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }

    public boolean temTracing() {
        return this.traceId != null && !this.traceId.trim().isEmpty();
    }

    public boolean temSpan() {
        return this.spanId != null && !this.spanId.trim().isEmpty();
    }

    public String getTracingContext() {
        if (!temTracing()) {
            return null;
        }
        return String.format("traceId=%s,spanId=%s,parentSpanId=%s", 
                            this.traceId, this.spanId, this.parentSpanId);
    }

    public void setTracingContext(String traceId, String spanId, String parentSpanId) {
        this.traceId = traceId;
        this.spanId = spanId;
        this.parentSpanId = parentSpanId;
    }

    @Override
    public String toString() {
        return "NFeQueueMetadata{" +
                "source='" + source + '\'' +
                ", version='" + version + '\'' +
                ", environment='" + environment + '\'' +
                ", region='" + region + '\'' +
                ", instanceId='" + instanceId + '\'' +
                ", traceId='" + traceId + '\'' +
                ", spanId='" + spanId + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}


