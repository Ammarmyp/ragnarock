/**
 * Projects API Service
 * All project-related API calls
 * Use these functions with React Query hooks in feature-specific hooks
 */

import type { AxiosResponse } from "axios";
import apiClient from "./client";
import { PROJECT_ENDPOINTS, buildQueryString } from "./endpoints";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginatedResponseBase,
  PaginationParams,
} from "@/types";

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

export type ProjectPersona =
  | "business_owner"
  | "developer"
  | "qa_engineer"
  | "project_manager"
  | "stakeholder";

export const PROJECT_PERSONA_LABELS: Record<ProjectPersona, string> = {
  business_owner: "Business Owner",
  developer: "Developer",
  qa_engineer: "QA Engineer",
  project_manager: "Project Manager",
  stakeholder: "Stakeholder",
};

export type AgentSessionType =
  | "requirements"
  | "developer_intelligence"
  | "project_planner"
  | "qa_intelligence"
  | "change_impact";

export type ArchDocType = "sad" | "hld" | "lld" | "adr";

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: "owner" | "admin" | "member" | "viewer";
  personas: ProjectPersona[];
  joinedAt: string;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export interface AddProjectMemberDto {
  userId?: string;
  email?: string;
  role: ProjectMember["role"];
  personas?: ProjectPersona[];
}

export interface UpdateProjectMemberPersonasDto {
  personas: ProjectPersona[];
}

export type ProjectRoleSummary = { role: ProjectMember["role"] };

export type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "reviewing"
  | "reviewed"
  | "done"
  | "cancelled";

export type TaskPhase = "discovery" | "planning" | "build" | "test" | "release";

