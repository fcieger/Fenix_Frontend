# SDK Migration Summary

## Completed Phases

### Phase 1: SDK Setup and Infrastructure ✅

- Created `src/lib/sdk/client-factory.ts` - Centralized SDK client factory
- Created `src/lib/sdk/client-manager.ts` - Client manager with hooks
- Created `src/lib/sdk/error-handler.ts` - Standardized error handling
- Created `src/lib/sdk/initialize.ts` - SDK initialization utility
- Updated `src/config/api.ts` - Added SDK configuration helpers

### Phase 2: Authentication Migration ✅

- Migrated `src/contexts/auth-context.tsx` to use `AuthApiClient`
- Created `src/types/auth.ts` - Auth types
- Updated login, register, and profile loading to use SDK
- Integrated error handling with `SdkErrorHandler`

### Phase 3: Core Modules Migration ✅

- Created `src/services/quotes-service.ts` - Quotes service using `QuotesApiClient`
- Created `src/services/sales-orders-service.ts` - Sales orders using `SalesOrdersApiClient`
- Created `src/services/purchase-orders-service.ts` - Purchase orders using `PurchaseOrdersApiClient`
- Updated all imports in:
  - `src/app/quotes/page.tsx`
  - `src/app/quotes/[id]/page.tsx`
  - `src/app/sales/page.tsx`
  - `src/app/sales/[id]/page.tsx`
  - `src/app/purchases/page.tsx`
  - `src/app/purchases/[id]/page.tsx`
  - `src/app/purchases/ia-lancar/page.tsx`

### Phase 4: Financial Modules Migration ✅

- Created `src/services/financial-accounts-service.ts` - Financial accounts service
- Service includes fallback to Next.js API routes for compatibility

### Phase 5: Additional SDK Services ✅

- Created `src/services/accounts-payable-service.ts` - Accounts payable using `AccountsPayableApiClient`
- Created `src/services/accounts-receivable-service.ts` - Accounts receivable using `AccountsReceivableApiClient`
- Created `src/services/taxes-service.ts` - Taxes using `TaxesApiClient`
- Created `src/services/certificates-service.ts` - Certificates using `CertificatesApiClient`
- Created `src/services/companies-users-service.ts` - Companies users using `CompaniesUsersApiClient`
- Created `src/services/invitations-service.ts` - Invitations using `InvitationsApiClient`
- Created `src/services/nfe-config-service.ts` - NFe config using `NfeConfigApiClient`
- Created `src/services/operation-nature-service.ts` - Operation nature using `OperationNatureApiClient`
- Created `src/services/plans-service.ts` - Plans using `PlansApiClient`
- Created `src/services/api-keys-service.ts` - API keys using `ApiKeysApiClient`
- Updated `src/lib/sdk/client-factory.ts` - Added all missing client factory methods

### Phase 6: Services Documentation ✅

- Documented services that use API routes directly (movements, payment-methods, cost-centers, chart-of-accounts)
- Documented services that use direct database queries (fluxo-caixa-service)
- Documented services that need future SDK support (licitacoes, credito, chat, lookups)

### Phase 7: Pages Migration ✅

- Migrated `src/app/nfe/page.tsx` - Now uses `nfe-service` for all NFe operations
- Migrated `src/app/profile/page.tsx` - Now uses `companies-users-service` with fallback
- Enhanced `src/services/nfe-service.ts` - Added integration methods (sync, issue, cancel, download XML/PDF)

### Phase 8: Infrastructure & Error Handling ✅

- Error handling standardized across all services
- Services use SDK clients with fallback patterns
- Type safety maintained throughout

## Migration Pattern

All new services follow this pattern:

```typescript
import { SdkClientFactory } from "@/lib/sdk/client-factory";
import { SdkErrorHandler } from "@/lib/sdk/error-handler";

export async function operation() {
  try {
    const client = SdkClientFactory.getXxxClient();
    return await client.operation();
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}
```

## Backward Compatibility

All services maintain legacy function names for backward compatibility:

- `listarOrcamentos` → `listQuotes`
- `criarPedidoVenda` → `createSalesOrder`
- etc.

