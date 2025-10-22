package br.com.fenix.nfe.api.config;

import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.listener.RabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração específica para listeners do RabbitMQ
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Configuration
public class RabbitMQListenerConfig {

    @Value("${nfe.fila.concurrency.emitir-alta:2}")
    private int emitirAltaConcurrency;

    @Value("${nfe.fila.concurrency.emitir-normal:3}")
    private int emitirNormalConcurrency;

    @Value("${nfe.fila.concurrency.emitir-baixa:1}")
    private int emitirBaixaConcurrency;

    @Value("${nfe.fila.concurrency.consulta:5}")
    private int consultaConcurrency;

    @Value("${nfe.fila.concurrency.eventos:2}")
    private int eventosConcurrency;

    @Value("${nfe.fila.concurrency.inutilizacao:1}")
    private int inutilizacaoConcurrency;

    @Value("${nfe.fila.timeout.emitir:120000}")
    private long emitirTimeout;

    @Value("${nfe.fila.timeout.consulta:30000}")
    private long consultaTimeout;

    @Value("${nfe.fila.timeout.evento:60000}")
    private long eventoTimeout;

    @Value("${nfe.fila.timeout.inutilizacao:180000}")
    private long inutilizacaoTimeout;

    @Value("${nfe.fila.retry.max-tentativas:3}")
    private int maxTentativas;

    @Value("${nfe.fila.retry.delay-inicial:5000}")
    private long delayInicial;

    @Value("${nfe.fila.retry.multiplicador:2}")
    private double multiplicador;

    @Value("${nfe.fila.retry.max-delay:60000}")
    private long maxDelay;

    /**
     * Container factory para filas de alta prioridade
     */
    @Bean("emitirAltaContainerFactory")
    public RabbitListenerContainerFactory<SimpleMessageListenerContainer> emitirAltaContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setConcurrentConsumers(1);
        factory.setMaxConcurrentConsumers(emitirAltaConcurrency);
        factory.setPrefetchCount(1);
        factory.setReceiveTimeout(emitirTimeout);
        factory.setDefaultRequeueRejected(false);
        factory.setAutoStartup(true);
        return factory;
    }

    /**
     * Container factory para filas de prioridade normal
     */
    @Bean("emitirNormalContainerFactory")
    public RabbitListenerContainerFactory<SimpleMessageListenerContainer> emitirNormalContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setConcurrentConsumers(1);
        factory.setMaxConcurrentConsumers(emitirNormalConcurrency);
        factory.setPrefetchCount(2);
        factory.setReceiveTimeout(emitirTimeout);
        factory.setDefaultRequeueRejected(false);
        factory.setAutoStartup(true);
        return factory;
    }

    /**
     * Container factory para filas de baixa prioridade
     */
    @Bean("emitirBaixaContainerFactory")
    public RabbitListenerContainerFactory<SimpleMessageListenerContainer> emitirBaixaContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setConcurrentConsumers(1);
        factory.setMaxConcurrentConsumers(emitirBaixaConcurrency);
        factory.setPrefetchCount(5);
        factory.setReceiveTimeout(emitirTimeout);
        factory.setDefaultRequeueRejected(false);
        factory.setAutoStartup(true);
        return factory;
    }

    /**
     * Container factory para filas de consulta
     */
    @Bean("consultaContainerFactory")
    public RabbitListenerContainerFactory<SimpleMessageListenerContainer> consultaContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setConcurrentConsumers(1);
        factory.setMaxConcurrentConsumers(consultaConcurrency);
        factory.setPrefetchCount(1);
        factory.setReceiveTimeout(consultaTimeout);
        factory.setDefaultRequeueRejected(false);
        factory.setAutoStartup(true);
        return factory;
    }

    /**
     * Container factory para filas de eventos
     */
    @Bean("eventoContainerFactory")
    public RabbitListenerContainerFactory<SimpleMessageListenerContainer> eventoContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setConcurrentConsumers(1);
        factory.setMaxConcurrentConsumers(eventosConcurrency);
        factory.setPrefetchCount(1);
        factory.setReceiveTimeout(eventoTimeout);
        factory.setDefaultRequeueRejected(false);
        factory.setAutoStartup(true);
        return factory;
    }

    /**
     * Container factory para fila de inutilização
     */
    @Bean("inutilizacaoContainerFactory")
    public RabbitListenerContainerFactory<SimpleMessageListenerContainer> inutilizacaoContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setConcurrentConsumers(1);
        factory.setMaxConcurrentConsumers(inutilizacaoConcurrency);
        factory.setPrefetchCount(1);
        factory.setReceiveTimeout(inutilizacaoTimeout);
        factory.setDefaultRequeueRejected(false);
        factory.setAutoStartup(true);
        return factory;
    }

    /**
     * Container factory para fila de retry
     */
    @Bean("retryContainerFactory")
    public RabbitListenerContainerFactory<SimpleMessageListenerContainer> retryContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setConcurrentConsumers(1);
        factory.setMaxConcurrentConsumers(2);
        factory.setPrefetchCount(1);
        factory.setReceiveTimeout(30000);
        factory.setDefaultRequeueRejected(false);
        factory.setAutoStartup(true);
        return factory;
    }

    /**
     * Container factory para Dead Letter Queues
     */
    @Bean("dlqContainerFactory")
    public RabbitListenerContainerFactory<SimpleMessageListenerContainer> dlqContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setConcurrentConsumers(1);
        factory.setMaxConcurrentConsumers(1);
        factory.setPrefetchCount(1);
        factory.setReceiveTimeout(60000);
        factory.setDefaultRequeueRejected(false);
        factory.setAutoStartup(true);
        return factory;
    }

    // Getters para configurações
    public int getEmitirAltaConcurrency() {
        return emitirAltaConcurrency;
    }

    public int getEmitirNormalConcurrency() {
        return emitirNormalConcurrency;
    }

    public int getEmitirBaixaConcurrency() {
        return emitirBaixaConcurrency;
    }

    public int getConsultaConcurrency() {
        return consultaConcurrency;
    }

    public int getEventosConcurrency() {
        return eventosConcurrency;
    }

    public int getInutilizacaoConcurrency() {
        return inutilizacaoConcurrency;
    }

    public long getEmitirTimeout() {
        return emitirTimeout;
    }

    public long getConsultaTimeout() {
        return consultaTimeout;
    }

    public long getEventoTimeout() {
        return eventoTimeout;
    }

    public long getInutilizacaoTimeout() {
        return inutilizacaoTimeout;
    }

    public int getMaxTentativas() {
        return maxTentativas;
    }

    public long getDelayInicial() {
        return delayInicial;
    }

    public double getMultiplicador() {
        return multiplicador;
    }

    public long getMaxDelay() {
        return maxDelay;
    }
}


