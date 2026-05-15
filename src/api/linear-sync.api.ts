import type { AxiosResponse } from "axios";
import apiClient from "./client";
import { INTEGRATION_ENDPOINTS, LINEAR_SYNC_ENDPOINTS } from "./endpoints";
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

export type LinearTeam = { id: string; name: string };
export type LinearProject = { id: string; name: string };

export type LinearProjectMappingStatus = {
  linearProjectId: string;
  linearTeamId: string;
  linearProjectName: string | null;
  lastSyncAt: string | null;
  lastImportAt: string | null;
  lastExportAt: string | null;
  syncStatus: "idle" | "syncing" | "error";
  lastSyncError: string | null;
  autoSyncEnabled: boolean;
};

export type LinearProjectStatusResponse = {
  linearConnected: boolean;
  connectionStatus: string | null;
  connectionLastError: string | null;
  mapping: LinearProjectMappingStatus | null;
};

export type SyncStats = {
  created: number;
  updated: number;
  skipped: number;
  failed: number;
};

export type SyncActionResponse = {
  syncRunId?: string;
  stats: SyncStats;
  export?: SyncStats;
  import?: SyncStats;
};

export type LinearSyncRun = {
  id: string;
  type: "import" | "export" | "sync";
  status: "pending" | "running" | "completed" | "failed" | "partial";
  startedAt: string;
  finishedAt: string | null;
  stats: SyncStats | { export?: SyncStats; import?: SyncStats } | null;
  error: string | null;
};

export type PaginatedLinearSyncRuns = {
  data: LinearSyncRun[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export const LINEAR_ERROR_CODES = {
  NOT_CONNECTED: "LINEAR_NOT_CONNECTED",
  NOT_LINKED: "LINEAR_NOT_LINKED",
  SYNC_IN_PROGRESS: "LINEAR_SYNC_IN_PROGRESS",
} as const;

export function isLinearErrorCode(err: unknown, code: string): boolean {
  if (!err || typeof err !== "object") return false;
  const response = (err as { response?: { data?: { code?: string; message?: string } } }).response;
  return response?.data?.code === code;
}

export async function getLinearTeams(): Promise<{ teams: LinearTeam[] }> {
  const response = await apiClient.get<unknown>(INTEGRATION_ENDPOINTS.LINEAR_TEAMS);
  return parseResponseData<{ teams: LinearTeam[] }>(response);
}

export async function getLinearProjects(teamId: string): Promise<{ projects: LinearProject[] }> {
  const response = await apiClient.get<unknown>(INTEGRATION_ENDPOINTS.LINEAR_PROJECTS, {
    params: { teamId },
  });
  return parseResponseData<{ projects: LinearProject[] }>(response);
}

export async function getLinearProjectStatus(
  projectId: string,
): Promise<LinearProjectStatusResponse> {
  const response = await apiClient.get<unknown>(LINEAR_SYNC_ENDPOINTS.STATUS(projectId));
  return parseResponseData<LinearProjectStatusResponse>(response);
}

export async function linkLinearProject(
  projectId: string,
  body: { linearProjectId: string; linearTeamId: string },
): Promise<{ linearProjectId: string; linearTeamId: string; linearProjectName: string | null }> {
  const response = await apiClient.put<unknown>(LINEAR_SYNC_ENDPOINTS.LINK(projectId), body);
  return parseResponseData(response);
}

export async function unlinkLinearProject(projectId: string): Promise<{ unlinked: boolean }> {
  const response = await apiClient.delete<unknown>(LINEAR_SYNC_ENDPOINTS.LINK(projectId));
  return parseResponseData(response);
}

export async function updateLinearSettings(
  projectId: string,
  body: { autoSyncEnabled?: boolean },
): Promise<{ autoSyncEnabled: boolean; defaultLinearStateId: string | null }> {
  const response = await apiClient.patch<unknown>(LINEAR_SYNC_ENDPOINTS.SETTINGS(projectId), body);
  return parseResponseData(response);
}

export async function importFromLinear(projectId: string): Promise<SyncActionResponse> {
  const response = await apiClient.post<unknown>(LINEAR_SYNC_ENDPOINTS.IMPORT(projectId));
  return parseResponseData(response);
}

export async function exportToLinear(projectId: string): Promise<SyncActionResponse> {
  const response = await apiClient.post<unknown>(LINEAR_SYNC_ENDPOINTS.EXPORT(projectId));
  return parseResponseData(response);
}

export async function syncWithLinear(projectId: string): Promise<SyncActionResponse> {
  const response = await apiClient.post<unknown>(LINEAR_SYNC_ENDPOINTS.SYNC(projectId));
  return parseResponseData(response);
}

export async function getLinearSyncRuns(
  projectId: string,
  params: { page?: number; limit?: number } = {},
): Promise<PaginatedLinearSyncRuns> {
  const response = await apiClient.get<unknown>(LINEAR_SYNC_ENDPOINTS.SYNC_RUNS(projectId), {
    params: { page: params.page ?? 1, limit: params.limit ?? 10 },
  });
  return parseResponseData<PaginatedLinearSyncRuns>(response);
}
