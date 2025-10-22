package br.com.fenix.nfe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Aplicação principal da API NFe Fenix
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
public class NFeApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(NFeApiApplication.class, args);
    }
}


