package br.com.fenix.nfe.model.enums;

/**
 * Enum que representa os tipos de operações da NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public enum NFeOperacaoEnum {
    
    EMITIR("EMITIR", "Emitir NFe", "Emissão de Nota Fiscal Eletrônica"),
    CONSULTAR_STATUS("CONSULTAR_STATUS", "Consultar Status", "Consulta de status da NFe"),
    CONSULTAR_XML("CONSULTAR_XML", "Consultar XML", "Consulta do XML da NFe"),
    CONSULTAR_CADASTRO("CONSULTAR_CADASTRO", "Consultar Cadastro", "Consulta de cadastro de contribuinte"),
    CONSULTAR_DISTRIBUICAO("CONSULTAR_DISTRIBUICAO", "Consultar Distribuição", "Consulta de distribuição de DFe"),
    CANCELAR("CANCELAR", "Cancelar NFe", "Cancelamento de NFe"),
    CARTA_CORRECAO("CARTA_CORRECAO", "Carta de Correção", "Carta de Correção Eletrônica"),
    MANIFESTACAO("MANIFESTACAO", "Manifestação", "Manifestação do Destinatário"),
    ATOR_INTERESSADO("ATOR_INTERESSADO", "Ator Interessado", "Ator Interessado na NFe"),
    INUTILIZAR("INUTILIZAR", "Inutilizar", "Inutilização de numeração"),
    VALIDAR("VALIDAR", "Validar", "Validação de XML"),
    PROCESSAR_FILA("PROCESSAR_FILA", "Processar Fila", "Processamento de mensagem da fila"),
    RETRY("RETRY", "Retry", "Nova tentativa de processamento"),
    DLQ("DLQ", "Dead Letter Queue", "Processamento de mensagem falhada");

    private final String codigo;
    private final String descricao;
    private final String detalhes;

    NFeOperacaoEnum(String codigo, String descricao, String detalhes) {
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
     * Verifica se a operação é de consulta
     */
    public boolean isConsulta() {
        return CONSULTAR_STATUS.equals(this) || 
               CONSULTAR_XML.equals(this) || 
               CONSULTAR_CADASTRO.equals(this) || 
               CONSULTAR_DISTRIBUICAO.equals(this);
    }

    /**
     * Verifica se a operação é de evento
     */
    public boolean isEvento() {
        return CANCELAR.equals(this) || 
               CARTA_CORRECAO.equals(this) || 
               MANIFESTACAO.equals(this) || 
               ATOR_INTERESSADO.equals(this);
    }

    /**
     * Verifica se a operação é de processamento
     */
    public boolean isProcessamento() {
        return EMITIR.equals(this) || 
               PROCESSAR_FILA.equals(this) || 
               RETRY.equals(this) || 
               DLQ.equals(this);
    }

    /**
     * Verifica se a operação é de validação
     */
    public boolean isValidacao() {
        return VALIDAR.equals(this);
    }

    /**
     * Verifica se a operação é de inutilização
     */
    public boolean isInutilizacao() {
        return INUTILIZAR.equals(this);
    }

    /**
     * Verifica se a operação requer certificado digital
     */
    public boolean requerCertificado() {
        return !isConsulta() && !isValidacao();
    }

    /**
     * Verifica se a operação é assíncrona
     */
    public boolean isAssincrona() {
        return EMITIR.equals(this) || 
               CANCELAR.equals(this) || 
               CARTA_CORRECAO.equals(this) || 
               MANIFESTACAO.equals(this) || 
               ATOR_INTERESSADO.equals(this) || 
               INUTILIZAR.equals(this);
    }

    /**
     * Busca enum pelo código
     */
    public static NFeOperacaoEnum fromCodigo(String codigo) {
        if (codigo == null) {
            return null;
        }
        for (NFeOperacaoEnum operacao : values()) {
            if (operacao.codigo.equals(codigo)) {
                return operacao;
            }
        }
        throw new IllegalArgumentException("Código de operação inválido: " + codigo);
    }

    /**
     * Busca enum pela descrição
     */
    public static NFeOperacaoEnum fromDescricao(String descricao) {
        if (descricao == null) {
            return null;
        }
        for (NFeOperacaoEnum operacao : values()) {
            if (operacao.descricao.equals(descricao)) {
                return operacao;
            }
        }
        throw new IllegalArgumentException("Descrição de operação inválida: " + descricao);
    }

    @Override
    public String toString() {
        return codigo + " - " + descricao;
    }
}


