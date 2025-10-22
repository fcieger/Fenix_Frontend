package br.com.fenix.nfe.api.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Métricas customizadas para NFe API
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NFeMetrics {

    private final MeterRegistry meterRegistry;

    // Contadores de NFe
    private final Counter nfeEmittedTotal = Counter.builder("nfe_emitted_total")
            .description("Total number of NFe emitted")
            .register(meterRegistry);

    private final Counter nfeAuthorizedTotal = Counter.builder("nfe_authorized_total")
            .description("Total number of NFe authorized")
            .register(meterRegistry);

    private final Counter nfeRejectedTotal = Counter.builder("nfe_rejected_total")
            .description("Total number of NFe rejected")
            .register(meterRegistry);

    private final Counter nfeCancelledTotal = Counter.builder("nfe_cancelled_total")
            .description("Total number of NFe cancelled")
            .register(meterRegistry);

    // Contadores de erros
    private final Counter nfeErrorsTotal = Counter.builder("nfe_errors_total")
            .description("Total number of NFe errors")
            .register(meterRegistry);

    // Timers de processamento
    private final Timer nfeProcessingDuration = Timer.builder("nfe_processing_duration_seconds")
            .description("NFe processing duration")
            .register(meterRegistry);

    private final Timer nfeWorkerDuration = Timer.builder("nfe_worker_duration_seconds")
            .description("NFe worker processing duration")
            .register(meterRegistry);

    // Contadores de workers
    private final Counter nfeWorkerProcessedTotal = Counter.builder("nfe_worker_processed_total")
            .description("Total number of messages processed by workers")
            .register(meterRegistry);

    /**
     * Incrementa contador de NFe emitidas
     */
    public void incrementNFeEmitted(String companyCnpj) {
        nfeEmittedTotal.increment(
            io.micrometer.core.instrument.Tags.of("company_cnpj", companyCnpj)
        );
    }

    /**
     * Incrementa contador de NFe autorizadas
     */
    public void incrementNFeAuthorized(String companyCnpj) {
        nfeAuthorizedTotal.increment(
            io.micrometer.core.instrument.Tags.of("company_cnpj", companyCnpj)
        );
    }

    /**
     * Incrementa contador de NFe rejeitadas
     */
    public void incrementNFeRejected(String companyCnpj, String reason) {
        nfeRejectedTotal.increment(
            io.micrometer.core.instrument.Tags.of(
                "company_cnpj", companyCnpj,
                "reason", reason
            )
        );
    }

    /**
     * Incrementa contador de NFe canceladas
     */
    public void incrementNFeCancelled(String companyCnpj) {
        nfeCancelledTotal.increment(
            io.micrometer.core.instrument.Tags.of("company_cnpj", companyCnpj)
        );
    }

    /**
     * Incrementa contador de erros
     */
    public void incrementError(String errorType, String errorCode, String companyCnpj) {
        nfeErrorsTotal.increment(
            io.micrometer.core.instrument.Tags.of(
                "error_type", errorType,
                "error_code", errorCode,
                "company_cnpj", companyCnpj
            )
        );
    }

    /**
     * Registra duração de processamento de NFe
     */
    public void recordNFeProcessingDuration(Duration duration, String companyCnpj) {
        nfeProcessingDuration.record(duration, 
            io.micrometer.core.instrument.Tags.of("company_cnpj", companyCnpj)
        );
    }

    /**
     * Registra duração de processamento de worker
     */
    public void recordWorkerDuration(Duration duration, String workerName) {
        nfeWorkerDuration.record(duration,
            io.micrometer.core.instrument.Tags.of("worker", workerName)
        );
    }

    /**
     * Incrementa contador de mensagens processadas por worker
     */
    public void incrementWorkerProcessed(String workerName) {
        nfeWorkerProcessedTotal.increment(
            io.micrometer.core.instrument.Tags.of("worker", workerName)
        );
    }

    /**
     * Cria um timer para medir duração de operação
     */
    public Timer.Sample startTimer() {
        return Timer.start(meterRegistry);
    }

    /**
     * Para um timer e registra a duração
     */
    public void stopTimer(Timer.Sample sample, String operation, String companyCnpj) {
        sample.stop(Timer.builder("nfe_operation_duration_seconds")
                .description("NFe operation duration")
                .tag("operation", operation)
                .tag("company_cnpj", companyCnpj)
                .register(meterRegistry));
    }
}
