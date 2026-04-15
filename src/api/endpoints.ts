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
  GET: (id: string) => `/projects/${id}`,
  UPDATE: (id: string) => `/projects/${id}`,
  DELETE: (id: string) => `/projects/${id}`,
  ARCHIVE: (id: string) => `/projects/${id}/archive`,
  RESTORE: (id: string) => `/projects/${id}/restore`,
  MEMBERS: (id: string) => `/projects/${id}/members`,
  ADD_MEMBER: (id: string) => `/projects/${id}/members`,
  REMOVE_MEMBER: (id: string, memberId: string) =>
    `/projects/${id}/members/${memberId}`,
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
  REQUIREMENT: REQUIREMENT_ENDPOINTS,
  DASHBOARD: DASHBOARD_ENDPOINTS,
  FILE: FILE_ENDPOINTS,
  NOTIFICATION: NOTIFICATION_ENDPOINTS,
  SETTINGS: SETTINGS_ENDPOINTS,
  SEARCH: SEARCH_ENDPOINTS,
} as const;
