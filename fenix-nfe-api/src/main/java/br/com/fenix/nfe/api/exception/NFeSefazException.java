package br.com.fenix.nfe.api.exception;

import lombok.Getter;

/**
 * Exceção para erros da SEFAZ
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Getter
public class NFeSefazException extends NFeException {

    private final String sefazCode;
    private final String sefazMessage;
    private final String operation;
    private final String xmlResponse;

    public NFeSefazException(String message) {
        super("SEFAZ_ERROR", "SEFAZ", message);
        this.sefazCode = "UNKNOWN";
        this.sefazMessage = message;
        this.operation = "unknown";
        this.xmlResponse = null;
    }

    public NFeSefazException(String message, Throwable cause) {
        super("SEFAZ_ERROR", "SEFAZ", message, cause);
        this.sefazCode = "UNKNOWN";
        this.sefazMessage = message;
        this.operation = "unknown";
        this.xmlResponse = null;
    }

    public NFeSefazException(String sefazCode, String sefazMessage, String operation) {
        super("SEFAZ_ERROR", "SEFAZ", String.format("Erro SEFAZ [%s] na operação '%s': %s", sefazCode, operation, sefazMessage));
        this.sefazCode = sefazCode;
        this.sefazMessage = sefazMessage;
        this.operation = operation;
        this.xmlResponse = null;
    }

    public NFeSefazException(String sefazCode, String sefazMessage, String operation, String xmlResponse) {
        super("SEFAZ_ERROR", "SEFAZ", String.format("Erro SEFAZ [%s] na operação '%s': %s", sefazCode, operation, sefazMessage));
        this.sefazCode = sefazCode;
        this.sefazMessage = sefazMessage;
        this.operation = operation;
        this.xmlResponse = xmlResponse;
    }

    public NFeSefazException(String sefazCode, String sefazMessage, String operation, String xmlResponse, Throwable cause) {
        super("SEFAZ_ERROR", "SEFAZ", String.format("Erro SEFAZ [%s] na operação '%s': %s", sefazCode, operation, sefazMessage), cause);
        this.sefazCode = sefazCode;
        this.sefazMessage = sefazMessage;
        this.operation = operation;
        this.xmlResponse = xmlResponse;
    }
}