export type ProjectTask = {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: "low" | "medium" | "high" | "urgent";
  phase?: TaskPhase | null;
  assigneeId?: string | null;
  assignee?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  startDate?: string | null;
  dueDate?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type DocumentationType =
  | "brd"
  | "prd"
  | "frd"
  | "srs"
  | "srd"
  | "trd"
  | "sad"
  | "adr"
  | "hld"
  | "lld"
  | "icd"
  | "dbd"
  | "api"
  | "stp"
  | "std"
  | "rtm"
  | "ug"
  | "om"
  | "wbs"
  | "raci"
  | "note";

export type DocumentationStatus = "draft" | "pending_review" | "completed" | "rejected";

export type ProjectDocumentation = {
  id: string;
  projectId: string;
  title: string;
  type: DocumentationType;
  status: DocumentationStatus;
  content: string;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
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
  actor?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type ListProjectActivityParams = PaginationParams & {
  search?: string;
  entityType?: string;
  action?: string;
};

export type ProjectSkillListItem = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectSkill = ProjectSkillListItem & {
  projectId: string;
  bodyMarkdown: string;
};

export type CreateProjectSkillDto = {
  title: string;
  summary?: string;
  bodyMarkdown: string;
  slug?: string;
};

export type UpdateProjectSkillDto = {
  title?: string;
  summary?: string | null;
  bodyMarkdown?: string;
};

/** Full project payload from GET /projects/:id (Prisma shape). */
export type ProjectOverviewProject = {
  id: string;
  name: string;
  description: string | null;
  status: Project["status"];
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  members: ProjectMember[];
  _count: { requirements: number; tasks: number; documentations: number };
};

export type ProjectRequirementWithAuthor = ProjectRequirement & {
  author?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export type ProjectOverviewRecentDoc = Pick<
  ProjectDocumentation,
  "id" | "title" | "type" | "status" | "updatedAt" | "createdAt"
>;

export type ProjectOverviewResponse = {
  project: ProjectOverviewProject;
  organization: { name: string; slug: string } | null;
  team: ProjectMember[];
  stats: {
    totalTasks: number;
    tasksDone: number;
    totalRequirements: number;
    requirementsImplemented: number;
    totalDocumentations: number;
    memberCount: number;
    activitiesLast7Days: number;
  };
  tasksByStatus: Record<string, number>;
  requirementsByStatus: Record<string, number>;
  activityByEntity: Record<string, number>;
  progress: {
    taskCompletionPercent: number;
    requirementCompletionPercent: number;
  };
  highlights: {
    lastProjectUpdateAt: string;
    lastDocumentationUpdateAt: string | null;
    lastActivityAt: string | null;
  };
  recentTasks: ProjectTask[];
  recentRequirements: ProjectRequirementWithAuthor[];
  recentDocumentations: ProjectOverviewRecentDoc[];
};

export type CreateProjectTaskDto = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: ProjectTask["priority"];
  phase?: TaskPhase;
  assigneeId?: string;
  startDate?: string;
  dueDate?: string;
  sortOrder?: number;
};

export type UpdateProjectTaskDto = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: ProjectTask["priority"];
  phase?: TaskPhase | null;
  assigneeId?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  sortOrder?: number;
};

export type ReorderProjectTasksDto = {
  updates: { id: string; sortOrder: number; status?: TaskStatus }[];
};

export type ListProjectTasksParams = PaginationParams & {
  status?: TaskStatus;
  phase?: TaskPhase;
  assigneeId?: string;
  search?: string;
};

export type CreateProjectDocumentationDto = {
  title: string;
  type: DocumentationType;
  content: string;
  status?: DocumentationStatus;
};
export type UpdateProjectDocumentationDto = Partial<CreateProjectDocumentationDto>;

export type ListProjectDocumentationsParams = {
  page: number;
  perPage: number;
  search?: string;
  status?: DocumentationStatus;
  type?: DocumentationType;
};

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

export async function updateProjectMemberPersonas(
  projectId: string,
  userId: string,
  personas: ProjectPersona[],
): Promise<ProjectMember> {
  const response = await apiClient.patch<unknown>(
    `${PROJECT_ENDPOINTS.MEMBER(projectId, userId)}/persona`,
    { personas },
  );
  return parseResponseData<ProjectMember>(response);
}

export async function getProjectRole(projectId: string): Promise<ProjectRoleSummary> {
  const response = await apiClient.get<unknown>(PROJECT_ENDPOINTS.MY_ROLE(projectId));
  return parseResponseData<ProjectRoleSummary>(response);
}

export async function getProjectOverview(projectId: string): Promise<ProjectOverviewResponse> {
  const response = await apiClient.get<unknown>(PROJECT_ENDPOINTS.OVERVIEW(projectId));
  return parseResponseData<ProjectOverviewResponse>(response);
}

export async function getProjectTasks(
  projectId: string,
  params: ListProjectTasksParams,
): Promise<PaginatedResponse<ProjectTask>> {
  const response = await apiClient.get<unknown>(
    `${PROJECT_ENDPOINTS.TASKS(projectId)}${buildQueryString(params as unknown as Record<string, unknown>)}`,
  );
  return parseResponseData<PaginatedResponse<ProjectTask>>(response);
}

export async function getProjectTask(projectId: string, taskId: string): Promise<ProjectTask> {
  const response = await apiClient.get<unknown>(PROJECT_ENDPOINTS.TASK(projectId, taskId));
  return parseResponseData<ProjectTask>(response);
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

export async function reorderProjectTasks(
  projectId: string,
  data: ReorderProjectTasksDto,
): Promise<{ success: boolean }> {
  const response = await apiClient.patch<unknown>(PROJECT_ENDPOINTS.TASKS_REORDER(projectId), data);
  return parseResponseData<{ success: boolean }>(response);
}

export async function deleteProjectTask(projectId: string, taskId: string): Promise<void> {
  await apiClient.delete(PROJECT_ENDPOINTS.TASK(projectId, taskId));
}

export async function getProjectDocumentations(
  projectId: string,
  params: ListProjectDocumentationsParams,
): Promise<PaginatedResponseBase<ProjectDocumentation>> {
  const response = await apiClient.get<unknown>(
    `${PROJECT_ENDPOINTS.DOCUMENTATIONS(projectId)}${buildQueryString(params as unknown as Record<string, unknown>)}`,
  );
  return parseResponseData<PaginatedResponseBase<ProjectDocumentation>>(response);
}

export async function getProjectDocumentation(
  projectId: string,
  documentationId: string,
): Promise<ProjectDocumentation> {
  const response = await apiClient.get<unknown>(
    PROJECT_ENDPOINTS.DOCUMENTATION(projectId, documentationId),
  );
  return parseResponseData<ProjectDocumentation>(response);
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
  params: ListProjectActivityParams,
): Promise<PaginatedResponse<ProjectActivity>> {
  const response = await apiClient.get<unknown>(
    `${PROJECT_ENDPOINTS.ACTIVITY(projectId)}${buildQueryString(params as unknown as Record<string, unknown>)}`,
  );
  return parseResponseData<PaginatedResponse<ProjectActivity>>(response);
}

export async function getProjectSkills(
  projectId: string,
  config?: { signal?: AbortSignal },
): Promise<ProjectSkillListItem[]> {
  const response = await apiClient.get<unknown>(PROJECT_ENDPOINTS.SKILLS(projectId), {
    signal: config?.signal,
  });
  return parseResponseData<ProjectSkillListItem[]>(response);
}

export async function getProjectSkill(projectId: string, skillId: string): Promise<ProjectSkill> {
  const response = await apiClient.get<unknown>(PROJECT_ENDPOINTS.SKILL(projectId, skillId));
  return parseResponseData<ProjectSkill>(response);
}

export async function createProjectSkill(projectId: string, data: CreateProjectSkillDto): Promise<ProjectSkill> {
  const response = await apiClient.post<unknown>(PROJECT_ENDPOINTS.SKILLS(projectId), data);
  return parseResponseData<ProjectSkill>(response);
}

export async function updateProjectSkill(
  projectId: string,
  skillId: string,
  data: UpdateProjectSkillDto,
): Promise<ProjectSkill> {
  const response = await apiClient.patch<unknown>(PROJECT_ENDPOINTS.SKILL(projectId, skillId), data);
  return parseResponseData<ProjectSkill>(response);
}

export async function deleteProjectSkill(projectId: string, skillId: string): Promise<void> {
  await apiClient.delete(PROJECT_ENDPOINTS.SKILL(projectId, skillId));
}

export async function exportProjectSkill(
  projectId: string,
  skillId: string,
  format: "md" | "txt",
): Promise<{ blob: Blob; filename: string }> {
  const response = await apiClient.get<Blob>(
    `${PROJECT_ENDPOINTS.SKILL_EXPORT(projectId, skillId)}${buildQueryString({ format })}`,
    { responseType: "blob" },
  );
  const disposition = response.headers["content-disposition"];
  let filename = `skill.${format}`;
  if (disposition && typeof disposition === "string") {
    const match = /filename="?([^";]+)"?/i.exec(disposition);
    if (match?.[1]) {
      filename = match[1];
    }
  }
  return { blob: response.data, filename };
}

