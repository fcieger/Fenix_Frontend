package br.com.fenix.nfe.model.queue;

import br.com.fenix.nfe.model.enums.NFeQueueTypeEnum;

/**
 * Classe utilitária para gerenciar tipos de fila
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public class NFeQueueType {

    private final NFeQueueTypeEnum queueType;
    private final String queueName;
    private final String routingKey;
    private final String exchange;
    private final boolean durable;
    private final boolean exclusive;
    private final boolean autoDelete;

    public NFeQueueType(NFeQueueTypeEnum queueType) {
        this.queueType = queueType;
        this.queueName = queueType.getQueueName();
        this.routingKey = queueType.getRoutingKey();
        this.exchange = queueType.getExchange();
        this.durable = !queueType.isDLQ();
        this.exclusive = false;
        this.autoDelete = queueType.isDLQ();
    }

    public NFeQueueTypeEnum getQueueType() {
        return queueType;
    }

    public String getQueueName() {
        return queueName;
    }

    public String getRoutingKey() {
        return routingKey;
    }

    public String getExchange() {
        return exchange;
    }

    public boolean isDurable() {
        return durable;
    }

    public boolean isExclusive() {
        return exclusive;
    }

    public boolean isAutoDelete() {
        return autoDelete;
    }

    /**
     * Verifica se é fila de emissão
     */
    public boolean isEmissao() {
        return queueType.isEmissao();
    }

    /**
     * Verifica se é fila de consulta
     */
    public boolean isConsulta() {
        return queueType.isConsulta();
    }

    /**
     * Verifica se é fila de evento
     */
    public boolean isEvento() {
        return queueType.isEvento();
    }

    /**
     * Verifica se é fila de retry
     */
    public boolean isRetry() {
        return queueType.isRetry();
    }

    /**
     * Verifica se é Dead Letter Queue
     */
    public boolean isDLQ() {
        return queueType.isDLQ();
    }

    /**
     * Retorna a prioridade da fila
     */
    public NFePriority getPriority() {
        return new NFePriority(queueType.getPriority());
    }

    /**
     * Retorna a configuração de TTL para a fila
     */
    public Long getTtlMs() {
        return queueType.getPriority().getTtlMs();
    }

    /**
     * Retorna a configuração de concurrency para a fila
     */
    public String getConcurrencyConfig() {
        return getPriority().getConcurrencyConfig();
    }

    /**
     * Retorna a configuração de prefetch para a fila
     */
    public String getPrefetchConfig() {
        return getPriority().getPrefetchConfig();
    }

    /**
     * Cria uma instância para fila de emissão alta
     */
    public static NFeQueueType emitirAlta() {
        return new NFeQueueType(NFeQueueTypeEnum.EMITIR_ALTA);
    }

    /**
     * Cria uma instância para fila de emissão normal
     */
    public static NFeQueueType emitirNormal() {
        return new NFeQueueType(NFeQueueTypeEnum.EMITIR_NORMAL);
    }

    /**
     * Cria uma instância para fila de emissão baixa
     */
    public static NFeQueueType emitirBaixa() {
        return new NFeQueueType(NFeQueueTypeEnum.EMITIR_BAIXA);
    }

    /**
     * Cria uma instância para fila de consulta
     */
    public static NFeQueueType consulta() {
        return new NFeQueueType(NFeQueueTypeEnum.CONSULTA_STATUS);
    }

    /**
     * Cria uma instância para fila de evento
     */
    public static NFeQueueType evento() {
        return new NFeQueueType(NFeQueueTypeEnum.CANCELAMENTO);
    }

    /**
     * Cria uma instância para fila de retry
     */
    public static NFeQueueType retry() {
        return new NFeQueueType(NFeQueueTypeEnum.RETRY);
    }

    /**
     * Cria uma instância para Dead Letter Queue
     */
    public static NFeQueueType dlq() {
        return new NFeQueueType(NFeQueueTypeEnum.DLQ_EMITIR);
    }

    @Override
    public String toString() {
        return "NFeQueueType{" +
                "queueType=" + queueType +
                ", queueName='" + queueName + '\'' +
                ", routingKey='" + routingKey + '\'' +
                ", exchange='" + exchange + '\'' +
                ", durable=" + durable +
                ", exclusive=" + exclusive +
                ", autoDelete=" + autoDelete +
                '}';
    }
}


