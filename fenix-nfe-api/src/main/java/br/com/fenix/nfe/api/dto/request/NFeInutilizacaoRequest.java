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
 * DTO para requisição de inutilização de NFe
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Requisição para inutilização de NFe")
public class NFeInutilizacaoRequest {

    @NotBlank(message = "CNPJ do emitente é obrigatório")
    @Pattern(regexp = "\\d{14}", message = "CNPJ deve ter 14 dígitos")
    @Schema(description = "CNPJ do emitente", example = "12345678000195")
    private String cnpjEmitente;

    @NotBlank(message = "Inscrição Estadual é obrigatória")
    @Schema(description = "Inscrição Estadual do emitente", example = "123456789")
    private String inscricaoEstadual;

    @NotNull(message = "Série é obrigatória")
    @Schema(description = "Série da NFe", example = "1")
    private Integer serie;

    @NotNull(message = "Número inicial é obrigatório")
    @Schema(description = "Número inicial da faixa", example = "1")
    private Integer numeroInicial;

    @NotNull(message = "Número final é obrigatório")
    @Schema(description = "Número final da faixa", example = "100")
    private Integer numeroFinal;

    @NotBlank(message = "Justificativa é obrigatória")
    @Size(min = 15, max = 255, message = "Justificativa deve ter entre 15 e 255 caracteres")
    @Schema(description = "Justificativa para inutilização", example = "Inutilização por erro de digitação na numeração")
    private String justificativa;

    @NotNull(message = "Data de inutilização é obrigatória")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Data e hora da inutilização", example = "2024-01-22T10:30:00")
    private LocalDateTime dataInutilizacao;

    @NotBlank(message = "CNPJ do solicitante é obrigatório")
    @Pattern(regexp = "\\d{14}", message = "CNPJ deve ter 14 dígitos")
    @Schema(description = "CNPJ do solicitante da inutilização", example = "12345678000195")
    private String cnpjSolicitante;

    @Schema(description = "Observações adicionais", example = "Inutilização solicitada via API")
    private String observacoes;

    @Schema(description = "Indica se deve enviar notificação por email", example = "true")
    private Boolean enviarNotificacao;

    @Schema(description = "Email para notificação", example = "contato@empresa.com.br")
    private String emailNotificacao;

    @Schema(description = "Ambiente da inutilização", example = "HOMOLOGACAO", 
            allowableValues = {"HOMOLOGACAO", "PRODUCAO"})
    private String ambiente;
}
