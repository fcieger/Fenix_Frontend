import { SdkClientManager } from "./client-manager";
import { getApiBaseUrl, getToken } from "@/config/api";

/**
 * Initialize SDK clients
 * Should be called once at app startup (client-side)
 */
export function initializeSdk(): void {
  if (typeof window === "undefined") {
    // Server-side: don't initialize
    return;
  }

  const baseUrl = getApiBaseUrl();
  const tokenGetter = getToken;

  SdkClientManager.initialize(baseUrl, tokenGetter);
}
