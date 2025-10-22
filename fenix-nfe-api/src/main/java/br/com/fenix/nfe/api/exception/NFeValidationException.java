package br.com.fenix.nfe.api.exception;

import lombok.Getter;

import java.util.List;
import java.util.Map;

/**
 * Exceção para erros de validação de dados
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Getter
public class NFeValidationException extends NFeException {

    private final List<String> validationErrors;
    private final Map<String, String> fieldErrors;

    public NFeValidationException(String message) {
        super("VALIDATION_ERROR", "VALIDATION", message);
        this.validationErrors = List.of(message);
        this.fieldErrors = Map.of();
    }

    public NFeValidationException(String message, List<String> validationErrors) {
        super("VALIDATION_ERROR", "VALIDATION", message);
        this.validationErrors = validationErrors;
        this.fieldErrors = Map.of();
    }

    public NFeValidationException(String message, Map<String, String> fieldErrors) {
        super("VALIDATION_ERROR", "VALIDATION", message);
        this.validationErrors = List.of();
        this.fieldErrors = fieldErrors;
    }

    public NFeValidationException(String message, List<String> validationErrors, Map<String, String> fieldErrors) {
        super("VALIDATION_ERROR", "VALIDATION", message);
        this.validationErrors = validationErrors;
        this.fieldErrors = fieldErrors;
    }

    public NFeValidationException(String field, String error) {
        super("FIELD_VALIDATION_ERROR", "VALIDATION", String.format("Erro de validação no campo '%s': %s", field, error));
        this.validationErrors = List.of(String.format("Campo '%s': %s", field, error));
        this.fieldErrors = Map.of(field, error);
    }
}
