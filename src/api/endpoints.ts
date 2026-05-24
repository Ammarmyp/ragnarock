/**
 * API Endpoints Dictionary
 * Centralized definition of all API endpoints
 * Use these constants instead of hardcoding URLs in API functions
 */

/**
 * Authentication Endpoints
 */
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REGISTER: "/auth/register",
  REFRESH_TOKEN: "/auth/refresh",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_EMAIL: "/auth/verify-email",
  ME: "/auth/me",
} as const;

/**
 * User Endpoints
 */
export const USER_ENDPOINTS = {
  LIST: "/users",
  CREATE: "/users",
  GET: (id: string) => `/users/${id}`,
  UPDATE: (id: string) => `/users/${id}`,
  DELETE: (id: string) => `/users/${id}`,
  UPDATE_PROFILE: "/users/profile",
  CHANGE_PASSWORD: "/users/change-password",
  UPLOAD_AVATAR: "/users/avatar",
} as const;

/**
 * Project Endpoints
 */
export const PROJECT_ENDPOINTS = {
  LIST: "/projects",
  CREATE: "/projects",
  GET: (projectId: string) => `/projects/${projectId}`,
  UPDATE: (projectId: string) => `/projects/${projectId}`,
  DELETE: (projectId: string) => `/projects/${projectId}`,
  ARCHIVE: (projectId: string) => `/projects/${projectId}/archive`,
  RESTORE: (projectId: string) => `/projects/${projectId}/restore`,
  MY_ROLE: (projectId: string) => `/projects/${projectId}/my-role`,
  OVERVIEW: (projectId: string) => `/projects/${projectId}/overview`,
  MEMBERS: (projectId: string) => `/projects/${projectId}/members`,
  MEMBER: (projectId: string, userId: string) => `/projects/${projectId}/members/${userId}`,
  TASKS: (projectId: string) => `/projects/${projectId}/tasks`,
  TASKS_REORDER: (projectId: string) => `/projects/${projectId}/tasks/reorder`,
  TASK: (projectId: string, taskId: string) => `/projects/${projectId}/tasks/${taskId}`,
  DOCUMENTATIONS: (projectId: string) => `/projects/${projectId}/documentations`,
  DOCUMENTATION: (projectId: string, documentationId: string) =>
    `/projects/${projectId}/documentations/${documentationId}`,
  REQUIREMENTS: (projectId: string) => `/projects/${projectId}/requirements`,
  REQUIREMENT: (projectId: string, requirementId: string) =>
    `/projects/${projectId}/requirements/${requirementId}`,
  ACTIVITY: (projectId: string) => `/projects/${projectId}/activity`,
  SKILLS: (projectId: string) => `/projects/${projectId}/skills`,
  SKILL: (projectId: string, skillId: string) => `/projects/${projectId}/skills/${skillId}`,
  SKILL_EXPORT: (projectId: string, skillId: string) => `/projects/${projectId}/skills/${skillId}/export`,
  /** Persisted AI requirements chat (Nest ↔ FastAPI). */
  AI_CHAT_SESSIONS: (projectId: string) => `/projects/${projectId}/ai/chat/sessions`,
  AI_CHAT_MESSAGES: (projectId: string, sessionId: string) =>
    `/projects/${projectId}/ai/chat/sessions/${sessionId}/messages`,
  AI_REQUIREMENTS: (projectId: string) => `/projects/${projectId}/ai/requirements`,
  AI_REQUIREMENTS_UPLOAD: (projectId: string) => `/projects/${projectId}/ai/requirements/upload`,
  AI_ARCH_DOC_GENERATE: (projectId: string) => `/projects/${projectId}/ai/arch-doc/generate`,
  AI_PLAN_GENERATE: (projectId: string) => `/projects/${projectId}/ai/plan/generate`,
  AI_QA_GENERATE: (projectId: string) => `/projects/${projectId}/ai/qa/generate`,
  AI_RAGNAROCK_CHAT: (projectId: string) => `/projects/${projectId}/ai/ragnarock/chat`,
  AI_RAGNAROCK_SESSIONS: (projectId: string) => `/projects/${projectId}/ai/ragnarock/sessions`,
  AI_RAGNAROCK_SESSION: (projectId: string, sessionId: string) => `/projects/${projectId}/ai/ragnarock/sessions/${sessionId}`,
  /** The project's single shared draft SRS — what every new chat continues from. */
  AI_DRAFT: (projectId: string) => `/projects/${projectId}/ai/draft`,
  SPECIFICATIONS: (projectId: string) => `/projects/${projectId}/specifications`,
  SPECIFICATION: (projectId: string, specificationId: string) =>
    `/projects/${projectId}/specifications/${specificationId}`,
  FEATURES: (projectId: string) => `/projects/${projectId}/features`,
  API_KEYS: (projectId: string) => `/projects/${projectId}/api-keys`,
  API_KEY: (projectId: string, keyId: string) => `/projects/${projectId}/api-keys/${keyId}`,
  REPOSITORIES: (projectId: string) => `/projects/${projectId}/repositories`,
  REPOSITORY: (projectId: string, repositoryId: string) =>
    `/projects/${projectId}/repositories/${repositoryId}`,
  REPOSITORY_REFRESH: (projectId: string, repositoryId: string) =>
    `/projects/${projectId}/repositories/${repositoryId}/refresh`,
  REPOSITORY_COMMITS: (projectId: string, repositoryId: string) =>
    `/projects/${projectId}/repositories/${repositoryId}/commits`,
  REPOSITORY_CONTRIBUTORS: (projectId: string, repositoryId: string) =>
    `/projects/${projectId}/repositories/${repositoryId}/contributors`,
  REPOSITORY_PULLS: (projectId: string, repositoryId: string) =>
    `/projects/${projectId}/repositories/${repositoryId}/pulls`,
  REPOSITORY_ISSUES: (projectId: string, repositoryId: string) =>
    `/projects/${projectId}/repositories/${repositoryId}/issues`,
  REPOSITORY_BROWSE: (projectId: string, repositoryId: string) =>
    `/projects/${projectId}/repositories/${repositoryId}/browse`,
  REPOSITORY_FILE: (projectId: string, repositoryId: string) =>
    `/projects/${projectId}/repositories/${repositoryId}/file`,
} as const;

