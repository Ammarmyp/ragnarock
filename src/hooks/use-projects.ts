/**
 * Projects React Query Hooks
 * Custom hooks for project-related data fetching and mutations
 * Uses TanStack Query for server state management
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  restoreProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  type Project,
  type CreateProjectDto,
  type UpdateProjectDto,
  type ProjectMember,
  type AddProjectMemberDto,
} from "@/api/projects.api";
import type { PaginatedResponse, PaginationParams } from "@/types";
import { getErrorMessage } from "@/api/client";

/**
 * Query Keys for Projects
 * Centralized query key management for better cache control
 */
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (
    params: PaginationParams & { status?: Project["status"]; search?: string },
  ) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  members: (id: string) => [...projectKeys.detail(id), "members"] as const,
};

/**
 * Hook to fetch paginated list of projects
 * @param params - Pagination and filter parameters
 * @param options - React Query options
 */
export function useProjects(
  params: PaginationParams & { status?: Project["status"]; search?: string },
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Project>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => getProjects(params),
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook to fetch a single project by ID
 * @param id - Project ID
 * @param options - React Query options
 */
export function useProject(
  id: string,
  options?: Omit<UseQueryOptions<Project, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProject(id),
    enabled: !!id, // Only fetch if ID is provided
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook to fetch project members
 * @param id - Project ID
 * @param options - React Query options
 */
export function useProjectMembers(
  id: string,
  options?: Omit<
    UseQueryOptions<ProjectMember[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: projectKeys.members(id),
    queryFn: () => getProjectMembers(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    ...options,
  });
}

/**
 * Hook to create a new project
 * @param options - React Query mutation options
 */
export function useCreateProject(
  options?: UseMutationOptions<Project, Error, CreateProjectDto>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: (data, variables, context) => {
      // Invalidate projects list to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to create project:", getErrorMessage(error));
    },
    ...options,
  });
}

/**
 * Hook to update an existing project
 * @param options - React Query mutation options
 */
export function useUpdateProject(
  options?: UseMutationOptions<
    Project,
    Error,
    { id: string; data: UpdateProjectDto }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateProject(id, data),
    onSuccess: (data, variables) => {
      // Update the specific project in cache
      queryClient.setQueryData(projectKeys.detail(variables.id), data);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to update project:", getErrorMessage(error));
    },
    ...options,
  });
}

/**
 * Hook to delete a project
 * @param options - React Query mutation options
 */
export function useDeleteProject(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (data, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to delete project:", getErrorMessage(error));
    },
    ...options,
  });
}

/**
 * Hook to archive a project
 * @param options - React Query mutation options
 */
export function useArchiveProject(
  options?: UseMutationOptions<Project, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveProject,
    onSuccess: (data, id) => {
      // Update the specific project in cache
      queryClient.setQueryData(projectKeys.detail(id), data);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to archive project:", getErrorMessage(error));
    },
    ...options,
  });
}

/**
 * Hook to restore an archived project
 * @param options - React Query mutation options
 */
export function useRestoreProject(
  options?: UseMutationOptions<Project, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreProject,
    onSuccess: (data, id) => {
      // Update the specific project in cache
      queryClient.setQueryData(projectKeys.detail(id), data);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to restore project:", getErrorMessage(error));
    },
    ...options,
  });
}

/**
 * Hook to add a member to a project
 * @param options - React Query mutation options
 */
export function useAddProjectMember(
  options?: UseMutationOptions<
    ProjectMember,
    Error,
    { id: string; data: AddProjectMemberDto }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => addProjectMember(id, data),
    onSuccess: (data, variables) => {
      // Invalidate members list to refetch
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(variables.id),
      });
      // Update project member count
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.id),
      });
    },
    onError: (error) => {
      console.error("Failed to add project member:", getErrorMessage(error));
    },
    ...options,
  });
}

/**
 * Hook to remove a member from a project
 * @param options - React Query mutation options
 */
export function useRemoveProjectMember(
  options?: UseMutationOptions<
    void,
    Error,
    { projectId: string; memberId: string }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, memberId }) =>
      removeProjectMember(projectId, memberId),
    onSuccess: (data, variables) => {
      // Invalidate members list to refetch
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(variables.projectId),
      });
      // Update project member count
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.projectId),
      });
    },
    onError: (error) => {
      console.error("Failed to remove project member:", getErrorMessage(error));
    },
    ...options,
  });
}
