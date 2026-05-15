import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  addProjectMember,
  createProject,
  createProjectDocumentation,
  generateProjectArchDoc,
  createProjectRequirement,
  createProjectSkill,
  createProjectTask,
  deleteProject,
  deleteProjectDocumentation,
  deleteProjectRequirement,
  deleteProjectSkill,
  deleteProjectTask,
  getProject,
  getProjectActivity,
  getProjectDocumentation,
  getProjectDocumentations,
  getProjectMembers,
  getProjectOverview,
  getProjectRequirements,
  getProjectRole,
  getProjects,
  getProjectSkill,
  getProjectSkills,
  getProjectTask,
  getProjectTasks,
  reorderProjectTasks,
  removeProjectMember,
  updateProject,
  updateProjectDocumentation,
  updateProjectMemberRole,
  updateProjectMemberPersona,
  updateProjectRequirement,
  updateProjectSkill,
  updateProjectTask,
  type AddProjectMemberDto,
  type CreateProjectDocumentationDto,
  type CreateProjectDto,
  type ListProjectDocumentationsParams,
  type CreateProjectRequirementDto,
  type CreateProjectSkillDto,
  type CreateProjectTaskDto,
  type ListProjectActivityParams,
  type ListProjectTasksParams,
  type Project,
  type ProjectActivity,
  type ProjectOverviewResponse,
  type ProjectDocumentation,
  type ProjectMember,
  type ProjectPersona,
  type ProjectRequirement,
  type ProjectRoleSummary,
  type ProjectSkill,
  type ProjectSkillListItem,
  type ProjectTask,
  type UpdateProjectDocumentationDto,
  type UpdateProjectDto,
  type UpdateProjectRequirementDto,
  type UpdateProjectSkillDto,
  type ReorderProjectTasksDto,
  type UpdateProjectTaskDto,
  type ArchDocQueuedResponse,
  type GenerateArchDocDto,
  type ArchDocType,
} from "@/api/projects.api";
import type { PaginatedResponse, PaginatedResponseBase, PaginationParams } from "@/types";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params: PaginationParams & { status?: Project["status"]; search?: string }) =>
    [...projectKeys.lists(), params] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
  role: (id: string) => [...projectKeys.detail(id), "role"] as const,
  overview: (id: string) => [...projectKeys.detail(id), "overview"] as const,
  members: (id: string) => [...projectKeys.detail(id), "members"] as const,
  tasks: (id: string, params: ListProjectTasksParams) => [...projectKeys.detail(id), "tasks", params] as const,
  task: (projectId: string, taskId: string) => [...projectKeys.detail(projectId), "task", taskId] as const,
  documentations: (id: string, params: ListProjectDocumentationsParams) =>
    [...projectKeys.detail(id), "documentations", params] as const,
  documentation: (projectId: string, documentationId: string) =>
    [...projectKeys.detail(projectId), "documentation", documentationId] as const,
  requirements: (id: string, params: PaginationParams & { status?: ProjectRequirement["status"] }) =>
    [...projectKeys.detail(id), "requirements", params] as const,
  activity: (id: string, params: PaginationParams) => [...projectKeys.detail(id), "activity", params] as const,
  skills: (id: string) => [...projectKeys.detail(id), "skills"] as const,
  skill: (projectId: string, skillId: string) => [...projectKeys.detail(projectId), "skill", skillId] as const,
  aiChatSessions: (projectId: string, params: PaginationParams) =>
    [...projectKeys.detail(projectId), "ai-chat-sessions", params] as const,
  aiChatMessages: (projectId: string, sessionId: string, params: PaginationParams) =>
    [...projectKeys.detail(projectId), "ai-chat-messages", sessionId, params] as const,
  specifications: (projectId: string, params: PaginationParams) =>
    [...projectKeys.detail(projectId), "specifications", params] as const,
  aiDraft: (projectId: string) => [...projectKeys.detail(projectId), "ai-draft"] as const,
};

export function invalidateProjectOverview(queryClient: QueryClient, projectId: string) {
  queryClient.invalidateQueries({ queryKey: projectKeys.overview(projectId) });
}

/** Refetch documentation list, optional detail, and project overview after doc CRUD. */
export function invalidateProjectDocumentationQueries(
  queryClient: QueryClient,
  projectId: string,
  documentationId?: string,
) {
  queryClient.invalidateQueries({ queryKey: [...projectKeys.detail(projectId), "documentations"] });
  if (documentationId) {
    queryClient.invalidateQueries({ queryKey: projectKeys.documentation(projectId, documentationId) });
  }
  invalidateProjectOverview(queryClient, projectId);
}

/** Refetch task lists, optional single task, and overview after task CRUD or reorder. */
export function invalidateProjectTaskQueries(queryClient: QueryClient, projectId: string, taskId?: string) {
  queryClient.invalidateQueries({ queryKey: [...projectKeys.detail(projectId), "tasks"] });
  if (taskId) {
    queryClient.invalidateQueries({ queryKey: projectKeys.task(projectId, taskId) });
  }
  invalidateProjectOverview(queryClient, projectId);
}

