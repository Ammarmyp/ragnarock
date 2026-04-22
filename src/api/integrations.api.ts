/**
 * Organization-scoped integrations API (active org from session / org header).
 */

import type { AxiosResponse } from "axios";
import apiClient from "./client";
import { INTEGRATION_ENDPOINTS } from "./endpoints";
import type { ApiResponse } from "@/types";

function parseResponseData<T>(response: AxiosResponse<unknown>): T {
  const body = response.data as unknown;
  if (
    body &&
    typeof body === "object" &&
    "success" in body &&
    "data" in body &&
    typeof (body as ApiResponse<unknown>).success === "boolean"
  ) {
    return (body as ApiResponse<T>).data;
  }
  return body as T;
}

export type IntegrationProviderKey = "linear" | "figma" | "cursor_workspace";

export type IntegrationAuthMode = "oauth2" | "api_key" | "pat";

export type IntegrationCatalogEntry = {
  provider: IntegrationProviderKey;
  displayName: string;
  description: string;
  authModes: IntegrationAuthMode[];
  connectImplemented: boolean;
};

export type IntegrationConnectionStatus = "active" | "error" | "disconnected";

export type IntegrationListItem = IntegrationCatalogEntry & {
  status: IntegrationConnectionStatus | null;
  lastError: string | null;
  lastVerifiedAt: string | null;
  updatedAt: string | null;
};

export type IntegrationsListResponse = {
  catalog: IntegrationCatalogEntry[];
  connections: IntegrationListItem[];
};

export type ConnectLinearResponse = {
  provider: IntegrationProviderKey;
  status: IntegrationConnectionStatus;
  lastVerifiedAt: string | null;
};

export async function getIntegrations(): Promise<IntegrationsListResponse> {
  const response = await apiClient.get<unknown>(INTEGRATION_ENDPOINTS.LIST);
  return parseResponseData<IntegrationsListResponse>(response);
}

export async function connectLinear(pat: string): Promise<ConnectLinearResponse> {
  const response = await apiClient.post<unknown>(INTEGRATION_ENDPOINTS.LINEAR_CONNECT, { pat });
  return parseResponseData<ConnectLinearResponse>(response);
}

export async function disconnectIntegration(provider: IntegrationProviderKey): Promise<{ disconnected: boolean; provider: string }> {
  const response = await apiClient.delete<unknown>(INTEGRATION_ENDPOINTS.DISCONNECT(provider));
  return parseResponseData<{ disconnected: boolean; provider: string }>(response);
}

export type VerifyIntegrationResponse = {
  ok: boolean;
  provider: IntegrationProviderKey;
  lastVerifiedAt: string | null;
};

export async function verifyIntegration(provider: IntegrationProviderKey): Promise<VerifyIntegrationResponse> {
  const response = await apiClient.post<unknown>(INTEGRATION_ENDPOINTS.VERIFY(provider));
  return parseResponseData<VerifyIntegrationResponse>(response);
}
