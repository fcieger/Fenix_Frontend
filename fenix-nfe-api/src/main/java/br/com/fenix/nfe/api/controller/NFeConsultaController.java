package br.com.fenix.nfe.api.controller;

import br.com.fenix.nfe.api.dto.request.NFeConsultaRequest;
import br.com.fenix.nfe.api.dto.response.NFeConsultaResponse;
import br.com.fenix.nfe.service.NFeService;
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

/**
 * Controller para consultas de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/nfe/consulta")
@Tag(name = "NFe Consulta", description = "API para consultas de NFe")
public class NFeConsultaController {

    private static final Logger logger = LoggerFactory.getLogger(NFeConsultaController.class);

    @Autowired
    private NFeService nfeService;

    /**
     * Processa consulta genérica
     */
    @PostMapping("/processar")
    @Operation(summary = "Processar Consulta", description = "Processa uma consulta genérica de NFe")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Consulta processada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeConsultaResponse> processarConsulta(
            @Valid @RequestBody NFeConsultaRequest request,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Processando consulta genérica: {} empresa: {}", 
                   request.getTipoConsulta(), empresaId);
        
        try {
            // Definir empresa ID do header
            request.setEmpresaId(empresaId);
            
            NFeConsultaResponse response = nfeService.processarConsulta(request);
            
            logger.info("Consulta processada com sucesso: {} sucesso: {}", 
                       request.getTipoConsulta(), response.isSucesso());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao processar consulta: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Consulta status por chave de acesso
     */
    @GetMapping("/status/{chaveAcesso}")
    @Operation(summary = "Consultar Status por Chave", description = "Consulta status de NFe por chave de acesso")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status consultado com sucesso"),
        @ApiResponse(responseCode = "404", description = "NFe não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeConsultaResponse> consultarStatusPorChave(
            @PathVariable String chaveAcesso,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Consultando status por chave: {} empresa: {}", chaveAcesso, empresaId);
        
        try {
            NFeConsultaRequest request = new NFeConsultaRequest();
            request.setEmpresaId(empresaId);
            request.setChaveAcesso(chaveAcesso);
            request.setTipoConsulta(br.com.fenix.nfe.model.enums.NFeOperacaoEnum.CONSULTAR_STATUS);
            
            NFeConsultaResponse response = nfeService.processarConsulta(request);
            
            logger.info("Status consultado com sucesso: {}", chaveAcesso);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao consultar status por chave {}: {}", chaveAcesso, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Consulta XML por chave de acesso
     */
    @GetMapping("/xml/{chaveAcesso}")
    @Operation(summary = "Consultar XML por Chave", description = "Consulta XML de NFe por chave de acesso")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "XML consultado com sucesso"),
        @ApiResponse(responseCode = "404", description = "NFe não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeConsultaResponse> consultarXmlPorChave(
            @PathVariable String chaveAcesso,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Consultando XML por chave: {} empresa: {}", chaveAcesso, empresaId);
        
        try {
            NFeConsultaRequest request = new NFeConsultaRequest();
            request.setEmpresaId(empresaId);
            request.setChaveAcesso(chaveAcesso);
            request.setTipoConsulta(br.com.fenix.nfe.model.enums.NFeOperacaoEnum.CONSULTAR_XML);
            
            NFeConsultaResponse response = nfeService.processarConsulta(request);
            
            logger.info("XML consultado com sucesso: {}", chaveAcesso);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao consultar XML por chave {}: {}", chaveAcesso, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Consulta cadastro por CNPJ
     */
    @GetMapping("/cadastro/{cnpj}")
    @Operation(summary = "Consultar Cadastro por CNPJ", description = "Consulta cadastro de contribuinte por CNPJ")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cadastro consultado com sucesso"),
        @ApiResponse(responseCode = "400", description = "CNPJ inválido"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeConsultaResponse> consultarCadastroPorCnpj(
            @PathVariable String cnpj,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Consultando cadastro por CNPJ: {} empresa: {}", cnpj, empresaId);
        
        try {
            NFeConsultaRequest request = new NFeConsultaRequest();
            request.setEmpresaId(empresaId);
            request.setCnpj(cnpj);
            request.setTipoConsulta(br.com.fenix.nfe.model.enums.NFeOperacaoEnum.CONSULTAR_CADASTRO);
            
            NFeConsultaResponse response = nfeService.processarConsulta(request);
            
            logger.info("Cadastro consultado com sucesso: {}", cnpj);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao consultar cadastro por CNPJ {}: {}", cnpj, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Consulta distribuição por CNPJ
     */
    @GetMapping("/distribuicao/{cnpj}")
    @Operation(summary = "Consultar Distribuição por CNPJ", description = "Consulta distribuição de DFe por CNPJ")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Distribuição consultada com sucesso"),
        @ApiResponse(responseCode = "400", description = "CNPJ inválido"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeConsultaResponse> consultarDistribuicaoPorCnpj(
            @PathVariable String cnpj,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Consultando distribuição por CNPJ: {} empresa: {}", cnpj, empresaId);
        
        try {
            NFeConsultaRequest request = new NFeConsultaRequest();
            request.setEmpresaId(empresaId);
            request.setCnpj(cnpj);
            request.setTipoConsulta(br.com.fenix.nfe.model.enums.NFeOperacaoEnum.CONSULTAR_DISTRIBUICAO);
            
            NFeConsultaResponse response = nfeService.processarConsulta(request);
            
            logger.info("Distribuição consultada com sucesso: {}", cnpj);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao consultar distribuição por CNPJ {}: {}", cnpj, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Consulta por protocolo
     */
    @GetMapping("/protocolo/{protocolo}")
    @Operation(summary = "Consultar por Protocolo", description = "Consulta NFe por protocolo")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Consulta realizada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Protocolo não encontrado"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeConsultaResponse> consultarPorProtocolo(
            @PathVariable String protocolo,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Consultando por protocolo: {} empresa: {}", protocolo, empresaId);
        
        try {
            NFeConsultaRequest request = new NFeConsultaRequest();
            request.setEmpresaId(empresaId);
            request.setProtocolo(protocolo);
            request.setTipoConsulta(br.com.fenix.nfe.model.enums.NFeOperacaoEnum.CONSULTAR_STATUS);
            
            NFeConsultaResponse response = nfeService.processarConsulta(request);
            
            logger.info("Consulta por protocolo realizada com sucesso: {}", protocolo);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao consultar por protocolo {}: {}", protocolo, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Consulta por IE
     */
    @GetMapping("/ie/{ie}")
    @Operation(summary = "Consultar por IE", description = "Consulta NFe por Inscrição Estadual")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Consulta realizada com sucesso"),
        @ApiResponse(responseCode = "400", description = "IE inválida"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeConsultaResponse> consultarPorIe(
            @PathVariable String ie,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Consultando por IE: {} empresa: {}", ie, empresaId);
        
        try {
            NFeConsultaRequest request = new NFeConsultaRequest();
            request.setEmpresaId(empresaId);
            request.setIe(ie);
            request.setTipoConsulta(br.com.fenix.nfe.model.enums.NFeOperacaoEnum.CONSULTAR_CADASTRO);
            
            NFeConsultaResponse response = nfeService.processarConsulta(request);
            
            logger.info("Consulta por IE realizada com sucesso: {}", ie);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao consultar por IE {}: {}", ie, e.getMessage(), e);
            throw e;
        }
    }
}
