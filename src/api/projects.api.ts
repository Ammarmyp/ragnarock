/**
 * Projects API Service
 * All project-related API calls
 * Use these functions with React Query hooks in feature-specific hooks
 */

import type { AxiosResponse } from "axios";
import apiClient from "./client";
import { PROJECT_ENDPOINTS, buildQueryString } from "./endpoints";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types";

/**
 * Nest returns resources directly on `response.data`.
 * Legacy code assumed an `{ success, data }` envelope — normalize both.
 */
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

/**
 * Project Types
 * These should eventually be moved to src/types/project.types.ts
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "archived" | "completed";
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  memberCount: number;
  requirementCount: number;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  status?: Project["status"];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: Project["status"];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: "owner" | "admin" | "member" | "viewer";
  joinedAt: string;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export interface AddProjectMemberDto {
  userId: string;
  role: ProjectMember["role"];
}

export type ProjectRoleSummary = { role: ProjectMember["role"] };

export type ProjectTask = {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: "todo" | "in_progress" | "blocked" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assigneeId?: string | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDocumentation = {
  id: string;
  projectId: string;
  title: string;
  type: "srs" | "srd" | "architecture" | "api" | "note";
  content: string;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectRequirement = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  acceptanceCriteria?: string | null;
  status: "draft" | "in_review" | "approved" | "implemented";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectActivity = {
  id: string;
  projectId: string;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type CreateProjectTaskDto = {
  title: string;
  description?: string;
  status?: ProjectTask["status"];
  priority?: ProjectTask["priority"];
  assigneeId?: string;
  dueDate?: string;
};

export type UpdateProjectTaskDto = Partial<CreateProjectTaskDto>;

export type CreateProjectDocumentationDto = {
  title: string;
  type: ProjectDocumentation["type"];
  content: string;
};
export type UpdateProjectDocumentationDto = Partial<CreateProjectDocumentationDto>;

export type CreateProjectRequirementDto = {
  title: string;
  description: string;
  acceptanceCriteria?: string;
  status?: ProjectRequirement["status"];
};
export type UpdateProjectRequirementDto = Partial<CreateProjectRequirementDto>;

/**
 * Get paginated list of projects
 * @param params - Pagination and filter parameters
 * @returns Paginated list of projects
 */
export async function getProjects(
  params: PaginationParams & { status?: Project["status"]; search?: string },
): Promise<PaginatedResponse<Project>> {
  const queryString = buildQueryString(
    params as unknown as Record<string, unknown>,
  );
  const response = await apiClient.get<unknown>(`${PROJECT_ENDPOINTS.LIST}${queryString}`);
  return parseResponseData<PaginatedResponse<Project>>(response);
}

/**
 * Get a single project by ID
 * @param id - Project ID
 * @returns Project details
 */
export async function getProject(id: string): Promise<Project> {
  const response = await apiClient.get<unknown>(PROJECT_ENDPOINTS.GET(id));
  return parseResponseData<Project>(response);
}

/**
 * Create a new project
 * @param data - Project creation data
 * @returns Created project
 */
export async function createProject(data: CreateProjectDto): Promise<Project> {
  const response = await apiClient.post<unknown>(PROJECT_ENDPOINTS.CREATE, data);
  return parseResponseData<Project>(response);
}

/**
 * Update an existing project
 * @param id - Project ID
 * @param data - Project update data
 * @returns Updated project
 */
export async function updateProject(
  id: string,
  data: UpdateProjectDto,
): Promise<Project> {
  const response = await apiClient.patch<unknown>(PROJECT_ENDPOINTS.UPDATE(id), data);
  return parseResponseData<Project>(response);
}

/**
 * Delete a project
 * @param id - Project ID
 * @returns Success status
 */
export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(PROJECT_ENDPOINTS.DELETE(id));
}

/**
 * Archive a project
 * @param id - Project ID
 * @returns Updated project
 */
export async function archiveProject(id: string): Promise<Project> {
  const response = await apiClient.post<unknown>(PROJECT_ENDPOINTS.ARCHIVE(id));
  return parseResponseData<Project>(response);
}

/**
 * Restore an archived project
 * @param id - Project ID
 * @returns Updated project
 */
export async function restoreProject(id: string): Promise<Project> {
  const response = await apiClient.post<unknown>(PROJECT_ENDPOINTS.RESTORE(id));
  return parseResponseData<Project>(response);
}

/**
 * Get project members
 * @param id - Project ID
 * @returns List of project members
 */
export async function getProjectMembers(id: string): Promise<ProjectMember[]> {
  const response = await apiClient.get<unknown>(PROJECT_ENDPOINTS.MEMBERS(id));
  return parseResponseData<ProjectMember[]>(response);
}

/**
 * Add a member to a project
 * @param id - Project ID
 * @param data - Member data
 * @returns Added member
 */
export async function addProjectMember(
  id: string,
  data: AddProjectMemberDto,
): Promise<ProjectMember> {
  const response = await apiClient.post<unknown>(PROJECT_ENDPOINTS.MEMBERS(id), data);
  return parseResponseData<ProjectMember>(response);
}

/**
 * Remove a member from a project
 * @param projectId - Project ID
 * @param memberId - Member ID
 * @returns Success status
 */
export async function removeProjectMember(
  projectId: string,
  userId: string,
): Promise<void> {
  await apiClient.delete(PROJECT_ENDPOINTS.MEMBER(projectId, userId));
}

