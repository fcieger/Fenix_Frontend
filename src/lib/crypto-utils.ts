import CryptoJS from 'crypto-js';

export class CryptoUtils {
  private static readonly SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_SECRET || 'fenix-cert-secret-key-2024';

  /**
   * Criptografa a senha do certificado antes de enviar para o backend
   */
  static encryptPassword(password: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(password, this.SECRET_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Erro ao criptografar senha:', error);
      throw new Error('Falha na criptografia da senha');
    }
  }

  /**
   * Criptografa dados sensíveis
   */
  static encryptData(data: string, key?: string): string {
    const secretKey = key || this.SECRET_KEY;
    return CryptoJS.AES.encrypt(data, secretKey).toString();
  }

  /**
   * Gera hash SHA-256 para verificação de integridade
   */
  static generateHash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * Gera uma chave de criptografia única baseada na senha
   */
  static generateEncryptionKey(password: string, salt?: string): string {
    const saltValue = salt || CryptoJS.lib.WordArray.random(128/8).toString();
    return CryptoJS.PBKDF2(password, saltValue, {
      keySize: 256/32,
      iterations: 10000
    }).toString();
  }

  /**
   * Valida se uma string é um hash válido
   */
  static isValidHash(hash: string): boolean {
    return /^[a-f0-9]{64}$/i.test(hash);
  }

  /**
   * Gera um salt aleatório
   */
  static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128/8).toString();
  }
}
