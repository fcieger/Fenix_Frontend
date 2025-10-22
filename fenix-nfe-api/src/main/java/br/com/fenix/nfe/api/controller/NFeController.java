package br.com.fenix.nfe.api.controller;

import br.com.fenix.nfe.api.dto.request.NFeConsultaRequest;
import br.com.fenix.nfe.api.dto.request.NFeRequest;
import br.com.fenix.nfe.api.dto.response.NFeConsultaResponse;
import br.com.fenix.nfe.api.dto.response.NFeResponse;
import br.com.fenix.nfe.api.dto.response.NFeStatusResponse;
import br.com.fenix.nfe.service.NFeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller principal para operações de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/nfe")
@Tag(name = "NFe", description = "API para operações de Nota Fiscal Eletrônica")
public class NFeController {

    private static final Logger logger = LoggerFactory.getLogger(NFeController.class);

    @Autowired
    private NFeService nfeService;

    /**
     * Emite uma NFe
     */
    @PostMapping("/emitir")
    @Operation(summary = "Emitir NFe", description = "Emite uma nova Nota Fiscal Eletrônica")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "NFe emitida com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeResponse> emitirNFe(
            @Valid @RequestBody NFeRequest request,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Recebida solicitação de emissão de NFe para empresa: {}", empresaId);
        
