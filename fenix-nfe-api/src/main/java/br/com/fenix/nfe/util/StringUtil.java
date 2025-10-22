package br.com.fenix.nfe.util;

import lombok.extern.slf4j.Slf4j;

import java.text.Normalizer;
import java.util.Random;
import java.util.regex.Pattern;

/**
 * Utilitários para manipulação de strings
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Slf4j
public class StringUtil {

    private static final Pattern ONLY_NUMBERS = Pattern.compile("\\d+");
    private static final Pattern ONLY_LETTERS = Pattern.compile("[a-zA-Z\\s]+");
    private static final Pattern ONLY_ALPHANUMERIC = Pattern.compile("[a-zA-Z0-9\\s]+");
    private static final Random RANDOM = new Random();

    /**
     * Verifica se string é nula ou vazia
     */
    public static boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    /**
     * Verifica se string não é nula nem vazia
     */
    public static boolean isNotEmpty(String str) {
        return !isEmpty(str);
    }

    /**
     * Verifica se string é nula, vazia ou contém apenas espaços
     */
    public static boolean isBlank(String str) {
        return str == null || str.trim().isEmpty();
    }

    /**
     * Verifica se string não é nula, vazia nem contém apenas espaços
     */
    public static boolean isNotBlank(String str) {
        return !isBlank(str);
    }

    /**
     * Remove acentos de uma string
     */
    public static String removeAccents(String str) {
        if (isEmpty(str)) {
            return str;
        }
        
        return Normalizer.normalize(str, Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
    }

    /**
     * Converte string para maiúsculas
     */
    public static String toUpperCase(String str) {
        return isEmpty(str) ? str : str.toUpperCase();
    }

    /**
     * Converte string para minúsculas
     */
    public static String toLowerCase(String str) {
        return isEmpty(str) ? str : str.toLowerCase();
    }

    /**
     * Capitaliza primeira letra de cada palavra
     */
    public static String capitalizeWords(String str) {
        if (isEmpty(str)) {
            return str;
        }
        
        String[] words = str.trim().split("\\s+");
        StringBuilder result = new StringBuilder();
        
        for (int i = 0; i < words.length; i++) {
            if (i > 0) {
                result.append(" ");
            }
            
            if (words[i].length() > 0) {
                result.append(Character.toUpperCase(words[i].charAt(0)))
                      .append(words[i].substring(1).toLowerCase());
            }
        }
        
        return result.toString();
    }

    /**
     * Remove caracteres especiais, mantendo apenas letras, números e espaços
     */
    public static String removeSpecialCharacters(String str) {
        if (isEmpty(str)) {
            return str;
        }
        
        return str.replaceAll("[^a-zA-Z0-9\\s]", "");
    }

    /**
     * Remove todos os espaços de uma string
     */
    public static String removeSpaces(String str) {
        if (isEmpty(str)) {
            return str;
        }
        
        return str.replaceAll("\\s+", "");
    }

    /**
     * Remove espaços extras, mantendo apenas um espaço entre palavras
     */
    public static String normalizeSpaces(String str) {
        if (isEmpty(str)) {
            return str;
        }
        
        return str.trim().replaceAll("\\s+", " ");
    }

    /**
     * Trunca string para tamanho máximo
     */
    public static String truncate(String str, int maxLength) {
        if (isEmpty(str) || str.length() <= maxLength) {
            return str;
        }
        
        return str.substring(0, maxLength);
    }

    /**
     * Trunca string para tamanho máximo com sufixo
     */
    public static String truncate(String str, int maxLength, String suffix) {
        if (isEmpty(str) || str.length() <= maxLength) {
            return str;
        }
        
        if (suffix == null) {
            suffix = "...";
        }
        
        int suffixLength = suffix.length();
        if (maxLength <= suffixLength) {
            return str.substring(0, maxLength);
        }
        
        return str.substring(0, maxLength - suffixLength) + suffix;
    }

    /**
     * Preenche string à esquerda com caracteres
     */
    public static String padLeft(String str, int length, char padChar) {
        if (str == null) {
            str = "";
        }
        
        if (str.length() >= length) {
            return str;
        }
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length - str.length(); i++) {
            sb.append(padChar);
        }
        sb.append(str);
        
        return sb.toString();
    }

    /**
     * Preenche string à direita com caracteres
     */
    public static String padRight(String str, int length, char padChar) {
        if (str == null) {
            str = "";
        }
        
        if (str.length() >= length) {
            return str;
        }
        
        StringBuilder sb = new StringBuilder(str);
        for (int i = 0; i < length - str.length(); i++) {
            sb.append(padChar);
        }
        
        return sb.toString();
    }

    /**
     * Preenche string com zeros à esquerda
     */
    public static String padLeftWithZeros(String str, int length) {
        return padLeft(str, length, '0');
    }

    /**
     * Gera string aleatória
     */
    public static String generateRandomString(int length) {
        if (length <= 0) {
            return "";
        }
        
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder(length);
        
        for (int i = 0; i < length; i++) {
            sb.append(characters.charAt(RANDOM.nextInt(characters.length())));
        }
        
        return sb.toString();
    }

    /**
     * Gera string aleatória com caracteres específicos
     */
    public static String generateRandomString(int length, String characters) {
        if (length <= 0 || isEmpty(characters)) {
            return "";
        }
        
        StringBuilder sb = new StringBuilder(length);
        
        for (int i = 0; i < length; i++) {
            sb.append(characters.charAt(RANDOM.nextInt(characters.length())));
        }
        
        return sb.toString();
    }

    /**
     * Gera string aleatória numérica
     */
    public static String generateRandomNumericString(int length) {
        return generateRandomString(length, "0123456789");
    }

    /**
     * Gera string aleatória alfabética
     */
    public static String generateRandomAlphaString(int length) {
        return generateRandomString(length, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");
    }

    /**
     * Verifica se string contém apenas números
     */
    public static boolean isNumeric(String str) {
        return isNotEmpty(str) && ONLY_NUMBERS.matcher(str).matches();
    }

    /**
     * Verifica se string contém apenas letras
     */
    public static boolean isAlpha(String str) {
        return isNotEmpty(str) && ONLY_LETTERS.matcher(str).matches();
    }

    /**
     * Verifica se string contém apenas letras e números
     */
    public static boolean isAlphaNumeric(String str) {
        return isNotEmpty(str) && ONLY_ALPHANUMERIC.matcher(str).matches();
    }

    /**
     * Conta ocorrências de um caractere na string
     */
    public static int countOccurrences(String str, char character) {
        if (isEmpty(str)) {
            return 0;
        }
        
        int count = 0;
        for (char c : str.toCharArray()) {
            if (c == character) {
                count++;
            }
        }
        return count;
    }

    /**
     * Conta ocorrências de uma substring na string
     */
    public static int countOccurrences(String str, String substring) {
        if (isEmpty(str) || isEmpty(substring)) {
            return 0;
        }
        
        int count = 0;
        int index = 0;
        while ((index = str.indexOf(substring, index)) != -1) {
            count++;
            index += substring.length();
        }
        return count;
    }

    /**
     * Inverte uma string
     */
    public static String reverse(String str) {
        if (isEmpty(str)) {
            return str;
        }
        
        return new StringBuilder(str).reverse().toString();
    }

    /**
     * Remove caracteres duplicados consecutivos
     */
    public static String removeConsecutiveDuplicates(String str) {
        if (isEmpty(str)) {
            return str;
        }
        
        StringBuilder result = new StringBuilder();
        char lastChar = 0;
        
        for (char c : str.toCharArray()) {
            if (c != lastChar) {
                result.append(c);
                lastChar = c;
            }
        }
        
        return result.toString();
    }

    /**
     * Converte string para slug (URL-friendly)
     */
    public static String toSlug(String str) {
        if (isEmpty(str)) {
            return "";
        }
        
        return removeAccents(str)
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    /**
     * Extrai números de uma string
     */
    public static String extractNumbers(String str) {
        if (isEmpty(str)) {
            return "";
        }
        
        return str.replaceAll("[^0-9]", "");
    }

    /**
     * Extrai letras de uma string
     */
    public static String extractLetters(String str) {
        if (isEmpty(str)) {
            return "";
        }
        
        return str.replaceAll("[^a-zA-Z]", "");
    }

    /**
     * Verifica se string é um email válido (formato básico)
     */
    public static boolean isValidEmail(String email) {
        if (isEmpty(email)) {
            return false;
        }
        
        return email.matches("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$");
    }

    /**
     * Mascara string, mostrando apenas os primeiros e últimos caracteres
     */
    public static String mask(String str, int visibleStart, int visibleEnd, char maskChar) {
        if (isEmpty(str) || str.length() <= visibleStart + visibleEnd) {
            return str;
        }
        
        String start = str.substring(0, visibleStart);
        String end = str.substring(str.length() - visibleEnd);
        String middle = str.substring(visibleStart, str.length() - visibleEnd)
                .replaceAll(".", String.valueOf(maskChar));
        
        return start + middle + end;
    }

    /**
     * Mascara CNPJ
     */
    public static String maskCNPJ(String cnpj) {
        if (isEmpty(cnpj)) {
            return cnpj;
        }
        
        String numbers = extractNumbers(cnpj);
        if (numbers.length() != 14) {
            return cnpj;
        }
        
        return mask(numbers, 2, 2, '*');
    }

    /**
     * Mascara CPF
     */
    public static String maskCPF(String cpf) {
        if (isEmpty(cpf)) {
            return cpf;
        }
        
        String numbers = extractNumbers(cpf);
        if (numbers.length() != 11) {
            return cpf;
        }
        
        return mask(numbers, 3, 2, '*');
    }
}
