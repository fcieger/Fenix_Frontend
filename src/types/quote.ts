/**
 * Quote types - Re-exported from SDK
 * Use types from @/types/sdk instead of local types
 */

// Re-export SDK types
export type {
  Quote,
  QuoteItem,
  QuoteItemDto,
  CreateQuoteDto,
  UpdateQuoteDto,
  QuoteChangeStatusDto,
} from '@/types/sdk';

export { QuoteStatus } from '@/types/sdk';

// Legacy exports for backward compatibility
export type StatusOrcamento = QuoteStatus;
export type OrcamentoItem = QuoteItem;
export type Orcamento = Quote;


