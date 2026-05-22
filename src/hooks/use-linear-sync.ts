import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  exportToLinear,
  getLinearProjectStatus,
  getLinearProjects,
  getLinearSyncRuns,
  getLinearTeams,
  importFromLinear,
  linkLinearProject,
  syncWithLinear,
  unlinkLinearProject,
  updateLinearSettings,
  type LinearProjectStatusResponse,
  type PaginatedLinearSyncRuns,
  type SyncActionResponse,
} from "@/api/linear-sync.api";
import { invalidateProjectTaskQueries } from "./use-projects";

export const linearSyncKeys = {
  all: ["linear-sync"] as const,
  status: (projectId: string) => [...linearSyncKeys.all, "status", projectId] as const,
  teams: () => [...linearSyncKeys.all, "teams"] as const,
  projects: (teamId: string) => [...linearSyncKeys.all, "projects", teamId] as const,
  runs: (projectId: string, page: number, limit: number) =>
    [...linearSyncKeys.all, "runs", projectId, page, limit] as const,
};

export function useLinearProjectStatus(
  projectId: string,
  options?: Omit<UseQueryOptions<LinearProjectStatusResponse, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: linearSyncKeys.status(projectId),
    queryFn: () => getLinearProjectStatus(projectId),
    enabled: Boolean(projectId),
    ...options,
  });
}

export function useLinearTeams(
  enabled: boolean,
  options?: Omit<UseQueryOptions<{ teams: { id: string; name: string }[] }, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: linearSyncKeys.teams(),
    queryFn: () => getLinearTeams(),
    enabled,
    ...options,
  });
}

export function useLinearProjects(
  teamId: string,
  options?: Omit<
    UseQueryOptions<{ projects: { id: string; name: string }[] }, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: linearSyncKeys.projects(teamId),
    queryFn: () => getLinearProjects(teamId),
    enabled: Boolean(teamId),
    ...options,
  });
}

export function useLinearSyncRuns(
  projectId: string,
  params: { page?: number; limit?: number } = {},
  options?: Omit<UseQueryOptions<PaginatedLinearSyncRuns, Error>, "queryKey" | "queryFn">,
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  return useQuery({
    queryKey: linearSyncKeys.runs(projectId, page, limit),
    queryFn: () => getLinearSyncRuns(projectId, { page, limit }),
    enabled: Boolean(projectId),
    ...options,
  });
}

function useInvalidateLinear(projectId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: linearSyncKeys.status(projectId) });
    queryClient.invalidateQueries({ queryKey: [...linearSyncKeys.all, "runs", projectId] });
    invalidateProjectTaskQueries(queryClient, projectId);
  };
}

export function useLinkLinearProject(
  projectId: string,
  options?: UseMutationOptions<
    { linearProjectId: string; linearTeamId: string; linearProjectName: string | null },
    Error,
    { linearProjectId: string; linearTeamId: string }
  >,
) {
  const invalidate = useInvalidateLinear(projectId);
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (body) => linkLinearProject(projectId, body),
    onSuccess: (data, variables, ctx, meta) => {
      invalidate();
      onSuccess?.(data, variables, ctx, meta);
    },
  });
}

export function useUnlinkLinearProject(
  projectId: string,
  options?: UseMutationOptions<{ unlinked: boolean }, Error, void>,
) {
  const invalidate = useInvalidateLinear(projectId);
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: () => unlinkLinearProject(projectId),
    onSuccess: (data, variables, ctx, meta) => {
      invalidate();
      onSuccess?.(data, variables, ctx, meta);
    },
  });
}

export function useUpdateLinearSettings(
  projectId: string,
  options?: UseMutationOptions<
    { autoSyncEnabled: boolean; defaultLinearStateId: string | null },
    Error,
    { autoSyncEnabled?: boolean }
  >,
) {
  const invalidate = useInvalidateLinear(projectId);
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (body) => updateLinearSettings(projectId, body),
    onSuccess: (data, variables, ctx, meta) => {
      invalidate();
      onSuccess?.(data, variables, ctx, meta);
    },
  });
}

export function useLinearImport(
  projectId: string,
  options?: UseMutationOptions<SyncActionResponse, Error, void>,
) {
  const invalidate = useInvalidateLinear(projectId);
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: () => importFromLinear(projectId),
    onSuccess: (data, variables, ctx, meta) => {
      invalidate();
      onSuccess?.(data, variables, ctx, meta);
    },
  });
}

export function useLinearExport(
  projectId: string,
  options?: UseMutationOptions<SyncActionResponse, Error, void>,
) {
  const invalidate = useInvalidateLinear(projectId);
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: () => exportToLinear(projectId),
    onSuccess: (data, variables, ctx, meta) => {
      invalidate();
      onSuccess?.(data, variables, ctx, meta);
    },
  });
}

export function useLinearSync(
  projectId: string,
  options?: UseMutationOptions<SyncActionResponse, Error, void>,
) {
  const invalidate = useInvalidateLinear(projectId);
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: () => syncWithLinear(projectId),
    onSuccess: (data, variables, ctx, meta) => {
      invalidate();
      onSuccess?.(data, variables, ctx, meta);
    },
  });
}
