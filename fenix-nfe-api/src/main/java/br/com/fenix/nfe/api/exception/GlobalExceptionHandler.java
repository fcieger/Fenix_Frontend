package br.com.fenix.nfe.api.exception;

import br.com.fenix.nfe.api.dto.response.NFeErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Handler global para exceções da API
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Trata erros de validação
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<NFeErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex, WebRequest request) {
        
        log.warn("Erro de validação: {}", ex.getMessage());
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        NFeErrorResponse errorResponse = NFeErrorResponse.builder()
                .errorCode("VALIDATION_ERROR")
                .message("Erro de validação nos dados de entrada")
                .category("CLIENT_ERROR")
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .metadata(errors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Trata exceções customizadas de validação NFe
     */
    @ExceptionHandler(NFeValidationException.class)
    public ResponseEntity<NFeErrorResponse> handleNFeValidationException(
            NFeValidationException ex, WebRequest request) {
        
        log.warn("Erro de validação NFe: {}", ex.getMessage());
        
        NFeErrorResponse errorResponse = NFeErrorResponse.builder()
                .errorCode(ex.getErrorCode())
                .message(ex.getMessage())
                .category(ex.getCategory())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .metadata(Map.of(
                    "validationErrors", ex.getValidationErrors(),
                    "fieldErrors", ex.getFieldErrors()
                ))
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Trata exceções de configuração NFe
     */
    @ExceptionHandler(NFeConfigurationException.class)
    public ResponseEntity<NFeErrorResponse> handleNFeConfigurationException(
            NFeConfigurationException ex, WebRequest request) {
        
        log.error("Erro de configuração NFe: {}", ex.getMessage());
        
        NFeErrorResponse errorResponse = NFeErrorResponse.builder()
                .errorCode(ex.getErrorCode())
                .message(ex.getMessage())
                .category(ex.getCategory())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    /**
     * Trata exceções de fila NFe
     */
    @ExceptionHandler(NFeQueueException.class)
    public ResponseEntity<NFeErrorResponse> handleNFeQueueException(
            NFeQueueException ex, WebRequest request) {
        
        log.error("Erro de fila NFe: {}", ex.getMessage());
        
        NFeErrorResponse errorResponse = NFeErrorResponse.builder()
                .errorCode(ex.getErrorCode())
                .message(ex.getMessage())
                .category(ex.getCategory())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .metadata(Map.of(
                    "queueName", ex.getQueueName(),
                    "operation", ex.getOperation()
                ))
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    /**
     * Trata exceções de certificado NFe
     */
    @ExceptionHandler(NFeCertificateException.class)
    public ResponseEntity<NFeErrorResponse> handleNFeCertificateException(
            NFeCertificateException ex, WebRequest request) {
        
        log.error("Erro de certificado NFe: {}", ex.getMessage());
        
        NFeErrorResponse errorResponse = NFeErrorResponse.builder()
                .errorCode(ex.getErrorCode())
                .message(ex.getMessage())
                .category(ex.getCategory())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .metadata(Map.of(
                    "certificatePath", ex.getCertificatePath(),
                    "certificateType", ex.getCertificateType()
                ))
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Trata exceções da SEFAZ NFe
     */
    @ExceptionHandler(NFeSefazException.class)
    public ResponseEntity<NFeErrorResponse> handleNFeSefazException(
            NFeSefazException ex, WebRequest request) {
        
        log.error("Erro da SEFAZ NFe: {}", ex.getMessage());
        
        NFeErrorResponse errorResponse = NFeErrorResponse.builder()
                .errorCode(ex.getErrorCode())
                .message(ex.getMessage())
                .category(ex.getCategory())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .metadata(Map.of(
                    "sefazCode", ex.getSefazCode(),
                    "sefazMessage", ex.getSefazMessage(),
                    "operation", ex.getOperation()
                ))
                .build();

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
    }

    /**
     * Trata exceções gerais NFe
     */
    @ExceptionHandler(NFeException.class)
    public ResponseEntity<NFeErrorResponse> handleNFeException(
            NFeException ex, WebRequest request) {
        
        log.error("Erro NFe: {}", ex.getMessage());
        
        NFeErrorResponse errorResponse = NFeErrorResponse.builder()
                .errorCode(ex.getErrorCode())
                .message(ex.getMessage())
                .category(ex.getCategory())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    /**
     * Trata erros de autenticação
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<NFeErrorResponse> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {
        
        log.warn("Erro de autenticação: {}", ex.getMessage());
        
        NFeErrorResponse errorResponse = NFeErrorResponse.builder()
                .errorCode("AUTHENTICATION_ERROR")
                .message("Erro de autenticação")
                .category("AUTHENTICATION")
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    /**
     * Trata erros de autorização
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<NFeErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {
        
        log.warn("Erro de autorização: {}", ex.getMessage());
        
        NFeErrorResponse errorResponse = NFeErrorResponse.builder()
                .errorCode("ACCESS_DENIED")
                .message("Acesso negado")
                .category("AUTHORIZATION")
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    /**
     * Trata erros de credenciais inválidas
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<NFeErrorResponse> handleBadCredentialsException(
            BadCredentialsException ex, WebRequest request) {
        
        log.warn("Credenciais inválidas: {}", ex.getMessage());
        
        NFeErrorResponse errorResponse = NFeErrorResponse.builder()
                .errorCode("BAD_CREDENTIALS")
                .message("Credenciais inválidas")
                .category("AUTHENTICATION")
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    /**
     * Trata erros de recurso não encontrado
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<NFeErrorResponse> handleNoHandlerFoundException(
            NoHandlerFoundException ex, WebRequest request) {
        
        log.warn("Recurso não encontrado: {}", ex.getMessage());
        
        NFeErrorResponse errorResponse = NFeErrorResponse.builder()
                .errorCode("NOT_FOUND")
                .message("Recurso não encontrado")
                .category("CLIENT_ERROR")
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    /**
     * Trata erros de argumento inválido
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<NFeErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        
        log.warn("Argumento inválido: {}", ex.getMessage());
        
        NFeErrorResponse errorResponse = NFeErrorResponse.builder()
                .errorCode("INVALID_ARGUMENT")
                .message("Argumento inválido")
                .category("CLIENT_ERROR")
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Trata erros genéricos
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<NFeErrorResponse> handleGenericException(
            Exception ex, WebRequest request) {
        
        log.error("Erro interno: {}", ex.getMessage(), ex);
        
        NFeErrorResponse errorResponse = NFeErrorResponse.builder()
                .errorCode("INTERNAL_ERROR")
                .message("Erro interno do servidor")
                .category("SERVER_ERROR")
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .stackTrace(ex.getStackTrace())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