export async function updateProjectMemberRole(
  projectId: string,
  userId: string,
  role: ProjectMember["role"],
): Promise<ProjectMember> {
  const response = await apiClient.patch<unknown>(PROJECT_ENDPOINTS.MEMBER(projectId, userId), {
    role,
  });
  return parseResponseData<ProjectMember>(response);
}

export async function getProjectRole(projectId: string): Promise<ProjectRoleSummary> {
  const response = await apiClient.get<unknown>(PROJECT_ENDPOINTS.MY_ROLE(projectId));
  return parseResponseData<ProjectRoleSummary>(response);
}

export async function getProjectOverview(projectId: string) {
  const response = await apiClient.get<unknown>(PROJECT_ENDPOINTS.OVERVIEW(projectId));
  return parseResponseData<Record<string, unknown>>(response);
}

export async function getProjectTasks(
  projectId: string,
  params: PaginationParams & { status?: ProjectTask["status"] },
): Promise<PaginatedResponse<ProjectTask>> {
  const response = await apiClient.get<unknown>(
    `${PROJECT_ENDPOINTS.TASKS(projectId)}${buildQueryString(params as unknown as Record<string, unknown>)}`,
  );
  return parseResponseData<PaginatedResponse<ProjectTask>>(response);
}

export async function createProjectTask(
  projectId: string,
  data: CreateProjectTaskDto,
): Promise<ProjectTask> {
  const response = await apiClient.post<unknown>(PROJECT_ENDPOINTS.TASKS(projectId), data);
  return parseResponseData<ProjectTask>(response);
}

export async function updateProjectTask(
  projectId: string,
  taskId: string,
  data: UpdateProjectTaskDto,
): Promise<ProjectTask> {
  const response = await apiClient.patch<unknown>(PROJECT_ENDPOINTS.TASK(projectId, taskId), data);
  return parseResponseData<ProjectTask>(response);
}

export async function deleteProjectTask(projectId: string, taskId: string): Promise<void> {
  await apiClient.delete(PROJECT_ENDPOINTS.TASK(projectId, taskId));
}

export async function getProjectDocumentations(
  projectId: string,
  params: PaginationParams & { type?: ProjectDocumentation["type"] },
): Promise<PaginatedResponse<ProjectDocumentation>> {
  const response = await apiClient.get<unknown>(
    `${PROJECT_ENDPOINTS.DOCUMENTATIONS(projectId)}${buildQueryString(params as unknown as Record<string, unknown>)}`,
  );
  return parseResponseData<PaginatedResponse<ProjectDocumentation>>(response);
}

export async function createProjectDocumentation(
  projectId: string,
  data: CreateProjectDocumentationDto,
): Promise<ProjectDocumentation> {
  const response = await apiClient.post<unknown>(PROJECT_ENDPOINTS.DOCUMENTATIONS(projectId), data);
  return parseResponseData<ProjectDocumentation>(response);
}

export async function updateProjectDocumentation(
  projectId: string,
  documentationId: string,
  data: UpdateProjectDocumentationDto,
): Promise<ProjectDocumentation> {
  const response = await apiClient.patch<unknown>(
    PROJECT_ENDPOINTS.DOCUMENTATION(projectId, documentationId),
    data,
  );
  return parseResponseData<ProjectDocumentation>(response);
}

export async function deleteProjectDocumentation(projectId: string, documentationId: string): Promise<void> {
  await apiClient.delete(PROJECT_ENDPOINTS.DOCUMENTATION(projectId, documentationId));
}

export async function getProjectRequirements(
  projectId: string,
  params: PaginationParams & { status?: ProjectRequirement["status"] },
): Promise<PaginatedResponse<ProjectRequirement>> {
  const response = await apiClient.get<unknown>(
    `${PROJECT_ENDPOINTS.REQUIREMENTS(projectId)}${buildQueryString(params as unknown as Record<string, unknown>)}`,
  );
  return parseResponseData<PaginatedResponse<ProjectRequirement>>(response);
}

export async function createProjectRequirement(
  projectId: string,
  data: CreateProjectRequirementDto,
): Promise<ProjectRequirement> {
  const response = await apiClient.post<unknown>(PROJECT_ENDPOINTS.REQUIREMENTS(projectId), data);
  return parseResponseData<ProjectRequirement>(response);
}

export async function updateProjectRequirement(
  projectId: string,
  requirementId: string,
  data: UpdateProjectRequirementDto,
): Promise<ProjectRequirement> {
  const response = await apiClient.patch<unknown>(
    PROJECT_ENDPOINTS.REQUIREMENT(projectId, requirementId),
    data,
  );
  return parseResponseData<ProjectRequirement>(response);
}

export async function deleteProjectRequirement(projectId: string, requirementId: string): Promise<void> {
  await apiClient.delete(PROJECT_ENDPOINTS.REQUIREMENT(projectId, requirementId));
}

export async function getProjectActivity(
  projectId: string,
  params: PaginationParams,
): Promise<PaginatedResponse<ProjectActivity>> {
  const response = await apiClient.get<unknown>(
    `${PROJECT_ENDPOINTS.ACTIVITY(projectId)}${buildQueryString(params as unknown as Record<string, unknown>)}`,
  );
  return parseResponseData<PaginatedResponse<ProjectActivity>>(response);
}
