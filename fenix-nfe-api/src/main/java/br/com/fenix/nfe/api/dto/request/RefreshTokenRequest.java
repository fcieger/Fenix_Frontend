package br.com.fenix.nfe.api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para requisição de renovação de token
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dados para renovação de token")
public class RefreshTokenRequest {

    @NotBlank(message = "Refresh token é obrigatório")
    @Schema(description = "Refresh token para renovação", example = "eyJhbGciOiJIUzUxMiJ9...", required = true)
    private String refreshToken;
}
