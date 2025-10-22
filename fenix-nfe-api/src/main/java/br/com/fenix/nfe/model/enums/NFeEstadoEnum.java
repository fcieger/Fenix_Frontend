package br.com.fenix.nfe.model.enums;

/**
 * Enum que representa os estados brasileiros para NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public enum NFeEstadoEnum {
    
    AC("AC", "Acre", 12),
    AL("AL", "Alagoas", 27),
    AP("AP", "Amapá", 16),
    AM("AM", "Amazonas", 13),
    BA("BA", "Bahia", 29),
    CE("CE", "Ceará", 23),
    DF("DF", "Distrito Federal", 53),
    ES("ES", "Espírito Santo", 32),
    GO("GO", "Goiás", 52),
    MA("MA", "Maranhão", 21),
    MT("MT", "Mato Grosso", 51),
    MS("MS", "Mato Grosso do Sul", 50),
    MG("MG", "Minas Gerais", 31),
    PA("PA", "Pará", 15),
    PB("PB", "Paraíba", 25),
    PR("PR", "Paraná", 41),
    PE("PE", "Pernambuco", 26),
    PI("PI", "Piauí", 22),
    RJ("RJ", "Rio de Janeiro", 33),
    RN("RN", "Rio Grande do Norte", 24),
    RS("RS", "Rio Grande do Sul", 43),
    RO("RO", "Rondônia", 11),
    RR("RR", "Roraima", 14),
    SC("SC", "Santa Catarina", 42),
    SP("SP", "São Paulo", 35),
    SE("SE", "Sergipe", 28),
    TO("TO", "Tocantins", 17);

    private final String uf;
    private final String nome;
    private final Integer codigoIbge;

    NFeEstadoEnum(String uf, String nome, Integer codigoIbge) {
        this.uf = uf;
        this.nome = nome;
        this.codigoIbge = codigoIbge;
    }

    public String getUf() {
        return uf;
    }

    public String getNome() {
        return nome;
    }

    public Integer getCodigoIbge() {
        return codigoIbge;
    }

    /**
     * Retorna o código da UF para SEFAZ
     */
    public String getCodigoSefaz() {
        return codigoIbge.toString();
    }

    /**
     * Verifica se o estado tem SEFAZ própria
     */
    public boolean temSefazPropria() {
        return SP.equals(this) || RJ.equals(this) || MG.equals(this) || 
               RS.equals(this) || PR.equals(this) || SC.equals(this) || 
               BA.equals(this) || GO.equals(this) || DF.equals(this);
    }

    /**
     * Retorna a URL da SEFAZ para o estado
     */
    public String getUrlSefaz() {
        if (temSefazPropria()) {
            return "https://" + uf.toLowerCase() + ".sefaz.gov.br";
        }
        return "https://www.nfe.fazenda.gov.br";
    }

    /**
     * Busca enum pela UF
     */
    public static NFeEstadoEnum fromUf(String uf) {
        if (uf == null) {
            return null;
        }
        for (NFeEstadoEnum estado : values()) {
            if (estado.uf.equalsIgnoreCase(uf)) {
                return estado;
            }
        }
        throw new IllegalArgumentException("UF inválida: " + uf);
    }

    /**
     * Busca enum pelo nome
     */
    public static NFeEstadoEnum fromNome(String nome) {
        if (nome == null) {
            return null;
        }
        for (NFeEstadoEnum estado : values()) {
            if (estado.nome.equalsIgnoreCase(nome)) {
                return estado;
            }
        }
        throw new IllegalArgumentException("Nome de estado inválido: " + nome);
    }

    /**
     * Busca enum pelo código IBGE
     */
    public static NFeEstadoEnum fromCodigoIbge(Integer codigoIbge) {
        if (codigoIbge == null) {
            return null;
        }
        for (NFeEstadoEnum estado : values()) {
            if (estado.codigoIbge.equals(codigoIbge)) {
                return estado;
            }
        }
        throw new IllegalArgumentException("Código IBGE inválido: " + codigoIbge);
    }

    /**
     * Busca enum pelo código SEFAZ
     */
    public static NFeEstadoEnum fromCodigoSefaz(String codigoSefaz) {
        if (codigoSefaz == null) {
            return null;
        }
        try {
            Integer codigo = Integer.parseInt(codigoSefaz);
            return fromCodigoIbge(codigo);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Código SEFAZ inválido: " + codigoSefaz);
        }
    }

    @Override
    public String toString() {
        return uf + " - " + nome;
    }
}


