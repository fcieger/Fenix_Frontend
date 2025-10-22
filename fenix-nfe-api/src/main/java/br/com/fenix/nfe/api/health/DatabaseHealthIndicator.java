package br.com.fenix.nfe.api.health;

import br.com.fenix.nfe.repository.NFeStatusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuator.health.Health;
import org.springframework.boot.actuator.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Health indicator para banco de dados
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseHealthIndicator implements HealthIndicator {

    private final NFeStatusRepository nfeStatusRepository;

    @Override
    public Health health() {
        try {
            Map<String, Object> details = new HashMap<>();
            
            // Verificar conexão com banco
            long totalNFe = nfeStatusRepository.count();
            details.put("totalNFe", totalNFe);
            
            // Verificar NFe por status
            Map<String, Long> nfeByStatus = new HashMap<>();
            nfeByStatus.put("PENDENTE", nfeStatusRepository.countByStatus("PENDENTE"));
            nfeByStatus.put("PROCESSANDO", nfeStatusRepository.countByStatus("PROCESSANDO"));
            nfeByStatus.put("AUTORIZADA", nfeStatusRepository.countByStatus("AUTORIZADA"));
            nfeByStatus.put("REJEITADA", nfeStatusRepository.countByStatus("REJEITADA"));
            nfeByStatus.put("CANCELADA", nfeStatusRepository.countByStatus("CANCELADA"));
            
            details.put("nfeByStatus", nfeByStatus);
            
            // Verificar NFe recentes (últimas 24h)
            long recentNFe = nfeStatusRepository.countRecentNFe(24);
            details.put("recentNFe24h", recentNFe);
            
            return Health.up()
                    .withDetails(details)
                    .build();
                    
        } catch (Exception e) {
            log.error("Error checking database health: {}", e.getMessage(), e);
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}