/** GitHub-backed discovery (uses the signed-in user's GitHub OAuth token). */
export const GITHUB_REPO_ENDPOINTS = {
  SEARCH: "/repositories/search",
} as const;

/**
 * Organization integrations (active org context; backend reads org from session/header)
 */
export const INTEGRATION_ENDPOINTS = {
  LIST: "/integrations",
  LINEAR_CONNECT: "/integrations/linear",
  LINEAR_TEAMS: "/integrations/linear/teams",
  LINEAR_PROJECTS: "/integrations/linear/projects",
  DISCONNECT: (provider: string) => `/integrations/${provider}`,
  VERIFY: (provider: string) => `/integrations/${provider}/verify`,
} as const;

export const LINEAR_SYNC_ENDPOINTS = {
  STATUS: (projectId: string) => `/projects/${projectId}/linear`,
  LINK: (projectId: string) => `/projects/${projectId}/linear/link`,
  SETTINGS: (projectId: string) => `/projects/${projectId}/linear/settings`,
  IMPORT: (projectId: string) => `/projects/${projectId}/linear/import`,
  EXPORT: (projectId: string) => `/projects/${projectId}/linear/export`,
  SYNC: (projectId: string) => `/projects/${projectId}/linear/sync`,
  SYNC_RUNS: (projectId: string) => `/projects/${projectId}/linear/sync-runs`,
} as const;

/**
 * Requirement Endpoints
 */
export const REQUIREMENT_ENDPOINTS = {
  LIST: "/requirements",
  CREATE: "/requirements",
  GET: (id: string) => `/requirements/${id}`,
  UPDATE: (id: string) => `/requirements/${id}`,
  DELETE: (id: string) => `/requirements/${id}`,
  BULK_CREATE: "/requirements/bulk",
  BULK_UPDATE: "/requirements/bulk",
  BULK_DELETE: "/requirements/bulk",
  BY_PROJECT: (projectId: string) => `/projects/${projectId}/requirements`,
} as const;

/**
 * Dashboard Endpoints
 */
export const DASHBOARD_ENDPOINTS = {
  OVERVIEW: "/dashboard/overview",
  STATS: "/dashboard/stats",
  RECENT_ACTIVITY: "/dashboard/recent-activity",
  ANALYTICS: "/dashboard/analytics",
} as const;

/**
 * File/Upload Endpoints
 */
export const FILE_ENDPOINTS = {
  UPLOAD: "/files/upload",
  DOWNLOAD: (id: string) => `/files/${id}/download`,
  DELETE: (id: string) => `/files/${id}`,
  LIST: "/files",
} as const;

/**
 * Notification Endpoints
 */
export const NOTIFICATION_ENDPOINTS = {
  LIST: "/notifications",
  GET: (id: string) => `/notifications/${id}`,
  MARK_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_READ: "/notifications/mark-all-read",
  DELETE: (id: string) => `/notifications/${id}`,
  PREFERENCES: "/notifications/preferences",
} as const;

/**
 * Settings Endpoints
 */
export const SETTINGS_ENDPOINTS = {
  GET: "/settings",
  UPDATE: "/settings",
  GET_CATEGORY: (category: string) => `/settings/${category}`,
  UPDATE_CATEGORY: (category: string) => `/settings/${category}`,
} as const;

/**
 * Search Endpoints
 */
export const SEARCH_ENDPOINTS = {
  GLOBAL: "/search",
  PROJECTS: "/search/projects",
  REQUIREMENTS: "/search/requirements",
  USERS: "/search/users",
} as const;

/**
 * Helper function to build query string from params
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Export all endpoints as a single object for easy access
 */
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  PROJECT: PROJECT_ENDPOINTS,
  GITHUB_REPO: GITHUB_REPO_ENDPOINTS,
  INTEGRATION: INTEGRATION_ENDPOINTS,
  REQUIREMENT: REQUIREMENT_ENDPOINTS,
  DASHBOARD: DASHBOARD_ENDPOINTS,
  FILE: FILE_ENDPOINTS,
  NOTIFICATION: NOTIFICATION_ENDPOINTS,
  SETTINGS: SETTINGS_ENDPOINTS,
  SEARCH: SEARCH_ENDPOINTS,
} as const;
