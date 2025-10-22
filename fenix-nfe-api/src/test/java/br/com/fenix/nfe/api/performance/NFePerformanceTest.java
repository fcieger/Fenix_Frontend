package br.com.fenix.nfe.api.performance;

import br.com.fenix.nfe.api.dto.request.NFeRequest;
import br.com.fenix.nfe.api.service.NFeService;
import br.com.fenix.nfe.model.entity.EmpresaNFeConfig;
import br.com.fenix.nfe.model.enums.NFeAmbienteEnum;
import br.com.fenix.nfe.model.enums.NFeEstadoEnum;
import br.com.fenix.nfe.repository.EmpresaNFeConfigRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes de performance para NFe API
 * 
 * @author Fenix Team
 * @version 1.0
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("NFe API - Testes de Performance")
class NFePerformanceTest {

    @Autowired
    private NFeService nfeService;

    @Autowired
    private EmpresaNFeConfigRepository empresaConfigRepository;

    private EmpresaNFeConfig empresaConfig;

    @BeforeEach
    void setUp() {
        setupTestData();
    }

    private void setupTestData() {
        empresaConfig = new EmpresaNFeConfig();
        empresaConfig.setCnpj("11543862000187");
        empresaConfig.setNomeEmpresa("EMPRESA TESTE LTDA");
        empresaConfig.setEstado(NFeEstadoEnum.PR);
        empresaConfig.setAmbiente(NFeAmbienteEnum.HOMOLOGACAO);
        empresaConfig.setSerie(32);
        empresaConfig.setProximoNumero(1);
        empresaConfig.setCertificadoPath("/teste/certificado.pfx");
        empresaConfig.setCertificadoPassword("teste123");
        empresaConfig.setAtivo(true);
        
        empresaConfigRepository.save(empresaConfig);
    }

    @Test
    @DisplayName("Deve processar 100 NFe em menos de 30 segundos")
    void deveProcessar100NfeEmMenosDe30Segundos() throws Exception {
        // Given
        int quantidadeNFe = 100;
        List<NFeRequest> requests = createNFeRequests(quantidadeNFe);
        
        long startTime = System.currentTimeMillis();

        // When
        List<String> nfeIds = new ArrayList<>();
        for (NFeRequest request : requests) {
            try {
                String nfeId = nfeService.emitirNFe(request, "11543862000187");
                nfeIds.add(nfeId);
            } catch (Exception e) {
                // Ignorar erros para teste de performance
            }
        }

        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        // Then
        assertTrue(duration < 30000, "Processamento de 100 NFe deve levar menos de 30 segundos. Tempo: " + duration + "ms");
        assertTrue(nfeIds.size() > 0, "Pelo menos uma NFe deve ser processada");
        
        System.out.println("Processadas " + nfeIds.size() + " NFe em " + duration + "ms");
    }

