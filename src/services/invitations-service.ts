import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Invitations Service
 * Uses SDK InvitationsApiClient
 */

/**
 * List invitations with pagination and filters
 */
export async function listInvitations(params?: {
  page?: number;
  limit?: number;
  company_id?: string;
  status?: string;
  [key: string]: any;
}) {
  try {
    const invitationsClient = SdkClientFactory.getInvitationsClient();
    const response = await invitationsClient.findAll(params || {});
    return response;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single invitation by ID
 */
export async function getInvitation(id: string) {
  try {
    const invitationsClient = SdkClientFactory.getInvitationsClient();
    const invitation = await invitationsClient.findOne(id);
    return invitation;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new invitation
 */
export async function createInvitation(payload: any) {
  try {
    const invitationsClient = SdkClientFactory.getInvitationsClient();
    const invitation = await invitationsClient.create(payload);
    return invitation;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Update an existing invitation
 */
export async function updateInvitation(id: string, payload: Partial<any>) {
  try {
    const invitationsClient = SdkClientFactory.getInvitationsClient();
    const invitation = await invitationsClient.update(id, payload);
    return invitation;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete an invitation
 */
export async function deleteInvitation(id: string) {
  try {
    const invitationsClient = SdkClientFactory.getInvitationsClient();
    await invitationsClient.delete(id);
    return { success: true };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(id: string) {
  try {
    const invitationsClient = SdkClientFactory.getInvitationsClient();
    if (typeof (invitationsClient as any).accept === 'function') {
      return await (invitationsClient as any).accept(id);
    }
    // Fallback: update status
    return await updateInvitation(id, { status: 'accepted' });
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Reject an invitation
 */
export async function rejectInvitation(id: string) {
  try {
    const invitationsClient = SdkClientFactory.getInvitationsClient();
    if (typeof (invitationsClient as any).reject === 'function') {
      return await (invitationsClient as any).reject(id);
    }
    // Fallback: update status
    return await updateInvitation(id, { status: 'rejected' });
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarConvites = listInvitations;
export const obterConvite = getInvitation;
export const criarConvite = createInvitation;
export const atualizarConvite = updateInvitation;
export const excluirConvite = deleteInvitation;
export const aceitarConvite = acceptInvitation;
export const rejeitarConvite = rejectInvitation;


