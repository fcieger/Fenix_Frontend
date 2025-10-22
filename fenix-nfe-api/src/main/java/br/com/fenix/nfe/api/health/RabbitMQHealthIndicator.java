package br.com.fenix.nfe.api.health;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.actuator.health.Health;
import org.springframework.boot.actuator.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Health indicator para RabbitMQ
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RabbitMQHealthIndicator implements HealthIndicator {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public Health health() {
        try {
            Map<String, Object> details = new HashMap<>();
            
            // Verificar conexão com RabbitMQ
            rabbitTemplate.execute(channel -> {
                // Verificar se o canal está aberto
                if (!channel.isOpen()) {
                    throw new RuntimeException("RabbitMQ channel is not open");
                }
                
                // Verificar se a conexão está ativa
                if (!channel.getConnection().isOpen()) {
                    throw new RuntimeException("RabbitMQ connection is not open");
                }
                
                return null;
            });
            
            details.put("connection", "UP");
            details.put("channel", "OPEN");
            
            // Verificar filas principais
            String[] queues = {
                "nfe.emitir.high",
                "nfe.emitir.normal", 
                "nfe.emitir.low",
                "nfe.consulta",
                "nfe.evento",
                "nfe.retry",
                "nfe.dlq"
            };
            
            Map<String, String> queueStatus = new HashMap<>();
            for (String queue : queues) {
                try {
                    rabbitTemplate.execute(channel -> {
                        channel.queueDeclarePassive(queue);
                        return null;
                    });
                    queueStatus.put(queue, "EXISTS");
                } catch (Exception e) {
                    queueStatus.put(queue, "ERROR: " + e.getMessage());
                }
            }
            
            details.put("queues", queueStatus);
            
            return Health.up()
                    .withDetails(details)
                    .build();
                    
        } catch (Exception e) {
            log.error("Error checking RabbitMQ health: {}", e.getMessage(), e);
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}
