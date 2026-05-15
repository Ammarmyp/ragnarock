"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AgentRequirementPayload } from "@/api/projects.api";
import { projectKeys } from "@/hooks/use-projects";
import {
  useProjectAiChatSocket,
  type AiTurnCompletedEvent,
  type AiTurnFailedEvent,
} from "@/hooks/use-project-ai-chat-socket";
import { useRequirementsWorkspaceStore } from "@/stores/requirements-workspace.store";

/**
 * Keeps TanStack Query caches warm and dispatches Zustand store actions
 * when the Nest AI chat emits socket events.
 */
export function ProjectAiChatRealtimeSync(props: { projectId: string; sessionId: string | null }) {
  const queryClient = useQueryClient();
  const applyPartialSrs = useRequirementsWorkspaceStore((s) => s.applyPartialSrs);
  const applyCompletedSrs = useRequirementsWorkspaceStore((s) => s.applyCompletedSrs);
  const setAgentError = useRequirementsWorkspaceStore((s) => s.setAgentError);

  const onTurnCompleted = useCallback(
    (payload: AiTurnCompletedEvent) => {
      if (!props.sessionId) return;

      void queryClient.invalidateQueries({
        queryKey: [...projectKeys.detail(props.projectId), "ai-chat-messages", props.sessionId],
      });
      void queryClient.invalidateQueries({
        queryKey: [...projectKeys.detail(props.projectId), "ai-chat-sessions"],
      });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.aiDraft(props.projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: [...projectKeys.detail(props.projectId), "specifications"],
      });

      const agent = payload.agent as Record<string, unknown> | null;
      if (!agent) return;

      if (agent.status === "needs_clarification") {
        const questions = (agent.questions as string[] | undefined) ?? [];
        const partial = (agent.partial_srs as Parameters<typeof applyPartialSrs>[0] | undefined) ?? {};
        applyPartialSrs(partial, questions, payload.assistantMessageId);
      } else if (agent.status === "complete") {
        applyCompletedSrs(
          agent as unknown as AgentRequirementPayload,
          payload.specificationId ?? "",
          payload.assistantMessageId,
        );
      }
    },
    [props.projectId, props.sessionId, queryClient, applyPartialSrs, applyCompletedSrs],
  );

  const onTurnFailed = useCallback(
    (payload: AiTurnFailedEvent) => {
      setAgentError(payload.error ?? "Agent failed. Please try again.");
    },
    [setAgentError],
  );

  useProjectAiChatSocket({
    sessionId: props.sessionId,
    enabled: Boolean(props.sessionId),
    onTurnCompleted,
    onTurnFailed,
    onError: (e) => setAgentError(e.message),
  });

  return null;
}
