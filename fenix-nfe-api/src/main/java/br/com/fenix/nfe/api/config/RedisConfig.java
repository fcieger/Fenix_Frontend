package br.com.fenix.nfe.api.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Configuração do Redis para cache e sessões
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Configuration
@EnableCaching
public class RedisConfig {

    @Value("${spring.data.redis.host:localhost}")
    private String host;

    @Value("${spring.data.redis.port:6379}")
    private int port;

    @Value("${spring.data.redis.password:}")
    private String password;

    @Value("${spring.data.redis.database:0}")
    private int database;

    @Value("${spring.data.redis.timeout:2000}")
    private int timeout;

    // TTLs para diferentes tipos de cache
    @Value("${nfe.cache.ttl.configuracao:1800}")
    private long configuracaoTtl;

    @Value("${nfe.cache.ttl.status:300}")
    private long statusTtl;

    @Value("${nfe.cache.ttl.consulta:600}")
    private long consultaTtl;

    @Value("${nfe.cache.ttl.empresa:3600}")
    private long empresaTtl;

    @Value("${nfe.cache.ttl.certificado:7200}")
    private long certificadoTtl;

    @Value("${nfe.cache.ttl.metricas:900}")
    private long metricasTtl;

    @Value("${nfe.cache.ttl.sessao:1800}")
    private long sessaoTtl;

    /**
     * Configuração da conexão Redis
     */
    @Bean
    public RedisStandaloneConfiguration redisStandaloneConfiguration() {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName(host);
        config.setPort(port);
        config.setDatabase(database);
        if (password != null && !password.trim().isEmpty()) {
            config.setPassword(password);
        }
        return config;
    }

    /**
     * Factory de conexão Redis
     */
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(redisStandaloneConfiguration());
    }

    /**
     * Configuração do ObjectMapper para Redis
     */
    @Bean
    public ObjectMapper redisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.activateDefaultTyping(
            LaissezFaireSubTypeValidator.instance,
            ObjectMapper.DefaultTyping.NON_FINAL,
            JsonTypeInfo.As.PROPERTY
        );
        return mapper;
    }

    /**
     * Configuração do RedisTemplate
     */
    @Bean
    @Primary
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // Serializer para chaves (String)
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        
        // Serializer para valores (JSON)
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(redisObjectMapper());
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);
        
        template.setDefaultSerializer(jsonSerializer);
        template.afterPropertiesSet();
        
        return template;
    }

    /**
     * Configuração do CacheManager
     */
    @Bean
    @Primary
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Configuração padrão
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(300)) // 5 minutos padrão
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer(redisObjectMapper())))
                .disableCachingNullValues();

        // Configurações específicas por cache
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        
        // Cache de configurações de empresa
        cacheConfigurations.put("configuracao", defaultConfig.entryTtl(Duration.ofSeconds(configuracaoTtl)));
        cacheConfigurations.put("empresa", defaultConfig.entryTtl(Duration.ofSeconds(empresaTtl)));
        cacheConfigurations.put("certificado", defaultConfig.entryTtl(Duration.ofSeconds(certificadoTtl)));
        
        // Cache de status de NFe
        cacheConfigurations.put("status", defaultConfig.entryTtl(Duration.ofSeconds(statusTtl)));
        cacheConfigurations.put("nfe-status", defaultConfig.entryTtl(Duration.ofSeconds(statusTtl)));
        
        // Cache de consultas
        cacheConfigurations.put("consulta", defaultConfig.entryTtl(Duration.ofSeconds(consultaTtl)));
        cacheConfigurations.put("consulta-status", defaultConfig.entryTtl(Duration.ofSeconds(consultaTtl)));
        cacheConfigurations.put("consulta-cadastro", defaultConfig.entryTtl(Duration.ofSeconds(consultaTtl)));
        cacheConfigurations.put("consulta-xml", defaultConfig.entryTtl(Duration.ofSeconds(consultaTtl)));
        cacheConfigurations.put("consulta-distribuicao", defaultConfig.entryTtl(Duration.ofSeconds(consultaTtl)));
        
        // Cache de métricas
        cacheConfigurations.put("metricas", defaultConfig.entryTtl(Duration.ofSeconds(metricasTtl)));
        cacheConfigurations.put("nfe-metricas", defaultConfig.entryTtl(Duration.ofSeconds(metricasTtl)));
        
        // Cache de sessão
        cacheConfigurations.put("sessao", defaultConfig.entryTtl(Duration.ofSeconds(sessaoTtl)));
        cacheConfigurations.put("session", defaultConfig.entryTtl(Duration.ofSeconds(sessaoTtl)));
        
        // Cache de logs (TTL menor)
        cacheConfigurations.put("logs", defaultConfig.entryTtl(Duration.ofSeconds(60)));
        cacheConfigurations.put("nfe-logs", defaultConfig.entryTtl(Duration.ofSeconds(60)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
    }

    /**
     * RedisTemplate específico para strings
     */
    @Bean("stringRedisTemplate")
    public RedisTemplate<String, String> stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new StringRedisSerializer());
        template.afterPropertiesSet();
        return template;
    }

    /**
     * RedisTemplate específico para números
     */
    @Bean("numberRedisTemplate")
    public RedisTemplate<String, Number> numberRedisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Number> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer(redisObjectMapper()));
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer(redisObjectMapper()));
        template.afterPropertiesSet();
        return template;
    }

    /**
     * RedisTemplate específico para listas
     */
    @Bean("listRedisTemplate")
    public RedisTemplate<String, Object> listRedisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer(redisObjectMapper()));
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer(redisObjectMapper()));
        template.afterPropertiesSet();
        return template;
    }

    /**
     * Configuração de TTL para diferentes tipos de dados
     */
    public static class CacheTTL {
        public static final Duration CONFIGURACAO = Duration.ofSeconds(1800); // 30 minutos
        public static final Duration STATUS = Duration.ofSeconds(300);        // 5 minutos
        public static final Duration CONSULTA = Duration.ofSeconds(600);      // 10 minutos
        public static final Duration EMPRESA = Duration.ofSeconds(3600);      // 1 hora
        public static final Duration CERTIFICADO = Duration.ofSeconds(7200);   // 2 horas
        public static final Duration METRICAS = Duration.ofSeconds(900);      // 15 minutos
        public static final Duration SESSAO = Duration.ofSeconds(1800);       // 30 minutos
        public static final Duration LOGS = Duration.ofSeconds(60);           // 1 minuto
    }

    /**
     * Chaves de cache padronizadas
     */
    public static class CacheKeys {
        public static final String CONFIGURACAO_EMPRESA = "nfe:config:{empresa_id}";
        public static final String STATUS_NFE = "nfe:status:{chave_acesso}";
        public static final String CONSULTA_STATUS = "nfe:consulta:status:{chave_acesso}";
        public static final String CONSULTA_CADASTRO = "nfe:consulta:cadastro:{cnpj}";
        public static final String CONSULTA_XML = "nfe:consulta:xml:{chave_acesso}";
        public static final String CONSULTA_DISTRIBUICAO = "nfe:consulta:distribuicao:{cnpj}";
        public static final String METRICAS_EMPRESA = "nfe:metricas:{empresa_id}";
        public static final String METRICAS_OPERACAO = "nfe:metricas:{operacao}";
        public static final String SESSAO_USUARIO = "nfe:sessao:{usuario_id}";
        public static final String LOGS_EMPRESA = "nfe:logs:{empresa_id}";
        public static final String LOGS_OPERACAO = "nfe:logs:{operacao}";
    }
}


