package br.com.fenix.nfe.api.contract;

import br.com.fenix.nfe.api.dto.request.NFeRequest;
import br.com.fenix.nfe.api.dto.response.NFeResponse;
import br.com.fenix.nfe.api.dto.response.NFeStatusResponse;
import br.com.fenix.nfe.api.dto.response.NFeConsultaResponse;
import br.com.fenix.nfe.api.dto.response.NFeErrorResponse;
import br.com.fenix.nfe.api.dto.request.LoginRequest;
import br.com.fenix.nfe.api.dto.response.JwtResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes de contrato para API NFe
 * 
 * @author Fenix Team
 * @version 1.0
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("NFe API - Testes de Contrato")
class NFeApiContractTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("NFeRequest deve ter estrutura válida")
    void nfeRequestDeveTerEstruturaValida() throws Exception {
        // Given
        NFeRequest request = new NFeRequest();
        request.setSerie(32);
        request.setNumero(1);
        request.setAmbiente("HOMOLOGACAO");

        // When
        String json = objectMapper.writeValueAsString(request);

        // Then
        assertNotNull(json);
        assertTrue(json.contains("serie"));
        assertTrue(json.contains("numero"));
        assertTrue(json.contains("ambiente"));
    }

    @Test
    @DisplayName("NFeResponse deve ter estrutura válida")
    void nfeResponseDeveTerEstruturaValida() throws Exception {
        // Given
        NFeResponse response = NFeResponse.builder()
                .success(true)
                .message("NFe processada com sucesso")
                .data(new Object())
                .build();

        // When
        String json = objectMapper.writeValueAsString(response);

        // Then
        assertNotNull(json);
        assertTrue(json.contains("success"));
        assertTrue(json.contains("message"));
        assertTrue(json.contains("data"));
    }

    @Test
    @DisplayName("NFeStatusResponse deve ter estrutura válida")
    void nfeStatusResponseDeveTerEstruturaValida() throws Exception {
        // Given
        NFeStatusResponse response = NFeStatusResponse.builder()
                .nfeId("teste-nfe-id")
                .status("AUTORIZADA")
                .chaveAcesso("41140411543862000187550010000000011234567890")
                .build();

        // When
        String json = objectMapper.writeValueAsString(response);

        // Then
        assertNotNull(json);
        assertTrue(json.contains("nfeId"));
        assertTrue(json.contains("status"));
        assertTrue(json.contains("chaveAcesso"));
    }

    @Test
    @DisplayName("NFeConsultaResponse deve ter estrutura válida")
    void nfeConsultaResponseDeveTerEstruturaValida() throws Exception {
        // Given
        NFeConsultaResponse response = NFeConsultaResponse.builder()
                .chaveAcesso("41140411543862000187550010000000011234567890")
                .status("AUTORIZADA")
                .numeroProtocolo("123456789012345")
                .build();

        // When
        String json = objectMapper.writeValueAsString(response);

        // Then
        assertNotNull(json);
        assertTrue(json.contains("chaveAcesso"));
        assertTrue(json.contains("status"));
        assertTrue(json.contains("numeroProtocolo"));
    }

    @Test
    @DisplayName("NFeErrorResponse deve ter estrutura válida")
    void nfeErrorResponseDeveTerEstruturaValida() throws Exception {
        // Given
        NFeErrorResponse response = NFeErrorResponse.builder()
                .errorCode("VALIDATION_ERROR")
                .message("Erro de validação")
                .category("CLIENT_ERROR")
                .build();

        // When
        String json = objectMapper.writeValueAsString(response);

        // Then
        assertNotNull(json);
        assertTrue(json.contains("errorCode"));
        assertTrue(json.contains("message"));
        assertTrue(json.contains("category"));
    }

    @Test
    @DisplayName("LoginRequest deve ter estrutura válida")
    void loginRequestDeveTerEstruturaValida() throws Exception {
        // Given
        LoginRequest request = new LoginRequest();
        request.setUsername("teste@exemplo.com");
        request.setPassword("senha123");

        // When
        String json = objectMapper.writeValueAsString(request);

        // Then
        assertNotNull(json);
        assertTrue(json.contains("username"));
        assertTrue(json.contains("password"));
    }

    @Test
    @DisplayName("JwtResponse deve ter estrutura válida")
    void jwtResponseDeveTerEstruturaValida() throws Exception {
        // Given
        JwtResponse response = JwtResponse.builder()
                .accessToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                .refreshToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .build();

        // When
        String json = objectMapper.writeValueAsString(response);

        // Then
        assertNotNull(json);
        assertTrue(json.contains("accessToken"));
        assertTrue(json.contains("refreshToken"));
        assertTrue(json.contains("tokenType"));
        assertTrue(json.contains("expiresIn"));
    }

    @Test
    @DisplayName("NFeRequest com emitente deve ter estrutura válida")
    void nfeRequestComEmitenteDeveTerEstruturaValida() throws Exception {
        // Given
        NFeRequest request = new NFeRequest();
        NFeRequest.EmitenteRequest emitente = new NFeRequest.EmitenteRequest();
        emitente.setCnpj("11543862000187");
        emitente.setNome("EMPRESA TESTE LTDA");
        emitente.setInscricaoEstadual("9110691308");
        request.setEmitente(emitente);

        // When
        String json = objectMapper.writeValueAsString(request);

        // Then
        assertNotNull(json);
        assertTrue(json.contains("emitente"));
        assertTrue(json.contains("cnpj"));
        assertTrue(json.contains("nome"));
        assertTrue(json.contains("inscricaoEstadual"));
    }

    @Test
    @DisplayName("NFeRequest com destinatário deve ter estrutura válida")
    void nfeRequestComDestinatarioDeveTerEstruturaValida() throws Exception {
        // Given
        NFeRequest request = new NFeRequest();
        NFeRequest.DestinatarioRequest destinatario = new NFeRequest.DestinatarioRequest();
        destinatario.setCnpj("11543862000187");
        destinatario.setNome("DESTINATARIO TESTE LTDA");
        destinatario.setInscricaoEstadual("9110691308");
        request.setDestinatario(destinatario);

        // When
        String json = objectMapper.writeValueAsString(request);

        // Then
        assertNotNull(json);
        assertTrue(json.contains("destinatario"));
        assertTrue(json.contains("cnpj"));
        assertTrue(json.contains("nome"));
        assertTrue(json.contains("inscricaoEstadual"));
    }

    @Test
    @DisplayName("NFeRequest com itens deve ter estrutura válida")
    void nfeRequestComItensDeveTerEstruturaValida() throws Exception {
        // Given
        NFeRequest request = new NFeRequest();
        NFeRequest.ItemRequest item = new NFeRequest.ItemRequest();
        item.setCodigo("001");
        item.setDescricao("Produto Teste");
        item.setQuantidade(1.0);
        item.setValorUnitario(100.00);
        item.setValorTotal(100.00);
        request.setItens(java.util.List.of(item));

        // When
        String json = objectMapper.writeValueAsString(request);

        // Then
        assertNotNull(json);
        assertTrue(json.contains("itens"));
        assertTrue(json.contains("codigo"));
        assertTrue(json.contains("descricao"));
        assertTrue(json.contains("quantidade"));
        assertTrue(json.contains("valorUnitario"));
        assertTrue(json.contains("valorTotal"));
    }

    @Test
    @DisplayName("NFeRequest com endereço deve ter estrutura válida")
    void nfeRequestComEnderecoDeveTerEstruturaValida() throws Exception {
        // Given
        NFeRequest request = new NFeRequest();
        NFeRequest.EnderecoRequest endereco = new NFeRequest.EnderecoRequest();
        endereco.setLogradouro("Rua Teste");
        endereco.setNumero("123");
        endereco.setBairro("Centro");
        endereco.setCidade("Curitiba");
        endereco.setUf("PR");
        endereco.setCep("80000-000");
        request.setEnderecoEmitente(endereco);

        // When
        String json = objectMapper.writeValueAsString(request);

        // Then
        assertNotNull(json);
        assertTrue(json.contains("enderecoEmitente"));
        assertTrue(json.contains("logradouro"));
        assertTrue(json.contains("numero"));
        assertTrue(json.contains("bairro"));
        assertTrue(json.contains("cidade"));
        assertTrue(json.contains("uf"));
        assertTrue(json.contains("cep"));
    }

    @Test
    @DisplayName("NFeRequest com impostos deve ter estrutura válida")
    void nfeRequestComImpostosDeveTerEstruturaValida() throws Exception {
        // Given
        NFeRequest request = new NFeRequest();
        NFeRequest.ImpostoRequest imposto = new NFeRequest.ImpostoRequest();
        imposto.setIcmsCst("102");
        imposto.setPisCst("07");
        imposto.setCofinsCst("07");
        request.setImposto(imposto);

        // When
        String json = objectMapper.writeValueAsString(request);

        // Then
        assertNotNull(json);
        assertTrue(json.contains("imposto"));
        assertTrue(json.contains("icmsCst"));
        assertTrue(json.contains("pisCst"));
        assertTrue(json.contains("cofinsCst"));
    }

    @Test
    @DisplayName("NFeRequest com responsável técnico deve ter estrutura válida")
    void nfeRequestComResponsavelTecnicoDeveTerEstruturaValida() throws Exception {
        // Given
        NFeRequest request = new NFeRequest();
        NFeRequest.ResponsavelTecnicoRequest responsavel = new NFeRequest.ResponsavelTecnicoRequest();
        responsavel.setCnpj("17642368000156");
        responsavel.setNome("Fabio Ieger");
        responsavel.setEmail("fabio@icertus.com.br");
        responsavel.setTelefone("4136536993");
        request.setResponsavelTecnico(responsavel);

        // When
        String json = objectMapper.writeValueAsString(request);

        // Then
        assertNotNull(json);
        assertTrue(json.contains("responsavelTecnico"));
        assertTrue(json.contains("cnpj"));
        assertTrue(json.contains("nome"));
        assertTrue(json.contains("email"));
        assertTrue(json.contains("telefone"));
    }
}