// ─── AI requirements chat (Nest ↔ FastAPI) ─────────────────────────────────

export interface ProjectAiChatSession {
  id: string;
  projectId: string;
  createdBy: string;
  title: string | null;
  agentType: AgentSessionType;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; name?: string | null; email?: string | null };
  _count?: { messages: number };
}

export interface ProjectAiChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  payload?: unknown;
  createdAt: string;
}

export type AiAgentResponse =
  | { status: "needs_clarification"; questions: string[] }
  | {
      status: "complete";
      project_name: string;
      summary: string;
      [key: string]: unknown;
    };

export interface AiTurnCompletedResponse {
  userMessageId: string;
  assistantMessageId: string;
  agent: AiAgentResponse;
  specificationId?: string;
}

export interface AiTurnQueuedResponse {
  jobId: string;
  userMessageId: string;
  status: "queued";
}

export interface CreateProjectAiChatSessionDto {
  title?: string;
  agentType?: AgentSessionType;
}

export async function createProjectAiChatSession(
  projectId: string,
  data?: CreateProjectAiChatSessionDto,
): Promise<ProjectAiChatSession> {
  const response = await apiClient.post<unknown>(PROJECT_ENDPOINTS.AI_CHAT_SESSIONS(projectId), data ?? {});
  return parseResponseData<ProjectAiChatSession>(response);
}

