package br.com.fenix.nfe.api.config;

import br.com.fenix.nfe.model.enums.NFeQueueTypeEnum;
import br.com.fenix.nfe.model.enums.NFePriorityEnum;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.HashMap;
import java.util.Map;

/**
 * Configuração do RabbitMQ para NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Configuration
public class RabbitMQConfig {

    @Value("${spring.rabbitmq.host:localhost}")
    private String host;

    @Value("${spring.rabbitmq.port:5672}")
    private int port;

    @Value("${spring.rabbitmq.username:guest}")
    private String username;

    @Value("${spring.rabbitmq.password:guest}")
    private String password;

    @Value("${spring.rabbitmq.virtual-host:/}")
    private String virtualHost;

    // Nomes dos exchanges
    public static final String NFE_EXCHANGE = "nfe.exchange";
    public static final String NFE_DLX = "nfe.dlx";

    // Nomes das filas
    public static final String NFE_EMITIR_ALTA_QUEUE = "nfe.fila.emitir.alta";
    public static final String NFE_EMITIR_NORMAL_QUEUE = "nfe.fila.emitir.normal";
    public static final String NFE_EMITIR_BAIXA_QUEUE = "nfe.fila.emitir.baixa";
    public static final String NFE_CONSULTA_STATUS_QUEUE = "nfe.fila.consulta.status";
    public static final String NFE_CONSULTA_CADASTRO_QUEUE = "nfe.fila.consulta.cadastro";
    public static final String NFE_CONSULTA_XML_QUEUE = "nfe.fila.consulta.xml";
    public static final String NFE_CONSULTA_DISTRIBUICAO_QUEUE = "nfe.fila.consulta.distribuicao";
    public static final String NFE_CANCELAMENTO_QUEUE = "nfe.fila.cancelamento";
    public static final String NFE_CARTA_CORRECAO_QUEUE = "nfe.fila.carta.correcao";
    public static final String NFE_MANIFESTACAO_QUEUE = "nfe.fila.manifestacao";
    public static final String NFE_ATOR_INTERESSADO_QUEUE = "nfe.fila.ator.interessado";
    public static final String NFE_INUTILIZACAO_QUEUE = "nfe.fila.inutilizacao";
    public static final String NFE_RETRY_QUEUE = "nfe.fila.retry";
    public static final String NFE_DLQ_EMITIR_QUEUE = "nfe.fila.dlq.emitir";
    public static final String NFE_DLQ_CONSULTA_QUEUE = "nfe.fila.dlq.consulta";
    public static final String NFE_DLQ_EVENTO_QUEUE = "nfe.fila.dlq.evento";

    // Routing keys
    public static final String NFE_EMITIR_ALTA_RK = "nfe.emitir.alta";
    public static final String NFE_EMITIR_NORMAL_RK = "nfe.emitir.normal";
    public static final String NFE_EMITIR_BAIXA_RK = "nfe.emitir.baixa";
    public static final String NFE_CONSULTA_STATUS_RK = "nfe.consulta.status";
    public static final String NFE_CONSULTA_CADASTRO_RK = "nfe.consulta.cadastro";
    public static final String NFE_CONSULTA_XML_RK = "nfe.consulta.xml";
    public static final String NFE_CONSULTA_DISTRIBUICAO_RK = "nfe.consulta.distribuicao";
    public static final String NFE_CANCELAMENTO_RK = "nfe.cancelamento";
    public static final String NFE_CARTA_CORRECAO_RK = "nfe.carta.correcao";
    public static final String NFE_MANIFESTACAO_RK = "nfe.manifestacao";
    public static final String NFE_ATOR_INTERESSADO_RK = "nfe.ator.interessado";
    public static final String NFE_INUTILIZACAO_RK = "nfe.inutilizacao";
    public static final String NFE_RETRY_RK = "nfe.retry";
    public static final String NFE_DLQ_EMITIR_RK = "nfe.dlq.emitir";
    public static final String NFE_DLQ_CONSULTA_RK = "nfe.dlq.consulta";
    public static final String NFE_DLQ_EVENTO_RK = "nfe.dlq.evento";

    /**
     * Configuração do message converter
     */
    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /**
     * Configuração do RabbitTemplate
     */
    @Bean
    @Primary
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        template.setMandatory(true);
        template.setReturnCallback((message, replyCode, replyText, exchange, routingKey) -> {
            // Log de erro quando mensagem não pode ser entregue
            System.err.println("Mensagem não entregue: " + message + " - " + replyText);
        });
        template.setConfirmCallback((correlationData, ack, cause) -> {
            if (!ack) {
                System.err.println("Confirmação falhou: " + correlationData + " - " + cause);
            }
        });
        return template;
    }

    /**
     * Configuração do container factory para listeners
     */
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter());
        factory.setConcurrentConsumers(1);
        factory.setMaxConcurrentConsumers(10);
        factory.setPrefetchCount(1);
        factory.setAutoStartup(true);
        factory.setDefaultRequeueRejected(false);
        return factory;
    }

    // ==================== EXCHANGES ====================

    /**
     * Exchange principal para NFe
     */
    @Bean
    public TopicExchange nfeExchange() {
        return new TopicExchange(NFE_EXCHANGE, true, false);
    }

    /**
     * Dead Letter Exchange
     */
    @Bean
    public TopicExchange nfeDlx() {
        return new TopicExchange(NFE_DLX, true, false);
    }

    // ==================== FILAS DE EMISSÃO ====================

    /**
     * Fila de emissão alta prioridade
     */
    @Bean
    public Queue nfeEmitirAltaQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", NFePriorityEnum.ALTA.getTtlMs());
        arguments.put("x-max-priority", 10);
        arguments.put("x-dead-letter-exchange", NFE_DLX);
        arguments.put("x-dead-letter-routing-key", NFE_DLQ_EMITIR_RK);
        return QueueBuilder.durable(NFE_EMITIR_ALTA_QUEUE)
                .withArguments(arguments)
                .build();
    }

    /**
     * Fila de emissão prioridade normal
     */
    @Bean
    public Queue nfeEmitirNormalQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", NFePriorityEnum.NORMAL.getTtlMs());
        arguments.put("x-max-priority", 5);
        arguments.put("x-dead-letter-exchange", NFE_DLX);
        arguments.put("x-dead-letter-routing-key", NFE_DLQ_EMITIR_RK);
        return QueueBuilder.durable(NFE_EMITIR_NORMAL_QUEUE)
                .withArguments(arguments)
                .build();
    }

    /**
     * Fila de emissão baixa prioridade
     */
    @Bean
    public Queue nfeEmitirBaixaQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", NFePriorityEnum.BAIXA.getTtlMs());
        arguments.put("x-max-priority", 1);
        arguments.put("x-dead-letter-exchange", NFE_DLX);
        arguments.put("x-dead-letter-routing-key", NFE_DLQ_EMITIR_RK);
        return QueueBuilder.durable(NFE_EMITIR_BAIXA_QUEUE)
                .withArguments(arguments)
                .build();
    }

    // ==================== FILAS DE CONSULTA ====================

    /**
     * Fila de consulta de status
     */
    @Bean
    public Queue nfeConsultaStatusQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", 300000L); // 5 minutos
        arguments.put("x-dead-letter-exchange", NFE_DLX);
        arguments.put("x-dead-letter-routing-key", NFE_DLQ_CONSULTA_RK);
        return QueueBuilder.durable(NFE_CONSULTA_STATUS_QUEUE)
                .withArguments(arguments)
                .build();
    }

    /**
     * Fila de consulta de cadastro
     */
    @Bean
    public Queue nfeConsultaCadastroQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", 300000L); // 5 minutos
        arguments.put("x-dead-letter-exchange", NFE_DLX);
        arguments.put("x-dead-letter-routing-key", NFE_DLQ_CONSULTA_RK);
        return QueueBuilder.durable(NFE_CONSULTA_CADASTRO_QUEUE)
                .withArguments(arguments)
                .build();
    }

    /**
     * Fila de consulta de XML
     */
    @Bean
    public Queue nfeConsultaXmlQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", 300000L); // 5 minutos
        arguments.put("x-dead-letter-exchange", NFE_DLX);
        arguments.put("x-dead-letter-routing-key", NFE_DLQ_CONSULTA_RK);
        return QueueBuilder.durable(NFE_CONSULTA_XML_QUEUE)
                .withArguments(arguments)
                .build();
    }

    /**
     * Fila de consulta de distribuição
     */
    @Bean
    public Queue nfeConsultaDistribuicaoQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", 300000L); // 5 minutos
        arguments.put("x-dead-letter-exchange", NFE_DLX);
        arguments.put("x-dead-letter-routing-key", NFE_DLQ_CONSULTA_RK);
        return QueueBuilder.durable(NFE_CONSULTA_DISTRIBUICAO_QUEUE)
                .withArguments(arguments)
                .build();
    }

    // ==================== FILAS DE EVENTOS ====================

    /**
     * Fila de cancelamento
     */
    @Bean
    public Queue nfeCancelamentoQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", 600000L); // 10 minutos
        arguments.put("x-dead-letter-exchange", NFE_DLX);
        arguments.put("x-dead-letter-routing-key", NFE_DLQ_EVENTO_RK);
        return QueueBuilder.durable(NFE_CANCELAMENTO_QUEUE)
                .withArguments(arguments)
                .build();
    }

    /**
     * Fila de carta de correção
     */
    @Bean
    public Queue nfeCartaCorrecaoQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", 600000L); // 10 minutos
        arguments.put("x-dead-letter-exchange", NFE_DLX);
        arguments.put("x-dead-letter-routing-key", NFE_DLQ_EVENTO_RK);
        return QueueBuilder.durable(NFE_CARTA_CORRECAO_QUEUE)
                .withArguments(arguments)
                .build();
    }

    /**
     * Fila de manifestação
     */
    @Bean
    public Queue nfeManifestacaoQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", 600000L); // 10 minutos
        arguments.put("x-dead-letter-exchange", NFE_DLX);
        arguments.put("x-dead-letter-routing-key", NFE_DLQ_EVENTO_RK);
        return QueueBuilder.durable(NFE_MANIFESTACAO_QUEUE)
                .withArguments(arguments)
                .build();
    }

    /**
     * Fila de ator interessado
     */
    @Bean
    public Queue nfeAtorInteressadoQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", 600000L); // 10 minutos
        arguments.put("x-dead-letter-exchange", NFE_DLX);
        arguments.put("x-dead-letter-routing-key", NFE_DLQ_EVENTO_RK);
        return QueueBuilder.durable(NFE_ATOR_INTERESSADO_QUEUE)
                .withArguments(arguments)
                .build();
    }

    /**
     * Fila de inutilização
     */
    @Bean
    public Queue nfeInutilizacaoQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", 1800000L); // 30 minutos
        arguments.put("x-dead-letter-exchange", NFE_DLX);
        arguments.put("x-dead-letter-routing-key", NFE_DLQ_EVENTO_RK);
        return QueueBuilder.durable(NFE_INUTILIZACAO_QUEUE)
                .withArguments(arguments)
                .build();
    }

    // ==================== FILAS DE SISTEMA ====================

    /**
     * Fila de retry
     */
    @Bean
    public Queue nfeRetryQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", 300000L); // 5 minutos
        arguments.put("x-dead-letter-exchange", NFE_DLX);
        return QueueBuilder.durable(NFE_RETRY_QUEUE)
                .withArguments(arguments)
                .build();
    }

    /**
     * Dead Letter Queue para emissão
     */
    @Bean
    public Queue nfeDlqEmitirQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", 86400000L); // 24 horas
        return QueueBuilder.durable(NFE_DLQ_EMITIR_QUEUE)
                .withArguments(arguments)
                .build();
    }

    /**
     * Dead Letter Queue para consulta
     */
    @Bean
    public Queue nfeDlqConsultaQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", 86400000L); // 24 horas
        return QueueBuilder.durable(NFE_DLQ_CONSULTA_QUEUE)
                .withArguments(arguments)
                .build();
    }

    /**
     * Dead Letter Queue para eventos
     */
    @Bean
    public Queue nfeDlqEventoQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", 86400000L); // 24 horas
        return QueueBuilder.durable(NFE_DLQ_EVENTO_QUEUE)
                .withArguments(arguments)
                .build();
    }

    // ==================== BINDINGS ====================

    /**
     * Binding para fila de emissão alta
     */
    @Bean
    public Binding nfeEmitirAltaBinding() {
        return BindingBuilder.bind(nfeEmitirAltaQueue())
                .to(nfeExchange())
                .with(NFE_EMITIR_ALTA_RK);
    }

    /**
     * Binding para fila de emissão normal
     */
    @Bean
    public Binding nfeEmitirNormalBinding() {
        return BindingBuilder.bind(nfeEmitirNormalQueue())
                .to(nfeExchange())
                .with(NFE_EMITIR_NORMAL_RK);
    }

    /**
     * Binding para fila de emissão baixa
     */
    @Bean
    public Binding nfeEmitirBaixaBinding() {
        return BindingBuilder.bind(nfeEmitirBaixaQueue())
                .to(nfeExchange())
                .with(NFE_EMITIR_BAIXA_RK);
    }

    /**
     * Binding para fila de consulta de status
     */
    @Bean
    public Binding nfeConsultaStatusBinding() {
        return BindingBuilder.bind(nfeConsultaStatusQueue())
                .to(nfeExchange())
                .with(NFE_CONSULTA_STATUS_RK);
    }

    /**
     * Binding para fila de consulta de cadastro
     */
    @Bean
    public Binding nfeConsultaCadastroBinding() {
        return BindingBuilder.bind(nfeConsultaCadastroQueue())
                .to(nfeExchange())
                .with(NFE_CONSULTA_CADASTRO_RK);
    }

    /**
     * Binding para fila de consulta de XML
     */
    @Bean
    public Binding nfeConsultaXmlBinding() {
        return BindingBuilder.bind(nfeConsultaXmlQueue())
                .to(nfeExchange())
                .with(NFE_CONSULTA_XML_RK);
    }

    /**
     * Binding para fila de consulta de distribuição
     */
    @Bean
    public Binding nfeConsultaDistribuicaoBinding() {
        return BindingBuilder.bind(nfeConsultaDistribuicaoQueue())
                .to(nfeExchange())
                .with(NFE_CONSULTA_DISTRIBUICAO_RK);
    }

    /**
     * Binding para fila de cancelamento
     */
    @Bean
    public Binding nfeCancelamentoBinding() {
        return BindingBuilder.bind(nfeCancelamentoQueue())
                .to(nfeExchange())
                .with(NFE_CANCELAMENTO_RK);
    }

    /**
     * Binding para fila de carta de correção
     */
    @Bean
    public Binding nfeCartaCorrecaoBinding() {
        return BindingBuilder.bind(nfeCartaCorrecaoQueue())
                .to(nfeExchange())
                .with(NFE_CARTA_CORRECAO_RK);
    }

    /**
     * Binding para fila de manifestação
     */
    @Bean
    public Binding nfeManifestacaoBinding() {
        return BindingBuilder.bind(nfeManifestacaoQueue())
                .to(nfeExchange())
                .with(NFE_MANIFESTACAO_RK);
    }

    /**
     * Binding para fila de ator interessado
     */
    @Bean
    public Binding nfeAtorInteressadoBinding() {
        return BindingBuilder.bind(nfeAtorInteressadoQueue())
                .to(nfeExchange())
                .with(NFE_ATOR_INTERESSADO_RK);
    }

    /**
     * Binding para fila de inutilização
     */
    @Bean
    public Binding nfeInutilizacaoBinding() {
        return BindingBuilder.bind(nfeInutilizacaoQueue())
                .to(nfeExchange())
                .with(NFE_INUTILIZACAO_RK);
    }

    /**
     * Binding para fila de retry
     */
    @Bean
    public Binding nfeRetryBinding() {
        return BindingBuilder.bind(nfeRetryQueue())
                .to(nfeExchange())
                .with(NFE_RETRY_RK);
    }

    /**
     * Binding para DLQ de emissão
     */
    @Bean
    public Binding nfeDlqEmitirBinding() {
        return BindingBuilder.bind(nfeDlqEmitirQueue())
                .to(nfeDlx())
                .with(NFE_DLQ_EMITIR_RK);
    }

    /**
     * Binding para DLQ de consulta
     */
    @Bean
    public Binding nfeDlqConsultaBinding() {
        return BindingBuilder.bind(nfeDlqConsultaQueue())
                .to(nfeDlx())
                .with(NFE_DLQ_CONSULTA_RK);
    }

    /**
     * Binding para DLQ de eventos
     */
    @Bean
    public Binding nfeDlqEventoBinding() {
        return BindingBuilder.bind(nfeDlqEventoQueue())
                .to(nfeDlx())
                .with(NFE_DLQ_EVENTO_RK);
    }
}


