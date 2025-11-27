import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Certificates Service
 * Uses SDK CertificatesApiClient
 */

/**
 * List certificates with pagination and filters
 */
export async function listCertificates(params?: {
  page?: number;
  limit?: number;
  company_id?: string;
  [key: string]: any;
}) {
  try {
    const certificatesClient = SdkClientFactory.getCertificatesClient();
    const response = await certificatesClient.findAll(params || {});
    return response;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single certificate by ID
 */
export async function getCertificate(id: string) {
  try {
    const certificatesClient = SdkClientFactory.getCertificatesClient();
    const certificate = await certificatesClient.findOne(id);
    return certificate;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new certificate
 */
export async function createCertificate(payload: any) {
  try {
    const certificatesClient = SdkClientFactory.getCertificatesClient();
    const certificate = await certificatesClient.create(payload);
    return certificate;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Update an existing certificate
 */
export async function updateCertificate(id: string, payload: Partial<any>) {
  try {
    const certificatesClient = SdkClientFactory.getCertificatesClient();
    const certificate = await certificatesClient.update(id, payload);
    return certificate;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete a certificate
 */
export async function deleteCertificate(id: string) {
  try {
    const certificatesClient = SdkClientFactory.getCertificatesClient();
    await certificatesClient.delete(id);
    return { success: true };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarCertificados = listCertificates;
export const obterCertificado = getCertificate;
export const criarCertificado = createCertificate;
export const atualizarCertificado = updateCertificate;
export const excluirCertificado = deleteCertificate;


