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
  generateProjectQaTestSuite,
  createProjectAiChatSession,
  submitProjectAiRequirements,
  type RagnarockChatQueuedResponse,
  type RagnarockDetectedAction,
  type AiTurnQueuedResponse,
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

export type QaIntelligenceCompletedEvent = {
  jobId: string;
  documentationId: string;
  title: string;
};
export type QaIntelligenceFailedEvent = { jobId: string; error: string };

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
  onQaCompleted?: (payload: QaIntelligenceCompletedEvent) => void;
  onQaFailed?: (payload: QaIntelligenceFailedEvent) => void;
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
    const onQaDone = (p: QaIntelligenceCompletedEvent) => callbacksRef.current.onQaCompleted?.(p);
    const onQaFail = (p: QaIntelligenceFailedEvent) => callbacksRef.current.onQaFailed?.(p);

    socket.on("ragnarock_chat_processing", onProc);
    socket.on("ragnarock_chat_completed", onDone);
    socket.on("ragnarock_chat_failed", onFail);
    socket.on("arch_doc_completed", onDocDone);
    socket.on("arch_doc_failed", onDocFail);
    socket.on("planner_completed", onPlanDone);
    socket.on("planner_failed", onPlanFail);
    socket.on("qa_intelligence_completed", onQaDone);
    socket.on("qa_intelligence_failed", onQaFail);

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
      socket.off("qa_intelligence_completed", onQaDone);
      socket.off("qa_intelligence_failed", onQaFail);
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

export function useGenerateQaTestSuite(
  options?: UseMutationOptions<{ jobId: string; status: "queued" }, Error, { projectId: string }>,
) {
  return useMutation({
    ...options,
    mutationFn: ({ projectId }) => generateProjectQaTestSuite(projectId),
  });
}

// ─── Requirements (SRS) session socket + mutations ────────────────────────────

export type SrsTurnCompletedEvent = {
  userMessageId: string;
  assistantMessageId: string;
  agent: {
    status: string;
    questions?: string[];
    [key: string]: unknown;
  };
  specificationId?: string;
};

export type SrsProcessingEvent = { jobId: string; userMessageId: string };
export type SrsTurnFailedEvent = { userMessageId: string; error: string };

export type UseSrsSessionSocketOptions = {
  projectId: string | null;
  sessionId: string | null;
  onSessionJoined?: () => void;
  onProcessing?: (payload: SrsProcessingEvent) => void;
  onTurnCompleted?: (payload: SrsTurnCompletedEvent) => void;
  onTurnFailed?: (payload: SrsTurnFailedEvent) => void;
};

export function useSrsSessionSocket(options: UseSrsSessionSocketOptions) {
  const { projectId, sessionId } = options;
  const callbacksRef = useRef(options);

  useEffect(() => {
    callbacksRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!projectId || !sessionId) return;

    const baseUrl = getApiBaseUrl();
    const socket: Socket = io(`${baseUrl}/ai-chat`, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const onProc = (p: SrsProcessingEvent) => callbacksRef.current.onProcessing?.(p);
    const onDone = (p: SrsTurnCompletedEvent) => callbacksRef.current.onTurnCompleted?.(p);
    const onFail = (p: SrsTurnFailedEvent) => callbacksRef.current.onTurnFailed?.(p);

    socket.on("processing", onProc);
    socket.on("turn_completed", onDone);
    socket.on("turn_failed", onFail);

    const joinRooms = () => {
      socket.emit("join_project", { projectId });
      // Use the ack callback — fires only after the server confirms the room join
      socket.emit("join_session", { projectId, sessionId }, (ack: { ok: boolean }) => {
        if (ack?.ok) callbacksRef.current.onSessionJoined?.();
      });
    };
    socket.on("connect", joinRooms);
    if (socket.connected) joinRooms();

    return () => {
      socket.off("processing", onProc);
      socket.off("turn_completed", onDone);
      socket.off("turn_failed", onFail);
      socket.off("connect", joinRooms);
      socket.disconnect();
    };
  }, [projectId, sessionId]);
}

export function useCreateSrsSession(
  options?: UseMutationOptions<{ id: string }, Error, { projectId: string }>,
) {
  return useMutation({
    ...options,
    mutationFn: ({ projectId }) =>
      createProjectAiChatSession(projectId, { agentType: "requirements" }) as Promise<{ id: string }>,
  });
}

export function useSubmitSrsMessage(
  options?: UseMutationOptions<
    AiTurnQueuedResponse,
    Error,
    { projectId: string; sessionId: string; input: string }
  >,
) {
  return useMutation({
    ...options,
    mutationFn: ({ projectId, sessionId, input }) =>
      submitProjectAiRequirements(projectId, { sessionId, input, type: "text" }),
  });
}
