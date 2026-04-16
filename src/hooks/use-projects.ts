import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import {
  addProjectMember,
  createProject,
  createProjectDocumentation,
  createProjectRequirement,
  createProjectTask,
  deleteProject,
  deleteProjectDocumentation,
  deleteProjectRequirement,
  deleteProjectTask,
  getProject,
  getProjectActivity,
  getProjectDocumentations,
  getProjectMembers,
  getProjectOverview,
  getProjectRequirements,
  getProjectRole,
  getProjects,
  getProjectTasks,
  removeProjectMember,
  updateProject,
  updateProjectDocumentation,
  updateProjectMemberRole,
  updateProjectRequirement,
  updateProjectTask,
  type AddProjectMemberDto,
  type CreateProjectDocumentationDto,
  type CreateProjectDto,
  type CreateProjectRequirementDto,
  type CreateProjectTaskDto,
  type Project,
  type ProjectActivity,
  type ProjectDocumentation,
  type ProjectMember,
  type ProjectRequirement,
  type ProjectRoleSummary,
  type ProjectTask,
  type UpdateProjectDocumentationDto,
  type UpdateProjectDto,
  type UpdateProjectRequirementDto,
  type UpdateProjectTaskDto,
} from "@/api/projects.api";
import type { PaginatedResponse, PaginationParams } from "@/types";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params: PaginationParams & { status?: Project["status"]; search?: string }) =>
    [...projectKeys.lists(), params] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
  role: (id: string) => [...projectKeys.detail(id), "role"] as const,
  overview: (id: string) => [...projectKeys.detail(id), "overview"] as const,
  members: (id: string) => [...projectKeys.detail(id), "members"] as const,
  tasks: (id: string, params: PaginationParams & { status?: ProjectTask["status"] }) =>
    [...projectKeys.detail(id), "tasks", params] as const,
  documentations: (id: string, params: PaginationParams & { type?: ProjectDocumentation["type"] }) =>
    [...projectKeys.detail(id), "documentations", params] as const,
  requirements: (id: string, params: PaginationParams & { status?: ProjectRequirement["status"] }) =>
    [...projectKeys.detail(id), "requirements", params] as const,
  activity: (id: string, params: PaginationParams) => [...projectKeys.detail(id), "activity", params] as const,
};

export function useProjects(params: PaginationParams & { status?: Project["status"]; search?: string }, options?: Omit<UseQueryOptions<PaginatedResponse<Project>, Error>, "queryKey" | "queryFn">) {
  return useQuery({ queryKey: projectKeys.list(params), queryFn: () => getProjects(params), ...options });
}
export function useProject(id: string, options?: Omit<UseQueryOptions<Project, Error>, "queryKey" | "queryFn">) {
  return useQuery({ queryKey: projectKeys.detail(id), queryFn: () => getProject(id), enabled: !!id, ...options });
}
export function useProjectRole(id: string, options?: Omit<UseQueryOptions<ProjectRoleSummary, Error>, "queryKey" | "queryFn">) {
  return useQuery({ queryKey: projectKeys.role(id), queryFn: () => getProjectRole(id), enabled: !!id, ...options });
}
export function useProjectOverview(id: string, options?: Omit<UseQueryOptions<Record<string, unknown>, Error>, "queryKey" | "queryFn">) {
  return useQuery({ queryKey: projectKeys.overview(id), queryFn: () => getProjectOverview(id), enabled: !!id, ...options });
}
export function useProjectMembers(id: string, options?: Omit<UseQueryOptions<ProjectMember[], Error>, "queryKey" | "queryFn">) {
  return useQuery({ queryKey: projectKeys.members(id), queryFn: () => getProjectMembers(id), enabled: !!id, ...options });
}
export function useProjectTasks(id: string, params: PaginationParams & { status?: ProjectTask["status"] }, options?: Omit<UseQueryOptions<PaginatedResponse<ProjectTask>, Error>, "queryKey" | "queryFn">) {
  return useQuery({ queryKey: projectKeys.tasks(id, params), queryFn: () => getProjectTasks(id, params), enabled: !!id, ...options });
}
export function useProjectDocumentations(id: string, params: PaginationParams & { type?: ProjectDocumentation["type"] }, options?: Omit<UseQueryOptions<PaginatedResponse<ProjectDocumentation>, Error>, "queryKey" | "queryFn">) {
  return useQuery({ queryKey: projectKeys.documentations(id, params), queryFn: () => getProjectDocumentations(id, params), enabled: !!id, ...options });
}
export function useProjectRequirements(id: string, params: PaginationParams & { status?: ProjectRequirement["status"] }, options?: Omit<UseQueryOptions<PaginatedResponse<ProjectRequirement>, Error>, "queryKey" | "queryFn">) {
  return useQuery({ queryKey: projectKeys.requirements(id, params), queryFn: () => getProjectRequirements(id, params), enabled: !!id, ...options });
}
export function useProjectActivity(id: string, params: PaginationParams, options?: Omit<UseQueryOptions<PaginatedResponse<ProjectActivity>, Error>, "queryKey" | "queryFn">) {
  return useQuery({ queryKey: projectKeys.activity(id, params), queryFn: () => getProjectActivity(id, params), enabled: !!id, ...options });
}

