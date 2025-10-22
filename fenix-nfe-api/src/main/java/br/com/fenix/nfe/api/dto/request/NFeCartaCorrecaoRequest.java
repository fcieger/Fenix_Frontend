package br.com.fenix.nfe.api.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para requisição de carta de correção de NFe
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Requisição para carta de correção de NFe")
public class NFeCartaCorrecaoRequest {

    @NotBlank(message = "Chave de acesso é obrigatória")
    @Pattern(regexp = "\\d{44}", message = "Chave de acesso deve ter 44 dígitos")
    @Schema(description = "Chave de acesso da NFe", example = "12345678901234567890123456789012345678901234")
    private String chaveAcesso;

    @NotNull(message = "Sequência é obrigatória")
    @Schema(description = "Sequência da carta de correção", example = "1")
    private Integer sequencia;

    @NotBlank(message = "Correção é obrigatória")
    @Size(min = 15, max = 1000, message = "Correção deve ter entre 15 e 1000 caracteres")
    @Schema(description = "Texto da correção", example = "Correção do valor do ICMS conforme legislação vigente")
    private String correcao;

    @NotNull(message = "Data de correção é obrigatória")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Data e hora da correção", example = "2024-01-22T10:30:00")
    private LocalDateTime dataCorrecao;

    @NotBlank(message = "CNPJ do solicitante é obrigatório")
    @Pattern(regexp = "\\d{14}", message = "CNPJ deve ter 14 dígitos")
    @Schema(description = "CNPJ do solicitante da correção", example = "12345678000195")
    private String cnpjSolicitante;

    @Schema(description = "Grupos alterados na correção")
    private List<String> gruposAlterados;

    @Schema(description = "Campos alterados na correção")
    private List<String> camposAlterados;

    @Schema(description = "Observações adicionais", example = "Correção solicitada via API")
    private String observacoes;

    @Schema(description = "Indica se deve enviar notificação por email", example = "true")
    private Boolean enviarNotificacao;

    @Schema(description = "Email para notificação", example = "contato@empresa.com.br")
    private String emailNotificacao;
}
