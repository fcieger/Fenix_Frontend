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
 * Controller para logs e auditoria de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/nfe/logs")
@Tag(name = "NFe Logs", description = "API para logs e auditoria de NFe")
public class NFeLogController {

    private static final Logger logger = LoggerFactory.getLogger(NFeLogController.class);

    @Autowired
    private NFeService nfeService;

    /**
     * Obtém logs da empresa
     */
    @GetMapping
    @Operation(summary = "Obter Logs da Empresa", description = "Obtém logs de NFe da empresa")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logs obtidos com sucesso"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Object> obterLogs(
            @RequestHeader("X-Empresa-Id") String empresaId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        logger.info("Obtendo logs da empresa: {} página: {} tamanho: {}", empresaId, page, size);
        
        try {
            Object response = nfeService.obterLogs(empresaId, page, size);
            
            logger.info("Logs obtidos com sucesso para empresa: {}", empresaId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao obter logs da empresa {}: {}", empresaId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Obtém logs por chave de acesso
     */
    @GetMapping("/chave/{chaveAcesso}")
    @Operation(summary = "Obter Logs por Chave", description = "Obtém logs de NFe por chave de acesso")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logs obtidos com sucesso"),
        @ApiResponse(responseCode = "404", description = "NFe não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Object> obterLogsPorChaveAcesso(
            @PathVariable String chaveAcesso,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Obtendo logs por chave: {} empresa: {}", chaveAcesso, empresaId);
        
        try {
            Object response = nfeService.obterLogsPorChaveAcesso(chaveAcesso, empresaId);
            
            logger.info("Logs obtidos com sucesso para chave: {}", chaveAcesso);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao obter logs por chave {}: {}", chaveAcesso, e.getMessage(), e);
            throw e;
        }
    }
}
