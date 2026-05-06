import type { AxiosResponse } from "axios";
import axios from "axios";
import apiClient from "./client";
import { GITHUB_REPO_ENDPOINTS, PROJECT_ENDPOINTS, buildQueryString } from "./endpoints";

function parseResponseData<T>(response: AxiosResponse<unknown>): T {
  const body = response.data as unknown;
  if (
    body &&
    typeof body === "object" &&
    "success" in body &&
    "data" in body &&
    typeof (body as { success?: unknown }).success === "boolean"
  ) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export const GITHUB_INTEGRATION_CODES = {
  NOT_LINKED: "GITHUB_NOT_LINKED",
  FORBIDDEN: "GITHUB_FORBIDDEN",
  RATE_LIMIT: "GITHUB_RATE_LIMIT",
} as const;

export type LinkedProjectRepository = {
  id: string;
  projectId: string;
  githubRepoId: string;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  visibility: string;
  defaultBranch: string;
  htmlUrl: string;
  stargazersCount: number;
  pushedAt: string | null;
  cachedAt: string;
  linkedByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type GithubRepoLiveSnapshot = {
  githubRepoId: string;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  visibility: string;
  defaultBranch: string;
  htmlUrl: string;
  stargazersCount: number;
  pushedAt: string | null;
};

export type ProjectRepositoryDetail = LinkedProjectRepository & {
  live: GithubRepoLiveSnapshot | null;
};

export type LinkProjectRepositoryDto = {
  owner: string;
  name: string;
};

export type GithubRepoSearchItem = {
  githubRepoId: string;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  visibility: string;
  defaultBranch: string;
  htmlUrl: string;
  stargazersCount: number;
  pushedAt: string | null;
};

export type GithubRepoSearchResponse = {
  items: GithubRepoSearchItem[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type GithubCommitListItem = {
  sha: string;
  message: string;
  authorName: string;
  authorLogin: string | null;
  authorAvatarUrl: string | null;
  committedAt: string | null;
  htmlUrl: string;
};

export type GithubContributorItem = {
  login: string;
  avatarUrl: string;
  contributions: number;
  htmlUrl: string;
};

export type GithubPullItem = {
  number: number;
  title: string;
  state: string;
  draft: boolean | null;
  authorLogin: string | null;
  authorAvatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
};

export type GithubIssueItem = {
  number: number;
  title: string;
  state: string;
  authorLogin: string | null;
  authorAvatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
};

export type RepositoryBrowseItem = {
  type: "dir" | "file";
  name: string;
  path: string;
  sha: string;
  size: number | null;
};

export type RepositoryBrowseResponse = {
  ref: string;
  path: string;
  items: RepositoryBrowseItem[];
};

export type RepositoryFileResponse = {
  ref: string;
  path: string;
  name: string;
  sha: string;
  size: number | null;
  truncated: boolean;
  content: string;
};

export async function listProjectRepositories(projectId: string): Promise<LinkedProjectRepository[]> {
  const response = await apiClient.get(PROJECT_ENDPOINTS.REPOSITORIES(projectId));
  return parseResponseData<LinkedProjectRepository[]>(response);
}

export async function getProjectRepository(
  projectId: string,
  repositoryId: string,
): Promise<ProjectRepositoryDetail> {
  const response = await apiClient.get(PROJECT_ENDPOINTS.REPOSITORY(projectId, repositoryId));
  return parseResponseData<ProjectRepositoryDetail>(response);
}

export async function linkProjectRepository(
  projectId: string,
  dto: LinkProjectRepositoryDto,
): Promise<LinkedProjectRepository> {
  const response = await apiClient.post(PROJECT_ENDPOINTS.REPOSITORIES(projectId), dto);
  return parseResponseData<LinkedProjectRepository>(response);
}

export async function unlinkProjectRepository(projectId: string, repositoryId: string): Promise<{ success: boolean }> {
  const response = await apiClient.delete(PROJECT_ENDPOINTS.REPOSITORY(projectId, repositoryId));
  return parseResponseData<{ success: boolean }>(response);
}

export async function refreshProjectRepository(
  projectId: string,
  repositoryId: string,
): Promise<LinkedProjectRepository> {
  const response = await apiClient.post(PROJECT_ENDPOINTS.REPOSITORY_REFRESH(projectId, repositoryId));
  return parseResponseData<LinkedProjectRepository>(response);
}

export type ListRepoCommitsParams = {
  branch?: string;
  page?: number;
  perPage?: number;
};

export async function listRepositoryCommits(
  projectId: string,
  repositoryId: string,
  params?: ListRepoCommitsParams,
): Promise<GithubCommitListItem[]> {
  const qs = buildQueryString({
    branch: params?.branch,
    page: params?.page,
    perPage: params?.perPage,
  });
  const response = await apiClient.get(`${PROJECT_ENDPOINTS.REPOSITORY_COMMITS(projectId, repositoryId)}${qs}`);
  return parseResponseData<GithubCommitListItem[]>(response);
}

export async function listRepositoryContributors(
  projectId: string,
  repositoryId: string,
): Promise<GithubContributorItem[]> {
  const response = await apiClient.get(PROJECT_ENDPOINTS.REPOSITORY_CONTRIBUTORS(projectId, repositoryId));
  return parseResponseData<GithubContributorItem[]>(response);
}

export type ListRepoPullsParams = {
  state?: "open" | "closed" | "all";
  page?: number;
  perPage?: number;
};

export async function listRepositoryPulls(
  projectId: string,
  repositoryId: string,
  params?: ListRepoPullsParams,
): Promise<GithubPullItem[]> {
  const qs = buildQueryString({
    state: params?.state,
    page: params?.page,
    perPage: params?.perPage,
  });
  const response = await apiClient.get(`${PROJECT_ENDPOINTS.REPOSITORY_PULLS(projectId, repositoryId)}${qs}`);
  return parseResponseData<GithubPullItem[]>(response);
}

export type ListRepoIssuesParams = {
  state?: "open" | "closed" | "all";
  page?: number;
  perPage?: number;
};

export async function listRepositoryIssues(
  projectId: string,
  repositoryId: string,
  params?: ListRepoIssuesParams,
): Promise<GithubIssueItem[]> {
  const qs = buildQueryString({
    state: params?.state,
    page: params?.page,
    perPage: params?.perPage,
  });
  const response = await apiClient.get(`${PROJECT_ENDPOINTS.REPOSITORY_ISSUES(projectId, repositoryId)}${qs}`);
  return parseResponseData<GithubIssueItem[]>(response);
}

export type BrowseRepositoryParams = {
  path?: string;
  ref?: string;
};

export async function browseRepository(
  projectId: string,
  repositoryId: string,
  params?: BrowseRepositoryParams,
): Promise<RepositoryBrowseResponse> {
  const qs = buildQueryString({
    path: params?.path,
    ref: params?.ref,
  });
  const response = await apiClient.get(`${PROJECT_ENDPOINTS.REPOSITORY_BROWSE(projectId, repositoryId)}${qs}`);
  return parseResponseData<RepositoryBrowseResponse>(response);
}

export async function getRepositoryFile(
  projectId: string,
  repositoryId: string,
  params: { path: string; ref?: string },
): Promise<RepositoryFileResponse> {
  const qs = buildQueryString({
    path: params.path,
    ref: params.ref,
  });
  const response = await apiClient.get(`${PROJECT_ENDPOINTS.REPOSITORY_FILE(projectId, repositoryId)}${qs}`);
  return parseResponseData<RepositoryFileResponse>(response);
}

export type SearchMyGithubReposParams = {
  q?: string;
  page?: number;
  perPage?: number;
};

export async function searchMyGithubRepos(params?: SearchMyGithubReposParams): Promise<GithubRepoSearchResponse> {
  const qs = buildQueryString({
    q: params?.q,
    page: params?.page,
    perPage: params?.perPage,
  });
  const response = await apiClient.get(`${GITHUB_REPO_ENDPOINTS.SEARCH}${qs}`);
  return parseResponseData<GithubRepoSearchResponse>(response);
}

export function getGithubIntegrationErrorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }
  const data = error.response?.data as Record<string, unknown> | undefined;
  if (!data) {
    return undefined;
  }
  if (typeof data.code === "string") {
    return data.code;
  }
  const message = data.message;
  if (message && typeof message === "object" && "code" in message) {
    const c = (message as { code: unknown }).code;
    if (typeof c === "string") {
      return c;
    }
  }
  return undefined;
}

export function isGithubNotLinkedError(error: unknown): boolean {
  return getGithubIntegrationErrorCode(error) === GITHUB_INTEGRATION_CODES.NOT_LINKED;
}

export function getFriendlyRepositoryError(error: unknown): string {
  const code = getGithubIntegrationErrorCode(error);
  if (code === GITHUB_INTEGRATION_CODES.NOT_LINKED) {
    return "Connect GitHub under Account → Preferences to browse repository files.";
  }
  if (code === GITHUB_INTEGRATION_CODES.FORBIDDEN) {
    return "Your GitHub account doesn’t have permission to access this repository.";
  }
  if (code === GITHUB_INTEGRATION_CODES.RATE_LIMIT) {
    return "GitHub rate limit exceeded. Please try again in a minute.";
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 404) return "That file or folder could not be found.";
    if (status === 400) return "That request couldn’t be processed. Try again.";
    if (status === 401) return "Your session expired. Please sign in again.";
    if (status === 500) return "We couldn’t load this from GitHub right now. Please try again.";
    if (status === 503) return "Service temporarily unavailable. Please try again.";
  }

  return error instanceof Error && error.message ? "Something went wrong while loading repository code." : "Something went wrong.";
}
