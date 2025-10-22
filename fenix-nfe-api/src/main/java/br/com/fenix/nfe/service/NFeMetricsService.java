package br.com.fenix.nfe.service;

import br.com.fenix.nfe.model.enums.NFeStatusEnum;
import br.com.fenix.nfe.model.enums.NFeOperacaoEnum;
import br.com.fenix.nfe.model.enums.NFePriorityEnum;

/**
 * Interface para serviço de métricas customizadas da NFe
 */
public interface NFeMetricsService {

    /**
     * Incrementa contador de NFe emitidas
     * @param empresaCnpj CNPJ da empresa
     * @param status Status da NFe
     * @param ambiente Ambiente (HOMOLOGACAO/PRODUCAO)
     */
    void incrementarNFeEmitida(String empresaCnpj, NFeStatusEnum status, String ambiente);

    /**
     * Incrementa contador de erros
     * @param empresaCnpj CNPJ da empresa
     * @param tipoErro Tipo do erro
     * @param operacao Operação que gerou o erro
     */
    void incrementarErro(String empresaCnpj, String tipoErro, NFeOperacaoEnum operacao);

    /**
     * Registra tempo de processamento
     * @param empresaCnpj CNPJ da empresa
     * @param operacao Operação processada
     * @param duracaoMs Duração em milissegundos
     */
    void registrarTempoProcessamento(String empresaCnpj, NFeOperacaoEnum operacao, long duracaoMs);

    /**
     * Atualiza gauge de fila
     * @param nomeFila Nome da fila
     * @param tamanho Tamanho atual da fila
     */
    void atualizarTamanhoFila(String nomeFila, int tamanho);

    /**
     * Registra métrica por empresa
     * @param empresaCnpj CNPJ da empresa
     * @param metrica Nome da métrica
     * @param valor Valor da métrica
     * @param unidade Unidade da métrica
     */
    void registrarMetricaEmpresa(String empresaCnpj, String metrica, double valor, String unidade);

    /**
     * Registra métrica por tipo de operação
     * @param operacao Tipo de operação
     * @param metrica Nome da métrica
     * @param valor Valor da métrica
     * @param unidade Unidade da métrica
     */
    void registrarMetricaOperacao(NFeOperacaoEnum operacao, String metrica, double valor, String unidade);

    /**
     * Registra métrica de prioridade
     * @param prioridade Prioridade da operação
     * @param metrica Nome da métrica
     * @param valor Valor da métrica
     */
    void registrarMetricaPrioridade(NFePriorityEnum prioridade, String metrica, double valor);

    /**
     * Registra métrica de ambiente
     * @param ambiente Ambiente (HOMOLOGACAO/PRODUCAO)
     * @param metrica Nome da métrica
     * @param valor Valor da métrica
     */
    void registrarMetricaAmbiente(String ambiente, String metrica, double valor);

    /**
     * Registra métrica de estado
     * @param estado Estado brasileiro
     * @param metrica Nome da métrica
     * @param valor Valor da métrica
     */
    void registrarMetricaEstado(String estado, String metrica, double valor);

    /**
     * Registra métrica de SEFAZ
     * @param estado Estado da SEFAZ
     * @param operacao Operação realizada
     * @param codigoRetorno Código de retorno
     * @param tempoResposta Tempo de resposta em ms
     */
    void registrarMetricaSefaz(String estado, NFeOperacaoEnum operacao, String codigoRetorno, long tempoResposta);

    /**
     * Registra métrica de certificado
     * @param empresaCnpj CNPJ da empresa
     * @param tipoCertificado Tipo do certificado
     * @param valido Se o certificado é válido
     * @param diasExpiracao Dias para expiração
     */
    void registrarMetricaCertificado(String empresaCnpj, String tipoCertificado, boolean valido, int diasExpiracao);

    /**
     * Registra métrica de cache
     * @param tipoCache Tipo do cache
     * @param operacao Operação (HIT/MISS)
     * @param tamanho Tamanho do cache
     */
    void registrarMetricaCache(String tipoCache, String operacao, long tamanho);

    /**
     * Registra métrica de banco de dados
     * @param operacao Operação no banco
     * @param duracaoMs Duração em milissegundos
     * @param registrosAfetados Número de registros afetados
     */
    void registrarMetricaBanco(String operacao, long duracaoMs, int registrosAfetados);

    /**
     * Registra métrica de fila RabbitMQ
     * @param nomeFila Nome da fila
     * @param operacao Operação (PUBLISH/CONSUME)
     * @param tamanhoMensagem Tamanho da mensagem em bytes
     * @param duracaoMs Duração em milissegundos
     */
    void registrarMetricaFila(String nomeFila, String operacao, long tamanhoMensagem, long duracaoMs);

    /**
     * Registra métrica de API
     * @param endpoint Endpoint da API
     * @param metodo Método HTTP
     * @param statusCode Código de status HTTP
     * @param duracaoMs Duração em milissegundos
     * @param tamanhoResposta Tamanho da resposta em bytes
     */
    void registrarMetricaApi(String endpoint, String metodo, int statusCode, long duracaoMs, long tamanhoResposta);

    /**
     * Registra métrica de sistema
     * @param metrica Nome da métrica
     * @param valor Valor da métrica
     * @param unidade Unidade da métrica
     * @param tags Tags adicionais
     */
    void registrarMetricaSistema(String metrica, double valor, String unidade, String... tags);

    /**
     * Obtém estatísticas de uma empresa
     * @param empresaCnpj CNPJ da empresa
     * @return Estatísticas da empresa
     */
    String obterEstatisticasEmpresa(String empresaCnpj);

    /**
     * Obtém estatísticas gerais do sistema
     * @return Estatísticas gerais
     */
    String obterEstatisticasGerais();

    /**
     * Limpa métricas antigas
     * @param diasAntigos Dias para considerar como antigo
     */
    void limparMetricasAntigas(int diasAntigos);
}