export function useCreateProject(options?: UseMutationOptions<Project, Error, CreateProjectDto>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createProject, onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.lists() }), ...options });
}
export function useUpdateProject(options?: UseMutationOptions<Project, Error, { id: string; data: UpdateProjectDto }>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }) => updateProject(id, data), onSuccess: (_d, v) => { queryClient.invalidateQueries({ queryKey: projectKeys.detail(v.id) }); queryClient.invalidateQueries({ queryKey: projectKeys.lists() }); }, ...options });
}
export function useDeleteProject(options?: UseMutationOptions<void, Error, string>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: deleteProject, onSuccess: (_d, id) => { queryClient.removeQueries({ queryKey: projectKeys.detail(id) }); queryClient.invalidateQueries({ queryKey: projectKeys.lists() }); }, ...options });
}
export function useAddProjectMember(options?: UseMutationOptions<ProjectMember, Error, { id: string; data: AddProjectMemberDto }>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }) => addProjectMember(id, data), onSuccess: (_d, v) => queryClient.invalidateQueries({ queryKey: projectKeys.members(v.id) }), ...options });
}
export function useUpdateProjectMemberRole(options?: UseMutationOptions<ProjectMember, Error, { projectId: string; userId: string; role: ProjectMember["role"] }>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ projectId, userId, role }) => updateProjectMemberRole(projectId, userId, role), onSuccess: (_d, v) => queryClient.invalidateQueries({ queryKey: projectKeys.members(v.projectId) }), ...options });
}
export function useRemoveProjectMember(options?: UseMutationOptions<void, Error, { projectId: string; userId: string }>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ projectId, userId }) => removeProjectMember(projectId, userId), onSuccess: (_d, v) => queryClient.invalidateQueries({ queryKey: projectKeys.members(v.projectId) }), ...options });
}
export function useCreateProjectTask(options?: UseMutationOptions<ProjectTask, Error, { projectId: string; data: CreateProjectTaskDto }>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ projectId, data }) => createProjectTask(projectId, data), onSuccess: (_d, v) => queryClient.invalidateQueries({ queryKey: [...projectKeys.detail(v.projectId), "tasks"] }), ...options });
}
export function useCreateProjectDocumentation(options?: UseMutationOptions<ProjectDocumentation, Error, { projectId: string; data: CreateProjectDocumentationDto }>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ projectId, data }) => createProjectDocumentation(projectId, data), onSuccess: (_d, v) => queryClient.invalidateQueries({ queryKey: [...projectKeys.detail(v.projectId), "documentations"] }), ...options });
}
export function useCreateProjectRequirement(options?: UseMutationOptions<ProjectRequirement, Error, { projectId: string; data: CreateProjectRequirementDto }>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ projectId, data }) => createProjectRequirement(projectId, data), onSuccess: (_d, v) => queryClient.invalidateQueries({ queryKey: [...projectKeys.detail(v.projectId), "requirements"] }), ...options });
}
export function useUpdateProjectTask(options?: UseMutationOptions<ProjectTask, Error, { projectId: string; taskId: string; data: UpdateProjectTaskDto }>) {
  return useMutation({ mutationFn: ({ projectId, taskId, data }) => updateProjectTask(projectId, taskId, data), ...options });
}
export function useUpdateProjectDocumentation(options?: UseMutationOptions<ProjectDocumentation, Error, { projectId: string; documentationId: string; data: UpdateProjectDocumentationDto }>) {
  return useMutation({ mutationFn: ({ projectId, documentationId, data }) => updateProjectDocumentation(projectId, documentationId, data), ...options });
}
export function useUpdateProjectRequirement(options?: UseMutationOptions<ProjectRequirement, Error, { projectId: string; requirementId: string; data: UpdateProjectRequirementDto }>) {
  return useMutation({ mutationFn: ({ projectId, requirementId, data }) => updateProjectRequirement(projectId, requirementId, data), ...options });
}
export function useDeleteProjectTask(options?: UseMutationOptions<void, Error, { projectId: string; taskId: string }>) {
  return useMutation({ mutationFn: ({ projectId, taskId }) => deleteProjectTask(projectId, taskId), ...options });
}
export function useDeleteProjectDocumentation(options?: UseMutationOptions<void, Error, { projectId: string; documentationId: string }>) {
  return useMutation({ mutationFn: ({ projectId, documentationId }) => deleteProjectDocumentation(projectId, documentationId), ...options });
}
export function useDeleteProjectRequirement(options?: UseMutationOptions<void, Error, { projectId: string; requirementId: string }>) {
  return useMutation({ mutationFn: ({ projectId, requirementId }) => deleteProjectRequirement(projectId, requirementId), ...options });
}
