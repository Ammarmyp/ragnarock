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
  listProjectAiChatMessages,
  listProjectAiChatSessions,
  submitProjectAiRequirements,
  submitProjectAiRequirementsUpload,
  type AiTurnCompletedResponse,
  type CreateProjectAiChatSessionDto,
  type ProjectAiChatMessage,
  type ProjectAiChatSession,
} from "@/api/projects.api";
import type { PaginatedResponse } from "@/types";
import { projectKeys } from "./use-projects";

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
    AiTurnCompletedResponse,
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
    AiTurnCompletedResponse,
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
