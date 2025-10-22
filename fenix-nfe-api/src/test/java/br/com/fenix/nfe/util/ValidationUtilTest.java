package br.com.fenix.nfe.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes unitários para ValidationUtil
 * 
 * @author Fenix Team
 * @version 1.0
 */
@DisplayName("ValidationUtil - Testes Unitários")
class ValidationUtilTest {

    @Nested
    @DisplayName("Validação de CNPJ")
    class ValidacaoCnpj {

        @ParameterizedTest
        @ValueSource(strings = {
            "11543862000187",
            "08667257000103",
            "17642368000156",
            "11222333000181",
            "11.543.862/0001-87",
            "08.667.257/0001-03"
        })
        @DisplayName("Deve validar CNPJ válido")
        void deveValidarCnpjValido(String cnpj) {
            // When
            boolean resultado = ValidationUtil.isValidCNPJ(cnpj);

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
            boolean resultado = ValidationUtil.isValidCNPJ(cnpj);

            // Then
            assertFalse(resultado, "CNPJ " + cnpj + " deveria ser inválido");
        }

        @Test
        @DisplayName("Deve rejeitar CNPJ nulo ou vazio")
        void deveRejeitarCnpjNuloOuVazio() {
            // When & Then
            assertFalse(ValidationUtil.isValidCNPJ(null));
            assertFalse(ValidationUtil.isValidCNPJ(""));
            assertFalse(ValidationUtil.isValidCNPJ("   "));
        }
    }

    @Nested
    @DisplayName("Validação de CPF")
    class ValidacaoCpf {

        @ParameterizedTest
        @ValueSource(strings = {
            "12345678901",
            "98765432100",
            "11144477735",
            "123.456.789-01",
            "987.654.321-00"
        })
        @DisplayName("Deve validar CPF válido")
        void deveValidarCpfValido(String cpf) {
            // When
            boolean resultado = ValidationUtil.isValidCPF(cpf);

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
            boolean resultado = ValidationUtil.isValidCPF(cpf);

            // Then
            assertFalse(resultado, "CPF " + cpf + " deveria ser inválido");
        }
    }

    @Nested
    @DisplayName("Validação de Email")
    class ValidacaoEmail {

