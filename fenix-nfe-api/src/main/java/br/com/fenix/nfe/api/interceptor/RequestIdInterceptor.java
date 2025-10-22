package br.com.fenix.nfe.api.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

/**
 * Interceptor para geração e propagação de Request ID
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Slf4j
@Component
public class RequestIdInterceptor implements HandlerInterceptor {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String REQUEST_ID_ATTRIBUTE = "requestId";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String requestId = request.getHeader(REQUEST_ID_HEADER);
        
        // Se não existe Request ID no header, gera um novo
        if (requestId == null || requestId.trim().isEmpty()) {
            requestId = generateRequestId();
            log.debug("Generated new Request ID: {}", requestId);
        } else {
            log.debug("Using existing Request ID: {}", requestId);
        }
        
        // Armazena o Request ID como atributo da request
        request.setAttribute(REQUEST_ID_ATTRIBUTE, requestId);
        
        // Adiciona o Request ID no header da response
        response.setHeader(REQUEST_ID_HEADER, requestId);
        
        return true;
    }

    /**
     * Gera um novo Request ID único
     */
    private String generateRequestId() {
        return "req_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    /**
     * Obtém o Request ID da request atual
     */
    public static String getCurrentRequestId(HttpServletRequest request) {
        return (String) request.getAttribute(REQUEST_ID_ATTRIBUTE);
    }
}
