package br.com.fenix.nfe.service.impl;

import br.com.fenix.nfe.model.enums.NFeStatusEnum;
import br.com.fenix.nfe.model.enums.NFeOperacaoEnum;
import br.com.fenix.nfe.model.enums.NFePriorityEnum;
import br.com.fenix.nfe.service.NFeMetricsService;
import br.com.fenix.nfe.api.metrics.NFeMetrics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Implementação do serviço de métricas customizadas da NFe
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NFeMetricsServiceImpl implements NFeMetricsService {

    private final NFeMetrics nfeMetrics;
    
    // Cache para estatísticas em tempo real
    private final Map<String, AtomicLong> contadoresEmpresa = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> contadoresOperacao = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> contadoresErro = new ConcurrentHashMap<>();

    @Override
    public void incrementarNFeEmitida(String empresaCnpj, NFeStatusEnum status, String ambiente) {
        log.debug("Incrementando NFe emitida: empresa={}, status={}, ambiente={}", empresaCnpj, status, ambiente);
        
        // Incrementar contador global
        nfeMetrics.incrementarNFeEmitida(status);
        
        // Incrementar contador por empresa
        String chaveEmpresa = String.format("nfe.emitida.empresa.%s.status.%s.ambiente.%s", 
                empresaCnpj, status.name(), ambiente);
        contadoresEmpresa.computeIfAbsent(chaveEmpresa, k -> new AtomicLong(0)).incrementAndGet();
        
        // Registrar métrica personalizada
        nfeMetrics.recordCustomMetric("nfe.emitida.empresa", 1, "count", 
                "empresa", empresaCnpj, 
                "status", status.name(), 
                "ambiente", ambiente);
    }

    @Override
    public void incrementarErro(String empresaCnpj, String tipoErro, NFeOperacaoEnum operacao) {
        log.debug("Incrementando erro: empresa={}, tipo={}, operacao={}", empresaCnpj, tipoErro, operacao);
        
        // Incrementar contador global
        nfeMetrics.incrementarErro();
        
        // Incrementar contador por empresa
        String chaveEmpresa = String.format("erro.empresa.%s.tipo.%s.operacao.%s", 
                empresaCnpj, tipoErro, operacao.name());
        contadoresEmpresa.computeIfAbsent(chaveEmpresa, k -> new AtomicLong(0)).incrementAndGet();
        
        // Incrementar contador por operação
        String chaveOperacao = String.format("erro.operacao.%s.tipo.%s", operacao.name(), tipoErro);
        contadoresOperacao.computeIfAbsent(chaveOperacao, k -> new AtomicLong(0)).incrementAndGet();
        
        // Registrar métrica personalizada
        nfeMetrics.recordCustomMetric("nfe.erro", 1, "count",
                "empresa", empresaCnpj,
                "tipo", tipoErro,
                "operacao", operacao.name());
    }

    @Override
    public void registrarTempoProcessamento(String empresaCnpj, NFeOperacaoEnum operacao, long duracaoMs) {
        log.debug("Registrando tempo de processamento: empresa={}, operacao={}, duracao={}ms", 
                empresaCnpj, operacao, duracaoMs);
        
        // Registrar timer global
        nfeMetrics.recordProcessingTime(operacao, duracaoMs);
        
        // Registrar métrica personalizada
        nfeMetrics.recordCustomMetric("nfe.tempo.processamento", duracaoMs, "milliseconds",
                "empresa", empresaCnpj,
                "operacao", operacao.name());
    }

    @Override
    public void atualizarTamanhoFila(String nomeFila, int tamanho) {
        log.debug("Atualizando tamanho da fila: fila={}, tamanho={}", nomeFila, tamanho);
        
        // Atualizar gauge global
        nfeMetrics.updateQueueDepth(nomeFila, tamanho);
        
        // Registrar métrica personalizada
        nfeMetrics.recordCustomMetric("nfe.fila.tamanho", tamanho, "messages",
                "fila", nomeFila);
    }

    @Override
    public void registrarMetricaEmpresa(String empresaCnpj, String metrica, double valor, String unidade) {
        log.debug("Registrando métrica por empresa: empresa={}, metrica={}, valor={}, unidade={}", 
                empresaCnpj, metrica, valor, unidade);
        
        nfeMetrics.recordCustomMetric("nfe.empresa." + metrica, valor, unidade,
                "empresa", empresaCnpj);
    }

    @Override
    public void registrarMetricaOperacao(NFeOperacaoEnum operacao, String metrica, double valor, String unidade) {
        log.debug("Registrando métrica por operação: operacao={}, metrica={}, valor={}, unidade={}", 
                operacao, metrica, valor, unidade);
        
        nfeMetrics.recordCustomMetric("nfe.operacao." + metrica, valor, unidade,
                "operacao", operacao.name());
    }

    @Override
    public void registrarMetricaPrioridade(NFePriorityEnum prioridade, String metrica, double valor) {
        log.debug("Registrando métrica por prioridade: prioridade={}, metrica={}, valor={}", 
                prioridade, metrica, valor);
        
        nfeMetrics.recordCustomMetric("nfe.prioridade." + metrica, valor, "count",
                "prioridade", prioridade.name());
    }

    @Override
    public void registrarMetricaAmbiente(String ambiente, String metrica, double valor) {
        log.debug("Registrando métrica por ambiente: ambiente={}, metrica={}, valor={}", 
                ambiente, metrica, valor);
        
        nfeMetrics.recordCustomMetric("nfe.ambiente." + metrica, valor, "count",
                "ambiente", ambiente);
    }

    @Override
    public void registrarMetricaEstado(String estado, String metrica, double valor) {
        log.debug("Registrando métrica por estado: estado={}, metrica={}, valor={}", 
                estado, metrica, valor);
        
        nfeMetrics.recordCustomMetric("nfe.estado." + metrica, valor, "count",
                "estado", estado);
    }

    @Override
    public void registrarMetricaSefaz(String estado, NFeOperacaoEnum operacao, String codigoRetorno, long tempoResposta) {
        log.debug("Registrando métrica SEFAZ: estado={}, operacao={}, codigo={}, tempo={}ms", 
                estado, operacao, codigoRetorno, tempoResposta);
        
        nfeMetrics.recordCustomMetric("nfe.sefaz.tempo.resposta", tempoResposta, "milliseconds",
                "estado", estado,
                "operacao", operacao.name(),
                "codigo", codigoRetorno);
    }

    @Override
    public void registrarMetricaCertificado(String empresaCnpj, String tipoCertificado, boolean valido, int diasExpiracao) {
        log.debug("Registrando métrica certificado: empresa={}, tipo={}, valido={}, dias={}", 
                empresaCnpj, tipoCertificado, valido, diasExpiracao);
        
        nfeMetrics.recordCustomMetric("nfe.certificado.valido", valido ? 1 : 0, "boolean",
                "empresa", empresaCnpj,
                "tipo", tipoCertificado);
        
        nfeMetrics.recordCustomMetric("nfe.certificado.dias.expiracao", diasExpiracao, "days",
                "empresa", empresaCnpj,
                "tipo", tipoCertificado);
    }

    @Override
    public void registrarMetricaCache(String tipoCache, String operacao, long tamanho) {
        log.debug("Registrando métrica cache: tipo={}, operacao={}, tamanho={}", 
                tipoCache, operacao, tamanho);
        
        nfeMetrics.recordCustomMetric("nfe.cache." + operacao.toLowerCase(), 1, "count",
                "tipo", tipoCache);
        
        nfeMetrics.recordCustomMetric("nfe.cache.tamanho", tamanho, "bytes",
                "tipo", tipoCache);
    }

    @Override
    public void registrarMetricaBanco(String operacao, long duracaoMs, int registrosAfetados) {
        log.debug("Registrando métrica banco: operacao={}, duracao={}ms, registros={}", 
                operacao, duracaoMs, registrosAfetados);
        
        nfeMetrics.recordCustomMetric("nfe.banco.tempo", duracaoMs, "milliseconds",
                "operacao", operacao);
        
        nfeMetrics.recordCustomMetric("nfe.banco.registros", registrosAfetados, "count",
                "operacao", operacao);
    }

    @Override
    public void registrarMetricaFila(String nomeFila, String operacao, long tamanhoMensagem, long duracaoMs) {
        log.debug("Registrando métrica fila: fila={}, operacao={}, tamanho={}bytes, duracao={}ms", 
                nomeFila, operacao, tamanhoMensagem, duracaoMs);
        
        nfeMetrics.recordCustomMetric("nfe.fila." + operacao.toLowerCase(), 1, "count",
                "fila", nomeFila);
        
        nfeMetrics.recordCustomMetric("nfe.fila.tamanho.mensagem", tamanhoMensagem, "bytes",
                "fila", nomeFila);
        
        nfeMetrics.recordCustomMetric("nfe.fila.tempo", duracaoMs, "milliseconds",
                "fila", nomeFila);
    }

    @Override
    public void registrarMetricaApi(String endpoint, String metodo, int statusCode, long duracaoMs, long tamanhoResposta) {
        log.debug("Registrando métrica API: endpoint={}, metodo={}, status={}, duracao={}ms, tamanho={}bytes", 
                endpoint, metodo, statusCode, duracaoMs, tamanhoResposta);
        
        nfeMetrics.recordCustomMetric("nfe.api.tempo.resposta", duracaoMs, "milliseconds",
                "endpoint", endpoint,
                "metodo", metodo,
                "status", String.valueOf(statusCode));
        
        nfeMetrics.recordCustomMetric("nfe.api.tamanho.resposta", tamanhoResposta, "bytes",
                "endpoint", endpoint,
                "metodo", metodo);
    }

    @Override
    public void registrarMetricaSistema(String metrica, double valor, String unidade, String... tags) {
        log.debug("Registrando métrica sistema: metrica={}, valor={}, unidade={}, tags={}", 
                metrica, valor, unidade, String.join(",", tags));
        
        nfeMetrics.recordCustomMetric("nfe.sistema." + metrica, valor, unidade, tags);
    }

    @Override
    public String obterEstatisticasEmpresa(String empresaCnpj) {
        log.debug("Obtendo estatísticas da empresa: {}", empresaCnpj);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("empresa", empresaCnpj);
        stats.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        // Contar métricas por empresa
        long totalNFe = contadoresEmpresa.entrySet().stream()
                .filter(entry -> entry.getKey().contains("nfe.emitida.empresa." + empresaCnpj))
                .mapToLong(entry -> entry.getValue().get())
                .sum();
        
        long totalErros = contadoresEmpresa.entrySet().stream()
                .filter(entry -> entry.getKey().contains("erro.empresa." + empresaCnpj))
                .mapToLong(entry -> entry.getValue().get())
                .sum();
        
        stats.put("totalNFe", totalNFe);
        stats.put("totalErros", totalErros);
        stats.put("taxaErro", totalNFe > 0 ? (double) totalErros / totalNFe * 100 : 0);
        
        return stats.toString();
    }

    @Override
    public String obterEstatisticasGerais() {
        log.debug("Obtendo estatísticas gerais do sistema");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        // Contar métricas gerais
        long totalNFe = contadoresEmpresa.entrySet().stream()
                .filter(entry -> entry.getKey().contains("nfe.emitida.empresa"))
                .mapToLong(entry -> entry.getValue().get())
                .sum();
        
        long totalErros = contadoresOperacao.entrySet().stream()
                .filter(entry -> entry.getKey().contains("erro.operacao"))
                .mapToLong(entry -> entry.getValue().get())
                .sum();
        
        stats.put("totalNFe", totalNFe);
        stats.put("totalErros", totalErros);
        stats.put("taxaErro", totalNFe > 0 ? (double) totalErros / totalNFe * 100 : 0);
        stats.put("empresasAtivas", contadoresEmpresa.keySet().stream()
                .filter(key -> key.contains("nfe.emitida.empresa"))
                .map(key -> key.split("\\.")[3])
                .distinct()
                .count());
        
        return stats.toString();
    }

    @Override
    public void limparMetricasAntigas(int diasAntigos) {
        log.debug("Limpando métricas antigas: {} dias", diasAntigos);
        
        // Limpar contadores (implementação simples)
        // Em produção, isso seria feito com base em timestamps
        contadoresEmpresa.clear();
        contadoresOperacao.clear();
        contadoresErro.clear();
        
        log.info("Métricas antigas limpas com sucesso");
    }
}