        try {
            // Definir empresa ID do header
            request.setEmpresaId(empresaId);
            
            NFeResponse response = nfeService.emitirNFe(request);
            
            logger.info("NFe emitida com sucesso: {} empresa: {}", 
                       response.getChaveAcesso(), empresaId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            logger.error("Erro ao emitir NFe para empresa {}: {}", empresaId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Consulta status de uma NFe
     */
    @GetMapping("/status/{chaveAcesso}")
    @Operation(summary = "Consultar Status", description = "Consulta o status de uma NFe")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status consultado com sucesso"),
        @ApiResponse(responseCode = "404", description = "NFe não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeStatusResponse> consultarStatus(
            @PathVariable String chaveAcesso,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Consultando status da NFe: {} empresa: {}", chaveAcesso, empresaId);
        
        try {
            NFeStatusResponse response = nfeService.consultarStatus(chaveAcesso, empresaId);
            
            logger.info("Status consultado com sucesso: {} status: {}", 
                       chaveAcesso, response.getStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao consultar status da NFe {}: {}", chaveAcesso, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Consulta XML de uma NFe
     */
    @GetMapping("/xml/{chaveAcesso}")
    @Operation(summary = "Consultar XML", description = "Consulta o XML de uma NFe")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "XML consultado com sucesso"),
        @ApiResponse(responseCode = "404", description = "NFe não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeConsultaResponse> consultarXml(
            @PathVariable String chaveAcesso,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Consultando XML da NFe: {} empresa: {}", chaveAcesso, empresaId);
        
        try {
            NFeConsultaResponse response = nfeService.consultarXml(chaveAcesso, empresaId);
            
            logger.info("XML consultado com sucesso: {}", chaveAcesso);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao consultar XML da NFe {}: {}", chaveAcesso, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Consulta cadastro de contribuinte
     */
    @GetMapping("/cadastro/{cnpj}")
    @Operation(summary = "Consultar Cadastro", description = "Consulta cadastro de contribuinte")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cadastro consultado com sucesso"),
        @ApiResponse(responseCode = "400", description = "CNPJ inválido"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeConsultaResponse> consultarCadastro(
            @PathVariable String cnpj,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Consultando cadastro do CNPJ: {} empresa: {}", cnpj, empresaId);
        
        try {
            NFeConsultaResponse response = nfeService.consultarCadastro(cnpj, empresaId);
            
            logger.info("Cadastro consultado com sucesso: {}", cnpj);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao consultar cadastro do CNPJ {}: {}", cnpj, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Consulta distribuição de DFe
     */
    @GetMapping("/distribuicao/{cnpj}")
    @Operation(summary = "Consultar Distribuição", description = "Consulta distribuição de DFe")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Distribuição consultada com sucesso"),
        @ApiResponse(responseCode = "400", description = "CNPJ inválido"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeConsultaResponse> consultarDistribuicao(
            @PathVariable String cnpj,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Consultando distribuição do CNPJ: {} empresa: {}", cnpj, empresaId);
        
        try {
            NFeConsultaResponse response = nfeService.consultarDistribuicao(cnpj, empresaId);
            
            logger.info("Distribuição consultada com sucesso: {}", cnpj);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao consultar distribuição do CNPJ {}: {}", cnpj, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Cancela uma NFe
     */
    @PostMapping("/cancelar/{chaveAcesso}")
    @Operation(summary = "Cancelar NFe", description = "Cancela uma NFe")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "NFe cancelada com sucesso"),
        @ApiResponse(responseCode = "400", description = "NFe não pode ser cancelada"),
        @ApiResponse(responseCode = "404", description = "NFe não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeResponse> cancelarNFe(
            @PathVariable String chaveAcesso,
            @RequestParam String motivo,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Cancelando NFe: {} empresa: {} motivo: {}", chaveAcesso, empresaId, motivo);
        
        try {
            NFeResponse response = nfeService.cancelarNFe(chaveAcesso, motivo, empresaId);
            
            logger.info("NFe cancelada com sucesso: {}", chaveAcesso);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao cancelar NFe {}: {}", chaveAcesso, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Envia carta de correção
     */
    @PostMapping("/carta-correcao/{chaveAcesso}")
    @Operation(summary = "Carta de Correção", description = "Envia carta de correção para uma NFe")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Carta de correção enviada com sucesso"),
        @ApiResponse(responseCode = "400", description = "NFe não permite carta de correção"),
        @ApiResponse(responseCode = "404", description = "NFe não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeResponse> cartaCorrecao(
            @PathVariable String chaveAcesso,
            @RequestParam String correcao,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Enviando carta de correção para NFe: {} empresa: {}", chaveAcesso, empresaId);
        
        try {
            NFeResponse response = nfeService.cartaCorrecao(chaveAcesso, correcao, empresaId);
            
            logger.info("Carta de correção enviada com sucesso: {}", chaveAcesso);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao enviar carta de correção para NFe {}: {}", chaveAcesso, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Envia manifestação
     */
    @PostMapping("/manifestacao/{chaveAcesso}")
    @Operation(summary = "Manifestação", description = "Envia manifestação para uma NFe")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Manifestação enviada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "404", description = "NFe não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeResponse> manifestacao(
            @PathVariable String chaveAcesso,
            @RequestParam String tipo,
            @RequestParam(required = false) String justificativa,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Enviando manifestação para NFe: {} empresa: {} tipo: {}", 
                   chaveAcesso, empresaId, tipo);
        
        try {
            NFeResponse response = nfeService.manifestacao(chaveAcesso, tipo, justificativa, empresaId);
            
            logger.info("Manifestação enviada com sucesso: {}", chaveAcesso);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao enviar manifestação para NFe {}: {}", chaveAcesso, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Inutiliza numeração
     */
    @PostMapping("/inutilizar")
    @Operation(summary = "Inutilizar Numeração", description = "Inutiliza uma sequência de numeração de NFe")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Numeração inutilizada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeResponse> inutilizar(
            @RequestParam Integer serie,
            @RequestParam Integer numeroInicial,
            @RequestParam Integer numeroFinal,
            @RequestParam String justificativa,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Inutilizando numeração empresa: {} série: {} números: {}-{}", 
                   empresaId, serie, numeroInicial, numeroFinal);
        
        try {
            NFeResponse response = nfeService.inutilizar(empresaId, serie, numeroInicial, 
                                                       numeroFinal, justificativa);
            
            logger.info("Numeração inutilizada com sucesso: empresa: {} série: {}", 
                       empresaId, serie);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao inutilizar numeração da empresa {}: {}", empresaId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Valida XML
     */
    @PostMapping("/validar-xml")
    @Operation(summary = "Validar XML", description = "Valida um XML de NFe")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "XML validado com sucesso"),
        @ApiResponse(responseCode = "400", description = "XML inválido"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeConsultaResponse> validarXml(
            @RequestBody String xml,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Validando XML para empresa: {}", empresaId);
        
        try {
            NFeConsultaResponse response = nfeService.validarXml(xml, empresaId);
            
            logger.info("XML validado com sucesso para empresa: {}", empresaId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao validar XML para empresa {}: {}", empresaId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Lista NFe por empresa
     */
    @GetMapping("/listar")
    @Operation(summary = "Listar NFe", description = "Lista NFe de uma empresa")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista consultada com sucesso"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<List<NFeResponse>> listarNFe(
            @RequestHeader("X-Empresa-Id") String empresaId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        logger.info("Listando NFe da empresa: {} página: {} tamanho: {}", empresaId, page, size);
        
        try {
            List<NFeResponse> response = nfeService.listarNFe(empresaId, page, size);
            
            logger.info("Lista consultada com sucesso: {} registros", response.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao listar NFe da empresa {}: {}", empresaId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Busca NFe por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Buscar NFe por ID", description = "Busca uma NFe pelo ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "NFe encontrada"),
        @ApiResponse(responseCode = "404", description = "NFe não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeResponse> buscarPorId(
            @PathVariable UUID id,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Buscando NFe por ID: {} empresa: {}", id, empresaId);
        
        try {
            NFeResponse response = nfeService.buscarPorId(id, empresaId);
            
            logger.info("NFe encontrada: {}", id);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao buscar NFe por ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Busca NFe por chave de acesso
     */
    @GetMapping("/chave/{chaveAcesso}")
    @Operation(summary = "Buscar NFe por Chave", description = "Busca uma NFe pela chave de acesso")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "NFe encontrada"),
        @ApiResponse(responseCode = "404", description = "NFe não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<NFeResponse> buscarPorChaveAcesso(
            @PathVariable String chaveAcesso,
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Buscando NFe por chave: {} empresa: {}", chaveAcesso, empresaId);
        
        try {
            NFeResponse response = nfeService.buscarPorChaveAcesso(chaveAcesso, empresaId);
            
            logger.info("NFe encontrada: {}", chaveAcesso);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao buscar NFe por chave {}: {}", chaveAcesso, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Obtém estatísticas da empresa
     */
    @GetMapping("/estatisticas")
    @Operation(summary = "Obter Estatísticas", description = "Obtém estatísticas de NFe da empresa")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Estatísticas obtidas com sucesso"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Object> obterEstatisticas(
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Obtendo estatísticas da empresa: {}", empresaId);
        
        try {
            Object response = nfeService.obterEstatisticas(empresaId);
            
            logger.info("Estatísticas obtidas com sucesso para empresa: {}", empresaId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao obter estatísticas da empresa {}: {}", empresaId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Obtém métricas de performance
     */
    @GetMapping("/metricas")
    @Operation(summary = "Obter Métricas", description = "Obtém métricas de performance da empresa")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Métricas obtidas com sucesso"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Object> obterMetricas(
            @RequestHeader("X-Empresa-Id") String empresaId) {
        
        logger.info("Obtendo métricas da empresa: {}", empresaId);
        
        try {
            Object response = nfeService.obterMetricasPerformance(empresaId);
            
            logger.info("Métricas obtidas com sucesso para empresa: {}", empresaId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao obter métricas da empresa {}: {}", empresaId, e.getMessage(), e);
            throw e;
        }
    }
}
