import { format, parseISO, isValid } from 'date-fns';

/**
 * Date Transformers
 * Transformadores para formatação e normalização de datas
 */

/**
 * Normaliza data para formato ISO string
 */
export function normalizeDate(
  date: Date | string | undefined | null
): string | undefined {
  if (!date) return undefined;
  if (typeof date === 'string') {
    try {
      // Tenta parsear e retornar ISO string
      const parsed = parseISO(date);
      if (isValid(parsed)) {
        return parsed.toISOString();
      }
      return undefined;
    } catch {
      return undefined;
    }
  }
  if (date instanceof Date && isValid(date)) {
    return date.toISOString();
  }
  return undefined;
}

/**
 * Formata data para exibição (dd/MM/yyyy)
 */
export function formatDateForDisplay(
  date: string | Date | undefined | null
): string | undefined {
  if (!date) return undefined;
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isValid(dateObj)) {
      return format(dateObj, 'dd/MM/yyyy');
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Formata data e hora para exibição (dd/MM/yyyy HH:mm)
 */
export function formatDateTimeForDisplay(
  date: string | Date | undefined | null
): string | undefined {
  if (!date) return undefined;
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isValid(dateObj)) {
      return format(dateObj, 'dd/MM/yyyy HH:mm');
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Converte string ISO para Date object
 */
export function parseDate(date: string | undefined | null): Date | undefined {
  if (!date) return undefined;
  try {
    const parsed = parseISO(date);
    if (isValid(parsed)) {
      return parsed;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

