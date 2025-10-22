package br.com.fenix.nfe.api.controller;

import br.com.fenix.nfe.service.NFeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para health check e monitoramento
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/nfe/health")
@Tag(name = "NFe Health", description = "API para health check e monitoramento")
public class NFeHealthController {

    private static final Logger logger = LoggerFactory.getLogger(NFeHealthController.class);

    @Autowired
    private NFeService nfeService;

    /**
     * Health check básico
     */
    @GetMapping
    @Operation(summary = "Health Check", description = "Verifica saúde do serviço")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Serviço saudável"),
        @ApiResponse(responseCode = "503", description = "Serviço indisponível")
    })
    public ResponseEntity<Object> healthCheck() {
        
        logger.debug("Executando health check");
        
        try {
            Object response = nfeService.obterStatusSaude();
            
            logger.debug("Health check executado com sucesso");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro no health check: {}", e.getMessage(), e);
            return ResponseEntity.status(503).body(Map.of(
                    "status", "DOWN",
                    "error", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * Health check detalhado
     */
    @GetMapping("/detailed")
    @Operation(summary = "Health Check Detalhado", description = "Verifica saúde detalhada do serviço")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Serviço saudável"),
        @ApiResponse(responseCode = "503", description = "Serviço indisponível")
    })
    public ResponseEntity<Object> healthCheckDetalhado() {
        
        logger.debug("Executando health check detalhado");
        
        try {
            Object response = nfeService.obterStatusSaude();
            
            // Adicionar informações detalhadas
            Map<String, Object> detailedResponse = Map.of(
                    "status", "UP",
                    "timestamp", System.currentTimeMillis(),
                    "version", "1.0.0",
                    "environment", "development",
                    "uptime", System.currentTimeMillis(),
                    "details", response
            );
            
            logger.debug("Health check detalhado executado com sucesso");
            
            return ResponseEntity.ok(detailedResponse);
            
        } catch (Exception e) {
            logger.error("Erro no health check detalhado: {}", e.getMessage(), e);
            return ResponseEntity.status(503).body(Map.of(
                    "status", "DOWN",
                    "error", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * Informações de versão
     */
    @GetMapping("/version")
    @Operation(summary = "Informações de Versão", description = "Obtém informações de versão do serviço")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Informações obtidas com sucesso"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Object> obterVersao() {
        
        logger.debug("Obtendo informações de versão");
        
        try {
            Object response = nfeService.obterVersao();
            
            logger.debug("Informações de versão obtidas com sucesso");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao obter informações de versão: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Health check da empresa
     */
    @GetMapping("/empresa")
    @Operation(summary = "Health Check da Empresa", description = "Verifica saúde específica da empresa")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Empresa saudável"),
        @ApiResponse(responseCode = "404", description = "Empresa não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Object> healthCheckEmpresa(
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Executando health check da empresa: {}", empresaId);
        
        try {
            boolean habilitada = nfeService.validarEmpresaHabilitada(empresaId);
            
            Map<String, Object> response = Map.of(
                    "empresaId", empresaId,
                    "habilitada", habilitada,
                    "status", habilitada ? "UP" : "DOWN",
                    "timestamp", System.currentTimeMillis()
            );
            
            logger.info("Health check da empresa executado com sucesso: {} habilitada: {}", 
                       empresaId, habilitada);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro no health check da empresa {}: {}", empresaId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                    "empresaId", empresaId,
                    "status", "ERROR",
                    "error", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }
}
