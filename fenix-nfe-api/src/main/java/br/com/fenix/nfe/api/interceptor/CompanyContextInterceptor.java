package br.com.fenix.nfe.api.interceptor;

import br.com.fenix.nfe.api.service.NFeConfigurationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor para contexto da empresa
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CompanyContextInterceptor implements HandlerInterceptor {

    private final NFeConfigurationService configurationService;
    
    private static final String COMPANY_CNPJ_HEADER = "X-Company-CNPJ";
    private static final String COMPANY_CONTEXT_ATTRIBUTE = "companyContext";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String companyCnpj = request.getHeader(COMPANY_CNPJ_HEADER);
        
        if (companyCnpj != null && !companyCnpj.trim().isEmpty()) {
            try {
                // Valida se a empresa existe e está ativa
                boolean isValidCompany = configurationService.validarEmpresa(companyCnpj);
                
                if (isValidCompany) {
                    // Armazena o CNPJ como atributo da request
                    request.setAttribute(COMPANY_CONTEXT_ATTRIBUTE, companyCnpj);
                    log.debug("Company context set: {}", companyCnpj);
                } else {
                    log.warn("Invalid company CNPJ provided: {}", companyCnpj);
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    return false;
                }
            } catch (Exception e) {
                log.error("Error validating company CNPJ: {} - {}", companyCnpj, e.getMessage());
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                return false;
            }
        } else {
            log.debug("No company CNPJ provided in header");
        }
        
        return true;
    }

    /**
     * Obtém o CNPJ da empresa da request atual
     */
    public static String getCurrentCompanyCnpj(HttpServletRequest request) {
        return (String) request.getAttribute(COMPANY_CONTEXT_ATTRIBUTE);
    }
}
