package br.com.fenix.nfe.api.controller;

import br.com.fenix.nfe.model.entity.EmpresaNFeConfig;
import br.com.fenix.nfe.model.enums.NFeAmbienteEnum;
import br.com.fenix.nfe.model.enums.NFeEstadoEnum;
import br.com.fenix.nfe.service.NFeConfigurationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller para configurações de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/nfe/config")
@Tag(name = "NFe Configuração", description = "API para configurações de NFe")
public class NFeConfigController {

    private static final Logger logger = LoggerFactory.getLogger(NFeConfigController.class);

    @Autowired
    private NFeConfigurationService configService;

    /**
     * Obtém configuração da empresa
     */
    @GetMapping
    @Operation(summary = "Obter Configuração", description = "Obtém configuração de NFe da empresa")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Configuração obtida com sucesso"),
        @ApiResponse(responseCode = "404", description = "Configuração não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Object> obterConfiguracao(
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Obtendo configuração da empresa: {}", empresaId);
        
        try {
            Object response = configService.obterConfiguracaoEmpresa(empresaId);
            
            logger.info("Configuração obtida com sucesso para empresa: {}", empresaId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao obter configuração da empresa {}: {}", empresaId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Cria nova configuração
     */
    @PostMapping
    @Operation(summary = "Criar Configuração", description = "Cria nova configuração de NFe para empresa")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Configuração criada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "409", description = "Configuração já existe"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<EmpresaNFeConfig> criarConfiguracao(
            @RequestHeader("X-Empresa-Id") String empresaId,
            @RequestParam String cnpj,
            @RequestParam String razaoSocial,
            @RequestParam NFeEstadoEnum estado,
            @RequestParam NFeAmbienteEnum ambiente) {
        
        logger.info("Criando configuração para empresa: {} CNPJ: {}", empresaId, cnpj);
        
        try {
            EmpresaNFeConfig response = configService.criarConfiguracaoEmpresa(
                    empresaId, cnpj, razaoSocial, estado, ambiente);
            
            logger.info("Configuração criada com sucesso para empresa: {}", empresaId);
            
            return ResponseEntity.status(201).body(response);
            
        } catch (Exception e) {
            logger.error("Erro ao criar configuração da empresa {}: {}", empresaId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Atualiza configuração
     */
    @PutMapping
    @Operation(summary = "Atualizar Configuração", description = "Atualiza configuração de NFe da empresa")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Configuração atualizada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "404", description = "Configuração não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<EmpresaNFeConfig> atualizarConfiguracao(
            @RequestHeader("X-Empresa-Id") String empresaId,
            @RequestBody Map<String, Object> configuracoes) {
        
        logger.info("Atualizando configuração da empresa: {}", empresaId);
        
        try {
            EmpresaNFeConfig response = configService.atualizarConfiguracaoEmpresa(
                    empresaId, configuracoes);
            
            logger.info("Configuração atualizada com sucesso para empresa: {}", empresaId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao atualizar configuração da empresa {}: {}", empresaId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Valida empresa
     */
    @GetMapping("/validar")
    @Operation(summary = "Validar Empresa", description = "Valida se empresa está habilitada")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Validação realizada com sucesso"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Map<String, Object>> validarEmpresa(
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Validando empresa: {}", empresaId);
        
        try {
            boolean habilitada = configService.validarEmpresa(empresaId);
            
            Map<String, Object> response = Map.of(
                    "empresaId", empresaId,
                    "habilitada", habilitada,
                    "timestamp", System.currentTimeMillis()
            );
            
            logger.info("Validação realizada com sucesso para empresa: {} habilitada: {}", 
                       empresaId, habilitada);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao validar empresa {}: {}", empresaId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Obtém próximo número
     */
    @GetMapping("/proximo-numero")
    @Operation(summary = "Obter Próximo Número", description = "Obtém próximo número de NFe para série")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Número obtido com sucesso"),
        @ApiResponse(responseCode = "404", description = "Configuração não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Map<String, Object>> obterProximoNumero(
            @RequestHeader("X-Empresa-Id") String empresaId,
            @RequestParam Integer serie) {
        
        logger.info("Obtendo próximo número para empresa: {} série: {}", empresaId, serie);
        
        try {
            Integer proximoNumero = configService.obterProximoNumero(empresaId, serie);
            
            Map<String, Object> response = Map.of(
                    "empresaId", empresaId,
                    "serie", serie,
                    "proximoNumero", proximoNumero,
                    "timestamp", System.currentTimeMillis()
            );
            
            logger.info("Próximo número obtido com sucesso: {} série: {} número: {}", 
                       empresaId, serie, proximoNumero);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao obter próximo número da empresa {}: {}", empresaId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Atualiza certificado
     */
    @PutMapping("/certificado")
    @Operation(summary = "Atualizar Certificado", description = "Atualiza certificado digital da empresa")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Certificado atualizado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Certificado inválido"),
        @ApiResponse(responseCode = "404", description = "Configuração não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<EmpresaNFeConfig> atualizarCertificado(
            @RequestHeader("X-Empresa-Id") String empresaId,
            @RequestParam String caminhoCertificado,
            @RequestParam String senhaCertificado) {
        
        logger.info("Atualizando certificado da empresa: {}", empresaId);
        
        try {
            EmpresaNFeConfig response = configService.atualizarCertificado(
                    empresaId, caminhoCertificado, senhaCertificado);
            
            logger.info("Certificado atualizado com sucesso para empresa: {}", empresaId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao atualizar certificado da empresa {}: {}", empresaId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Valida certificado
     */
    @GetMapping("/certificado/validar")
    @Operation(summary = "Validar Certificado", description = "Valida certificado digital da empresa")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Validação realizada com sucesso"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Map<String, Object>> validarCertificado(
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Validando certificado da empresa: {}", empresaId);
        
        try {
            boolean valido = configService.validarCertificado(empresaId);
            
            Map<String, Object> response = Map.of(
                    "empresaId", empresaId,
                    "certificadoValido", valido,
                    "timestamp", System.currentTimeMillis()
            );
            
            logger.info("Validação de certificado realizada com sucesso para empresa: {} válido: {}", 
                       empresaId, valido);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao validar certificado da empresa {}: {}", empresaId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Lista todas as configurações
     */
    @GetMapping("/listar")
    @Operation(summary = "Listar Configurações", description = "Lista todas as configurações de empresas")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista obtida com sucesso"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<List<EmpresaNFeConfig>> listarConfiguracoes() {
        
        logger.info("Listando todas as configurações");
        
        try {
            List<EmpresaNFeConfig> response = configService.listarConfiguracoes();
            
            logger.info("Lista obtida com sucesso: {} configurações", response.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao listar configurações: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Obtém estatísticas de configurações
     */
    @GetMapping("/estatisticas")
    @Operation(summary = "Obter Estatísticas", description = "Obtém estatísticas das configurações")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Estatísticas obtidas com sucesso"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Object> obterEstatisticas() {
        
        logger.info("Obtendo estatísticas das configurações");
        
        try {
            Object response = configService.obterEstatisticas();
            
            logger.info("Estatísticas obtidas com sucesso");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao obter estatísticas: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Exporta configuração
     */
    @GetMapping("/exportar")
    @Operation(summary = "Exportar Configuração", description = "Exporta configuração da empresa para backup")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Configuração exportada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Configuração não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Object> exportarConfiguracao(
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Exportando configuração da empresa: {}", empresaId);
        
        try {
            Object response = configService.exportarConfiguracao(empresaId);
            
            logger.info("Configuração exportada com sucesso para empresa: {}", empresaId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao exportar configuração da empresa {}: {}", empresaId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Importa configuração
     */
    @PostMapping("/importar")
    @Operation(summary = "Importar Configuração", description = "Importa configuração de backup")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Configuração importada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<EmpresaNFeConfig> importarConfiguracao(
            @RequestBody Map<String, Object> dadosBackup) {
        
        logger.info("Importando configuração de backup");
        
        try {
            EmpresaNFeConfig response = configService.importarConfiguracao(dadosBackup);
            
            logger.info("Configuração importada com sucesso para empresa: {}", response.getEmpresaId());
            
            return ResponseEntity.status(201).body(response);
            
        } catch (Exception e) {
            logger.error("Erro ao importar configuração: {}", e.getMessage(), e);
            throw e;
        }
    }
}