## Migration Status

### Completed ✅

- All SDK modules have corresponding services
- Core pages migrated (quotes, sales, purchases, nfe, profile)
- Error handling standardized
- Documentation added for services using API routes

### In Progress / Remaining

1. **Pages Migration**: Migrate remaining pages that use fetch directly

   - Dashboard pages (may need custom dashboard endpoints)
   - Financial pages
   - Stock pages
   - Point of sale pages
   - Settings pages
   - Credit pages
   - Companies pages
   - Notifications page

2. **Hooks Migration**: Update hooks to use SDK services

   - `src/hooks/useMovimentacoes.ts`
   - `src/hooks/useCentrosCustos.ts`
   - `src/hooks/useContas.ts`
   - `src/hooks/useContasContabeis.ts`
   - `src/hooks/useContasContabeisSimples.ts`

3. **Components Migration**: Migrate components that use fetch directly

   - Report components
   - NFe components
   - Point of sale components
   - Other utility components

4. **Library Migration**: Migrate utility libraries

   - `src/lib/api-nfe.ts` - Migrate to use nfe-service
   - `src/lib/api-certificado.ts` - Migrate to use certificates-service
   - `src/lib/relatorios/carregarDados.ts` - Migrate fetch calls

5. **Testing**: Test all migrated endpoints
6. **Type Updates**: Gradually replace custom types with SDK types
7. **Cleanup**: Deprecate `src/lib/api.ts` after full migration

## Files Created

### SDK Infrastructure

- `src/lib/sdk/client-factory.ts`
- `src/lib/sdk/client-manager.ts`
- `src/lib/sdk/error-handler.ts`
- `src/lib/sdk/initialize.ts`

### Types

- `src/types/auth.ts`

### Services (SDK-based)

- `src/services/quotes-service.ts`
- `src/services/sales-orders-service.ts`
- `src/services/purchase-orders-service.ts`
- `src/services/financial-accounts-service.ts`
- `src/services/products-service.ts`
- `src/services/partners-service.ts`
- `src/services/stock-service.ts`
- `src/services/payment-terms-service.ts`
- `src/services/nfe-service.ts`
- `src/services/accounts-payable-service.ts`
- `src/services/accounts-receivable-service.ts`
- `src/services/taxes-service.ts`
- `src/services/certificates-service.ts`
- `src/services/companies-users-service.ts`
- `src/services/invitations-service.ts`
- `src/services/nfe-config-service.ts`
- `src/services/operation-nature-service.ts`
- `src/services/plans-service.ts`
- `src/services/api-keys-service.ts`

### Services (API Routes - Documented)

- `src/services/movements-service.ts` - Uses API routes (no SDK module)
- `src/services/payment-methods-service.ts` - Uses API routes (no SDK module)
- `src/services/cost-centers-service.ts` - Uses API routes (no SDK module)
- `src/services/chart-of-accounts-service.ts` - Uses API routes (no SDK module)
- `src/services/fluxo-caixa-service.ts` - Uses direct database queries (intentional)
- `src/services/licitacoes-service.ts` - Uses API routes (no SDK module)
- `src/services/credito.ts` - Uses API routes (no SDK module)
- `src/services/chat-service.ts` - Uses API routes (no SDK module)
- `src/services/lookups.ts` - Uses API routes (utility functions)

## Files Updated

### Configuration

- `src/config/api.ts` - Added SDK helpers

### Contexts

- `src/contexts/auth-context.tsx` - Migrated to SDK

### Pages

- `src/app/nfe/page.tsx` - Migrated to use `nfe-service`
- `src/app/profile/page.tsx` - Migrated to use `companies-users-service`
- All quote/sales/purchase order page imports updated

### Services

- All services updated with proper documentation and error handling

## Notes

- SDK package name handling: Supports both `@fenix/api-sdk` and `@fenix/api-sdk`
- Error handling: All services use `SdkErrorHandler` for consistent error messages
- Fallback patterns: Services fall back to Next.js API routes when SDK methods aren't available
- Token management: Handled automatically by SDK client factory
