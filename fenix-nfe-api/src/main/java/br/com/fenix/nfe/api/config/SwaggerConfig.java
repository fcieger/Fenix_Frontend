package br.com.fenix.nfe.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuração do Swagger/OpenAPI 3.0
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Configuration
public class SwaggerConfig {

    @Value("${app.swagger.title:Fenix NFe API}")
    private String title;

    @Value("${app.swagger.description:API para emissão e gerenciamento de NFe com arquitetura de filas}")
    private String description;

    @Value("${app.swagger.version:1.0.0}")
    private String version;

    @Value("${app.swagger.contact.name:Fenix Team}")
    private String contactName;

    @Value("${app.swagger.contact.email:contato@fenix.com.br}")
    private String contactEmail;

    @Value("${app.swagger.contact.url:https://fenix.com.br}")
    private String contactUrl;

    @Value("${app.swagger.license.name:MIT License}")
    private String licenseName;

    @Value("${app.swagger.license.url:https://opensource.org/licenses/MIT}")
    private String licenseUrl;

    @Value("${app.swagger.server.url:http://localhost:8080}")
    private String serverUrl;

    @Value("${app.swagger.server.description:Servidor de Desenvolvimento}")
    private String serverDescription;

    /**
     * Configuração principal do OpenAPI
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(List.of(apiServer()))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("Bearer Authentication", createAPIKeyScheme()));
    }

    /**
     * Informações da API
     */
    private Info apiInfo() {
        return new Info()
                .title(title)
                .description(description)
                .version(version)
                .contact(new Contact()
                        .name(contactName)
                        .email(contactEmail)
                        .url(contactUrl))
                .license(new License()
                        .name(licenseName)
                        .url(licenseUrl))
                .termsOfService("https://fenix.com.br/terms");
    }

    /**
     * Configuração do servidor
     */
    private Server apiServer() {
        return new Server()
                .url(serverUrl)
                .description(serverDescription);
    }

    /**
     * Configuração do esquema de segurança JWT
     */
    private SecurityScheme createAPIKeyScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .bearerFormat("JWT")
                .scheme("bearer")
                .description("JWT Authorization header usando o esquema Bearer. " +
                        "Digite 'Bearer' [espaço] e então seu token na caixa de texto abaixo. " +
                        "Exemplo: \"Bearer 1safsfsdfdfd\"");
    }
}
