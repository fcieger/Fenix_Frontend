package br.com.fenix.nfe.util;

import lombok.extern.slf4j.Slf4j;

import java.util.regex.Pattern;

/**
 * Utilitários para validação de dados
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Slf4j
public class ValidationUtil {

    // Padrões de regex
    private static final Pattern CNPJ_PATTERN = Pattern.compile("\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}");
    private static final Pattern CPF_PATTERN = Pattern.compile("\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}$");
    private static final Pattern CEP_PATTERN = Pattern.compile("\\d{5}-?\\d{3}");
    private static final Pattern IE_PATTERN = Pattern.compile("\\d{2,3}\\.?\\d{3}\\.?\\d{3}\\.?\\d{3}");
    private static final Pattern NFE_KEY_PATTERN = Pattern.compile("\\d{44}");

    /**
     * Valida CNPJ
     */
    public static boolean isValidCNPJ(String cnpj) {
        if (cnpj == null || cnpj.trim().isEmpty()) {
            return false;
        }

        // Remove formatação
        String cleanCnpj = cnpj.replaceAll("[^0-9]", "");
        
        // Verifica se tem 14 dígitos
        if (cleanCnpj.length() != 14) {
            return false;
        }

        // Verifica se todos os dígitos são iguais
        if (cleanCnpj.matches("(\\d)\\1{13}")) {
            return false;
        }

        // Calcula primeiro dígito verificador
        int sum = 0;
        int weight = 5;
        for (int i = 0; i < 12; i++) {
            sum += Character.getNumericValue(cleanCnpj.charAt(i)) * weight;
            weight = (weight == 2) ? 9 : weight - 1;
        }
        int firstDigit = (sum % 11 < 2) ? 0 : 11 - (sum % 11);

        // Calcula segundo dígito verificador
        sum = 0;
        weight = 6;
        for (int i = 0; i < 13; i++) {
            sum += Character.getNumericValue(cleanCnpj.charAt(i)) * weight;
            weight = (weight == 2) ? 9 : weight - 1;
        }
        int secondDigit = (sum % 11 < 2) ? 0 : 11 - (sum % 11);

        // Verifica se os dígitos verificadores estão corretos
        return Character.getNumericValue(cleanCnpj.charAt(12)) == firstDigit &&
               Character.getNumericValue(cleanCnpj.charAt(13)) == secondDigit;
    }

    /**
     * Valida CPF
     */
    public static boolean isValidCPF(String cpf) {
        if (cpf == null || cpf.trim().isEmpty()) {
            return false;
        }

        // Remove formatação
        String cleanCpf = cpf.replaceAll("[^0-9]", "");
        
        // Verifica se tem 11 dígitos
        if (cleanCpf.length() != 11) {
            return false;
        }

        // Verifica se todos os dígitos são iguais
        if (cleanCpf.matches("(\\d)\\1{10}")) {
            return false;
        }

        // Calcula primeiro dígito verificador
        int sum = 0;
        for (int i = 0; i < 9; i++) {
            sum += Character.getNumericValue(cleanCpf.charAt(i)) * (10 - i);
        }
        int firstDigit = (sum % 11 < 2) ? 0 : 11 - (sum % 11);

        // Calcula segundo dígito verificador
        sum = 0;
        for (int i = 0; i < 10; i++) {
            sum += Character.getNumericValue(cleanCpf.charAt(i)) * (11 - i);
        }
        int secondDigit = (sum % 11 < 2) ? 0 : 11 - (sum % 11);

        // Verifica se os dígitos verificadores estão corretos
        return Character.getNumericValue(cleanCpf.charAt(9)) == firstDigit &&
               Character.getNumericValue(cleanCpf.charAt(10)) == secondDigit;
    }

    /**
     * Valida email
     */
    public static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }

    /**
     * Valida telefone
     */
    public static boolean isValidPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return false;
        }
        return PHONE_PATTERN.matcher(phone).matches();
    }

    /**
     * Valida CEP
     */
    public static boolean isValidCEP(String cep) {
        if (cep == null || cep.trim().isEmpty()) {
            return false;
        }
        return CEP_PATTERN.matcher(cep).matches();
    }

    /**
     * Valida Inscrição Estadual (formato básico)
     */
    public static boolean isValidIE(String ie) {
        if (ie == null || ie.trim().isEmpty()) {
            return false;
        }
        
        // Remove formatação
        String cleanIE = ie.replaceAll("[^0-9]", "");
        
        // Verifica se tem entre 8 e 14 dígitos
        return cleanIE.length() >= 8 && cleanIE.length() <= 14;
    }

    /**
     * Valida chave de acesso da NFe
     */
    public static boolean isValidNFeKey(String nfeKey) {
        if (nfeKey == null || nfeKey.trim().isEmpty()) {
            return false;
        }
        
        // Remove formatação
        String cleanKey = nfeKey.replaceAll("[^0-9]", "");
        
        // Verifica se tem 44 dígitos
        if (cleanKey.length() != 44) {
            return false;
        }
        
        return NFE_KEY_PATTERN.matcher(cleanKey).matches();
    }

    /**
     * Valida se string não é nula ou vazia
     */
    public static boolean isNotEmpty(String value) {
        return value != null && !value.trim().isEmpty();
    }

    /**
     * Valida se string é nula ou vazia
     */
    public static boolean isEmpty(String value) {
        return value == null || value.trim().isEmpty();
    }

    /**
     * Valida se número é positivo
     */
    public static boolean isPositive(Number number) {
        return number != null && number.doubleValue() > 0;
    }

    /**
     * Valida se número é não negativo
     */
    public static boolean isNonNegative(Number number) {
        return number != null && number.doubleValue() >= 0;
    }

    /**
     * Valida se número está em um range
     */
    public static boolean isInRange(Number number, Number min, Number max) {
        if (number == null || min == null || max == null) {
            return false;
        }
        double value = number.doubleValue();
        return value >= min.doubleValue() && value <= max.doubleValue();
    }

    /**
     * Valida se string tem tamanho mínimo
     */
    public static boolean hasMinLength(String value, int minLength) {
        return value != null && value.length() >= minLength;
    }

    /**
     * Valida se string tem tamanho máximo
     */
    public static boolean hasMaxLength(String value, int maxLength) {
        return value == null || value.length() <= maxLength;
    }

    /**
     * Valida se string tem tamanho exato
     */
    public static boolean hasExactLength(String value, int length) {
        return value != null && value.length() == length;
    }

    /**
     * Valida se string contém apenas números
     */
    public static boolean isNumeric(String value) {
        if (value == null || value.trim().isEmpty()) {
            return false;
        }
        return value.matches("\\d+");
    }

    /**
     * Valida se string contém apenas letras
     */
    public static boolean isAlpha(String value) {
        if (value == null || value.trim().isEmpty()) {
            return false;
        }
        return value.matches("[a-zA-Z\\s]+");
    }

    /**
     * Valida se string contém apenas letras e números
     */
    public static boolean isAlphaNumeric(String value) {
        if (value == null || value.trim().isEmpty()) {
            return false;
        }
        return value.matches("[a-zA-Z0-9\\s]+");
    }

    /**
     * Formata CNPJ
     */
    public static String formatCNPJ(String cnpj) {
        if (cnpj == null || cnpj.trim().isEmpty()) {
            return null;
        }
        
        String cleanCnpj = cnpj.replaceAll("[^0-9]", "");
        if (cleanCnpj.length() != 14) {
            return cnpj;
        }
        
        return String.format("%s.%s.%s/%s-%s",
                cleanCnpj.substring(0, 2),
                cleanCnpj.substring(2, 5),
                cleanCnpj.substring(5, 8),
                cleanCnpj.substring(8, 12),
                cleanCnpj.substring(12, 14));
    }

    /**
     * Formata CPF
     */
    public static String formatCPF(String cpf) {
        if (cpf == null || cpf.trim().isEmpty()) {
            return null;
        }
        
        String cleanCpf = cpf.replaceAll("[^0-9]", "");
        if (cleanCpf.length() != 11) {
            return cpf;
        }
        
        return String.format("%s.%s.%s-%s",
                cleanCpf.substring(0, 3),
                cleanCpf.substring(3, 6),
                cleanCpf.substring(6, 9),
                cleanCpf.substring(9, 11));
    }

    /**
     * Formata CEP
     */
    public static String formatCEP(String cep) {
        if (cep == null || cep.trim().isEmpty()) {
            return null;
        }
        
        String cleanCep = cep.replaceAll("[^0-9]", "");
        if (cleanCep.length() != 8) {
            return cep;
        }
        
        return String.format("%s-%s",
                cleanCep.substring(0, 5),
                cleanCep.substring(5, 8));
    }
}
