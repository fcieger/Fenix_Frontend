package br.com.fenix.nfe.model.queue;

import br.com.fenix.nfe.model.enums.NFePriorityEnum;

/**
 * Classe utilitária para gerenciar prioridades de fila
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public class NFePriority {

    private final NFePriorityEnum priority;
    private final Integer valor;
    private final Long ttlMs;
    private final Integer maxWorkers;
    private final Integer prefetch;

    public NFePriority(NFePriorityEnum priority) {
        this.priority = priority;
        this.valor = priority.getValor();
        this.ttlMs = priority.getTtlMs();
        this.maxWorkers = priority.getMaxWorkers();
        this.prefetch = priority.getPrefetch();
    }

    public NFePriorityEnum getPriority() {
        return priority;
    }

    public Integer getValor() {
        return valor;
    }

    public Long getTtlMs() {
        return ttlMs;
    }

    public Integer getMaxWorkers() {
        return maxWorkers;
    }

    public Integer getPrefetch() {
        return prefetch;
    }

    /**
     * Verifica se é alta prioridade
     */
    public boolean isAlta() {
        return priority.isAlta();
    }

    /**
     * Verifica se é prioridade normal
     */
    public boolean isNormal() {
        return priority.isNormal();
    }

    /**
     * Verifica se é baixa prioridade
     */
    public boolean isBaixa() {
        return priority.isBaixa();
    }

    /**
     * Retorna o TTL em segundos
     */
    public Long getTtlSeconds() {
        return ttlMs / 1000;
    }

    /**
     * Retorna o TTL em minutos
     */
    public Long getTtlMinutes() {
        return ttlMs / (1000 * 60);
    }

    /**
     * Retorna a configuração de concurrency para Spring AMQP
     */
    public String getConcurrencyConfig() {
        return "1-" + maxWorkers;
    }

    /**
     * Retorna a configuração de prefetch para Spring AMQP
     */
    public String getPrefetchConfig() {
        return prefetch.toString();
    }

    /**
     * Cria uma instância de alta prioridade
     */
    public static NFePriority alta() {
        return new NFePriority(NFePriorityEnum.ALTA);
    }

    /**
     * Cria uma instância de prioridade normal
     */
    public static NFePriority normal() {
        return new NFePriority(NFePriorityEnum.NORMAL);
    }

    /**
     * Cria uma instância de baixa prioridade
     */
    public static NFePriority baixa() {
        return new NFePriority(NFePriorityEnum.BAIXA);
    }

    @Override
    public String toString() {
        return "NFePriority{" +
                "priority=" + priority +
                ", valor=" + valor +
                ", ttlMs=" + ttlMs +
                ", maxWorkers=" + maxWorkers +
                ", prefetch=" + prefetch +
                '}';
    }
}


