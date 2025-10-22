package br.com.fenix.nfe.api.exception;

/**
 * Exceção para erros de certificado digital
 * 
 * @author Fenix Team
 * @version 1.0
 */
public class NFeCertificateException extends NFeException {

    private final String certificatePath;
    private final String certificateType;

    public NFeCertificateException(String message) {
        super("CERTIFICATE_ERROR", "CERTIFICATE", message);
        this.certificatePath = "unknown";
        this.certificateType = "unknown";
    }

    public NFeCertificateException(String message, Throwable cause) {
        super("CERTIFICATE_ERROR", "CERTIFICATE", message, cause);
        this.certificatePath = "unknown";
        this.certificateType = "unknown";
    }

    public NFeCertificateException(String certificatePath, String message) {
        super("CERTIFICATE_ERROR", "CERTIFICATE", String.format("Erro no certificado '%s': %s", certificatePath, message));
        this.certificatePath = certificatePath;
        this.certificateType = "unknown";
    }

    public NFeCertificateException(String certificatePath, String message, Throwable cause) {
        super("CERTIFICATE_ERROR", "CERTIFICATE", String.format("Erro no certificado '%s': %s", certificatePath, message), cause);
        this.certificatePath = certificatePath;
        this.certificateType = "unknown";
    }

    public NFeCertificateException(String certificatePath, String certificateType, String message) {
        super("CERTIFICATE_ERROR", "CERTIFICATE", String.format("Erro no certificado '%s' (%s): %s", certificatePath, certificateType, message));
        this.certificatePath = certificatePath;
        this.certificateType = certificateType;
    }

    public NFeCertificateException(String certificatePath, String certificateType, String message, Throwable cause) {
        super("CERTIFICATE_ERROR", "CERTIFICATE", String.format("Erro no certificado '%s' (%s): %s", certificatePath, certificateType, message), cause);
        this.certificatePath = certificatePath;
        this.certificateType = certificateType;
    }

    public String getCertificatePath() {
        return certificatePath;
    }

    public String getCertificateType() {
        return certificateType;
    }
}
