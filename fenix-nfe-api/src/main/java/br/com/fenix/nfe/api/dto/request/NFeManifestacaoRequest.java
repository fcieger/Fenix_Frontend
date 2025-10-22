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
 * DTO para requisição de manifestação de NFe
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Requisição para manifestação de NFe")
public class NFeManifestacaoRequest {

    @NotBlank(message = "Chave de acesso é obrigatória")
    @Pattern(regexp = "\\d{44}", message = "Chave de acesso deve ter 44 dígitos")
    @Schema(description = "Chave de acesso da NFe", example = "12345678901234567890123456789012345678901234")
    private String chaveAcesso;

    @NotNull(message = "Tipo de manifestação é obrigatório")
    @Schema(description = "Tipo de manifestação", example = "CIENCIA_OPERACAO", 
            allowableValues = {"CIENCIA_OPERACAO", "CONFIRMACAO_OPERACAO", "DESCONHECIMENTO_OPERACAO", "OPERACAO_NAO_REALIZADA"})
    private TipoManifestacao tipoManifestacao;

    @NotBlank(message = "CNPJ do manifestante é obrigatório")
    @Pattern(regexp = "\\d{14}", message = "CNPJ deve ter 14 dígitos")
    @Schema(description = "CNPJ do manifestante", example = "12345678000195")
    private String cnpjManifestante;

    @NotNull(message = "Data de manifestação é obrigatória")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Data e hora da manifestação", example = "2024-01-22T10:30:00")
    private LocalDateTime dataManifestacao;

    @Schema(description = "Justificativa para manifestação", example = "Manifestação de ciência da operação")
    private String justificativa;

    @Schema(description = "Observações adicionais", example = "Manifestação solicitada via API")
    private String observacoes;

    @Schema(description = "Indica se deve enviar notificação por email", example = "true")
    private Boolean enviarNotificacao;

    @Schema(description = "Email para notificação", example = "contato@empresa.com.br")
    private String emailNotificacao;

    /**
     * Enum para tipos de manifestação
     */
    public enum TipoManifestacao {
        @Schema(description = "Ciência da Operação")
        CIENCIA_OPERACAO("210200"),
        
        @Schema(description = "Confirmação da Operação")
        CONFIRMACAO_OPERACAO("210210"),
        
        @Schema(description = "Desconhecimento da Operação")
        DESCONHECIMENTO_OPERACAO("210220"),
        
        @Schema(description = "Operação Não Realizada")
        OPERACAO_NAO_REALIZADA("210240");

        private final String codigo;

        TipoManifestacao(String codigo) {
            this.codigo = codigo;
        }

        public String getCodigo() {
            return codigo;
        }
    }
}
