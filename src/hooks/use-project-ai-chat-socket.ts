"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { getApiBaseUrl } from "@/api/client";

export type AiProcessingEvent = { phase: string; userMessageId?: string };

export type AiTurnCompletedEvent = {
  userMessageId: string;
  assistantMessageId: string;
  agent: unknown;
  specificationId?: string;
};

export type AiErrorEvent = { code: unknown; message: string };

export type UseProjectAiChatSocketOptions = {
  sessionId: string | null;
  enabled?: boolean;
  onProcessing?: (payload: AiProcessingEvent) => void;
  onTurnCompleted?: (payload: AiTurnCompletedEvent) => void;
  onError?: (payload: AiErrorEvent) => void;
};

/**
 * Subscribes to Nest `/ai-chat` Socket.IO namespace (Better Auth cookie session).
 * Joins `sessionId` room after connect; listens for `processing`, `turn_completed`, and `error`.
 */
export function useProjectAiChatSocket(options: UseProjectAiChatSocketOptions) {
  const { sessionId, enabled = true } = options;
  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  useEffect(() => {
    if (!enabled || !sessionId) {
      return;
    }

    const baseUrl = getApiBaseUrl();
    const socket: Socket = io(`${baseUrl}/ai-chat`, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const onProc = (payload: AiProcessingEvent) => {
      callbacksRef.current.onProcessing?.(payload);
    };
    const onDone = (payload: AiTurnCompletedEvent) => {
      callbacksRef.current.onTurnCompleted?.(payload);
    };
    const onWsErr = (payload: AiErrorEvent) => {
      callbacksRef.current.onError?.(payload);
    };

    socket.on("processing", onProc);
    socket.on("turn_completed", onDone);
    socket.on("error", onWsErr);

    const join = () => {
      socket.emit(
        "join_session",
        { sessionId },
        (ack: { ok?: boolean; code?: string; message?: string }) => {
          if (ack && ack.ok === false) {
            callbacksRef.current.onError?.({
              code: ack.code ?? "JOIN_FAILED",
              message: ack.message ?? "Failed to join AI chat session",
            });
          }
        },
      );
    };

    socket.on("connect", join);
    if (socket.connected) {
      join();
    }

    socket.on("connect_error", (err: Error) => {
      callbacksRef.current.onError?.({ code: "CONNECT_ERROR", message: err.message });
    });

    return () => {
      socket.off("processing", onProc);
      socket.off("turn_completed", onDone);
      socket.off("error", onWsErr);
      socket.off("connect", join);
      socket.disconnect();
    };
  }, [enabled, sessionId]);
}
