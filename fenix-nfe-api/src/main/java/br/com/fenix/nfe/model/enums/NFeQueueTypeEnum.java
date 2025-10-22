package br.com.fenix.nfe.model.enums;

/**
 * Enum que representa os tipos de filas da NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public enum NFeQueueTypeEnum {
    
    EMITIR_ALTA("EMITIR_ALTA", "Emitir Alta", "Fila de emissão de alta prioridade"),
    EMITIR_NORMAL("EMITIR_NORMAL", "Emitir Normal", "Fila de emissão de prioridade normal"),
    EMITIR_BAIXA("EMITIR_BAIXA", "Emitir Baixa", "Fila de emissão de baixa prioridade"),
    CONSULTA_STATUS("CONSULTA_STATUS", "Consulta Status", "Fila de consulta de status"),
    CONSULTA_CADASTRO("CONSULTA_CADASTRO", "Consulta Cadastro", "Fila de consulta de cadastro"),
    CONSULTA_XML("CONSULTA_XML", "Consulta XML", "Fila de consulta de XML"),
    CONSULTA_DISTRIBUICAO("CONSULTA_DISTRIBUICAO", "Consulta Distribuição", "Fila de consulta de distribuição"),
    CANCELAMENTO("CANCELAMENTO", "Cancelamento", "Fila de cancelamento"),
    CARTA_CORRECAO("CARTA_CORRECAO", "Carta Correção", "Fila de carta de correção"),
    MANIFESTACAO("MANIFESTACAO", "Manifestação", "Fila de manifestação"),
    ATOR_INTERESSADO("ATOR_INTERESSADO", "Ator Interessado", "Fila de ator interessado"),
    INUTILIZACAO("INUTILIZACAO", "Inutilização", "Fila de inutilização"),
    RETRY("RETRY", "Retry", "Fila de retry"),
    DLQ_EMITIR("DLQ_EMITIR", "DLQ Emitir", "Dead Letter Queue para emissão"),
    DLQ_CONSULTA("DLQ_CONSULTA", "DLQ Consulta", "Dead Letter Queue para consulta"),
    DLQ_EVENTO("DLQ_EVENTO", "DLQ Evento", "Dead Letter Queue para eventos");

    private final String codigo;
    private final String descricao;
    private final String detalhes;

    NFeQueueTypeEnum(String codigo, String descricao, String detalhes) {
        this.codigo = codigo;
        this.descricao = descricao;
        this.detalhes = detalhes;
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
     * Verifica se é fila de emissão
     */
    public boolean isEmissao() {
        return EMITIR_ALTA.equals(this) || 
               EMITIR_NORMAL.equals(this) || 
               EMITIR_BAIXA.equals(this);
    }

    /**
     * Verifica se é fila de consulta
     */
    public boolean isConsulta() {
        return CONSULTA_STATUS.equals(this) || 
               CONSULTA_CADASTRO.equals(this) || 
               CONSULTA_XML.equals(this) || 
               CONSULTA_DISTRIBUICAO.equals(this);
    }

    /**
     * Verifica se é fila de evento
     */
    public boolean isEvento() {
        return CANCELAMENTO.equals(this) || 
               CARTA_CORRECAO.equals(this) || 
               MANIFESTACAO.equals(this) || 
               ATOR_INTERESSADO.equals(this) || 
               INUTILIZACAO.equals(this);
    }

    /**
     * Verifica se é fila de retry
     */
    public boolean isRetry() {
        return RETRY.equals(this);
    }

    /**
     * Verifica se é Dead Letter Queue
     */
    public boolean isDLQ() {
        return DLQ_EMITIR.equals(this) || 
               DLQ_CONSULTA.equals(this) || 
               DLQ_EVENTO.equals(this);
    }

    /**
     * Retorna o nome da fila no RabbitMQ
     */
    public String getQueueName() {
        return "nfe.fila." + codigo.toLowerCase().replace("_", ".");
    }

    /**
     * Retorna o routing key para a fila
     */
    public String getRoutingKey() {
        return "nfe." + codigo.toLowerCase().replace("_", ".");
    }

    /**
     * Retorna o exchange para a fila
     */
    public String getExchange() {
        if (isDLQ()) {
            return "nfe.dlx";
        }
        return "nfe.exchange";
    }

    /**
     * Retorna a prioridade da fila
     */
    public NFePriorityEnum getPriority() {
        if (EMITIR_ALTA.equals(this)) {
            return NFePriorityEnum.ALTA;
        } else if (EMITIR_BAIXA.equals(this)) {
            return NFePriorityEnum.BAIXA;
        } else {
            return NFePriorityEnum.NORMAL;
        }
    }

    /**
     * Busca enum pelo código
     */
    public static NFeQueueTypeEnum fromCodigo(String codigo) {
        if (codigo == null) {
            return null;
        }
        for (NFeQueueTypeEnum queueType : values()) {
            if (queueType.codigo.equals(codigo)) {
                return queueType;
            }
        }
        throw new IllegalArgumentException("Código de tipo de fila inválido: " + codigo);
    }

    /**
     * Busca enum pela descrição
     */
    public static NFeQueueTypeEnum fromDescricao(String descricao) {
        if (descricao == null) {
            return null;
        }
        for (NFeQueueTypeEnum queueType : values()) {
            if (queueType.descricao.equals(descricao)) {
                return queueType;
            }
        }
        throw new IllegalArgumentException("Descrição de tipo de fila inválida: " + descricao);
    }

    /**
     * Busca enum pelo nome da fila
     */
    public static NFeQueueTypeEnum fromQueueName(String queueName) {
        if (queueName == null) {
            return null;
        }
        for (NFeQueueTypeEnum queueType : values()) {
            if (queueType.getQueueName().equals(queueName)) {
                return queueType;
            }
        }
        throw new IllegalArgumentException("Nome de fila inválido: " + queueName);
    }

    @Override
    public String toString() {
        return codigo + " - " + descricao;
    }
}


