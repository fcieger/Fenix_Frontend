package br.com.fenix.nfe.api.config;

import br.com.fenix.nfe.api.interceptor.LoggingInterceptor;
import br.com.fenix.nfe.api.interceptor.RequestIdInterceptor;
import br.com.fenix.nfe.api.interceptor.CompanyContextInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.format.datetime.standard.DateTimeFormatterRegistrar;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Configuração web da aplicação
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final LoggingInterceptor loggingInterceptor;
    private final RequestIdInterceptor requestIdInterceptor;
    private final CompanyContextInterceptor companyContextInterceptor;

    /**
     * Configuração de CORS
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                        "http://localhost:*",
                        "https://localhost:*",
                        "http://127.0.0.1:*",
                        "https://127.0.0.1:*",
                        "https://*.fenix.com.br",
                        "https://*.icertus.com.br"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders(
                        "Authorization",
                        "Content-Type",
                        "X-Requested-With",
                        "Accept",
                        "Origin",
                        "Access-Control-Request-Method",
                        "Access-Control-Request-Headers",
                        "X-Company-CNPJ",
                        "X-Request-ID",
                        "X-Trace-ID"
                )
                .exposedHeaders(
                        "Authorization",
                        "X-Request-ID",
                        "X-Trace-ID",
                        "X-Total-Count",
                        "X-Page-Number",
                        "X-Page-Size"
                )
                .allowCredentials(true)
                .maxAge(3600);
    }

    /**
     * Configuração de interceptors
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Interceptor para logging de requests
        registry.addInterceptor(loggingInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/actuator/**",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/swagger-resources/**",
                        "/webjars/**"
                );

        // Interceptor para Request ID
        registry.addInterceptor(requestIdInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/actuator/**",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/swagger-resources/**",
                        "/webjars/**"
                );

        // Interceptor para contexto da empresa
        registry.addInterceptor(companyContextInterceptor)
                .addPathPatterns("/api/v1/nfe/**", "/api/v1/consulta/**", "/api/v1/config/**")
                .excludePathPatterns(
                        "/api/v1/auth/**",
                        "/api/v1/health/**"
                );
    }

    /**
     * Configuração de recursos estáticos
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Swagger UI
        registry.addResourceHandler("/swagger-ui/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/swagger-ui/");

        // Documentação da API
        registry.addResourceHandler("/docs/**")
                .addResourceLocations("classpath:/static/docs/");

        // Recursos estáticos
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
    }

    /**
     * Configuração de conversores de mensagem
     */
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        // Configurar Jackson para formatação de datas
        MappingJackson2HttpMessageConverter jacksonConverter = new MappingJackson2HttpMessageConverter();
        converters.add(jacksonConverter);
    }

    /**
     * Configuração de formatadores
     */
    @Override
    public void addFormatters(FormatterRegistry registry) {
        DateTimeFormatterRegistrar registrar = new DateTimeFormatterRegistrar();
        registrar.setUseIsoFormat(true);
        registrar.setDateFormatter(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        registrar.setTimeFormatter(DateTimeFormatter.ofPattern("HH:mm:ss"));
        registrar.setDateTimeFormatter(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
        registrar.registerFormatters(registry);
    }
}
