package br.com.fenix.nfe.model.enums;

/**
 * Enum que representa os ambientes da NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public enum NFeAmbienteEnum {
    
    HOMOLOGACAO("HOMOLOGACAO", "Homologação", "Ambiente de homologação/teste"),
    PRODUCAO("PRODUCAO", "Produção", "Ambiente de produção");

    private final String codigo;
    private final String descricao;
    private final String detalhes;

    NFeAmbienteEnum(String codigo, String descricao, String detalhes) {
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
     * Verifica se é ambiente de homologação
     */
    public boolean isHomologacao() {
        return HOMOLOGACAO.equals(this);
    }

    /**
     * Verifica se é ambiente de produção
     */
    public boolean isProducao() {
        return PRODUCAO.equals(this);
    }

    /**
     * Retorna o código numérico do ambiente para SEFAZ
     */
    public String getCodigoSefaz() {
        return isHomologacao() ? "2" : "1";
    }

    /**
     * Retorna a URL base da SEFAZ para o ambiente
     */
    public String getUrlBaseSefaz() {
        return isHomologacao() ? "homologacao" : "www";
    }

    /**
     * Busca enum pelo código
     */
    public static NFeAmbienteEnum fromCodigo(String codigo) {
        if (codigo == null) {
            return null;
        }
        for (NFeAmbienteEnum ambiente : values()) {
            if (ambiente.codigo.equals(codigo)) {
                return ambiente;
            }
        }
        throw new IllegalArgumentException("Código de ambiente inválido: " + codigo);
    }

    /**
     * Busca enum pela descrição
     */
    public static NFeAmbienteEnum fromDescricao(String descricao) {
        if (descricao == null) {
            return null;
        }
        for (NFeAmbienteEnum ambiente : values()) {
            if (ambiente.descricao.equals(descricao)) {
                return ambiente;
            }
        }
        throw new IllegalArgumentException("Descrição de ambiente inválida: " + descricao);
    }

    /**
     * Busca enum pelo código da SEFAZ
     */
    public static NFeAmbienteEnum fromCodigoSefaz(String codigoSefaz) {
        if (codigoSefaz == null) {
            return null;
        }
        if ("2".equals(codigoSefaz)) {
            return HOMOLOGACAO;
        } else if ("1".equals(codigoSefaz)) {
            return PRODUCAO;
        }
        throw new IllegalArgumentException("Código SEFAZ inválido: " + codigoSefaz);
    }

    @Override
    public String toString() {
        return codigo + " - " + descricao;
    }
}


