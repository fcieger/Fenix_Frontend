package br.com.fenix.nfe.model.enums;

/**
 * Enum que representa as prioridades das filas de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public enum NFePriorityEnum {
    
    ALTA(1, "ALTA", "Alta Prioridade", "Processamento prioritário"),
    NORMAL(2, "NORMAL", "Prioridade Normal", "Processamento normal"),
    BAIXA(3, "BAIXA", "Baixa Prioridade", "Processamento em lote");

    private final Integer valor;
    private final String codigo;
    private final String descricao;
    private final String detalhes;

    NFePriorityEnum(Integer valor, String codigo, String descricao, String detalhes) {
        this.valor = valor;
        this.codigo = codigo;
        this.descricao = descricao;
        this.detalhes = detalhes;
    }

    public Integer getValor() {
        return valor;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getDetalhes() {
        return detalhes;
    }

    /**
     * Verifica se é alta prioridade
     */
    public boolean isAlta() {
        return ALTA.equals(this);
    }

    /**
     * Verifica se é prioridade normal
     */
    public boolean isNormal() {
        return NORMAL.equals(this);
    }

    /**
     * Verifica se é baixa prioridade
     */
    public boolean isBaixa() {
        return BAIXA.equals(this);
    }

    /**
     * Retorna o tempo de TTL em milissegundos
     */
    public Long getTtlMs() {
        switch (this) {
            case ALTA:
                return 300000L; // 5 minutos
            case NORMAL:
                return 600000L; // 10 minutos
            case BAIXA:
                return 1800000L; // 30 minutos
            default:
                return 600000L; // 10 minutos padrão
        }
    }

    /**
     * Retorna o número máximo de workers
     */
    public Integer getMaxWorkers() {
        switch (this) {
            case ALTA:
                return 5;
            case NORMAL:
                return 10;
            case BAIXA:
                return 3;
            default:
                return 5;
        }
    }

    /**
     * Retorna o prefetch para RabbitMQ
     */
    public Integer getPrefetch() {
        switch (this) {
            case ALTA:
                return 1; // Processa uma por vez para alta prioridade
            case NORMAL:
                return 2; // Processa até 2 por vez
            case BAIXA:
                return 5; // Processa até 5 por vez
            default:
                return 1;
        }
    }

    /**
     * Busca enum pelo valor
     */
    public static NFePriorityEnum fromValor(Integer valor) {
        if (valor == null) {
            return null;
        }
        for (NFePriorityEnum priority : values()) {
            if (priority.valor.equals(valor)) {
                return priority;
            }
        }
        throw new IllegalArgumentException("Valor de prioridade inválido: " + valor);
    }

    /**
     * Busca enum pelo código
     */
    public static NFePriorityEnum fromCodigo(String codigo) {
        if (codigo == null) {
            return null;
        }
        for (NFePriorityEnum priority : values()) {
            if (priority.codigo.equals(codigo)) {
                return priority;
            }
        }
        throw new IllegalArgumentException("Código de prioridade inválido: " + codigo);
    }

    /**
     * Busca enum pela descrição
     */
    public static NFePriorityEnum fromDescricao(String descricao) {
        if (descricao == null) {
            return null;
        }
        for (NFePriorityEnum priority : values()) {
            if (priority.descricao.equals(descricao)) {
                return priority;
            }
        }
        throw new IllegalArgumentException("Descrição de prioridade inválida: " + descricao);
    }

    @Override
    public String toString() {
        return codigo + " - " + descricao;
    }
}