    @Test
    @DisplayName("Deve processar 10 NFe concorrentes em menos de 10 segundos")
    void deveProcessar10NfeConcorrentesEmMenosDe10Segundos() throws Exception {
        // Given
        int quantidadeNFe = 10;
        List<NFeRequest> requests = createNFeRequests(quantidadeNFe);
        ExecutorService executor = Executors.newFixedThreadPool(10);
        
        long startTime = System.currentTimeMillis();

        // When
        List<CompletableFuture<String>> futures = new ArrayList<>();
        for (NFeRequest request : requests) {
            CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
                try {
                    return nfeService.emitirNFe(request, "11543862000187");
                } catch (Exception e) {
                    return null;
                }
            }, executor);
            futures.add(future);
        }

        // Aguardar todas as NFe serem processadas
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        // Then
        assertTrue(duration < 10000, "Processamento concorrente de 10 NFe deve levar menos de 10 segundos. Tempo: " + duration + "ms");
        
        long nfeProcessadas = futures.stream()
                .mapToLong(future -> future.join() != null ? 1 : 0)
                .sum();
        
        assertTrue(nfeProcessadas > 0, "Pelo menos uma NFe deve ser processada");
        
        System.out.println("Processadas " + nfeProcessadas + " NFe concorrentes em " + duration + "ms");
        
        executor.shutdown();
    }

    @Test
    @DisplayName("Deve processar 1000 consultas em menos de 15 segundos")
    void deveProcessar1000ConsultasEmMenosDe15Segundos() throws Exception {
        // Given
        int quantidadeConsultas = 1000;
        String chaveAcesso = "41140411543862000187550010000000011234567890";
        
        long startTime = System.currentTimeMillis();

        // When
        int consultasProcessadas = 0;
        for (int i = 0; i < quantidadeConsultas; i++) {
            try {
                nfeService.consultarNFe(chaveAcesso, "11543862000187");
                consultasProcessadas++;
            } catch (Exception e) {
                // Ignorar erros para teste de performance
            }
        }

        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        // Then
        assertTrue(duration < 15000, "Processamento de 1000 consultas deve levar menos de 15 segundos. Tempo: " + duration + "ms");
        assertTrue(consultasProcessadas > 0, "Pelo menos uma consulta deve ser processada");
        
        System.out.println("Processadas " + consultasProcessadas + " consultas em " + duration + "ms");
    }

    @Test
    @DisplayName("Deve processar 100 cancelamentos em menos de 20 segundos")
    void deveProcessar100CancelamentosEmMenosDe20Segundos() throws Exception {
        // Given
        int quantidadeCancelamentos = 100;
        String justificativa = "Teste de cancelamento";
        
        long startTime = System.currentTimeMillis();

        // When
        int cancelamentosProcessados = 0;
        for (int i = 0; i < quantidadeCancelamentos; i++) {
            try {
                String nfeId = "teste-nfe-id-" + i;
                nfeService.cancelarNFe(nfeId, justificativa, "11543862000187");
                cancelamentosProcessados++;
            } catch (Exception e) {
                // Ignorar erros para teste de performance
            }
        }

        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        // Then
        assertTrue(duration < 20000, "Processamento de 100 cancelamentos deve levar menos de 20 segundos. Tempo: " + duration + "ms");
        assertTrue(cancelamentosProcessados > 0, "Pelo menos um cancelamento deve ser processado");
        
        System.out.println("Processados " + cancelamentosProcessados + " cancelamentos em " + duration + "ms");
    }

    @Test
    @DisplayName("Deve processar 5000 validações em menos de 5 segundos")
    void deveProcessar5000ValidacoesEmMenosDe5Segundos() throws Exception {
        // Given
        int quantidadeValidacoes = 5000;
        List<String> cnpjs = createCnpjs(quantidadeValidacoes);
        
        long startTime = System.currentTimeMillis();

        // When
        int validacoesProcessadas = 0;
        for (String cnpj : cnpjs) {
            try {
                // Simular validação de CNPJ
                boolean isValid = cnpj.matches("\\d{14}");
                if (isValid) {
                    validacoesProcessadas++;
                }
            } catch (Exception e) {
                // Ignorar erros para teste de performance
            }
        }

        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        // Then
        assertTrue(duration < 5000, "Processamento de 5000 validações deve levar menos de 5 segundos. Tempo: " + duration + "ms");
        assertTrue(validacoesProcessadas > 0, "Pelo menos uma validação deve ser processada");
        
        System.out.println("Processadas " + validacoesProcessadas + " validações em " + duration + "ms");
    }

    @Test
    @DisplayName("Deve processar 10000 consultas de status em menos de 10 segundos")
    void deveProcessar10000ConsultasStatusEmMenosDe10Segundos() throws Exception {
        // Given
        int quantidadeConsultas = 10000;
        
        long startTime = System.currentTimeMillis();

        // When
        int consultasProcessadas = 0;
        for (int i = 0; i < quantidadeConsultas; i++) {
            try {
                String nfeId = "teste-nfe-id-" + i;
                nfeService.consultarStatusNFe(nfeId, "11543862000187");
                consultasProcessadas++;
            } catch (Exception e) {
                // Ignorar erros para teste de performance
            }
        }

        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        // Then
        assertTrue(duration < 10000, "Processamento de 10000 consultas de status deve levar menos de 10 segundos. Tempo: " + duration + "ms");
        assertTrue(consultasProcessadas > 0, "Pelo menos uma consulta deve ser processada");
        
        System.out.println("Processadas " + consultasProcessadas + " consultas de status em " + duration + "ms");
    }

    private List<NFeRequest> createNFeRequests(int quantidade) {
        List<NFeRequest> requests = new ArrayList<>();
        
        for (int i = 0; i < quantidade; i++) {
            NFeRequest request = new NFeRequest();
            request.setSerie(32);
            request.setNumero(i + 1);
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
            item.setDescricao("Produto Teste " + i);
            item.setQuantidade(1.0);
            item.setValorUnitario(100.00);
            item.setValorTotal(100.00);
            request.setItens(java.util.List.of(item));
            
            requests.add(request);
        }
        
        return requests;
    }

    private List<String> createCnpjs(int quantidade) {
        List<String> cnpjs = new ArrayList<>();
        
        for (int i = 0; i < quantidade; i++) {
            String cnpj = String.format("%014d", i);
            cnpjs.add(cnpj);
        }
        
        return cnpjs;
    }
}
