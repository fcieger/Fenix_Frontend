/**
 * SDK Types Re-exports
 * Centralized re-exports of all types from @fenix/api-sdk
 *
 * This file provides a single import point for all SDK types,
 * making it easier to migrate from local types to SDK types.
 */

// Base types
export type {
  PaginationParams,
  PaginatedResponse,
} from '@fenix/api-sdk';
export { ApiError } from '@fenix/api-sdk';

// Auth types
export type {
  LoginDto,
  RegisterDto,
  AuthResponse,
  User,
  Company as AuthCompany,
  ValidateTokenDto,
  ValidateTokenResponse,
  RefreshTokenDto,
  RefreshResponse,
  CreateUserDto,
  CreateCompanyDto,
  AddressDto as AuthAddressDto,
  LogoutDto,
  LoginInput,
  RegisterInput,
  ValidateTokenInput,
  RefreshTokenInput,
  LogoutInput,
} from '@fenix/api-sdk';

// Product types
export type {
  Product,
  CreateProductDto,
  UpdateProductDto,
} from '@fenix/api-sdk';
export {
  createProductSchema,
  updateProductSchema,
} from '@fenix/api-sdk';

// Partner types
export type {
  Partner,
  CreatePartnerDto,
  UpdatePartnerDto,
  AddressDto as PartnerAddressDto,
  ContactDto,
  PartnerQueryParams,
} from '@fenix/api-sdk';
export {
  RegistrationType,
  PersonType,
  AddressType,
  createPartnerSchema,
  updatePartnerSchema,
  addressSchema as partnerAddressSchema,
  contactSchema,
} from '@fenix/api-sdk';

// Quote types
export type {
  Quote,
  QuoteItem,
  QuoteItemDto,
  CreateQuoteDto,
  UpdateQuoteDto,
  CreateQuoteInput,
  UpdateQuoteInput,
} from '@fenix/api-sdk';
export {
  createQuoteSchema,
  updateQuoteSchema,
  quoteItemSchema,
} from '@fenix/api-sdk';
// QuoteStatus is exported as type from main index, but we also export it directly from the module
export { QuoteStatus } from '@fenix/api-sdk/dist/clients/quotes/types';

// Sales Order types
export type {
  SalesOrder,
  SalesOrderItem,
  SalesOrderItemDto,
  SalesOrderInstallment,
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  CreateSalesOrderInput,
  UpdateSalesOrderInput,
} from '@fenix/api-sdk';
export {
  SalesOrderStatus,
  createSalesOrderSchema,
  updateSalesOrderSchema,
  salesOrderItemSchema,
} from '@fenix/api-sdk';
// Alias OrderStatus to SalesOrderStatus for backwards compatibility
export { SalesOrderStatus as OrderStatus } from '@fenix/api-sdk';
// Purchase Order types
export type {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderItemDto,
  PurchaseOrderInstallment,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
} from '@fenix/api-sdk';
export {
  PurchaseOrderStatus,
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  purchaseOrderItemSchema,
} from '@fenix/api-sdk';

// Payment Terms types
export type {
  PaymentTerm,
  CreatePaymentTermDto,
  UpdatePaymentTermDto,
  DaysConfigurations,
  InstallmentsConfigurations,
  CustomConfigurations,
  ConfigurationsDto,
} from '@fenix/api-sdk';
export { PaymentTermType } from '@fenix/api-sdk';

// Financial Accounts types
export type {
  FinancialAccount,
  CreateFinancialAccountDto,
  UpdateFinancialAccountDto,
} from '@fenix/api-sdk';

// Accounts Payable types
export type {
  AccountPayable,
  CreateAccountPayableDto,
  UpdateAccountPayableDto,
  RecordPaymentDto,
  CreateAccountPayableInput,
  UpdateAccountPayableInput,
  RecordPaymentInput,
} from '@fenix/api-sdk';

// Accounts Receivable types
export type {
  AccountReceivable,
  CreateAccountReceivableDto,
  UpdateAccountReceivableDto,
  RecordReceiptDto,
  CreateAccountReceivableInput,
  UpdateAccountReceivableInput,
  RecordReceiptInput,
} from '@fenix/api-sdk';

// Stock types
export type {
  StockLocation,
  CreateStockLocationDto,
  UpdateStockLocationDto,
  StockMovement,
  CreateStockMovementDto,
  UpdateStockMovementDto,
  StockBalance,
  TransferStockDto,
  GetMovementQueryParams,
  GetBalanceQueryParams,
} from '@fenix/api-sdk';
export {
  StockMovementType,
  StockMovementSource,
} from '@fenix/api-sdk';

// Certificates types
// Companies Users types
export type {
  Company,
  UpdateCompanyDto,
  AddressDto as CompanyAddressDto,
} from '@fenix/api-sdk';

// Invitations types
export type {
  Invitation,
  CreateInvitationDto,
} from '@fenix/api-sdk';

// NFe types
export type {
  Nfe,
  CreateNfeDto,
  UpdateNfeDto,
} from '@fenix/api-sdk';

// NFe Config types
// Operation Nature types
export type {
  OperationNature,
  CreateOperationNatureDto,
  UpdateOperationNatureDto,
} from '@fenix/api-sdk';

// Plans types
export type {
  Plan,
} from '@fenix/api-sdk';

// API Keys types
export type {
  ApiKey,
  CreateApiKeyDto,
} from '@fenix/api-sdk';