        @ParameterizedTest
        @ValueSource(strings = {
            "teste@exemplo.com",
            "usuario@dominio.com.br",
            "email+tag@exemplo.org",
            "user.name@domain.co.uk"
        })
        @DisplayName("Deve validar email válido")
        void deveValidarEmailValido(String email) {
            // When
            boolean resultado = ValidationUtil.isValidEmail(email);

            // Then
            assertTrue(resultado, "Email " + email + " deveria ser válido");
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "email-invalido",
            "@dominio.com",
            "usuario@",
            "usuario@dominio",
            "usuario..nome@dominio.com",
            ""
        })
        @DisplayName("Deve rejeitar email inválido")
        void deveRejeitarEmailInvalido(String email) {
            // When
            boolean resultado = ValidationUtil.isValidEmail(email);

            // Then
            assertFalse(resultado, "Email " + email + " deveria ser inválido");
        }
    }

    @Nested
    @DisplayName("Validação de Telefone")
    class ValidacaoTelefone {

        @ParameterizedTest
        @ValueSource(strings = {
            "(11) 99999-9999",
            "(41) 3333-4444",
            "11999999999",
            "4133334444",
            "(11) 9 9999-9999"
        })
        @DisplayName("Deve validar telefone válido")
        void deveValidarTelefoneValido(String telefone) {
            // When
            boolean resultado = ValidationUtil.isValidPhone(telefone);

            // Then
            assertTrue(resultado, "Telefone " + telefone + " deveria ser válido");
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "123",
            "123456789",
            "abc1234567",
            "(99) 99999-99999"
        })
        @DisplayName("Deve rejeitar telefone inválido")
        void deveRejeitarTelefoneInvalido(String telefone) {
            // When
            boolean resultado = ValidationUtil.isValidPhone(telefone);

            // Then
            assertFalse(resultado, "Telefone " + telefone + " deveria ser inválido");
        }
    }

    @Nested
    @DisplayName("Validação de CEP")
    class ValidacaoCep {

        @ParameterizedTest
        @ValueSource(strings = {
            "12345-678",
            "12345678",
            "00000-000"
        })
        @DisplayName("Deve validar CEP válido")
        void deveValidarCepValido(String cep) {
            // When
            boolean resultado = ValidationUtil.isValidCEP(cep);

            // Then
            assertTrue(resultado, "CEP " + cep + " deveria ser válido");
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "1234-567",
            "1234567",
            "123456789",
            "abc12345"
        })
        @DisplayName("Deve rejeitar CEP inválido")
        void deveRejeitarCepInvalido(String cep) {
            // When
            boolean resultado = ValidationUtil.isValidCEP(cep);

            // Then
            assertFalse(resultado, "CEP " + cep + " deveria ser inválido");
        }
    }

    @Nested
    @DisplayName("Validação de Inscrição Estadual")
    class ValidacaoIe {

        @ParameterizedTest
        @ValueSource(strings = {
            "123456789",
            "12345678",
            "12345678901234",
            "12.345.678-9"
        })
        @DisplayName("Deve validar IE válida")
        void deveValidarIeValida(String ie) {
            // When
            boolean resultado = ValidationUtil.isValidIE(ie);

            // Then
            assertTrue(resultado, "IE " + ie + " deveria ser válida");
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "1234567",
            "123456789012345",
            "abc12345678"
        })
        @DisplayName("Deve rejeitar IE inválida")
        void deveRejeitarIeInvalida(String ie) {
            // When
            boolean resultado = ValidationUtil.isValidIE(ie);

            // Then
            assertFalse(resultado, "IE " + ie + " deveria ser inválida");
        }
    }

    @Nested
    @DisplayName("Validação de Chave de Acesso NFe")
    class ValidacaoChaveNfe {

        @Test
        @DisplayName("Deve validar chave de acesso válida")
        void deveValidarChaveAcessoValida() {
            // Given
            String chaveValida = "41140411543862000187550010000000011234567890";

            // When
            boolean resultado = ValidationUtil.isValidNFeKey(chaveValida);

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
            boolean resultado = ValidationUtil.isValidNFeKey(chave);

            // Then
            assertFalse(resultado, "Chave " + chave + " deveria ser inválida");
        }
    }

    @Nested
    @DisplayName("Validação de Strings")
    class ValidacaoStrings {

        @Test
        @DisplayName("Deve validar string não vazia")
        void deveValidarStringNaoVazia() {
            // When & Then
            assertTrue(ValidationUtil.isNotEmpty("texto"));
            assertTrue(ValidationUtil.isNotEmpty(" a "));
            assertFalse(ValidationUtil.isNotEmpty(""));
            assertFalse(ValidationUtil.isNotEmpty("   "));
            assertFalse(ValidationUtil.isNotEmpty(null));
        }

        @Test
        @DisplayName("Deve validar string vazia")
        void deveValidarStringVazia() {
            // When & Then
            assertFalse(ValidationUtil.isEmpty("texto"));
            assertFalse(ValidationUtil.isEmpty(" a "));
            assertTrue(ValidationUtil.isEmpty(""));
            assertTrue(ValidationUtil.isEmpty("   "));
            assertTrue(ValidationUtil.isEmpty(null));
        }

        @Test
        @DisplayName("Deve validar string numérica")
        void deveValidarStringNumerica() {
            // When & Then
            assertTrue(ValidationUtil.isNumeric("123"));
            assertTrue(ValidationUtil.isNumeric("0"));
            assertFalse(ValidationUtil.isNumeric("abc"));
            assertFalse(ValidationUtil.isNumeric("12a"));
            assertFalse(ValidationUtil.isNumeric(""));
            assertFalse(ValidationUtil.isNumeric(null));
        }

        @Test
        @DisplayName("Deve validar string alfabética")
        void deveValidarStringAlfabetica() {
            // When & Then
            assertTrue(ValidationUtil.isAlpha("abc"));
            assertTrue(ValidationUtil.isAlpha("ABC"));
            assertTrue(ValidationUtil.isAlpha("a b c"));
            assertFalse(ValidationUtil.isAlpha("abc123"));
            assertFalse(ValidationUtil.isAlpha(""));
            assertFalse(ValidationUtil.isAlpha(null));
        }

        @Test
        @DisplayName("Deve validar string alfanumérica")
        void deveValidarStringAlfanumerica() {
            // When & Then
            assertTrue(ValidationUtil.isAlphaNumeric("abc123"));
            assertTrue(ValidationUtil.isAlphaNumeric("ABC 123"));
            assertFalse(ValidationUtil.isAlphaNumeric("abc@123"));
            assertFalse(ValidationUtil.isAlphaNumeric(""));
            assertFalse(ValidationUtil.isAlphaNumeric(null));
        }
    }

    @Nested
    @DisplayName("Validação de Números")
    class ValidacaoNumeros {

        @Test
        @DisplayName("Deve validar número positivo")
        void deveValidarNumeroPositivo() {
            // When & Then
            assertTrue(ValidationUtil.isPositive(1));
            assertTrue(ValidationUtil.isPositive(1.5));
            assertTrue(ValidationUtil.isPositive(0.1));
            assertFalse(ValidationUtil.isPositive(0));
            assertFalse(ValidationUtil.isPositive(-1));
            assertFalse(ValidationUtil.isPositive(null));
        }

        @Test
        @DisplayName("Deve validar número não negativo")
        void deveValidarNumeroNaoNegativo() {
            // When & Then
            assertTrue(ValidationUtil.isNonNegative(0));
            assertTrue(ValidationUtil.isNonNegative(1));
            assertTrue(ValidationUtil.isNonNegative(1.5));
            assertFalse(ValidationUtil.isNonNegative(-1));
            assertFalse(ValidationUtil.isNonNegative(-0.1));
            assertFalse(ValidationUtil.isNonNegative(null));
        }

        @Test
        @DisplayName("Deve validar número em range")
        void deveValidarNumeroEmRange() {
            // When & Then
            assertTrue(ValidationUtil.isInRange(5, 1, 10));
            assertTrue(ValidationUtil.isInRange(1, 1, 10));
            assertTrue(ValidationUtil.isInRange(10, 1, 10));
            assertFalse(ValidationUtil.isInRange(0, 1, 10));
            assertFalse(ValidationUtil.isInRange(11, 1, 10));
            assertFalse(ValidationUtil.isInRange(null, 1, 10));
        }
    }

    @Nested
    @DisplayName("Validação de Tamanho de String")
    class ValidacaoTamanhoString {

        @Test
        @DisplayName("Deve validar tamanho mínimo")
        void deveValidarTamanhoMinimo() {
            // When & Then
            assertTrue(ValidationUtil.hasMinLength("abc", 3));
            assertTrue(ValidationUtil.hasMinLength("abcd", 3));
            assertFalse(ValidationUtil.hasMinLength("ab", 3));
            assertFalse(ValidationUtil.hasMinLength("", 3));
            assertFalse(ValidationUtil.hasMinLength(null, 3));
        }

        @Test
        @DisplayName("Deve validar tamanho máximo")
        void deveValidarTamanhoMaximo() {
            // When & Then
            assertTrue(ValidationUtil.hasMaxLength("abc", 5));
            assertTrue(ValidationUtil.hasMaxLength("abcde", 5));
            assertFalse(ValidationUtil.hasMaxLength("abcdef", 5));
            assertTrue(ValidationUtil.hasMaxLength(null, 5));
        }

        @Test
        @DisplayName("Deve validar tamanho exato")
        void deveValidarTamanhoExato() {
            // When & Then
            assertTrue(ValidationUtil.hasExactLength("abc", 3));
            assertFalse(ValidationUtil.hasExactLength("ab", 3));
            assertFalse(ValidationUtil.hasExactLength("abcd", 3));
            assertFalse(ValidationUtil.hasExactLength("", 3));
            assertFalse(ValidationUtil.hasExactLength(null, 3));
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
            String resultado = ValidationUtil.formatCNPJ(cnpj);

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
            String resultado = ValidationUtil.formatCPF(cpf);

            // Then
            assertEquals(esperado, resultado);
        }

        @ParameterizedTest
        @CsvSource({
            "12345678, 12345-678",
            "87654321, 87654-321"
        })
        @DisplayName("Deve formatar CEP corretamente")
        void deveFormatarCepCorretamente(String cep, String esperado) {
            // When
            String resultado = ValidationUtil.formatCEP(cep);

            // Then
            assertEquals(esperado, resultado);
        }

        @Test
        @DisplayName("Deve retornar nulo para entrada nula")
        void deveRetornarNuloParaEntradaNula() {
            // When & Then
            assertNull(ValidationUtil.formatCNPJ(null));
            assertNull(ValidationUtil.formatCPF(null));
            assertNull(ValidationUtil.formatCEP(null));
        }
    }
}
