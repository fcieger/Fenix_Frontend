package br.com.fenix.nfe.worker;

import br.com.fenix.nfe.model.entity.NFeLog;
import br.com.fenix.nfe.model.enums.NFeStatusEnum;
import br.com.fenix.nfe.model.queue.NFeQueueMessage;
import br.com.fenix.nfe.repository.NFeLogRepository;
import br.com.fenix.nfe.service.NFeQueueService;
import br.com.fenix.nfe.service.NFeMetricsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

/**
 * Worker para processamento de mensagens da Dead Letter Queue (DLQ)
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Component
public class NFeDLQWorker {

    private static final Logger logger = LoggerFactory.getLogger(NFeDLQWorker.class);

    @Autowired
    private NFeLogRepository nfeLogRepository;

    @Autowired
    private NFeQueueService queueService;

    @Autowired
    private NFeMetricsService metricsService;

    // Análise de padrões de erro
    private final Map<String, AtomicLong> contadoresErro = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> contadoresEmpresa = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> contadoresOperacao = new ConcurrentHashMap<>();
    private final Map<String, List<String>> historicoErros = new ConcurrentHashMap<>();

    /**
     * Processa mensagens da DLQ
     */
    @RabbitListener(queues = "nfe.dlq", concurrency = "1-2")
    public void processarDLQ(NFeQueueMessage mensagem) {
        logger.error("Processando mensagem da DLQ: {} empresa: {} operação: {} tentativas: {}", 
                    mensagem.getId(), mensagem.getEmpresaId(), mensagem.getOperacao(), mensagem.getTentativas());
        
        try {
            // Analisar padrões de erro
            analisarPadroesErro(mensagem);
            
            // Log da mensagem na DLQ
            NFeLog log = new NFeLog(
                    null,
                    mensagem.getEmpresaId(),
                    mensagem.getOperacao(),
                    NFeStatusEnum.ERRO,
                    String.format("Mensagem enviada para DLQ após %d tentativas. Motivo: %s", 
                                 mensagem.getTentativas(), 
                                 mensagem.getMetadata().get("dlqMotivo"))
            );
            nfeLogRepository.save(log);

            // Analisar tipo de erro e tentar recuperação
            boolean recuperada = tentarRecuperacao(mensagem);

            if (recuperada) {
                logger.info("Mensagem {} recuperada com sucesso da DLQ", mensagem.getId());
            } else {
                logger.error("Mensagem {} não pôde ser recuperada da DLQ", mensagem.getId());
                // Aqui seria implementada a notificação para administradores
                notificarAdministradores(mensagem);
            }

        } catch (Exception e) {
            logger.error("Erro ao processar mensagem da DLQ {}: {}", mensagem.getId(), e.getMessage(), e);
        }
    }

    /**
     * Tenta recuperar mensagem da DLQ
     */
    private boolean tentarRecuperacao(NFeQueueMessage mensagem) {
        try {
            String motivo = (String) mensagem.getMetadata().get("dlqMotivo");
            
            // Verificar se é um erro temporário que pode ser recuperado
            if (isErroTemporario(motivo)) {
                logger.info("Tentando recuperar mensagem {} da DLQ (erro temporário)", mensagem.getId());
                
                // Resetar tentativas e reenviar
                mensagem.setTentativas(0);
                mensagem.setProximaTentativa(LocalDateTime.now().plusMinutes(30)); // Aguardar 30 minutos
                mensagem.setUpdatedAt(LocalDateTime.now());
                
                // Reenviar para fila de retry
                queueService.enviarParaRetry(mensagem, 0);
                
                return true;
            }
            
            // Verificar se é um erro de configuração que pode ser corrigido
            if (isErroConfiguracao(motivo)) {
                logger.info("Tentando recuperar mensagem {} da DLQ (erro de configuração)", mensagem.getId());
                
                // Aguardar mais tempo para correção manual
                mensagem.setTentativas(0);
                mensagem.setProximaTentativa(LocalDateTime.now().plusHours(2)); // Aguardar 2 horas
                mensagem.setUpdatedAt(LocalDateTime.now());
                
                // Reenviar para fila de retry
                queueService.enviarParaRetry(mensagem, 0);
                
                return true;
            }
            
            return false;

        } catch (Exception e) {
            logger.error("Erro ao tentar recuperar mensagem {} da DLQ: {}", 
                        mensagem.getId(), e.getMessage(), e);
            return false;
        }
    }

    /**
     * Verifica se é um erro temporário
     */
    private boolean isErroTemporario(String motivo) {
        if (motivo == null) return false;
        
        String motivoLower = motivo.toLowerCase();
        return motivoLower.contains("timeout") ||
               motivoLower.contains("connection") ||
               motivoLower.contains("network") ||
               motivoLower.contains("temporarily") ||
               motivoLower.contains("service unavailable") ||
               motivoLower.contains("rate limit");
    }

    /**
     * Verifica se é um erro de configuração
     */
    private boolean isErroConfiguracao(String motivo) {
        if (motivo == null) return false;
        
        String motivoLower = motivo.toLowerCase();
        return motivoLower.contains("certificate") ||
               motivoLower.contains("configuration") ||
               motivoLower.contains("empresa não habilitada") ||
               motivoLower.contains("configuração não encontrada") ||
               motivoLower.contains("certificado inválido");
    }

    /**
     * Notifica administradores sobre mensagem na DLQ
     */
    private void notificarAdministradores(NFeQueueMessage mensagem) {
        try {
            // Aqui seria implementada a notificação real (email, Slack, etc.)
            logger.error("NOTIFICAÇÃO ADMINISTRATIVA: Mensagem {} na DLQ requer atenção manual. " +
                        "Empresa: {}, Operação: {}, Tentativas: {}, Motivo: {}", 
                        mensagem.getId(),
                        mensagem.getEmpresaId(),
                        mensagem.getOperacao(),
                        mensagem.getTentativas(),
                        mensagem.getMetadata().get("dlqMotivo"));

            // Log para auditoria
            NFeLog log = new NFeLog(
                    null,
                    mensagem.getEmpresaId(),
                    mensagem.getOperacao(),
                    NFeStatusEnum.ERRO,
                    String.format("NOTIFICAÇÃO: Mensagem %s na DLQ requer atenção manual. Motivo: %s", 
                                 mensagem.getId(), mensagem.getMetadata().get("dlqMotivo"))
            );
            nfeLogRepository.save(log);

        } catch (Exception e) {
            logger.error("Erro ao notificar administradores sobre mensagem {} na DLQ: {}", 
                        mensagem.getId(), e.getMessage(), e);
        }
    }

    /**
     * Analisa padrões de erro para identificar tendências e problemas recorrentes
     */
    private void analisarPadroesErro(NFeQueueMessage mensagem) {
        try {
            String motivo = (String) mensagem.getMetadata().get("dlqMotivo");
            String empresaId = mensagem.getEmpresaId();
            String operacao = mensagem.getOperacao();
            
            // Incrementar contadores
            contadoresErro.computeIfAbsent(motivo, k -> new AtomicLong(0)).incrementAndGet();
            contadoresEmpresa.computeIfAbsent(empresaId, k -> new AtomicLong(0)).incrementAndGet();
            contadoresOperacao.computeIfAbsent(operacao, k -> new AtomicLong(0)).incrementAndGet();
            
            // Registrar no histórico
            String chaveHistorico = empresaId + ":" + operacao;
            historicoErros.computeIfAbsent(chaveHistorico, k -> new ArrayList<>()).add(motivo);
            
            // Registrar métricas
            metricsService.incrementarErro(empresaId, motivo, 
                    br.com.fenix.nfe.model.enums.NFeOperacaoEnum.valueOf(operacao));
            
            // Analisar tendências
            analisarTendencias(empresaId, operacao, motivo);
            
            logger.debug("Padrões de erro analisados para empresa: {}, operação: {}, motivo: {}", 
                        empresaId, operacao, motivo);
            
        } catch (Exception e) {
            logger.error("Erro ao analisar padrões de erro: {}", e.getMessage(), e);
        }
    }

    /**
     * Analisa tendências de erro para identificar problemas recorrentes
     */
    private void analisarTendencias(String empresaId, String operacao, String motivo) {
        try {
            String chaveHistorico = empresaId + ":" + operacao;
            List<String> historico = historicoErros.get(chaveHistorico);
            
            if (historico != null && historico.size() >= 3) {
                // Verificar se há padrão de erro recorrente
                long countMotivo = historico.stream()
                        .filter(h -> h.equals(motivo))
                        .count();
                
                double percentualMotivo = (double) countMotivo / historico.size() * 100;
                
                if (percentualMotivo >= 70) {
                    logger.warn("PADRÃO RECORRENTE DETECTADO: Empresa {} tem {}% de erros do tipo '{}' na operação {}", 
                               empresaId, percentualMotivo, motivo, operacao);
                    
                    // Registrar métrica de padrão recorrente
                    metricsService.registrarMetricaEmpresa(empresaId, "padrao.erro.recorrente", percentualMotivo, "percent");
                    
                    // Notificar sobre padrão recorrente
                    notificarPadraoRecorrente(empresaId, operacao, motivo, percentualMotivo);
                }
            }
            
            // Verificar se empresa tem muitos erros
            long totalErrosEmpresa = contadoresEmpresa.getOrDefault(empresaId, new AtomicLong(0)).get();
            if (totalErrosEmpresa >= 10) {
                logger.warn("EMPRESA COM MUITOS ERROS: {} tem {} erros na DLQ", empresaId, totalErrosEmpresa);
                
                // Registrar métrica de empresa problemática
                metricsService.registrarMetricaEmpresa(empresaId, "total.erros.dlq", totalErrosEmpresa, "count");
            }
            
        } catch (Exception e) {
            logger.error("Erro ao analisar tendências: {}", e.getMessage(), e);
        }
    }

    /**
     * Notifica sobre padrão recorrente de erro
     */
    private void notificarPadraoRecorrente(String empresaId, String operacao, String motivo, double percentual) {
        try {
            logger.error("ALERTA PADRÃO RECORRENTE: Empresa {} - Operação {} - Motivo '{}' - {}% dos erros", 
                        empresaId, operacao, motivo, percentual);
            
            // Log para auditoria
            NFeLog log = new NFeLog(
                    null,
                    empresaId,
                    operacao,
                    NFeStatusEnum.ERRO,
                    String.format("ALERTA: Padrão recorrente detectado - %s%% dos erros são do tipo '%s'", 
                                 percentual, motivo)
            );
            nfeLogRepository.save(log);
            
        } catch (Exception e) {
            logger.error("Erro ao notificar padrão recorrente: {}", e.getMessage(), e);
        }
    }

    /**
     * Obtém estatísticas de erro por empresa
     */
    public String obterEstatisticasErroEmpresa(String empresaId) {
        try {
            long totalErros = contadoresEmpresa.getOrDefault(empresaId, new AtomicLong(0)).get();
            
            Map<String, Long> errosPorTipo = contadoresErro.entrySet().stream()
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            entry -> entry.getValue().get()
                    ));
            
            return String.format("Empresa: %s, Total erros: %d, Tipos: %s", 
                               empresaId, totalErros, errosPorTipo);
            
        } catch (Exception e) {
            logger.error("Erro ao obter estatísticas de erro: {}", e.getMessage(), e);
            return "Erro ao obter estatísticas";
        }
    }

    /**
     * Obtém estatísticas gerais de erro
     */
    public String obterEstatisticasGeraisErro() {
        try {
            long totalErros = contadoresErro.values().stream()
                    .mapToLong(AtomicLong::get)
                    .sum();
            
            long totalEmpresas = contadoresEmpresa.size();
            long totalOperacoes = contadoresOperacao.size();
            
            return String.format("Total erros: %d, Empresas afetadas: %d, Operações afetadas: %d", 
                               totalErros, totalEmpresas, totalOperacoes);
            
        } catch (Exception e) {
            logger.error("Erro ao obter estatísticas gerais: {}", e.getMessage(), e);
            return "Erro ao obter estatísticas";
        }
    }

    /**
     * Limpa dados de análise de padrões (para manutenção)
     */
    public void limparDadosAnalise() {
        try {
            contadoresErro.clear();
            contadoresEmpresa.clear();
            contadoresOperacao.clear();
            historicoErros.clear();
            
            logger.info("Dados de análise de padrões limpos com sucesso");
            
        } catch (Exception e) {
            logger.error("Erro ao limpar dados de análise: {}", e.getMessage(), e);
        }
    }
}
