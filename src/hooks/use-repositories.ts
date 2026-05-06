import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import {
  browseRepository,
  getProjectRepository,
  getRepositoryFile,
  linkProjectRepository,
  listProjectRepositories,
  listRepositoryCommits,
  listRepositoryContributors,
  listRepositoryIssues,
  listRepositoryPulls,
  refreshProjectRepository,
  searchMyGithubRepos,
  unlinkProjectRepository,
  type BrowseRepositoryParams,
  type LinkProjectRepositoryDto,
  type ListRepoCommitsParams,
  type ListRepoIssuesParams,
  type ListRepoPullsParams,
  type SearchMyGithubReposParams,
} from "@/api/repositories.api";

export const repositoryKeys = {
  all: ["repositories"] as const,
  list: (projectId: string) => [...repositoryKeys.all, "list", projectId] as const,
  detail: (projectId: string, repositoryId: string) =>
    [...repositoryKeys.all, "detail", projectId, repositoryId] as const,
  browse: (projectId: string, repositoryId: string, params: BrowseRepositoryParams) =>
    [...repositoryKeys.all, "browse", projectId, repositoryId, params] as const,
  file: (projectId: string, repositoryId: string, params: { path: string; ref?: string }) =>
    [...repositoryKeys.all, "file", projectId, repositoryId, params] as const,
  commits: (projectId: string, repositoryId: string, params: ListRepoCommitsParams) =>
    [...repositoryKeys.all, "commits", projectId, repositoryId, params] as const,
  contributors: (projectId: string, repositoryId: string) =>
    [...repositoryKeys.all, "contributors", projectId, repositoryId] as const,
  pulls: (projectId: string, repositoryId: string, params: ListRepoPullsParams) =>
    [...repositoryKeys.all, "pulls", projectId, repositoryId, params] as const,
  issues: (projectId: string, repositoryId: string, params: ListRepoIssuesParams) =>
    [...repositoryKeys.all, "issues", projectId, repositoryId, params] as const,
  githubSearch: (params: SearchMyGithubReposParams) =>
    [...repositoryKeys.all, "github-search", params] as const,
};

export function useProjectRepositories(
  projectId: string,
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof listProjectRepositories>>, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: repositoryKeys.list(projectId),
    queryFn: () => listProjectRepositories(projectId),
    enabled: Boolean(projectId),
    ...options,
  });
}

export function useProjectRepositoryDetail(
  projectId: string,
  repositoryId: string,
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof getProjectRepository>>, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: repositoryKeys.detail(projectId, repositoryId),
    queryFn: () => getProjectRepository(projectId, repositoryId),
    enabled: Boolean(projectId && repositoryId),
    ...options,
  });
}

export function useRepositoryCommits(
  projectId: string,
  repositoryId: string,
  params: ListRepoCommitsParams,
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof listRepositoryCommits>>, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: repositoryKeys.commits(projectId, repositoryId, params),
    queryFn: () => listRepositoryCommits(projectId, repositoryId, params),
    enabled: Boolean(projectId && repositoryId),
    ...options,
  });
}

export function useRepositoryContributors(
  projectId: string,
  repositoryId: string,
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof listRepositoryContributors>>, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: repositoryKeys.contributors(projectId, repositoryId),
    queryFn: () => listRepositoryContributors(projectId, repositoryId),
    enabled: Boolean(projectId && repositoryId),
    ...options,
  });
}

export function useRepositoryPulls(
  projectId: string,
  repositoryId: string,
  params: ListRepoPullsParams,
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof listRepositoryPulls>>, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: repositoryKeys.pulls(projectId, repositoryId, params),
    queryFn: () => listRepositoryPulls(projectId, repositoryId, params),
    enabled: Boolean(projectId && repositoryId),
    ...options,
  });
}

export function useRepositoryIssues(
  projectId: string,
  repositoryId: string,
  params: ListRepoIssuesParams,
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof listRepositoryIssues>>, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: repositoryKeys.issues(projectId, repositoryId, params),
    queryFn: () => listRepositoryIssues(projectId, repositoryId, params),
    enabled: Boolean(projectId && repositoryId),
    ...options,
  });
}

export function useRepositoryBrowse(
  projectId: string,
  repositoryId: string,
  params: BrowseRepositoryParams,
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof browseRepository>>, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: repositoryKeys.browse(projectId, repositoryId, params),
    queryFn: () => browseRepository(projectId, repositoryId, params),
    enabled: Boolean(projectId && repositoryId),
    ...options,
  });
}

export function useRepositoryFile(
  projectId: string,
  repositoryId: string,
  params: { path: string; ref?: string },
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof getRepositoryFile>>, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: repositoryKeys.file(projectId, repositoryId, params),
    queryFn: () => getRepositoryFile(projectId, repositoryId, params),
    enabled: Boolean(projectId && repositoryId && params.path),
    ...options,
  });
}

export function useGithubRepoSearch(
  params: SearchMyGithubReposParams,
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof searchMyGithubRepos>>, Error>, "queryKey" | "queryFn">,
) {
  const { enabled = true, ...rest } = options ?? {};
  return useQuery({
    queryKey: repositoryKeys.githubSearch(params),
    queryFn: () => searchMyGithubRepos(params),
    enabled,
    ...rest,
  });
}

export function useLinkProjectRepository(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: LinkProjectRepositoryDto) => linkProjectRepository(projectId, dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: repositoryKeys.list(projectId) });
    },
  });
}

export function useUnlinkProjectRepository(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (repositoryId: string) => unlinkProjectRepository(projectId, repositoryId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: repositoryKeys.list(projectId) });
    },
  });
}

export function useRefreshProjectRepository(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (repositoryId: string) => refreshProjectRepository(projectId, repositoryId),
    onSuccess: async (_, repositoryId) => {
      await qc.invalidateQueries({ queryKey: repositoryKeys.list(projectId) });
      await qc.invalidateQueries({ queryKey: repositoryKeys.detail(projectId, repositoryId) });
    },
  });
}
