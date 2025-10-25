/**
 * Converte string de valor monetário brasileiro para number
 * Ex: "132,11" -> 132.11
 * Ex: "1.234,56" -> 1234.56
 */
export function parseBrazilianCurrency(value: string): number {
  if (!value || value.trim() === '') return 0;
  
  // Remove espaços e converte para string
  const cleanValue = value.trim().toString();
  
  // Se já é um número válido, retorna
  if (!isNaN(Number(cleanValue)) && !cleanValue.includes(',')) {
    return Number(cleanValue);
  }
  
  // Remove pontos de milhares (se houver)
  // Ex: "1.234,56" -> "1234,56"
  let normalizedValue = cleanValue.replace(/\./g, '');
  
  // Substitui vírgula por ponto para conversão
  // Ex: "1234,56" -> "1234.56"
  normalizedValue = normalizedValue.replace(',', '.');
  
  const result = parseFloat(normalizedValue);
  
  // Verifica se a conversão foi bem-sucedida
  if (isNaN(result)) {
    console.warn(`⚠️ Erro ao converter valor monetário: "${value}"`);
    return 0;
  }
  
  return result;
}

/**
 * Formata number para string de valor monetário brasileiro
 * Ex: 132.11 -> "132,11"
 * Ex: 1234.56 -> "1.234,56"
 */
export function formatBrazilianCurrency(value: number): string {
  if (isNaN(value)) return '0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

