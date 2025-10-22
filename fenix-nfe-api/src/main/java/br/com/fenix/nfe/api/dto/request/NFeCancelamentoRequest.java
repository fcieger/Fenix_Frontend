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

/**
 * DTO para requisição de cancelamento de NFe
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Requisição para cancelamento de NFe")
public class NFeCancelamentoRequest {

    @NotBlank(message = "Chave de acesso é obrigatória")
    @Pattern(regexp = "\\d{44}", message = "Chave de acesso deve ter 44 dígitos")
    @Schema(description = "Chave de acesso da NFe", example = "12345678901234567890123456789012345678901234")
    private String chaveAcesso;

    @NotBlank(message = "Justificativa é obrigatória")
    @Size(min = 15, max = 255, message = "Justificativa deve ter entre 15 e 255 caracteres")
    @Schema(description = "Justificativa para o cancelamento", example = "Cancelamento por solicitação do cliente")
    private String justificativa;

    @NotNull(message = "Data de cancelamento é obrigatória")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Data e hora do cancelamento", example = "2024-01-22T10:30:00")
    private LocalDateTime dataCancelamento;

    @NotBlank(message = "CNPJ do solicitante é obrigatório")
    @Pattern(regexp = "\\d{14}", message = "CNPJ deve ter 14 dígitos")
    @Schema(description = "CNPJ do solicitante do cancelamento", example = "12345678000195")
    private String cnpjSolicitante;

    @Schema(description = "Observações adicionais", example = "Cancelamento solicitado via API")
    private String observacoes;

    @Schema(description = "Indica se deve enviar notificação por email", example = "true")
    private Boolean enviarNotificacao;

    @Schema(description = "Email para notificação", example = "contato@empresa.com.br")
    private String emailNotificacao;
}
