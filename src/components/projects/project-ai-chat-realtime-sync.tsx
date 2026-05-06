"use client";

import { useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "@/hooks/use-projects";
import { useProjectAiChatSocket } from "@/hooks/use-project-ai-chat-socket";

/**
 * Keeps TanStack Query caches warm when the Nest AI chat emits `turn_completed`.
 * Set `backendAiChatSessionId` on the requirements workspace store when a persisted session exists.
 */
export function ProjectAiChatRealtimeSync(props: { projectId: string; sessionId: string | null }) {
  const queryClient = useQueryClient();

  useProjectAiChatSocket({
    sessionId: props.sessionId,
    enabled: Boolean(props.sessionId),
    onTurnCompleted: () => {
      if (!props.sessionId) return;
      void queryClient.invalidateQueries({
        queryKey: [...projectKeys.detail(props.projectId), "ai-chat-messages", props.sessionId],
      });
      void queryClient.invalidateQueries({
        queryKey: [...projectKeys.detail(props.projectId), "specifications"],
      });
    },
  });

  return null;
}