export function invalidateProjectSkillQueries(queryClient: QueryClient, projectId: string, skillId?: string) {
  queryClient.invalidateQueries({ queryKey: projectKeys.skills(projectId) });
  if (skillId) {
    queryClient.invalidateQueries({ queryKey: projectKeys.skill(projectId, skillId) });
  }
}

export function useProjects(params: PaginationParams & { status?: Project["status"]; search?: string }, options?: Omit<UseQueryOptions<PaginatedResponse<Project>, Error>, "queryKey" | "queryFn">) {
  return useQuery({ queryKey: projectKeys.list(params), queryFn: () => getProjects(params), ...options });
}
export function useProject(id: string, options?: Omit<UseQueryOptions<Project, Error>, "queryKey" | "queryFn">) {
  return useQuery({ queryKey: projectKeys.detail(id), queryFn: () => getProject(id), enabled: !!id, ...options });
}
export function useProjectRole(id: string, options?: Omit<UseQueryOptions<ProjectRoleSummary, Error>, "queryKey" | "queryFn">) {
  return useQuery({ queryKey: projectKeys.role(id), queryFn: () => getProjectRole(id), enabled: !!id, ...options });
}
export function useProjectOverview(
  id: string,
  options?: Omit<UseQueryOptions<ProjectOverviewResponse, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({ queryKey: projectKeys.overview(id), queryFn: () => getProjectOverview(id), enabled: !!id, ...options });
}
export function useProjectMembers(id: string, options?: Omit<UseQueryOptions<ProjectMember[], Error>, "queryKey" | "queryFn">) {
  return useQuery({ queryKey: projectKeys.members(id), queryFn: () => getProjectMembers(id), enabled: !!id, ...options });
}
export function useProjectTasks(
  id: string,
  params: ListProjectTasksParams,
  options?: Omit<UseQueryOptions<PaginatedResponse<ProjectTask>, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({ queryKey: projectKeys.tasks(id, params), queryFn: () => getProjectTasks(id, params), enabled: !!id, ...options });
}

export function useProjectTask(
  projectId: string,
  taskId: string,
  options?: Omit<UseQueryOptions<ProjectTask, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: projectKeys.task(projectId, taskId),
    queryFn: () => getProjectTask(projectId, taskId),
    enabled: !!projectId && !!taskId,
    ...options,
  });
}
export function useProjectDocumentations(
  id: string,
  params: ListProjectDocumentationsParams,
  options?: Omit<UseQueryOptions<PaginatedResponseBase<ProjectDocumentation>, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: projectKeys.documentations(id, params),
    queryFn: () => getProjectDocumentations(id, params),
    enabled: !!id,
    ...options,
  });
}

export function useProjectDocumentation(
  projectId: string,
  documentationId: string,
  options?: Omit<UseQueryOptions<ProjectDocumentation, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: projectKeys.documentation(projectId, documentationId),
    queryFn: () => getProjectDocumentation(projectId, documentationId),
    enabled: !!projectId && !!documentationId,
    ...options,
  });
}
export function useProjectRequirements(id: string, params: PaginationParams & { status?: ProjectRequirement["status"] }, options?: Omit<UseQueryOptions<PaginatedResponse<ProjectRequirement>, Error>, "queryKey" | "queryFn">) {
  return useQuery({ queryKey: projectKeys.requirements(id, params), queryFn: () => getProjectRequirements(id, params), enabled: !!id, ...options });
}
export function useProjectActivity(id: string, params: ListProjectActivityParams, options?: Omit<UseQueryOptions<PaginatedResponse<ProjectActivity>, Error>, "queryKey" | "queryFn">) {
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
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, data }) => addProjectMember(id, data),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(variables.id) });
      invalidateProjectOverview(queryClient, variables.id);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
export function useUpdateProjectMemberRole(options?: UseMutationOptions<ProjectMember, Error, { projectId: string; userId: string; role: ProjectMember["role"] }>) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, userId, role }) => updateProjectMemberRole(projectId, userId, role),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(variables.projectId) });
      invalidateProjectOverview(queryClient, variables.projectId);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
export function useUpdateProjectMemberPersona(
  options?: UseMutationOptions<ProjectMember, Error, { projectId: string; userId: string; persona: ProjectPersona | null }>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, userId, persona }) => updateProjectMemberPersona(projectId, userId, persona),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(variables.projectId) });
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useRemoveProjectMember(options?: UseMutationOptions<void, Error, { projectId: string; userId: string }>) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, userId }) => removeProjectMember(projectId, userId),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(variables.projectId) });
      invalidateProjectOverview(queryClient, variables.projectId);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
