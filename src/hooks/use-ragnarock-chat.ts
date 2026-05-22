"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { getApiBaseUrl } from "@/api/client";
import {
  sendRagnarockMessage,
  createRagnarockSession,
  generateProjectPlan,
  generateProjectArchDoc,
  type RagnarockChatQueuedResponse,
  type RagnarockDetectedAction,
  type ArchDocType,
} from "@/api/projects.api";

// ─── Socket event shapes ──────────────────────────────────────────────────────

export type RagnarockProcessingEvent = { jobId: string };

export type RagnarockCompletedEvent = {
  jobId: string;
  answer: string;
  detectedAction: RagnarockDetectedAction | null;
};

export type RagnarockFailedEvent = { jobId: string; error: string };

export type ArchDocCompletedEvent = {
  jobId: string;
  documentationId: string;
  docType: string;
  title: string;
  content: string;
  layer?: string;
};

export type ArchDocFailedEvent = { jobId: string; error: string };

export type PlannerCompletedEvent = { jobId: string; taskCount: number };
export type PlannerFailedEvent = { jobId: string; error: string };

export type UseRagnarockSocketOptions = {
  projectId: string | null;
  enabled?: boolean;
  onProcessing?: (payload: RagnarockProcessingEvent) => void;
  onCompleted?: (payload: RagnarockCompletedEvent) => void;
  onFailed?: (payload: RagnarockFailedEvent) => void;
  onArchDocCompleted?: (payload: ArchDocCompletedEvent) => void;
  onArchDocFailed?: (payload: ArchDocFailedEvent) => void;
  onPlannerCompleted?: (payload: PlannerCompletedEvent) => void;
  onPlannerFailed?: (payload: PlannerFailedEvent) => void;
};

export function useRagnarockSocket(options: UseRagnarockSocketOptions) {
  const { projectId, enabled = true } = options;
  const callbacksRef = useRef(options);

  useEffect(() => {
    callbacksRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!enabled || !projectId) return;

    const baseUrl = getApiBaseUrl();
    const socket: Socket = io(`${baseUrl}/ai-chat`, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const onProc = (p: RagnarockProcessingEvent) => callbacksRef.current.onProcessing?.(p);
    const onDone = (p: RagnarockCompletedEvent) => callbacksRef.current.onCompleted?.(p);
    const onFail = (p: RagnarockFailedEvent) => callbacksRef.current.onFailed?.(p);
    const onDocDone = (p: ArchDocCompletedEvent) => callbacksRef.current.onArchDocCompleted?.(p);
    const onDocFail = (p: ArchDocFailedEvent) => callbacksRef.current.onArchDocFailed?.(p);
    const onPlanDone = (p: PlannerCompletedEvent) => callbacksRef.current.onPlannerCompleted?.(p);
    const onPlanFail = (p: PlannerFailedEvent) => callbacksRef.current.onPlannerFailed?.(p);

    socket.on("ragnarock_chat_processing", onProc);
    socket.on("ragnarock_chat_completed", onDone);
    socket.on("ragnarock_chat_failed", onFail);
    socket.on("arch_doc_completed", onDocDone);
    socket.on("arch_doc_failed", onDocFail);
    socket.on("planner_completed", onPlanDone);
    socket.on("planner_failed", onPlanFail);

    const joinProject = () => socket.emit("join_project", { projectId });
    socket.on("connect", joinProject);
    if (socket.connected) joinProject();

    return () => {
      socket.off("ragnarock_chat_processing", onProc);
      socket.off("ragnarock_chat_completed", onDone);
      socket.off("ragnarock_chat_failed", onFail);
      socket.off("arch_doc_completed", onDocDone);
      socket.off("arch_doc_failed", onDocFail);
      socket.off("planner_completed", onPlanDone);
      socket.off("planner_failed", onPlanFail);
      socket.off("connect", joinProject);
      socket.disconnect();
    };
  }, [enabled, projectId]);
}

// ─── Mutation hooks ───────────────────────────────────────────────────────────

export function useSendRagnarockMessage(
  options?: UseMutationOptions<
    RagnarockChatQueuedResponse,
    Error,
    { projectId: string; sessionId: string; message: string }
  >,
) {
  return useMutation({
    ...options,
    mutationFn: ({ projectId, sessionId, message }) =>
      sendRagnarockMessage(projectId, sessionId, message),
  });
}

export function useCreateRagnarockSession(
  options?: UseMutationOptions<{ sessionId: string }, Error, { projectId: string }>,
) {
  return useMutation({
    ...options,
    mutationFn: ({ projectId }) => createRagnarockSession(projectId) as Promise<{ sessionId: string }>,
  });
}

export function useGeneratePlan(
  options?: UseMutationOptions<{ jobId: string; status: string }, Error, { projectId: string }>,
) {
  return useMutation({
    ...options,
    mutationFn: ({ projectId }) => generateProjectPlan(projectId),
  });
}

export function useGenerateArchDoc(
  options?: UseMutationOptions<
    { jobId: string; status: string },
    Error,
    { projectId: string; docType: ArchDocType }
  >,
) {
  return useMutation({
    ...options,
    mutationFn: ({ projectId, docType }) => generateProjectArchDoc(projectId, { docType }),
  });
}
