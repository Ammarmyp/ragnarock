/**
 * Projects API Service
 * All project-related API calls
 * Use these functions with React Query hooks in feature-specific hooks
 */

import apiClient from "./client";
import { PROJECT_ENDPOINTS, buildQueryString } from "./endpoints";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types";

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
}

export interface AddProjectMemberDto {
  userId: string;
  role: ProjectMember["role"];
}

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
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Project>>>(
    `${PROJECT_ENDPOINTS.LIST}${queryString}`,
  );
  return response.data.data;
}

/**
 * Get a single project by ID
 * @param id - Project ID
 * @returns Project details
 */
export async function getProject(id: string): Promise<Project> {
  const response = await apiClient.get<ApiResponse<Project>>(
    PROJECT_ENDPOINTS.GET(id),
  );
  return response.data.data;
}

/**
 * Create a new project
 * @param data - Project creation data
 * @returns Created project
 */
export async function createProject(data: CreateProjectDto): Promise<Project> {
  const response = await apiClient.post<ApiResponse<Project>>(
    PROJECT_ENDPOINTS.CREATE,
    data,
  );
  return response.data.data;
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
  const response = await apiClient.patch<ApiResponse<Project>>(
    PROJECT_ENDPOINTS.UPDATE(id),
    data,
  );
  return response.data.data;
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
  const response = await apiClient.post<ApiResponse<Project>>(
    PROJECT_ENDPOINTS.ARCHIVE(id),
  );
  return response.data.data;
}

/**
 * Restore an archived project
 * @param id - Project ID
 * @returns Updated project
 */
export async function restoreProject(id: string): Promise<Project> {
  const response = await apiClient.post<ApiResponse<Project>>(
    PROJECT_ENDPOINTS.RESTORE(id),
  );
  return response.data.data;
}

/**
 * Get project members
 * @param id - Project ID
 * @returns List of project members
 */
export async function getProjectMembers(id: string): Promise<ProjectMember[]> {
  const response = await apiClient.get<ApiResponse<ProjectMember[]>>(
    PROJECT_ENDPOINTS.MEMBERS(id),
  );
  return response.data.data;
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
  const response = await apiClient.post<ApiResponse<ProjectMember>>(
    PROJECT_ENDPOINTS.ADD_MEMBER(id),
    data,
  );
  return response.data.data;
}

/**
 * Remove a member from a project
 * @param projectId - Project ID
 * @param memberId - Member ID
 * @returns Success status
 */
export async function removeProjectMember(
  projectId: string,
  memberId: string,
): Promise<void> {
  await apiClient.delete(PROJECT_ENDPOINTS.REMOVE_MEMBER(projectId, memberId));
}
