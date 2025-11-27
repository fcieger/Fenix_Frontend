import { getApiBaseUrl } from "@/config/api";

/**
 * SDK Client Factory
 * Creates and manages SDK client instances with centralized configuration
 */

/**
 * Token getter function type
 */
export type TokenGetter = () => string | null;

/**
 * Base URL getter function type
 */
export type BaseUrlGetter = () => string;

/**
 * SDK Client Factory
 * Creates and manages SDK client instances with centralized configuration
 */
export class SdkClientFactory {
  private static baseUrl: string;
  private static tokenGetter: TokenGetter;
  private static clients: Map<string, any> = new Map();

  /**
   * Initialize the factory with base URL and token getter
   */
  static initialize(baseUrl: string, tokenGetter: TokenGetter): void {
    SdkClientFactory.baseUrl = baseUrl;
    SdkClientFactory.tokenGetter = tokenGetter;
    // Clear existing clients to force recreation with new config
    SdkClientFactory.clients.clear();
  }

  /**
   * Get SDK module (handles both package name variations)
   */
  private static getSdkModule(): any {
    try {
      return require("@fenix/api-sdk");
    } catch {
      try {
        return require("@fenix/api-sdk");
      } catch {
        throw new Error(
          "SDK package not found. Please install @fenix/api-sdk or @fenix/api-sdk"
        );
      }
    }
  }

  /**
   * Get or create an Auth API client (no token required)
   */
  static getAuthClient(): any {
    const key = "auth";
    if (!SdkClientFactory.clients.has(key)) {
      // Ensure baseUrl is set (initialize if not already done)
      if (!SdkClientFactory.baseUrl) {
        SdkClientFactory.baseUrl = getApiBaseUrl();
      }

      const SdkModule = this.getSdkModule();
      const client = new SdkModule.AuthApiClient(SdkClientFactory.baseUrl);
      SdkClientFactory.clients.set(key, client);
    }
    return SdkClientFactory.clients.get(key);
  }

  /**
   * Get or create a client instance (singleton pattern)
   */
  private static getClient<T>(
    key: string,
    ClientClass: new (baseUrl: string, token: string) => T
  ): T {
    if (!SdkClientFactory.clients.has(key)) {
      // Ensure baseUrl is set (initialize if not already done)
      if (!SdkClientFactory.baseUrl) {
        SdkClientFactory.baseUrl = getApiBaseUrl();
      }

      const token = SdkClientFactory.tokenGetter
        ? SdkClientFactory.tokenGetter()
        : null;
      if (!token) {
        throw new Error(`Token required for ${key} client`);
      }
      const client = new ClientClass(SdkClientFactory.baseUrl, token);
      SdkClientFactory.clients.set(key, client);
    }
    return SdkClientFactory.clients.get(key);
  }

  /**
   * Get Products API client
   */
  static getProductsClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient("products", SdkModule.ProductsApiClient);
  }

  /**
   * Get Partners API client
   */
  static getPartnersClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient("partners", SdkModule.PartnersApiClient);
  }

  /**
   * Get Quotes API client
   */
  static getQuotesClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient("quotes", SdkModule.QuotesApiClient);
  }

  /**
   * Get Sales Orders API client
   */
  static getSalesOrdersClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient("salesOrders", SdkModule.SalesOrdersApiClient);
  }

  /**
   * Get Purchase Orders API client
   */
  static getPurchaseOrdersClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient("purchaseOrders", SdkModule.PurchaseOrdersApiClient);
  }

  /**
   * Get Financial Accounts API client
   */
  static getFinancialAccountsClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient(
      "financialAccounts",
      SdkModule.FinancialAccountsApiClient
    );
  }

  /**
   * Get Accounts Payable API client
   */
  static getAccountsPayableClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient(
      "accountsPayable",
      SdkModule.AccountsPayableApiClient
    );
  }

  /**
   * Get Accounts Receivable API client
   */
  static getAccountsReceivableClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient(
      "accountsReceivable",
      SdkModule.AccountsReceivableApiClient
    );
  }

  /**
   * Get Stock API client
   */
  static getStockClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient("stock", SdkModule.StockApiClient);
  }

  /**
   * Get Taxes API client
   */
  static getTaxesClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient("taxes", SdkModule.TaxesApiClient);
  }

  /**
   * Get NFe API client
   */
  static getNfeClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient("nfe", SdkModule.NfeApiClient);
  }

  /**
   * Get Payment Terms API client
   */
  static getPaymentTermsClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient("paymentTerms", SdkModule.PaymentTermsApiClient);
  }

  /**
   * Get API Keys API client
   */
  static getApiKeysClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient("apiKeys", SdkModule.ApiKeysApiClient);
  }

  /**
   * Get Certificates API client
   */
  static getCertificatesClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient("certificates", SdkModule.CertificatesApiClient);
  }

  /**
   * Get Companies Users API client
   */
  static getCompaniesUsersClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient("companiesUsers", SdkModule.CompaniesUsersApiClient);
  }

  /**
   * Get Invitations API client
   */
  static getInvitationsClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient("invitations", SdkModule.InvitationsApiClient);
  }

  /**
   * Get NFe Config API client
   */
  static getNfeConfigClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient("nfeConfig", SdkModule.NfeConfigApiClient);
  }

  /**
   * Get Operation Nature API client
   */
  static getOperationNatureClient(): any {
    const SdkModule = this.getSdkModule();
    return this.getClient(
      "operationNature",
      SdkModule.OperationNatureApiClient
    );
  }

  /**
   * Get Plans API client (no token required)
   */
  static getPlansClient(): any {
    const key = "plans";
    if (!SdkClientFactory.clients.has(key)) {
      // Ensure baseUrl is set (initialize if not already done)
      if (!SdkClientFactory.baseUrl) {
        SdkClientFactory.baseUrl = getApiBaseUrl();
      }

      const SdkModule = this.getSdkModule();
      const client = new SdkModule.PlansApiClient(SdkClientFactory.baseUrl);
      SdkClientFactory.clients.set(key, client);
    }
    return SdkClientFactory.clients.get(key);
  }

  /**
   * Clear all client instances (useful for testing or token refresh)
   */
  static clearClients(): void {
    SdkClientFactory.clients.clear();
  }

  /**
   * Clear a specific client instance
   */
  static clearClient(key: string): void {
    SdkClientFactory.clients.delete(key);
  }
}
