package br.com.fenix.nfe.api.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO de resposta para erros padronizados
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public class NFeErrorResponse {

    private String codigo;
    private String mensagem;
    private String detalhes;
    private String tipo;
    private String categoria;
    private String chaveAcesso;
    private String empresaId;
    private List<String> erros;
    private Map<String, Object> metadata;
    private String stackTrace;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    
    private String path;
    private String method;
    private String correlationId;
    private String traceId;
    private String spanId;

    // Construtores
    public NFeErrorResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public NFeErrorResponse(String codigo, String mensagem) {
        this();
        this.codigo = codigo;
        this.mensagem = mensagem;
    }

    public NFeErrorResponse(String codigo, String mensagem, String detalhes) {
        this(codigo, mensagem);
        this.detalhes = detalhes;
    }

    public NFeErrorResponse(String codigo, String mensagem, String detalhes, String tipo) {
        this(codigo, mensagem, detalhes);
        this.tipo = tipo;
    }

    // Getters e Setters
    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
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

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getChaveAcesso() {
        return chaveAcesso;
    }

    public void setChaveAcesso(String chaveAcesso) {
        this.chaveAcesso = chaveAcesso;
    }

    public String getEmpresaId() {
        return empresaId;
    }

    public void setEmpresaId(String empresaId) {
        this.empresaId = empresaId;
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

    public String getStackTrace() {
        return stackTrace;
    }

    public void setStackTrace(String stackTrace) {
        this.stackTrace = stackTrace;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
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

    // Métodos de negócio
    public boolean isErroValidacao() {
        return "VALIDATION_ERROR".equals(this.tipo);
    }

    public boolean isErroNegocio() {
        return "BUSINESS_ERROR".equals(this.tipo);
    }

    public boolean isErroTecnico() {
        return "TECHNICAL_ERROR".equals(this.tipo);
    }

    public boolean isErroSefaz() {
        return "SEFAZ_ERROR".equals(this.tipo);
    }

    public boolean isErroCertificado() {
        return "CERTIFICATE_ERROR".equals(this.tipo);
    }

    public boolean isErroFila() {
        return "QUEUE_ERROR".equals(this.tipo);
    }

    public boolean isErroBanco() {
        return "DATABASE_ERROR".equals(this.tipo);
    }

    public boolean isErroRede() {
        return "NETWORK_ERROR".equals(this.tipo);
    }

    public boolean isErroTimeout() {
        return "TIMEOUT_ERROR".equals(this.tipo);
    }

    public boolean temErros() {
        return this.erros != null && !this.erros.isEmpty();
    }

    public boolean temDetalhes() {
        return this.detalhes != null && !this.detalhes.trim().isEmpty();
    }

    public boolean temStackTrace() {
        return this.stackTrace != null && !this.stackTrace.trim().isEmpty();
    }

    public boolean temTracing() {
        return this.traceId != null && !this.traceId.trim().isEmpty();
    }

    public String getTipoDescricao() {
        if (this.tipo == null) {
            return "Erro não classificado";
        }
        
        switch (this.tipo) {
            case "VALIDATION_ERROR":
                return "Erro de Validação";
            case "BUSINESS_ERROR":
                return "Erro de Negócio";
            case "TECHNICAL_ERROR":
                return "Erro Técnico";
            case "SEFAZ_ERROR":
                return "Erro da SEFAZ";
            case "CERTIFICATE_ERROR":
                return "Erro de Certificado";
            case "QUEUE_ERROR":
                return "Erro de Fila";
            case "DATABASE_ERROR":
                return "Erro de Banco de Dados";
            case "NETWORK_ERROR":
                return "Erro de Rede";
            case "TIMEOUT_ERROR":
                return "Erro de Timeout";
            default:
                return "Erro Desconhecido";
        }
    }

    public String getCategoriaDescricao() {
        if (this.categoria == null) {
            return "Categoria não definida";
        }
        
        switch (this.categoria) {
            case "CLIENT_ERROR":
                return "Erro do Cliente";
            case "SERVER_ERROR":
                return "Erro do Servidor";
            case "EXTERNAL_ERROR":
                return "Erro Externo";
            case "INTERNAL_ERROR":
                return "Erro Interno";
            default:
                return "Categoria Desconhecida";
        }
    }

    public String getMensagemCompleta() {
        StringBuilder sb = new StringBuilder();
        
        if (this.codigo != null) {
            sb.append("[").append(this.codigo).append("] ");
        }
        
        if (this.mensagem != null) {
            sb.append(this.mensagem);
        }
        
        if (this.detalhes != null && !this.detalhes.trim().isEmpty()) {
            sb.append(" - ").append(this.detalhes);
        }
        
        return sb.toString();
    }

    @Override
    public String toString() {
        return "NFeErrorResponse{" +
                "codigo='" + codigo + '\'' +
                ", mensagem='" + mensagem + '\'' +
                ", tipo='" + tipo + '\'' +
                ", categoria='" + categoria + '\'' +
                ", chaveAcesso='" + chaveAcesso + '\'' +
                ", empresaId='" + empresaId + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}

