package br.com.fenix.nfe.service;

import br.com.fenix.nfe.api.dto.request.NFeRequest;
import br.com.fenix.nfe.model.enums.NFeOperacaoEnum;
import br.com.fenix.nfe.model.enums.NFePriorityEnum;
import br.com.fenix.nfe.model.queue.NFeQueueMessage;

/**
 * Interface para gerenciamento de filas de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public interface NFeQueueService {

    /**
     * Envia NFe para fila de emissão
     * 
     * @param request DTO de entrada da NFe
     * @param chaveAcesso Chave de acesso da NFe
     * @param priority Prioridade da mensagem
     */
    void enviarParaFilaEmitir(NFeRequest request, String chaveAcesso, NFePriorityEnum priority);

    /**
     * Envia consulta para fila de consulta
     * 
     * @param identificador Identificador (CNPJ, chave de acesso, etc.)
     * @param empresaId ID da empresa
     * @param operacao Tipo de operação
     */
    void enviarParaFilaConsulta(String identificador, String empresaId, NFeOperacaoEnum operacao);

    /**
     * Envia evento para fila de eventos
     * 
     * @param chaveAcesso Chave de acesso da NFe
     * @param empresaId ID da empresa
     * @param operacao Tipo de operação
     * @param dados Dados adicionais
     */
    void enviarParaFilaEvento(String chaveAcesso, String empresaId, NFeOperacaoEnum operacao, String dados);

    /**
     * Envia inutilização para fila de inutilização
     * 
     * @param empresaId ID da empresa
     * @param serie Série da NFe
     * @param numeroInicial Número inicial
     * @param numeroFinal Número final
     * @param justificativa Justificativa
     */
    void enviarParaFilaInutilizacao(String empresaId, Integer serie, Integer numeroInicial, Integer numeroFinal, String justificativa);

    /**
     * Envia mensagem para fila de retry
     * 
     * @param mensagem Mensagem original
     * @param tentativa Número da tentativa
     */
    void enviarParaRetry(NFeQueueMessage mensagem, Integer tentativa);

    /**
     * Envia mensagem para Dead Letter Queue
     * 
     * @param mensagem Mensagem que falhou
     * @param motivo Motivo da falha
     */
    void enviarParaDLQ(NFeQueueMessage mensagem, String motivo);

    /**
     * Processa mensagem da fila
     * 
     * @param mensagem Mensagem a ser processada
     */
    void processarMensagem(NFeQueueMessage mensagem);

    /**
     * Retorna estatísticas das filas
     * 
     * @return Estatísticas das filas
     */
    Object obterEstatisticasFilas();

    /**
     * Retorna status das filas
     * 
     * @return Status das filas
     */
    Object obterStatusFilas();

    /**
     * Pausa uma fila
     * 
     * @param nomeFila Nome da fila
     */
    void pausarFila(String nomeFila);

    /**
     * Retoma uma fila
     * 
     * @param nomeFila Nome da fila
     */
    void retomarFila(String nomeFila);

    /**
     * Limpa uma fila
     * 
     * @param nomeFila Nome da fila
     */
    void limparFila(String nomeFila);

    /**
     * Retorna mensagens de uma fila
     * 
     * @param nomeFila Nome da fila
     * @param limite Limite de mensagens
     * @return Lista de mensagens
     */
    Object obterMensagensFila(String nomeFila, Integer limite);

    /**
     * Reprocessa mensagem de uma fila
     * 
     * @param nomeFila Nome da fila
     * @param mensagemId ID da mensagem
     */
    void reprocessarMensagem(String nomeFila, String mensagemId);

    /**
     * Remove mensagem de uma fila
     * 
     * @param nomeFila Nome da fila
     * @param mensagemId ID da mensagem
     */
    void removerMensagem(String nomeFila, String mensagemId);
}

