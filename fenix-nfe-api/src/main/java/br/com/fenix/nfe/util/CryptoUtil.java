package br.com.fenix.nfe.util;

import lombok.extern.slf4j.Slf4j;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Utilitários para criptografia e hash
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Slf4j
public class CryptoUtil {

    private static final String AES_ALGORITHM = "AES";
    private static final String SHA256_ALGORITHM = "SHA-256";
    private static final String MD5_ALGORITHM = "MD5";
    private static final int AES_KEY_LENGTH = 256;

    /**
     * Gera hash SHA-256 de uma string
     */
    public static String sha256(String input) {
        if (input == null || input.isEmpty()) {
            return null;
        }
        
        try {
            MessageDigest digest = MessageDigest.getInstance(SHA256_ALGORITHM);
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException e) {
            log.error("Erro ao gerar hash SHA-256: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Gera hash MD5 de uma string
     */
    public static String md5(String input) {
        if (input == null || input.isEmpty()) {
            return null;
        }
        
        try {
            MessageDigest digest = MessageDigest.getInstance(MD5_ALGORITHM);
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException e) {
            log.error("Erro ao gerar hash MD5: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Gera uma chave AES aleatória
     */
    public static String generateAESKey() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance(AES_ALGORITHM);
            keyGenerator.init(AES_KEY_LENGTH);
            SecretKey secretKey = keyGenerator.generateKey();
            return Base64.getEncoder().encodeToString(secretKey.getEncoded());
        } catch (Exception e) {
            log.error("Erro ao gerar chave AES: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Criptografa texto usando AES
     */
    public static String encryptAES(String plainText, String key) {
        if (plainText == null || plainText.isEmpty() || key == null || key.isEmpty()) {
            return null;
        }
        
        try {
            SecretKeySpec secretKey = new SecretKeySpec(
                Base64.getDecoder().decode(key), AES_ALGORITHM);
            
            Cipher cipher = Cipher.getInstance(AES_ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            
            byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            log.error("Erro ao criptografar com AES: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Descriptografa texto usando AES
     */
    public static String decryptAES(String encryptedText, String key) {
        if (encryptedText == null || encryptedText.isEmpty() || key == null || key.isEmpty()) {
            return null;
        }
        
        try {
            SecretKeySpec secretKey = new SecretKeySpec(
                Base64.getDecoder().decode(key), AES_ALGORITHM);
            
            Cipher cipher = Cipher.getInstance(AES_ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            
            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedText));
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Erro ao descriptografar com AES: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Gera uma string aleatória segura
     */
    public static String generateSecureRandomString(int length) {
        if (length <= 0) {
            return null;
        }
        
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        
        for (int i = 0; i < length; i++) {
            sb.append(characters.charAt(random.nextInt(characters.length())));
        }
        
        return sb.toString();
    }

    /**
     * Gera um token seguro para autenticação
     */
    public static String generateAuthToken() {
        return generateSecureRandomString(32);
    }

    /**
     * Gera um ID único seguro
     */
    public static String generateSecureId() {
        return generateSecureRandomString(16);
    }

    /**
     * Converte array de bytes para string hexadecimal
     */
    public static String bytesToHex(byte[] bytes) {
        if (bytes == null) {
            return null;
        }
        
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }

    /**
     * Converte string hexadecimal para array de bytes
     */
    public static byte[] hexToBytes(String hex) {
        if (hex == null || hex.length() % 2 != 0) {
            return null;
        }
        
        byte[] bytes = new byte[hex.length() / 2];
        for (int i = 0; i < bytes.length; i++) {
            bytes[i] = (byte) Integer.parseInt(hex.substring(i * 2, i * 2 + 2), 16);
        }
        return bytes;
    }

    /**
     * Gera hash com salt
     */
    public static String hashWithSalt(String input, String salt) {
        if (input == null || input.isEmpty() || salt == null || salt.isEmpty()) {
            return null;
        }
        
        return sha256(input + salt);
    }

    /**
     * Gera salt aleatório
     */
    public static String generateSalt() {
        return generateSecureRandomString(16);
    }

    /**
     * Verifica se hash corresponde ao input com salt
     */
    public static boolean verifyHash(String input, String salt, String hash) {
        if (input == null || salt == null || hash == null) {
            return false;
        }
        
        String computedHash = hashWithSalt(input, salt);
        return hash.equals(computedHash);
    }

    /**
     * Criptografa senha para armazenamento
     */
    public static String encryptPassword(String password) {
        if (password == null || password.isEmpty()) {
            return null;
        }
        
        String salt = generateSalt();
        String hash = hashWithSalt(password, salt);
        return salt + ":" + hash;
    }

    /**
     * Verifica senha criptografada
     */
    public static boolean verifyPassword(String password, String encryptedPassword) {
        if (password == null || encryptedPassword == null) {
            return false;
        }
        
        String[] parts = encryptedPassword.split(":");
        if (parts.length != 2) {
            return false;
        }
        
        String salt = parts[0];
        String hash = parts[1];
        
        return verifyHash(password, salt, hash);
    }
}
