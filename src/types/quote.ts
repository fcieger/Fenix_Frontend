/**
 * Quote types - Re-exported from SDK
 * Use types from @/types/sdk instead of local types
 */

import type {
  QuoteStatus as SdkQuoteStatus,
  QuoteItem as SdkQuoteItem,
  Quote as SdkQuote,
} from '@/types/sdk';

// Re-export SDK types
export type {
  Quote,
  QuoteItem,
  QuoteItemDto,
  CreateQuoteDto,
  UpdateQuoteDto,
} from '@/types/sdk';

export { QuoteStatus } from '@/types/sdk';

// Legacy exports for backward compatibility
export type StatusOrcamento = SdkQuoteStatus;
export type OrcamentoItem = SdkQuoteItem;
export type Orcamento = SdkQuote;