export async function listProjectAiChatSessions(
  projectId: string,
  params: PaginationParams,
): Promise<PaginatedResponse<ProjectAiChatSession>> {
  const response = await apiClient.get<unknown>(
    `${PROJECT_ENDPOINTS.AI_CHAT_SESSIONS(projectId)}${buildQueryString(params as unknown as Record<string, unknown>)}`,
  );
  return parseResponseData<PaginatedResponse<ProjectAiChatSession>>(response);
}

export async function listProjectAiChatMessages(
  projectId: string,
  sessionId: string,
  params: PaginationParams,
): Promise<PaginatedResponse<ProjectAiChatMessage>> {
  const response = await apiClient.get<unknown>(
    `${PROJECT_ENDPOINTS.AI_CHAT_MESSAGES(projectId, sessionId)}${buildQueryString(params as unknown as Record<string, unknown>)}`,
  );
  return parseResponseData<PaginatedResponse<ProjectAiChatMessage>>(response);
}

export async function submitProjectAiRequirements(
  projectId: string,
  body: { sessionId: string; input: string; type: "text" | "url" },
): Promise<AiTurnQueuedResponse> {
  const response = await apiClient.post<unknown>(PROJECT_ENDPOINTS.AI_REQUIREMENTS(projectId), body);
  return parseResponseData<AiTurnQueuedResponse>(response);
}

export async function submitProjectAiRequirementsUpload(
  projectId: string,
  sessionId: string,
  file: File,
): Promise<AiTurnQueuedResponse> {
  const formData = new FormData();
  formData.append("sessionId", sessionId);
  formData.append("file", file);
  const response = await apiClient.post<unknown>(PROJECT_ENDPOINTS.AI_REQUIREMENTS_UPLOAD(projectId), formData, {
    transformRequest: [
      (data, headers) => {
        if (data instanceof FormData) {
          delete headers["Content-Type"];
        }
        return data as FormData;
      },
    ],
  });
  return parseResponseData<AiTurnQueuedResponse>(response);
}

export interface GenerateArchDocDto {
  docType: ArchDocType;
  layer?: string;
}

export interface ArchDocQueuedResponse {
  jobId: string;
  status: "queued";
}

export async function generateProjectArchDoc(
  projectId: string,
  data: GenerateArchDocDto,
): Promise<ArchDocQueuedResponse> {
  const response = await apiClient.post<unknown>(
    PROJECT_ENDPOINTS.AI_ARCH_DOC_GENERATE(projectId),
    data,
  );
  return parseResponseData<ArchDocQueuedResponse>(response);
}

// ─── Ragnarock Chat (project Q&A + intent routing) ───────────────────────────

export type RagnarockDetectedAction = {
  type: "generate_srs" | "generate_plan" | "generate_doc" | "none";
  docType?: string;
  confirmationText: string;
};

export interface RagnarockChatQueuedResponse {
  jobId: string;
  status: "queued";
}

export async function sendRagnarockMessage(
  projectId: string,
  sessionId: string,
  message: string,
): Promise<RagnarockChatQueuedResponse> {
  const response = await apiClient.post<unknown>(
    PROJECT_ENDPOINTS.AI_RAGNAROCK_CHAT(projectId),
    { sessionId, message },
  );
  return parseResponseData<RagnarockChatQueuedResponse>(response);
}

export type RagnarockSession = {
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type RagnarockSessionMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  detectedAction: RagnarockDetectedAction | null;
  createdAt: string;
};

export type RagnarockSessionDetail = {
  session: { id: string; title: string };
  messages: RagnarockSessionMessage[];
};

