package br.com.fenix.nfe.api.health;

import br.com.fenix.nfe.api.service.NFeConfigurationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuator.health.Health;
import org.springframework.boot.actuator.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Health indicator customizado para NFe API
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NFeHealthIndicator implements HealthIndicator {

    private final NFeConfigurationService configurationService;

    @Override
    public Health health() {
        try {
            Map<String, Object> details = new HashMap<>();
            
            // Verificar configurações de empresas
            long totalCompanies = configurationService.countActiveCompanies();
            details.put("totalCompanies", totalCompanies);
            
            // Verificar se há pelo menos uma empresa configurada
            if (totalCompanies == 0) {
                return Health.down()
                        .withDetail("error", "No companies configured")
                        .withDetails(details)
                        .build();
            }
            
            // Verificar configurações válidas
            long validConfigurations = configurationService.countValidConfigurations();
            details.put("validConfigurations", validConfigurations);
            
            // Verificar proporção de configurações válidas
            double validRatio = (double) validConfigurations / totalCompanies;
            details.put("validConfigurationsRatio", validRatio);
            
            if (validRatio < 0.5) {
                return Health.down()
                        .withDetail("error", "Less than 50% of companies have valid configurations")
                        .withDetails(details)
                        .build();
            }
            
            return Health.up()
                    .withDetails(details)
                    .build();
                    
        } catch (Exception e) {
            log.error("Error checking NFe health: {}", e.getMessage(), e);
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}
