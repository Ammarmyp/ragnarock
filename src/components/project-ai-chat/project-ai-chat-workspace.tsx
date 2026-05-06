"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquarePlus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { projectKeys, useProjectRole } from "@/hooks/use-projects";
import {
  useCreateProjectAiChatSession,
  useProjectAiChatMessages,
  useProjectAiChatSessions,
  useSubmitAiRequirementsTurn,
  useSubmitAiRequirementsUpload,
} from "@/hooks/use-project-ai-chat";
import { useProjectAiChatSocket } from "@/hooks/use-project-ai-chat-socket";
import { cn } from "@/lib/utils";
import type { ProjectAiChatSession } from "@/api/projects.api";

const messagesQueryParams = { page: 1, limit: 100 } as const;
const sessionsQueryParams = { page: 1, limit: 30 } as const;

function axiosErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const d = err.response?.data as { message?: string; detail?: string } | string | undefined;
    if (typeof d === "string") return d;
    if (d && typeof d === "object") {
      if (typeof d.message === "string") return d.message;
      if (typeof d.detail === "string") return d.detail;
    }
    return err.message || "Request failed";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

export function ProjectAiChatWorkspace({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const { data: roleData } = useProjectRole(projectId);
  const isViewer = roleData?.role === "viewer";

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "url">("text");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessionsPage, isLoading: sessionsLoading } = useProjectAiChatSessions(
    projectId,
    sessionsQueryParams,
  );
  const { data: messagesPage, isLoading: messagesLoading } = useProjectAiChatMessages(
    projectId,
    activeSessionId,
    messagesQueryParams,
  );

  const onCreateSessionSuccess = useCallback((session: ProjectAiChatSession) => {
    setActiveSessionId(session.id);
    setSubmitError(null);
  }, []);
  const onCreateSessionError = useCallback((e: Error) => {
    setSubmitError(axiosErrorMessage(e));
  }, []);

  const createSession = useCreateProjectAiChatSession({
    onSuccess: onCreateSessionSuccess,
    onError: onCreateSessionError,
  });
  const submitTurn = useSubmitAiRequirementsTurn();
  const submitUpload = useSubmitAiRequirementsUpload();

  const invalidateFromSocket = useCallback(() => {
    if (!activeSessionId) return;
    void queryClient.invalidateQueries({
      queryKey: [...projectKeys.detail(projectId), "ai-chat-messages", activeSessionId],
    });
    void queryClient.invalidateQueries({
      queryKey: [...projectKeys.detail(projectId), "ai-chat-sessions"],
    });
  }, [queryClient, projectId, activeSessionId]);

  useProjectAiChatSocket({
    sessionId: activeSessionId,
    enabled: Boolean(activeSessionId),
    onProcessing: () => {
      setAgentStatus("Agent is processing your message...");
      invalidateFromSocket();
    },
    onTurnCompleted: () => {
      setAgentStatus(null);
      invalidateFromSocket();
    },
    onTurnFailed: (payload) => {
      setAgentStatus(null);
      setSubmitError(payload.error || "The AI agent could not process this message.");
      invalidateFromSocket();
    },
    onError: (payload) => {
      setSubmitError(payload.message);
    },
  });

  const messages = messagesPage?.data ?? [];
  const sessions = sessionsPage?.data ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeSessionId, agentStatus]);

  const handleNewChat = () => {
    setSubmitError(null);
    createSession.mutate({ projectId, data: {} });
  };

  const handleSend = () => {
    if (!activeSessionId || !input.trim()) return;
    setSubmitError(null);
    submitTurn.mutate(
      { projectId, sessionId: activeSessionId, input: input.trim(), type: inputMode },
      {
        onSuccess: () => {
          setInput("");
          setAgentStatus("Agent queued your message...");
        },
        onError: (e) => setSubmitError(axiosErrorMessage(e)),
      },
    );
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !activeSessionId) return;
    setUploadError(null);
    submitUpload.mutate(
      { projectId, sessionId: activeSessionId, file },
      {
        onSuccess: () => setAgentStatus("Agent queued your upload..."),
        onError: (err) => setUploadError(axiosErrorMessage(err)),
      },
    );
  };

  const busy = submitTurn.isPending || submitUpload.isPending || createSession.isPending || Boolean(agentStatus);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row">
      <aside className="flex w-full shrink-0 flex-col gap-2 border-b pb-4 md:w-56 md:border-b-0 md:border-r md:pb-0 md:pr-4">
        <Button
          type="button"
          variant="default"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={handleNewChat}
          disabled={isViewer || busy}
        >
          {createSession.isPending ? <Loader2 className="size-4 animate-spin" /> : <MessageSquarePlus className="size-4" />}
          New chat
        </Button>
        <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Sessions</div>
        <div className="flex max-h-48 flex-col gap-1 overflow-y-auto md:max-h-[min(60vh,28rem)]">
          {sessionsLoading ? (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No sessions yet.</p>
          ) : (
            sessions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveSessionId(s.id);
                  setSubmitError(null);
                  setUploadError(null);
                  setAgentStatus(null);
                }}
                className={cn(
                  "hover:bg-muted rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  activeSessionId === s.id && "bg-muted font-medium",
                )}
              >
                <span className="line-clamp-2">{s.title || `Chat ${s.id.slice(0, 8)}`}</span>
                <span className="text-muted-foreground text-xs">
                  {s._count?.messages != null ? `${s._count.messages} messages` : ""}
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        {!activeSessionId ? (
          <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center text-sm">
            <p>Select a session or start a new chat.</p>
            {submitError ? <p className="text-destructive max-w-md text-sm">{submitError}</p> : null}
          </div>
        ) : (
          <>
            <div className="bg-muted/30 flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border">
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messagesLoading ? (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Loader2 className="size-4 animate-spin" /> Loading messages…
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Send text, a URL, or a file to run the requirements agent.</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "max-w-[min(100%,42rem)] rounded-lg px-3 py-2 text-sm",
                        m.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted mr-auto",
                      )}
                    >
                      <div className="text-muted-foreground mb-1 text-[10px] uppercase tracking-wide opacity-80">
                        {m.role}
                      </div>
                      <pre className="font-sans whitespace-pre-wrap wrap-break-word">{m.content}</pre>
                    </div>
                  ))
                )}
                {agentStatus ? (
                  <div className="bg-muted mr-auto flex max-w-[min(100%,42rem)] items-center gap-2 rounded-lg px-3 py-2 text-sm">
                    <Loader2 className="size-4 animate-spin" />
                    <span>{agentStatus}</span>
                  </div>
                ) : null}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {isViewer ? (
              <p className="text-muted-foreground text-sm">Viewers cannot send messages.</p>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground text-xs">Input type</span>
                  <Button
                    type="button"
                    variant={inputMode === "text" ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setInputMode("text")}
                    disabled={busy}
                  >
                    Text
                  </Button>
                  <Button
                    type="button"
                    variant={inputMode === "url" ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setInputMode("url")}
                    disabled={busy}
                  >
                    URL
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,text/plain,application/pdf"
                    className="hidden"
                    onChange={handleFileSelected}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {submitUpload.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                    Upload file
                  </Button>
                </div>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={inputMode === "url" ? "https://…" : "Describe what you need…"}
                  rows={4}
                  disabled={busy}
                  className="min-h-[6rem] resize-y"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" onClick={handleSend} disabled={busy || !input.trim()}>
                    {submitTurn.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    Send
                  </Button>
                </div>
                {submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}
                {uploadError ? <p className="text-destructive text-sm">{uploadError}</p> : null}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
