/**
 * Enum Translators
 * Functions to translate SDK enums to Portuguese for UI display
 */

import { QuoteStatus, OrderStatus, RegistrationType } from '@/types/sdk';

/**
 * Translate QuoteStatus enum to Portuguese
 */
export function translateQuoteStatus(status: QuoteStatus): string {
  const translations: Record<QuoteStatus, string> = {
    [QuoteStatus.OPEN]: 'Aberto',
    [QuoteStatus.APPROVED]: 'Aprovado',
    [QuoteStatus.REJECTED]: 'Rejeitado',
    [QuoteStatus.EXPIRED]: 'Expirado',
  };
  return translations[status] || status;
}

/**
 * Translate OrderStatus enum to Portuguese
 */
export function translateOrderStatus(status: OrderStatus): string {
  const translations: Record<OrderStatus, string> = {
    [OrderStatus.DRAFT]: 'Rascunho',
    [OrderStatus.IN_PROGRESS]: 'Em Andamento',
    [OrderStatus.COMPLETED]: 'Concluído',
    [OrderStatus.CANCELLED]: 'Cancelado',
  };
  return translations[status] || status;
}

/**
 * Translate RegistrationType enum to Portuguese
 */
export function translateRegistrationType(type: RegistrationType): string {
  const translations: Record<RegistrationType, string> = {
    [RegistrationType.CUSTOMER]: 'Cliente',
    [RegistrationType.SUPPLIER]: 'Fornecedor',
    [RegistrationType.BOTH]: 'Cliente e Fornecedor',
  };
  return translations[type] || type;
}

/**
 * Get badge color class for QuoteStatus
 */
export function getQuoteStatusBadgeColor(status: QuoteStatus): string {
  const colors: Record<QuoteStatus, string> = {
    [QuoteStatus.OPEN]: 'bg-yellow-100 text-yellow-800',
    [QuoteStatus.APPROVED]: 'bg-green-100 text-green-800',
    [QuoteStatus.REJECTED]: 'bg-red-100 text-red-800',
    [QuoteStatus.EXPIRED]: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get badge color class for OrderStatus
 */
export function getOrderStatusBadgeColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    [OrderStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [OrderStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [OrderStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get badge color for any status (QuoteStatus or OrderStatus)
 */
export function getStatusBadgeColor(status: QuoteStatus | OrderStatus): string {
  if (Object.values(QuoteStatus).includes(status as QuoteStatus)) {
    return getQuoteStatusBadgeColor(status as QuoteStatus);
  }
  return getOrderStatusBadgeColor(status as OrderStatus);
}

