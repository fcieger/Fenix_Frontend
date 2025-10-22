package br.com.fenix.nfe.api.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para resposta de autenticação JWT
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Resposta de autenticação JWT")
public class JwtResponse {

    @Schema(description = "Token de acesso JWT", example = "eyJhbGciOiJIUzUxMiJ9...")
    private String accessToken;

    @Schema(description = "Token de renovação", example = "eyJhbGciOiJIUzUxMiJ9...")
    private String refreshToken;

    @Schema(description = "Tipo do token", example = "Bearer")
    private String tokenType;

    @Schema(description = "Tempo de expiração em milissegundos", example = "86400000")
    private Long expiresIn;

    @Schema(description = "Nome do usuário", example = "admin")
    private String username;

    @Schema(description = "Autoridades do usuário", example = "ROLE_ADMIN,ROLE_USER")
    private String authorities;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Data de criação do token")
    private LocalDateTime issuedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Data de expiração do token")
    private LocalDateTime expiresAt;
}
