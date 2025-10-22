package br.com.fenix.nfe.api.exception;

/**
 * Exceção para erros de fila
 * 
 * @author Fenix Team
 * @version 1.0
 */
public class NFeQueueException extends NFeException {

    private final String queueName;
    private final String operation;

    public NFeQueueException(String message) {
        super("QUEUE_ERROR", "QUEUE", message);
        this.queueName = "unknown";
        this.operation = "unknown";
    }

    public NFeQueueException(String message, Throwable cause) {
        super("QUEUE_ERROR", "QUEUE", message, cause);
        this.queueName = "unknown";
        this.operation = "unknown";
    }

    public NFeQueueException(String queueName, String operation, String message) {
        super("QUEUE_ERROR", "QUEUE", String.format("Erro na fila '%s' durante operação '%s': %s", queueName, operation, message));
        this.queueName = queueName;
        this.operation = operation;
    }

    public NFeQueueException(String queueName, String operation, String message, Throwable cause) {
        super("QUEUE_ERROR", "QUEUE", String.format("Erro na fila '%s' durante operação '%s': %s", queueName, operation, message), cause);
        this.queueName = queueName;
        this.operation = operation;
    }

    public String getQueueName() {
        return queueName;
    }

    public String getOperation() {
        return operation;
    }
}
