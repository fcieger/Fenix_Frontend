package br.com.fenix.nfe.api.controller;

import br.com.fenix.nfe.api.dto.request.NFeRequest;
import br.com.fenix.nfe.api.dto.request.NFeConsultaRequest;
import br.com.fenix.nfe.model.entity.EmpresaNFeConfig;
import br.com.fenix.nfe.model.enums.NFeAmbienteEnum;
import br.com.fenix.nfe.model.enums.NFeEstadoEnum;
import br.com.fenix.nfe.repository.EmpresaNFeConfigRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração para NFeController
 * 
 * @author Fenix Team
 * @version 1.0
 */
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class NFeControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private EmpresaNFeConfigRepository empresaConfigRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        setupTestData();
    }

    private void setupTestData() {
        // Criar configuração de empresa para testes
        EmpresaNFeConfig config = new EmpresaNFeConfig();
        config.setCnpj("11543862000187");
        config.setNomeEmpresa("EMPRESA TESTE LTDA");
        config.setEstado(NFeEstadoEnum.PR);
        config.setAmbiente(NFeAmbienteEnum.HOMOLOGACAO);
        config.setSerie(32);
        config.setProximoNumero(1);
        config.setCertificadoPath("/teste/certificado.pfx");
        config.setCertificadoPassword("teste123");
        config.setAtivo(true);
        
        empresaConfigRepository.save(config);
    }

    @Test
    @DisplayName("Deve emitir NFe com sucesso")
    void deveEmitirNfeComSucesso() throws Exception {
        // Given
        NFeRequest request = createValidNFeRequest();

        // When & Then
        mockMvc.perform(post("/api/nfe/emitir")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.nfeId").exists())
                .andExpect(jsonPath("$.data.status").value("PENDENTE"));
    }

    @Test
    @DisplayName("Deve retornar erro para empresa não configurada")
    void deveRetornarErroParaEmpresaNaoConfigurada() throws Exception {
        // Given
        NFeRequest request = createValidNFeRequest();

        // When & Then
        mockMvc.perform(post("/api/nfe/emitir")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("X-Company-CNPJ", "99999999000199"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("Deve retornar erro para dados inválidos")
    void deveRetornarErroParaDadosInvalidos() throws Exception {
        // Given
        NFeRequest request = createInvalidNFeRequest();

        // When & Then
        mockMvc.perform(post("/api/nfe/emitir")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("Deve consultar status da NFe")
    void deveConsultarStatusNfe() throws Exception {
        // Given
        String nfeId = "teste-nfe-id";

        // When & Then
        mockMvc.perform(get("/api/nfe/{nfeId}/status", nfeId)
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.nfeId").value(nfeId));
    }

    @Test
    @DisplayName("Deve consultar NFe por chave de acesso")
    void deveConsultarNfePorChaveAcesso() throws Exception {
        // Given
        NFeConsultaRequest request = new NFeConsultaRequest();
        request.setChaveAcesso("41140411543862000187550010000000011234567890");

        // When & Then
        mockMvc.perform(post("/api/nfe/consulta")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Deve cancelar NFe")
    void deveCancelarNfe() throws Exception {
        // Given
        String nfeId = "teste-nfe-id";
        String justificativa = "Teste de cancelamento";

        // When & Then
        mockMvc.perform(post("/api/nfe/{nfeId}/cancelar", nfeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(justificativa)
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Deve retornar XML da NFe")
    void deveRetornarXmlNfe() throws Exception {
        // Given
        String nfeId = "teste-nfe-id";

        // When & Then
        mockMvc.perform(get("/api/nfe/{nfeId}/xml", nfeId)
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_XML));
    }

    @Test
    @DisplayName("Deve retornar PDF da NFe")
    void deveRetornarPdfNfe() throws Exception {
        // Given
        String nfeId = "teste-nfe-id";

        // When & Then
        mockMvc.perform(get("/api/nfe/{nfeId}/pdf", nfeId)
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    @DisplayName("Deve listar NFe por empresa")
    void deveListarNfePorEmpresa() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/nfe")
                .param("page", "0")
                .param("size", "10")
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    private NFeRequest createValidNFeRequest() {
        NFeRequest request = new NFeRequest();
        
        // Emitente
        NFeRequest.EmitenteRequest emitente = new NFeRequest.EmitenteRequest();
        emitente.setCnpj("11543862000187");
        emitente.setNome("EMPRESA TESTE LTDA");
        emitente.setInscricaoEstadual("9110691308");
        request.setEmitente(emitente);
        
        // Destinatário
        NFeRequest.DestinatarioRequest destinatario = new NFeRequest.DestinatarioRequest();
        destinatario.setCnpj("11543862000187");
        destinatario.setNome("NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL");
        destinatario.setInscricaoEstadual("9110691308");
        request.setDestinatario(destinatario);
        
        // Item
        NFeRequest.ItemRequest item = new NFeRequest.ItemRequest();
        item.setCodigo("001");
        item.setDescricao("Produto Teste");
        item.setQuantidade(1.0);
        item.setValorUnitario(100.00);
        item.setValorTotal(100.00);
        request.setItens(java.util.List.of(item));
        
        // Configurações
        request.setSerie(32);
        request.setNumero(1);
        request.setAmbiente("HOMOLOGACAO");
        
        return request;
    }

    private NFeRequest createInvalidNFeRequest() {
        NFeRequest request = new NFeRequest();
        
        // Emitente inválido (CNPJ inválido)
        NFeRequest.EmitenteRequest emitente = new NFeRequest.EmitenteRequest();
        emitente.setCnpj("12345678901234"); // CNPJ inválido
        emitente.setNome(""); // Nome vazio
        request.setEmitente(emitente);
        
        // Destinatário inválido
        NFeRequest.DestinatarioRequest destinatario = new NFeRequest.DestinatarioRequest();
        destinatario.setCnpj(""); // CNPJ vazio
        destinatario.setNome(""); // Nome vazio
        request.setDestinatario(destinatario);
        
        // Item inválido
        NFeRequest.ItemRequest item = new NFeRequest.ItemRequest();
        item.setCodigo(""); // Código vazio
        item.setDescricao(""); // Descrição vazia
        item.setQuantidade(-1.0); // Quantidade negativa
        item.setValorUnitario(-100.00); // Valor negativo
        request.setItens(java.util.List.of(item));
        
        return request;
    }
}
