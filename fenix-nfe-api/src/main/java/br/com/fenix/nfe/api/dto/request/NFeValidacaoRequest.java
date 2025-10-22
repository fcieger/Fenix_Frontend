package br.com.fenix.nfe.api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para requisição de validação de NFe
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Requisição para validação de NFe")
public class NFeValidacaoRequest {

    @NotBlank(message = "Chave de acesso é obrigatória")
    @Pattern(regexp = "\\d{44}", message = "Chave de acesso deve ter 44 dígitos")
    @Schema(description = "Chave de acesso da NFe", example = "12345678901234567890123456789012345678901234")
    private String chaveAcesso;

    @NotNull(message = "Tipo de validação é obrigatório")
    @Schema(description = "Tipo de validação", example = "XML", 
            allowableValues = {"XML", "SCHEMA", "CERTIFICADO", "DADOS", "COMPLETA"})
    private TipoValidacao tipoValidacao;

    @Schema(description = "XML da NFe para validação")
    private String xmlNFe;

    @Schema(description = "Indica se deve validar certificado digital", example = "true")
    private Boolean validarCertificado;

    @Schema(description = "Indica se deve validar schema XML", example = "true")
    private Boolean validarSchema;

    @Schema(description = "Indica se deve validar dados de negócio", example = "true")
    private Boolean validarDados;

    @Schema(description = "Indica se deve validar regras fiscais", example = "true")
    private Boolean validarRegrasFiscais;

    @Schema(description = "Observações adicionais", example = "Validação solicitada via API")
    private String observacoes;

    /**
     * Enum para tipos de validação
     */
    public enum TipoValidacao {
        @Schema(description = "Validação de XML")
        XML("XML"),
        
        @Schema(description = "Validação de Schema")
        SCHEMA("SCHEMA"),
        
        @Schema(description = "Validação de Certificado")
        CERTIFICADO("CERTIFICADO"),
        
        @Schema(description = "Validação de Dados")
        DADOS("DADOS"),
        
        @Schema(description = "Validação Completa")
        COMPLETA("COMPLETA");

        private final String codigo;

        TipoValidacao(String codigo) {
            this.codigo = codigo;
        }

        public String getCodigo() {
            return codigo;
        }
    }
}
