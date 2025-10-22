package br.com.fenix.nfe.api.exception;

/**
 * Exceção para erros de configuração
 * 
 * @author Fenix Team
 * @version 1.0
 */
public class NFeConfigurationException extends NFeException {

    public NFeConfigurationException(String message) {
        super("CONFIG_ERROR", "CONFIGURATION", message);
    }

    public NFeConfigurationException(String message, Throwable cause) {
        super("CONFIG_ERROR", "CONFIGURATION", message, cause);
    }

    public NFeConfigurationException(String configKey, String message) {
        super("CONFIG_ERROR", "CONFIGURATION", String.format("Erro na configuração '%s': %s", configKey, message));
    }

    public NFeConfigurationException(String configKey, String message, Throwable cause) {
        super("CONFIG_ERROR", "CONFIGURATION", String.format("Erro na configuração '%s': %s", configKey, message), cause);
    }
}