export async function createRagnarockSession(projectId: string): Promise<{ sessionId: string }> {
  const response = await apiClient.post<unknown>(PROJECT_ENDPOINTS.AI_RAGNAROCK_SESSIONS(projectId));
  return parseResponseData<{ sessionId: string }>(response);
}

export async function listRagnarockSessions(projectId: string): Promise<RagnarockSession[]> {
  const response = await apiClient.get<unknown>(PROJECT_ENDPOINTS.AI_RAGNAROCK_SESSIONS(projectId));
  return parseResponseData<RagnarockSession[]>(response);
}

export async function getRagnarockSession(
  projectId: string,
  sessionId: string,
): Promise<RagnarockSessionDetail> {
  const response = await apiClient.get<unknown>(
    PROJECT_ENDPOINTS.AI_RAGNAROCK_SESSION(projectId, sessionId),
  );
  return parseResponseData<RagnarockSessionDetail>(response);
}

// ─── Project Planner ─────────────────────────────────────────────────────────

export interface PlannerQueuedResponse {
  jobId: string;
  status: "queued";
}

export async function generateProjectPlan(projectId: string): Promise<PlannerQueuedResponse> {
  const response = await apiClient.post<unknown>(
    PROJECT_ENDPOINTS.AI_PLAN_GENERATE(projectId),
  );
  return parseResponseData<PlannerQueuedResponse>(response);
}

export async function generateProjectQaTestSuite(projectId: string): Promise<{ jobId: string; status: "queued" }> {
  const response = await apiClient.post<unknown>(
    PROJECT_ENDPOINTS.AI_QA_GENERATE(projectId),
  );
  return parseResponseData<{ jobId: string; status: "queued" }>(response);
}

// ─── Project specifications ──────────────────────────────────────────────────

export type AgentPartialSrs = {
  project_name?: string | null;
  summary?: string | null;
  features?: { name: string; description: string }[];
  user_roles?: string[];
  functional_requirements?: string[];
  non_functional_requirements?: string[];
  user_stories?: { role: string; goal: string; benefit: string }[];
  acceptance_criteria?: string[];
  out_of_scope?: string[];
};

export interface ProjectAiChatSessionWithProgress extends ProjectAiChatSession {
  partialSrs?: AgentPartialSrs | null;
  srsProgress: number;
}

/** The project's single shared draft SRS — every new chat continues from this. */
export interface ProjectAiDraft {
  draftSrs: AgentPartialSrs | null;
  draftSrsProgress: number;
}

export async function getProjectAiDraft(projectId: string): Promise<ProjectAiDraft> {
  const response = await apiClient.get<unknown>(PROJECT_ENDPOINTS.AI_DRAFT(projectId));
  return parseResponseData<ProjectAiDraft>(response);
}

export interface ProjectSpecification {
  id: string;
  projectId: string;
  chatSessionId?: string | null;
  createdBy: string;
  title?: string | null;
  payload: AgentRequirementPayload;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; name?: string | null; email?: string | null };
}

export interface AgentRequirementPayload {
  status: "complete";
  project_name: string;
  summary: string;
  features: { name: string; description: string }[];
  functional_requirements: string[];
  non_functional_requirements: string[];
  user_stories: { role: string; goal: string; benefit: string }[];
  acceptance_criteria: string[];
  out_of_scope?: string[];
  business_owner_summary: string;
}

export async function listProjectSpecifications(
  projectId: string,
  params: PaginationParams = { page: 1, limit: 20 },
): Promise<PaginatedResponse<ProjectSpecification>> {
  const response = await apiClient.get<unknown>(
    `${PROJECT_ENDPOINTS.SPECIFICATIONS(projectId)}${buildQueryString(params as unknown as Record<string, unknown>)}`,
  );
  return parseResponseData<PaginatedResponse<ProjectSpecification>>(response);
}

export async function getProjectSpecification(
  projectId: string,
  specificationId: string,
): Promise<ProjectSpecification> {
  const response = await apiClient.get<unknown>(
    PROJECT_ENDPOINTS.SPECIFICATION(projectId, specificationId),
  );
  return parseResponseData<ProjectSpecification>(response);
}
