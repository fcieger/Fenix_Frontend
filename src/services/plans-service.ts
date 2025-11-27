import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Plans Service
 * Uses SDK PlansApiClient (no token required)
 */

/**
 * List plans
 */
export async function listPlans(params?: {
  [key: string]: any;
}) {
  try {
    const plansClient = SdkClientFactory.getPlansClient();
    const response = await plansClient.findAll(params || {});
    return response;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single plan by ID
 */
export async function getPlan(id: string) {
  try {
    const plansClient = SdkClientFactory.getPlansClient();
    const plan = await plansClient.findOne(id);
    return plan;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarPlanos = listPlans;
export const obterPlano = getPlan;


