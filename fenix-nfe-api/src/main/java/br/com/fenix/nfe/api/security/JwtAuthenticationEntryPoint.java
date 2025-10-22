package br.com.fenix.nfe.api.security;

import br.com.fenix.nfe.api.dto.response.NFeErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * Ponto de entrada para tratamento de erros de autenticação
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Slf4j
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public JwtAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request, 
                        HttpServletResponse response,
                        AuthenticationException authException) throws IOException {
        
        log.warn("Acesso não autorizado: {} - {}", 
                request.getRequestURI(), authException.getMessage());
        
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        
        NFeErrorResponse errorResponse = NFeErrorResponse.builder()
                .errorCode("UNAUTHORIZED")
                .message("Token de acesso inválido ou expirado")
                .category("AUTHENTICATION")
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .traceId(request.getHeader("X-Trace-ID"))
                .build();
        
        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
}
