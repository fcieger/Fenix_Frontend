package br.com.fenix.nfe.model.enums;

/**
 * Enum que representa os possíveis status de uma NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public enum NFeStatusEnum {
    
    PENDENTE("PENDENTE", "Pendente", "NFe aguardando processamento"),
    PROCESSANDO("PROCESSANDO", "Processando", "NFe sendo processada"),
    AUTORIZADA("AUTORIZADA", "Autorizada", "NFe autorizada pela SEFAZ"),
    REJEITADA("REJEITADA", "Rejeitada", "NFe rejeitada pela SEFAZ"),
    CANCELADA("CANCELADA", "Cancelada", "NFe cancelada"),
    ERRO("ERRO", "Erro", "Erro no processamento da NFe"),
    RETRY("RETRY", "Retry", "NFe aguardando nova tentativa"),
    INUTILIZADA("INUTILIZADA", "Inutilizada", "NFe inutilizada");

    private final String codigo;
    private final String descricao;
    private final String detalhes;

    NFeStatusEnum(String codigo, String descricao, String detalhes) {
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
     * Verifica se o status indica sucesso
     */
    public boolean isSucesso() {
        return AUTORIZADA.equals(this);
    }

    /**
     * Verifica se o status indica erro
     */
    public boolean isErro() {
        return REJEITADA.equals(this) || ERRO.equals(this);
    }

    /**
     * Verifica se o status indica processamento
     */
    public boolean isProcessando() {
        return PROCESSANDO.equals(this) || RETRY.equals(this);
    }

    /**
     * Verifica se o status indica finalização
     */
    public boolean isFinalizado() {
        return AUTORIZADA.equals(this) || REJEITADA.equals(this) || 
               CANCELADA.equals(this) || INUTILIZADA.equals(this);
    }

    /**
     * Verifica se o status permite cancelamento
     */
    public boolean permiteCancelamento() {
        return AUTORIZADA.equals(this);
    }

    /**
     * Verifica se o status permite carta de correção
     */
    public boolean permiteCartaCorrecao() {
        return AUTORIZADA.equals(this);
    }

    /**
     * Verifica se o status permite inutilização
     */
    public boolean permiteInutilizacao() {
        return PENDENTE.equals(this) || PROCESSANDO.equals(this) || 
               REJEITADA.equals(this) || ERRO.equals(this);
    }

    /**
     * Busca enum pelo código
     */
    public static NFeStatusEnum fromCodigo(String codigo) {
        if (codigo == null) {
            return null;
        }
        for (NFeStatusEnum status : values()) {
            if (status.codigo.equals(codigo)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Código de status inválido: " + codigo);
    }

    /**
     * Busca enum pela descrição
     */
    public static NFeStatusEnum fromDescricao(String descricao) {
        if (descricao == null) {
            return null;
        }
        for (NFeStatusEnum status : values()) {
            if (status.descricao.equals(descricao)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Descrição de status inválida: " + descricao);
    }

    @Override
    public String toString() {
        return codigo + " - " + descricao;
    }
}


