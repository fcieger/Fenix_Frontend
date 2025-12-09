/**
 * Common Transformers
 * Transformadores reutilizáveis para formatação de dados
 */

/**
 * Remove propriedades undefined/null de um objeto
 */
export function removeEmptyFields<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  const cleaned: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      cleaned[key as keyof T] = value;
    }
  }
  return cleaned;
}

/**
 * Normaliza strings (trim, remove espaços extras)
 */
export function normalizeString(str: string | undefined | null): string {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Normaliza número (converte para número ou retorna 0)
 */
export function normalizeNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Normaliza código (uppercase, remove espaços)
 */
export function normalizeCode(code: string | undefined | null): string {
  if (!code) return '';
  return code.toUpperCase().replace(/\s+/g, '');
}

/**
 * Normaliza email (lowercase, trim)
 */
export function normalizeEmail(email: string | undefined | null): string {
  if (!email) return '';
  return email.toLowerCase().trim();
}

/**
 * Normaliza CPF/CNPJ (remove formatação, mantém apenas números)
 */
export function normalizeDocument(
  document: string | undefined | null
): string {
  if (!document) return '';
  return document.replace(/\D/g, '');
}

/**
 * Normaliza telefone (remove formatação, mantém apenas números)
 */
export function normalizePhone(phone: string | undefined | null): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Normaliza CEP (remove formatação, mantém apenas números)
 */
export function normalizeZipCode(zipCode: string | undefined | null): string {
  if (!zipCode) return '';
  return zipCode.replace(/\D/g, '');
}

