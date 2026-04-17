// Core API Response Types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/** Aligns with backend `@app/common` `PaginatedResponseBase<T>`. */
export interface PaginatedResponseBase<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

// User & Auth Types (for future integration)
export type UserRole = 'admin' | 'manager' | 'user' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Navigation & Sidebar Types
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  disabled?: boolean;
  badge?: string | number;
  roles?: UserRole[]; // Roles that can see this nav item
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export interface SidebarConfig {
  navGroups: NavGroup[];
  footerItems?: NavItem[];
}

// Common UI Types
export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export type Theme = 'light' | 'dark' | 'system';

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;
