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
  ChangeStatusDto as QuoteChangeStatusDto,
  CreateQuoteInput,
  UpdateQuoteInput,
  ChangeStatusInput as QuoteChangeStatusInput,
} from '@fenix/api-sdk';
export {
  createQuoteSchema,
  updateQuoteSchema,
  quoteItemSchema,
  changeStatusSchema as quoteChangeStatusSchema,
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
  ChangeStatusDto as SalesOrderChangeStatusDto,
  CreateSalesOrderInput,
  UpdateSalesOrderInput,
  ChangeStatusInput as SalesOrderChangeStatusInput,
} from '@fenix/api-sdk';
export {
  SalesOrderStatus,
  createSalesOrderSchema,
  updateSalesOrderSchema,
  salesOrderItemSchema,
  changeStatusSchema as salesOrderChangeStatusSchema,
} from '@fenix/api-sdk';
// OrderStatus is exported as SalesOrderStatus from main index, but we also export it directly from the module
export { OrderStatus } from '@fenix/api-sdk/dist/clients/sales-orders/types';

// Purchase Order types
export type {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderItemDto,
  PurchaseOrderInstallment,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  ChangeStatusDto as PurchaseOrderChangeStatusDto,
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  ChangeStatusInput as PurchaseOrderChangeStatusInput,
} from '@fenix/api-sdk';
export {
  PurchaseOrderStatus,
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  purchaseOrderItemSchema,
  changeStatusSchema as purchaseOrderChangeStatusSchema,
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
  Installment as AccountPayableInstallment,
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
  Installment as AccountReceivableInstallment,
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

// Taxes types
export type {
  Tax,
  CreateTaxDto,
  UpdateTaxDto,
} from '@fenix/api-sdk';

// Certificates types
export type {
  Certificate,
  CreateCertificateDto,
  UpdateCertificateDto,
} from '@fenix/api-sdk';

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
export type {
  NfeConfig,
  CreateNfeConfigDto,
  UpdateNfeConfigDto,
} from '@fenix/api-sdk';

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