export function useCreateProjectTask(options?: UseMutationOptions<ProjectTask, Error, { projectId: string; data: CreateProjectTaskDto }>) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, data }) => createProjectTask(projectId, data),
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateProjectTaskQueries(queryClient, variables.projectId, data.id);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
export function useCreateProjectDocumentation(
  options?: UseMutationOptions<ProjectDocumentation, Error, { projectId: string; data: CreateProjectDocumentationDto }>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, data }) => createProjectDocumentation(projectId, data),
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateProjectDocumentationQueries(queryClient, variables.projectId, data.id);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
export function useGenerateProjectArchDoc(
  options?: UseMutationOptions<ArchDocQueuedResponse, Error, { projectId: string; data: GenerateArchDocDto }>,
) {
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, data }) => generateProjectArchDoc(projectId, data),
    onSuccess,
  });
}

export type { ArchDocType };

export function useCreateProjectRequirement(options?: UseMutationOptions<ProjectRequirement, Error, { projectId: string; data: CreateProjectRequirementDto }>) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, data }) => createProjectRequirement(projectId, data),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: [...projectKeys.detail(variables.projectId), "requirements"] });
      invalidateProjectOverview(queryClient, variables.projectId);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
export function useUpdateProjectTask(options?: UseMutationOptions<ProjectTask, Error, { projectId: string; taskId: string; data: UpdateProjectTaskDto }>) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, taskId, data }) => updateProjectTask(projectId, taskId, data),
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateProjectTaskQueries(queryClient, variables.projectId, variables.taskId);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useReorderProjectTasks(
  options?: UseMutationOptions<{ success: boolean }, Error, { projectId: string; data: ReorderProjectTasksDto }>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, data }) => reorderProjectTasks(projectId, data),
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateProjectTaskQueries(queryClient, variables.projectId);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
export function useUpdateProjectDocumentation(
  options?: UseMutationOptions<
    ProjectDocumentation,
    Error,
    { projectId: string; documentationId: string; data: UpdateProjectDocumentationDto }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, documentationId, data }) =>
      updateProjectDocumentation(projectId, documentationId, data),
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateProjectDocumentationQueries(queryClient, variables.projectId, variables.documentationId);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
export function useUpdateProjectRequirement(options?: UseMutationOptions<ProjectRequirement, Error, { projectId: string; requirementId: string; data: UpdateProjectRequirementDto }>) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, requirementId, data }) => updateProjectRequirement(projectId, requirementId, data),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: [...projectKeys.detail(variables.projectId), "requirements"] });
      invalidateProjectOverview(queryClient, variables.projectId);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
export function useDeleteProjectTask(options?: UseMutationOptions<void, Error, { projectId: string; taskId: string }>) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, taskId }) => deleteProjectTask(projectId, taskId),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.removeQueries({ queryKey: projectKeys.task(variables.projectId, variables.taskId) });
      invalidateProjectTaskQueries(queryClient, variables.projectId);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
export function useDeleteProjectDocumentation(
  options?: UseMutationOptions<void, Error, { projectId: string; documentationId: string }>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, documentationId }) => deleteProjectDocumentation(projectId, documentationId),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.removeQueries({ queryKey: projectKeys.documentation(variables.projectId, variables.documentationId) });
      invalidateProjectDocumentationQueries(queryClient, variables.projectId);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
export function useDeleteProjectRequirement(options?: UseMutationOptions<void, Error, { projectId: string; requirementId: string }>) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, requirementId }) => deleteProjectRequirement(projectId, requirementId),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: [...projectKeys.detail(variables.projectId), "requirements"] });
      invalidateProjectOverview(queryClient, variables.projectId);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useProjectSkills(
  projectId: string,
  options?: Omit<UseQueryOptions<ProjectSkillListItem[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: projectKeys.skills(projectId),
    queryFn: ({ signal }) => getProjectSkills(projectId, { signal }),
    enabled: !!projectId,
    ...options,
  });
}

export function useProjectSkill(
  projectId: string,
  skillId: string,
  options?: Omit<UseQueryOptions<ProjectSkill, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: projectKeys.skill(projectId, skillId),
    queryFn: () => getProjectSkill(projectId, skillId),
    enabled: !!projectId && !!skillId,
    ...options,
  });
}

export function useCreateProjectSkill(
  options?: UseMutationOptions<ProjectSkill, Error, { projectId: string; data: CreateProjectSkillDto }>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, data }) => createProjectSkill(projectId, data),
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateProjectSkillQueries(queryClient, variables.projectId);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateProjectSkill(
  options?: UseMutationOptions<
    ProjectSkill,
    Error,
    { projectId: string; skillId: string; data: UpdateProjectSkillDto }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, skillId, data }) => updateProjectSkill(projectId, skillId, data),
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateProjectSkillQueries(queryClient, variables.projectId, variables.skillId);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteProjectSkill(options?: UseMutationOptions<void, Error, { projectId: string; skillId: string }>) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, skillId }) => deleteProjectSkill(projectId, skillId),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.removeQueries({ queryKey: projectKeys.skill(variables.projectId, variables.skillId) });
      invalidateProjectSkillQueries(queryClient, variables.projectId);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
