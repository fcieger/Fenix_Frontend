package br.com.fenix.nfe.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes unitários para NFeUtil
 * 
 * @author Fenix Team
 * @version 1.0
 */
@DisplayName("NFeUtil - Testes Unitários")
class NFeUtilTest {

    @Nested
    @DisplayName("Geração de Chave de Acesso")
    class GeracaoChaveAcesso {

        @Test
        @DisplayName("Deve gerar chave de acesso válida")
        void deveGerarChaveAcessoValida() {
            // Given
            String cnpj = "11543862000187";
            String uf = "41";
            String ano = "2024";
            String mes = "01";
            String cnpjFormatado = "11543862000187";
            String modelo = "55";
            String serie = "001";
            String numero = "000000001";
            String tipoEmissao = "1";
            String codigoNumerico = "12345678";

            // When
            String chaveAcesso = NFeUtil.gerarChaveAcesso(
                cnpj, uf, ano, mes, cnpjFormatado, modelo, serie, numero, tipoEmissao, codigoNumerico
            );

            // Then
            assertNotNull(chaveAcesso);
            assertEquals(44, chaveAcesso.length());
            assertTrue(chaveAcesso.matches("\\d{44}"));
        }

        @Test
        @DisplayName("Deve lançar exceção para CNPJ inválido")
        void deveLancarExcecaoParaCnpjInvalido() {
            // Given
            String cnpjInvalido = "12345678901234";

            // When & Then
            assertThrows(IllegalArgumentException.class, () -> {
                NFeUtil.gerarChaveAcesso(
                    cnpjInvalido, "41", "2024", "01", "11543862000187", 
                    "55", "001", "000000001", "1", "12345678"
                );
            });
        }

        @Test
        @DisplayName("Deve lançar exceção para UF inválida")
        void deveLancarExcecaoParaUfInvalida() {
            // Given
            String ufInvalida = "99";

            // When & Then
            assertThrows(IllegalArgumentException.class, () -> {
                NFeUtil.gerarChaveAcesso(
                    "11543862000187", ufInvalida, "2024", "01", "11543862000187", 
                    "55", "001", "000000001", "1", "12345678"
                );
            });
        }
    }

    @Nested
    @DisplayName("Validação de CNPJ")
    class ValidacaoCnpj {

        @ParameterizedTest
        @ValueSource(strings = {
            "11543862000187",
            "08667257000103",
            "17642368000156",
            "11222333000181"
        })
        @DisplayName("Deve validar CNPJ válido")
        void deveValidarCnpjValido(String cnpj) {
            // When
            boolean resultado = NFeUtil.isValidCNPJ(cnpj);

            // Then
            assertTrue(resultado, "CNPJ " + cnpj + " deveria ser válido");
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "12345678901234",
            "00000000000000",
            "11111111111111",
            "1234567890123",
            "123456789012345",
            "abc12345678901"
        })
        @DisplayName("Deve rejeitar CNPJ inválido")
        void deveRejeitarCnpjInvalido(String cnpj) {
            // When
            boolean resultado = NFeUtil.isValidCNPJ(cnpj);

            // Then
            assertFalse(resultado, "CNPJ " + cnpj + " deveria ser inválido");
        }

