package br.com.fenix.nfe.api.e2e;

import br.com.fenix.nfe.api.dto.request.NFeRequest;
import br.com.fenix.nfe.api.dto.request.LoginRequest;
import br.com.fenix.nfe.api.dto.response.JwtResponse;
import br.com.fenix.nfe.model.entity.EmpresaNFeConfig;
import br.com.fenix.nfe.model.enums.NFeAmbienteEnum;
import br.com.fenix.nfe.model.enums.NFeEstadoEnum;
import br.com.fenix.nfe.repository.EmpresaNFeConfigRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
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
 * Testes End-to-End para NFe API
 * 
 * @author Fenix Team
 * @version 1.0
 */
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("NFe API - Testes End-to-End")
class NFeE2ETest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private EmpresaNFeConfigRepository empresaConfigRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;
    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        setupTestData();
        authenticate();
    }

    private void setupTestData() {
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

    private void authenticate() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("teste@exemplo.com");
        loginRequest.setPassword("senha123");

        String response = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JwtResponse jwtResponse = objectMapper.readValue(response, JwtResponse.class);
        authToken = jwtResponse.getAccessToken();
    }

    @Test
    @DisplayName("Deve executar fluxo completo de NFe: Login -> Emitir -> Consultar -> Cancelar")
    void deveExecutarFluxoCompletoNfe() throws Exception {
        // 1. Emitir NFe
        String nfeId = emitirNFe();
        assertNotNull(nfeId);

        // 2. Consultar status da NFe
        String status = consultarStatusNFe(nfeId);
        assertNotNull(status);

        // 3. Consultar NFe por chave de acesso
        String chaveAcesso = consultarNFePorChave();
        assertNotNull(chaveAcesso);

        // 4. Obter XML da NFe
        String xml = obterXmlNfe(nfeId);
        assertNotNull(xml);

        // 5. Obter PDF da NFe
        byte[] pdf = obterPdfNfe(nfeId);
        assertNotNull(pdf);

        // 6. Cancelar NFe
        boolean cancelado = cancelarNfe(nfeId);
        assertTrue(cancelado);

        // 7. Verificar status após cancelamento
        String statusFinal = consultarStatusNFe(nfeId);
        assertEquals("CANCELADA", statusFinal);
    }

    @Test
    @DisplayName("Deve executar fluxo de múltiplas NFe")
    void deveExecutarFluxoMultiplasNfe() throws Exception {
        // Emitir 5 NFe
        List<String> nfeIds = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            String nfeId = emitirNFe();
            nfeIds.add(nfeId);
        }

        // Verificar se todas foram emitidas
        assertEquals(5, nfeIds.size());

        // Consultar status de todas
        for (String nfeId : nfeIds) {
            String status = consultarStatusNFe(nfeId);
            assertNotNull(status);
        }

        // Listar todas as NFe da empresa
        String listaNfe = listarNfePorEmpresa();
        assertNotNull(listaNfe);
        assertTrue(listaNfe.contains("nfeId"));
    }

    @Test
    @DisplayName("Deve executar fluxo de consulta de NFe por diferentes critérios")
    void deveExecutarFluxoConsultaNfePorDiferentesCriterios() throws Exception {
        // Emitir NFe
        String nfeId = emitirNFe();

        // Consultar por ID
        String statusPorId = consultarStatusNFe(nfeId);
        assertNotNull(statusPorId);

        // Consultar por chave de acesso
        String chaveAcesso = consultarNFePorChave();
        assertNotNull(chaveAcesso);

        // Consultar por número
        String statusPorNumero = consultarNfePorNumero(1);
        assertNotNull(statusPorNumero);

        // Consultar por série
        String statusPorSerie = consultarNfePorSerie(32);
        assertNotNull(statusPorSerie);
    }

    @Test
    @DisplayName("Deve executar fluxo de geração de documentos")
    void deveExecutarFluxoGeracaoDocumentos() throws Exception {
        // Emitir NFe
        String nfeId = emitirNFe();

        // Gerar XML
        String xml = obterXmlNfe(nfeId);
        assertNotNull(xml);
        assertTrue(xml.contains("<?xml"));

        // Gerar PDF
        byte[] pdf = obterPdfNfe(nfeId);
        assertNotNull(pdf);
        assertTrue(pdf.length > 0);

        // Gerar DANFE
        byte[] danfe = obterDanfeNfe(nfeId);
        assertNotNull(danfe);
        assertTrue(danfe.length > 0);
    }

    @Test
    @DisplayName("Deve executar fluxo de tratamento de erros")
    void deveExecutarFluxoTratamentoErros() throws Exception {
        // Tentar emitir NFe com dados inválidos
        mockMvc.perform(post("/api/nfe/emitir")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createInvalidNFeRequest())
                .header("Authorization", "Bearer " + authToken)
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").exists());

        // Tentar consultar NFe inexistente
        mockMvc.perform(get("/api/nfe/inexistente/status")
                .header("Authorization", "Bearer " + authToken)
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isNotFound());

        // Tentar cancelar NFe inexistente
        mockMvc.perform(post("/api/nfe/inexistente/cancelar")
                .contentType(MediaType.APPLICATION_JSON)
                .content("Justificativa de teste")
                .header("Authorization", "Bearer " + authToken)
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isNotFound());
    }

    private String emitirNFe() throws Exception {
        NFeRequest request = createValidNFeRequest();

        String response = mockMvc.perform(post("/api/nfe/emitir")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", "Bearer " + authToken)
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get("data").get("nfeId").asText();
    }

    private String consultarStatusNFe(String nfeId) throws Exception {
        String response = mockMvc.perform(get("/api/nfe/{nfeId}/status", nfeId)
                .header("Authorization", "Bearer " + authToken)
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get("data").get("status").asText();
    }

    private String consultarNFePorChave() throws Exception {
        String response = mockMvc.perform(post("/api/nfe/consulta")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"chaveAcesso\":\"41140411543862000187550010000000011234567890\"}")
                .header("Authorization", "Bearer " + authToken)
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get("data").get("chaveAcesso").asText();
    }

    private String consultarNfePorNumero(int numero) throws Exception {
        String response = mockMvc.perform(get("/api/nfe/consulta/numero/{numero}", numero)
                .header("Authorization", "Bearer " + authToken)
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get("data").get("status").asText();
    }

    private String consultarNfePorSerie(int serie) throws Exception {
        String response = mockMvc.perform(get("/api/nfe/consulta/serie/{serie}", serie)
                .header("Authorization", "Bearer " + authToken)
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get("data").get("status").asText();
    }

    private String obterXmlNfe(String nfeId) throws Exception {
        return mockMvc.perform(get("/api/nfe/{nfeId}/xml", nfeId)
                .header("Authorization", "Bearer " + authToken)
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_XML))
                .andReturn()
                .getResponse()
                .getContentAsString();
    }

    private byte[] obterPdfNfe(String nfeId) throws Exception {
        return mockMvc.perform(get("/api/nfe/{nfeId}/pdf", nfeId)
                .header("Authorization", "Bearer " + authToken)
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andReturn()
                .getResponse()
                .getContentAsByteArray();
    }

    private byte[] obterDanfeNfe(String nfeId) throws Exception {
        return mockMvc.perform(get("/api/nfe/{nfeId}/danfe", nfeId)
                .header("Authorization", "Bearer " + authToken)
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andReturn()
                .getResponse()
                .getContentAsByteArray();
    }

    private boolean cancelarNfe(String nfeId) throws Exception {
        mockMvc.perform(post("/api/nfe/{nfeId}/cancelar", nfeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("Justificativa de teste")
                .header("Authorization", "Bearer " + authToken)
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        return true;
    }

    private String listarNfePorEmpresa() throws Exception {
        return mockMvc.perform(get("/api/nfe")
                .param("page", "0")
                .param("size", "10")
                .header("Authorization", "Bearer " + authToken)
                .header("X-Company-CNPJ", "11543862000187"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
    }

    private NFeRequest createValidNFeRequest() {
        NFeRequest request = new NFeRequest();
        request.setSerie(32);
        request.setNumero(1);
        request.setAmbiente("HOMOLOGACAO");

        // Emitente
        NFeRequest.EmitenteRequest emitente = new NFeRequest.EmitenteRequest();
        emitente.setCnpj("11543862000187");
        emitente.setNome("EMPRESA TESTE LTDA");
        emitente.setInscricaoEstadual("9110691308");
        request.setEmitente(emitente);

        // Destinatário
        NFeRequest.DestinatarioRequest destinatario = new NFeRequest.DestinatarioRequest();
        destinatario.setCnpj("11543862000187");
        destinatario.setNome("DESTINATARIO TESTE LTDA");
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

        return request;
    }

    private String createInvalidNFeRequest() {
        return "{\"serie\":32,\"numero\":1,\"ambiente\":\"HOMOLOGACAO\",\"emitente\":{\"cnpj\":\"12345678901234\",\"nome\":\"\",\"inscricaoEstadual\":\"\"},\"destinatario\":{\"cnpj\":\"\",\"nome\":\"\",\"inscricaoEstadual\":\"\"},\"itens\":[{\"codigo\":\"\",\"descricao\":\"\",\"quantidade\":-1.0,\"valorUnitario\":-100.00,\"valorTotal\":-100.00}]}";
    }
}
