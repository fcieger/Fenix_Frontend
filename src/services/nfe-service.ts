import { SdkClientFactory } from "@/lib/sdk/client-factory";
import { SdkErrorHandler } from "@/lib/sdk/error-handler";
import {
  normalizeListResponse,
  normalizePaginatedResponse,
} from "@/lib/sdk/response-normalizer";

/**
 * NFe Service
 * Uses SDK NfeApiClient
 */

/**
 * List NFes
 */
/**
 * List NFes with pagination and filters
 *
 * NOTE: company_id is handled automatically by JWT token (multi-tenant).
 * Do not pass company_id in params as it's extracted from the token.
 */
export async function listNfes(params?: {
  page?: number;
  limit?: number;
  status?: string;
  [key: string]: any;
}) {
  try {
    const nfeClient = SdkClientFactory.getNfeClient();
    // Remove company_id from params if present (handled by JWT)
    const { company_id, ...cleanParams } = params || {};
    const response = await nfeClient.findAll(cleanParams);
    return response;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single NFe by ID
 */
export async function getNfe(id: string) {
  try {
    const nfeClient = SdkClientFactory.getNfeClient();
    const nfe = await nfeClient.findOne(id);
    return nfe;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new NFe
 */
export async function createNfe(payload: any) {
  try {
    const nfeClient = SdkClientFactory.getNfeClient();
    const nfe = await nfeClient.create(payload);
    return nfe;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Issue an NFe
 */
export async function issueNfe(id: string) {
  try {
    const nfeClient = SdkClientFactory.getNfeClient();
    const nfe = await nfeClient.issue(id);
    return nfe;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Cancel an NFe
 */
export async function cancelNfe(id: string, reason: string) {
  try {
    const nfeClient = SdkClientFactory.getNfeClient();
    const nfe = await nfeClient.cancel(id, reason);
    return nfe;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Sync NFe (legacy function - may use direct API)
 */
export async function syncNfe(id: string) {
  try {
    // Check if SDK has sync method, otherwise use direct API
    const nfeClient = SdkClientFactory.getNfeClient();
    if (typeof (nfeClient as any).sync === "function") {
      return await (nfeClient as any).sync(id);
    }

    // Fallback to direct API call
    const response = await fetch(`/api/nfe/${id}/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || "Error syncing NFe");
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Sync NFe with external API (integration endpoint)
 */
export async function syncNfeIntegration(id: string) {
  try {
    const response = await fetch(`/api/nfe-integration/sincronizar/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();

    if (data.success) {
      return data;
    }
    throw new Error(data.error || "Error syncing NFe");
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Issue NFe with external API (integration endpoint)
 */
export async function issueNfeIntegration(id: string) {
  try {
    const response = await fetch(`/api/nfe-integration/emitir/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();

    if (data.success) {
      return data;
    }
    throw new Error(data.error || "Error issuing NFe");
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Cancel NFe with external API (integration endpoint)
 */
export async function cancelNfeIntegration(id: string, reason: string) {
  try {
    const response = await fetch(`/api/nfe-integration/cancelar/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ justificativa: reason }),
    });
    const data = await response.json();

    if (data.success) {
      return data;
    }
    throw new Error(data.error || "Error canceling NFe");
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Download XML of NFe
 */
export async function downloadNfeXml(id: string) {
  try {
    const response = await fetch(`/api/nfe-integration/xml/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();

    if (data.success || data.xml) {
      return data;
    }
    throw new Error(data.error || "Error downloading XML");
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Download PDF of NFe
 */
export async function downloadNfePdf(id: string) {
  try {
    const response = await fetch(`/api/nfe-integration/pdf/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();

    if (data.success || data.pdf) {
      return data;
    }
    throw new Error(data.error || "Error downloading PDF");
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarNfes = listNfes;
export const obterNfe = getNfe;
export const criarNfe = createNfe;
export const emitirNfe = issueNfe;
export const cancelarNfe = cancelNfe;
export const sincronizarNfe = syncNfe;
