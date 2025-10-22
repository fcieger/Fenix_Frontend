package br.com.fenix.nfe.api.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.time.Instant;

/**
 * Interceptor para logging de requests HTTP
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Slf4j
@Component
public class LoggingInterceptor implements HandlerInterceptor {

    private static final String START_TIME_ATTRIBUTE = "startTime";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        Instant startTime = Instant.now();
        request.setAttribute(START_TIME_ATTRIBUTE, startTime);
        
        String requestId = request.getHeader("X-Request-ID");
        String traceId = request.getHeader("X-Trace-ID");
        String companyCnpj = request.getHeader("X-Company-CNPJ");
        
        log.info("Incoming request: {} {} | Request-ID: {} | Trace-ID: {} | Company: {} | User-Agent: {}",
                request.getMethod(),
                request.getRequestURI(),
                requestId != null ? requestId : "N/A",
                traceId != null ? traceId : "N/A",
                companyCnpj != null ? companyCnpj : "N/A",
                request.getHeader("User-Agent"));
        
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        Instant startTime = (Instant) request.getAttribute(START_TIME_ATTRIBUTE);
        if (startTime != null) {
            Duration duration = Duration.between(startTime, Instant.now());
            
            String requestId = request.getHeader("X-Request-ID");
            String traceId = request.getHeader("X-Trace-ID");
            String companyCnpj = request.getHeader("X-Company-CNPJ");
            
            if (ex != null) {
                log.error("Request completed with error: {} {} | Status: {} | Duration: {}ms | Request-ID: {} | Trace-ID: {} | Company: {} | Error: {}",
                        request.getMethod(),
                        request.getRequestURI(),
                        response.getStatus(),
                        duration.toMillis(),
                        requestId != null ? requestId : "N/A",
                        traceId != null ? traceId : "N/A",
                        companyCnpj != null ? companyCnpj : "N/A",
                        ex.getMessage());
            } else {
                log.info("Request completed: {} {} | Status: {} | Duration: {}ms | Request-ID: {} | Trace-ID: {} | Company: {}",
                        request.getMethod(),
                        request.getRequestURI(),
                        response.getStatus(),
                        duration.toMillis(),
                        requestId != null ? requestId : "N/A",
                        traceId != null ? traceId : "N/A",
                        companyCnpj != null ? companyCnpj : "N/A");
            }
        }
    }
}