        @Test
        @DisplayName("Deve rejeitar CNPJ nulo ou vazio")
        void deveRejeitarCnpjNuloOuVazio() {
            // When & Then
            assertFalse(NFeUtil.isValidCNPJ(null));
            assertFalse(NFeUtil.isValidCNPJ(""));
            assertFalse(NFeUtil.isValidCNPJ("   "));
        }
    }

    @Nested
    @DisplayName("Validação de CPF")
    class ValidacaoCpf {

        @ParameterizedTest
        @ValueSource(strings = {
            "12345678901",
            "98765432100",
            "11144477735"
        })
        @DisplayName("Deve validar CPF válido")
        void deveValidarCpfValido(String cpf) {
            // When
            boolean resultado = NFeUtil.isValidCPF(cpf);

            // Then
            assertTrue(resultado, "CPF " + cpf + " deveria ser válido");
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "1234567890",
            "123456789012",
            "00000000000",
            "11111111111",
            "abc12345678"
        })
        @DisplayName("Deve rejeitar CPF inválido")
        void deveRejeitarCpfInvalido(String cpf) {
            // When
            boolean resultado = NFeUtil.isValidCPF(cpf);

            // Then
            assertFalse(resultado, "CPF " + cpf + " deveria ser inválido");
        }
    }

    @Nested
    @DisplayName("Formatação de Documentos")
    class FormatacaoDocumentos {

        @ParameterizedTest
        @CsvSource({
            "11543862000187, 11.543.862/0001-87",
            "08667257000103, 08.667.257/0001-03",
            "17642368000156, 17.642.368/0001-56"
        })
        @DisplayName("Deve formatar CNPJ corretamente")
        void deveFormatarCnpjCorretamente(String cnpj, String esperado) {
            // When
            String resultado = NFeUtil.formatCNPJ(cnpj);

            // Then
            assertEquals(esperado, resultado);
        }

        @ParameterizedTest
        @CsvSource({
            "12345678901, 123.456.789-01",
            "98765432100, 987.654.321-00"
        })
        @DisplayName("Deve formatar CPF corretamente")
        void deveFormatarCpfCorretamente(String cpf, String esperado) {
            // When
            String resultado = NFeUtil.formatCPF(cpf);

            // Then
            assertEquals(esperado, resultado);
        }

        @Test
        @DisplayName("Deve retornar nulo para entrada nula")
        void deveRetornarNuloParaEntradaNula() {
            // When & Then
            assertNull(NFeUtil.formatCNPJ(null));
            assertNull(NFeUtil.formatCPF(null));
        }
    }

    @Nested
    @DisplayName("Cálculo de Dígito Verificador")
    class CalculoDigitoVerificador {

        @Test
        @DisplayName("Deve calcular dígito verificador CNPJ corretamente")
        void deveCalcularDigitoVerificadorCnpjCorretamente() {
            // Given
            String cnpj = "11543862000187";

            // When
            int digito1 = NFeUtil.calcularDigitoVerificadorCNPJ(cnpj.substring(0, 12), 5);
            int digito2 = NFeUtil.calcularDigitoVerificadorCNPJ(cnpj.substring(0, 13), 6);

            // Then
            assertEquals(8, digito1);
            assertEquals(7, digito2);
        }

        @Test
        @DisplayName("Deve calcular dígito verificador CPF corretamente")
        void deveCalcularDigitoVerificadorCpfCorretamente() {
            // Given
            String cpf = "12345678901";

            // When
            int digito1 = NFeUtil.calcularDigitoVerificadorCPF(cpf.substring(0, 9), 10);
            int digito2 = NFeUtil.calcularDigitoVerificadorCPF(cpf.substring(0, 10), 11);

            // Then
            assertEquals(0, digito1);
            assertEquals(1, digito2);
        }
    }

    @Nested
    @DisplayName("Validação de Chave de Acesso")
    class ValidacaoChaveAcesso {

        @Test
        @DisplayName("Deve validar chave de acesso válida")
        void deveValidarChaveAcessoValida() {
            // Given
            String chaveValida = "41140411543862000187550010000000011234567890";

            // When
            boolean resultado = NFeUtil.isValidNFeKey(chaveValida);

            // Then
            assertTrue(resultado);
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "4114041154386200018755001000000001123456789",  // Muito curta
            "411404115438620001875500100000000112345678901", // Muito longa
            "abc1234567890123456789012345678901234567890",   // Contém letras
            "00000000000000000000000000000000000000000000"   // Todos zeros
        })
        @DisplayName("Deve rejeitar chave de acesso inválida")
        void deveRejeitarChaveAcessoInvalida(String chave) {
            // When
            boolean resultado = NFeUtil.isValidNFeKey(chave);

            // Then
            assertFalse(resultado, "Chave " + chave + " deveria ser inválida");
        }
    }
}
