package br.com.fenix.nfe.api.exception;

import lombok.Getter;

/**
 * Exceção base para todas as exceções da API NFe
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Getter
public class NFeException extends RuntimeException {

    private final String errorCode;
    private final String category;
    private final Object[] args;

    public NFeException(String message) {
        super(message);
        this.errorCode = "NFE_ERROR";
        this.category = "GENERAL";
        this.args = new Object[0];
    }

    public NFeException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "NFE_ERROR";
        this.category = "GENERAL";
        this.args = new Object[0];
    }

    public NFeException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.category = "GENERAL";
        this.args = new Object[0];
    }

    public NFeException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.category = "GENERAL";
        this.args = new Object[0];
    }

    public NFeException(String errorCode, String category, String message) {
        super(message);
        this.errorCode = errorCode;
        this.category = category;
        this.args = new Object[0];
    }

    public NFeException(String errorCode, String category, String message, Object... args) {
        super(message);
        this.errorCode = errorCode;
        this.category = category;
        this.args = args;
    }

    public NFeException(String errorCode, String category, String message, Throwable cause, Object... args) {
        super(message, cause);
        this.errorCode = errorCode;
        this.category = category;
        this.args = args;
    }
}
