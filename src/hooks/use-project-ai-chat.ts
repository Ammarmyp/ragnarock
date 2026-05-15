"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { PaginationParams } from "@/types";
import {
  createProjectAiChatSession,
  getProjectAiDraft,
  getProjectSpecification,
  listProjectAiChatMessages,
  listProjectAiChatSessions,
  listProjectSpecifications,
  submitProjectAiRequirements,
  submitProjectAiRequirementsUpload,
  type AiTurnQueuedResponse,
  type CreateProjectAiChatSessionDto,
  type ProjectAiChatMessage,
  type ProjectAiChatSession,
  type ProjectAiChatSessionWithProgress,
  type ProjectAiDraft,
  type ProjectSpecification,
} from "@/api/projects.api";
import type { PaginatedResponse } from "@/types";
import { projectKeys } from "./use-projects";

export type { ProjectAiChatSessionWithProgress, ProjectAiDraft, ProjectSpecification };

/** The project's single shared draft SRS — what every new chat continues from. */
export function useProjectAiDraft(
  projectId: string,
  options?: Omit<UseQueryOptions<ProjectAiDraft, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: projectKeys.aiDraft(projectId),
    queryFn: () => getProjectAiDraft(projectId),
    enabled: !!projectId,
    staleTime: 0,
    ...options,
  });
}

const defaultMessagesLimit = 100;

export function useProjectAiChatSessions(
  projectId: string,
  params: PaginationParams = { page: 1, limit: 20 },
  options?: Omit<UseQueryOptions<PaginatedResponse<ProjectAiChatSession>, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: projectKeys.aiChatSessions(projectId, params),
    queryFn: () => listProjectAiChatSessions(projectId, params),
    enabled: !!projectId,
    ...options,
  });
}

export function useProjectAiChatMessages(
  projectId: string,
  sessionId: string | null,
  params: PaginationParams = { page: 1, limit: defaultMessagesLimit },
  options?: Omit<UseQueryOptions<PaginatedResponse<ProjectAiChatMessage>, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: sessionId ? projectKeys.aiChatMessages(projectId, sessionId, params) : ["ai-chat-messages", "disabled"],
    queryFn: () => listProjectAiChatMessages(projectId, sessionId!, params),
    enabled: !!projectId && !!sessionId,
    ...options,
  });
}

function invalidateAiChatQueries(queryClient: ReturnType<typeof useQueryClient>, projectId: string, sessionId?: string) {
  void queryClient.invalidateQueries({ queryKey: [...projectKeys.detail(projectId), "ai-chat-sessions"] });
  if (sessionId) {
    void queryClient.invalidateQueries({
      queryKey: [...projectKeys.detail(projectId), "ai-chat-messages", sessionId],
    });
  } else {
    void queryClient.invalidateQueries({ queryKey: [...projectKeys.detail(projectId), "ai-chat-messages"] });
  }
}

export function useCreateProjectAiChatSession(
  options?: UseMutationOptions<
    ProjectAiChatSession,
    Error,
    { projectId: string; data?: CreateProjectAiChatSessionDto }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, data }) => createProjectAiChatSession(projectId, data),
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateAiChatQueries(queryClient, variables.projectId);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useSubmitAiRequirementsTurn(
  options?: UseMutationOptions<
    AiTurnQueuedResponse,
    Error,
    { projectId: string; sessionId: string; input: string; type: "text" | "url" }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, sessionId, input, type }) =>
      submitProjectAiRequirements(projectId, { sessionId, input, type }),
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateAiChatQueries(queryClient, variables.projectId, variables.sessionId);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useSubmitAiRequirementsUpload(
  options?: UseMutationOptions<
    AiTurnQueuedResponse,
    Error,
    { projectId: string; sessionId: string; file: File }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ projectId, sessionId, file }) => submitProjectAiRequirementsUpload(projectId, sessionId, file),
    onSuccess: (data, variables, onMutateResult, context) => {
      invalidateAiChatQueries(queryClient, variables.projectId, variables.sessionId);
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useProjectAiChatSessionsWithProgress(
  projectId: string,
  params: PaginationParams = { page: 1, limit: 20 },
  options?: Omit<UseQueryOptions<PaginatedResponse<ProjectAiChatSessionWithProgress>, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: [...projectKeys.aiChatSessions(projectId, params), "with-progress"],
    queryFn: () => listProjectAiChatSessions(projectId, params) as Promise<PaginatedResponse<ProjectAiChatSessionWithProgress>>,
    enabled: !!projectId,
    ...options,
  });
}

export function useProjectSpecifications(
  projectId: string,
  params: PaginationParams = { page: 1, limit: 20 },
  options?: Omit<UseQueryOptions<PaginatedResponse<ProjectSpecification>, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: [...projectKeys.detail(projectId), "specifications", params],
    queryFn: () => listProjectSpecifications(projectId, params),
    enabled: !!projectId,
    ...options,
  });
}

export function useProjectSpecification(
  projectId: string,
  specificationId: string | null,
  options?: Omit<UseQueryOptions<ProjectSpecification, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: [...projectKeys.detail(projectId), "specifications", specificationId],
    queryFn: () => getProjectSpecification(projectId, specificationId!),
    enabled: !!projectId && !!specificationId,
    ...options,
  });
}
