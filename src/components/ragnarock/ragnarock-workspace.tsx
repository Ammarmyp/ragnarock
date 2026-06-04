"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  BookOpen,
  ChevronRight,
  ClipboardList,
  FileText,
  FlaskConical,
  Loader2,
  SquarePen,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MarkdownContent } from "@/components/documentation/markdown-content";
import { cn } from "@/lib/utils";
import { useProject, useProjectRole } from "@/hooks/use-projects";
import { useProjectSpecifications } from "@/hooks/use-project-ai-chat";
import { useRequirementsWorkspaceStore } from "@/stores/requirements-workspace.store";
import { getProjectAiDraft } from "@/api/projects.api";
import type { RestoredSession } from "@/layouts/dashboard/projects/ragnarock-page-layout";
import {
  useSendRagnarockMessage,
  useRagnarockSocket,
  useGeneratePlan,
  useGenerateArchDoc,
  useGenerateQaTestSuite,
  useCreateRagnarockSession,
  useCreateSrsSession,
  useSubmitSrsMessage,
  useSrsSessionSocket,
} from "@/hooks/use-ragnarock-chat";
import type { RagnarockSessionMessage } from "@/api/projects.api";
import { RagnarockHistorySheet } from "./ragnarock-history-sheet";
import type { RagnarockDetectedAction } from "@/api/projects.api";
import type { RightPanelDocState, RightPanelPlanState } from "./ragnarock-right-panel";

// ─── Panel change event passed up to the page layout ─────────────────────────

export type PanelChangeEvent =
  | { mode: "idle" }
  | { mode: "srs" }
  | { mode: "plan"; state: RightPanelPlanState }
  | { mode: "doc"; state: RightPanelDocState }
  | { mode: "dev_intelligence" };

// ─── Slash command palette ────────────────────────────────────────────────────

type SlashCommand = {
  command: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  requiresSrs?: boolean;
  requiresRole?: "editor";
};

const ALL_COMMANDS: SlashCommand[] = [
  {
    command: "/srs",
    label: "Start SRS session",
    description: "Walk through requirements with the AI to build your SRS",
    icon: <FileText className="size-4" />,
    requiresRole: "editor",
  },
  {
    command: "/plan",
    label: "Generate task plan",
    description: "Create tasks in your backlog from the completed SRS",
    icon: <ClipboardList className="size-4" />,
    requiresSrs: true,
    requiresRole: "editor",
  },
  {
    command: "/doc sad",
    label: "Generate SAD",
    description: "Software Architecture Document — end-to-end system overview",
    icon: <BookOpen className="size-4" />,
    requiresSrs: true,
    requiresRole: "editor",
  },
  {
    command: "/doc hld",
    label: "Generate HLD",
    description: "High-Level Design — module breakdown and interface contracts",
    icon: <BookOpen className="size-4" />,
    requiresSrs: true,
    requiresRole: "editor",
  },
  {
    command: "/doc lld",
    label: "Generate LLD",
    description: "Low-Level Design — class diagrams, API specs, DB schema",
    icon: <BookOpen className="size-4" />,
    requiresSrs: true,
    requiresRole: "editor",
  },
  {
    command: "/doc adr",
    label: "Generate ADR",
    description: "Architecture Decision Record — context, decision, rationale",
    icon: <BookOpen className="size-4" />,
    requiresSrs: true,
    requiresRole: "editor",
  },
  {
    command: "/qa",
    label: "Generate test cases",
    description: "Generate a full QA test suite from the completed SRS",
    icon: <FlaskConical className="size-4" />,
    requiresSrs: true,
    requiresRole: "editor",
  },
];

function SlashPalette({
  commands,
  onSelect,
  onDismiss,
}: {
  commands: SlashCommand[];
  onSelect: (cmd: string) => void;
  onDismiss: () => void;
}) {
  const [focused, setFocused] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setFocused((f) => Math.min(f + 1, commands.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setFocused((f) => Math.max(f - 1, 0)); }
      else if (e.key === "Enter") { e.preventDefault(); if (commands[focused]) onSelect(commands[focused].command); }
      else if (e.key === "Escape") { onDismiss(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [commands, focused, onSelect, onDismiss]);

  if (commands.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border border-border/70 bg-background/95 shadow-xl shadow-black/10 backdrop-blur-md"
    >
      <div className="px-2 py-1.5">
        <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Commands
        </p>
        {commands.map((cmd, i) => (
          <button
            key={cmd.command}
            type="button"
            onMouseEnter={() => setFocused(i)}
            onClick={() => onSelect(cmd.command)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
              i === focused ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <span className="shrink-0 text-primary">{cmd.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium leading-none">{cmd.label}</span>
              <span className="mt-0.5 block truncate text-xs opacity-70">{cmd.description}</span>
            </span>
            <ChevronRight className="size-3.5 shrink-0 opacity-40" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Message types ────────────────────────────────────────────────────────────

type RagnarockMessage =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; answer: string; detectedAction: RagnarockDetectedAction | null };

// ─── Action confirmation card ─────────────────────────────────────────────────

function ActionConfirmCard({
  action,
  hasSrs,
  canEdit,
  onDismiss,
  onConfirm,
}: {
  action: RagnarockDetectedAction;
  hasSrs: boolean;
  canEdit: boolean;
  onDismiss: () => void;
  onConfirm: (action: RagnarockDetectedAction) => void;
}) {
  const ACTION_LABELS: Record<string, string> = {
    generate_srs: "Start SRS session",
    generate_plan: "Generate task plan",
    generate_doc: "Generate document",
  };

  const blocked = (action.type === "generate_plan" || action.type === "generate_doc") && !hasSrs;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <Badge variant="outline" className="border-primary/40 text-primary text-xs">
          Action detected
        </Badge>
      </div>
      <p className="text-sm leading-relaxed">{action.confirmationText}</p>
      {blocked && (
        <p className="text-xs text-muted-foreground rounded-lg border border-border/50 bg-muted/50 px-3 py-2">
          Complete the requirements session first to enable this action.
        </p>
      )}
      {!blocked && canEdit && (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => onConfirm(action)}>
            {ACTION_LABELS[action.type] ?? "Proceed"} →
          </Button>
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Quick starters ───────────────────────────────────────────────────────────

const QUICK_STARTERS = [
  "What's the current status of this project?",
  "Who is working on what?",
  "What tasks are in progress?",
  "Summarize the project documentation",
];

// ─── Main workspace ───────────────────────────────────────────────────────────

export function RagnarockWorkspace({
  projectId,
  onPanelChange,
  initialSession,
  initialRestoredSession,
}: {
  projectId: string;
  onPanelChange?: (event: PanelChangeEvent) => void;
  initialSession?: { sessionId: string; messages: RagnarockSessionMessage[] } | null;
  initialRestoredSession?: RestoredSession;
}) {
  const [sessionId, setSessionId] = useState<string | null>(
    initialRestoredSession?.ragnarockSessionId ?? initialSession?.sessionId ?? null,
  );

  const [messages, setMessages] = useState<RagnarockMessage[]>(() => {
    // Merge ragnarock + SRS messages chronologically into one unified conversation
    if (initialRestoredSession) {
      const ragnarockMsgs: RagnarockMessage[] = initialRestoredSession.ragnarockMessages.map((m) =>
        m.role === "user"
          ? { id: m.id, role: "user" as const, content: m.content, _ts: new Date(m.createdAt).getTime() }
          : { id: m.id, role: "assistant" as const, answer: m.content, detectedAction: m.detectedAction, _ts: new Date(m.createdAt).getTime() },
      );
      const srsMsgs: RagnarockMessage[] = initialRestoredSession.srsMessages.map((m) =>
        m.role === "user"
          ? { id: m.id, role: "user" as const, content: m.content, _ts: new Date(m.createdAt).getTime() }
          : { id: m.id, role: "assistant" as const, answer: m.content, detectedAction: null, _ts: new Date(m.createdAt).getTime() },
      );
      const merged = [...ragnarockMsgs, ...srsMsgs].sort((a, b) => ((a as any)._ts ?? 0) - ((b as any)._ts ?? 0));
      // Strip the temporary _ts sort key
      return merged.map(({ ...m }) => { delete (m as any)._ts; return m; });
    }
    return (initialSession?.messages ?? []).map((m) =>
      m.role === "user"
        ? { id: m.id, role: "user" as const, content: m.content }
        : { id: m.id, role: "assistant" as const, answer: m.content, detectedAction: m.detectedAction },
    );
  });

  const [draft, setDraft] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [dismissedActions, setDismissedActions] = useState<Set<string>>(new Set());

  // SRS mode — restored if there's a prior SRS session
  const [srsMode, setSrsMode] = useState(!!initialRestoredSession?.srsSessionId);
  const [srsSessionId, setSrsSessionId] = useState<string | null>(
    initialRestoredSession?.srsSessionId ?? null,
  );
  const pendingSrsMessageId = useRef<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingJobRef = useRef<string | null>(null);
  const pendingSrsStart = useRef<{ sessionId: string } | null>(null);

  const { data: project } = useProject(projectId);
  const { data: role } = useProjectRole(projectId);
  const { data: specs } = useProjectSpecifications(projectId, { page: 1, limit: 1 });

  const hasSrs = (specs?.data?.length ?? 0) > 0;
  const canEdit = role?.role === "owner" || role?.role === "admin" || role?.role === "member";

  const sendMessage = useSendRagnarockMessage();
  const generatePlan = useGeneratePlan();
  const generateArchDoc = useGenerateArchDoc();
  const generateQa = useGenerateQaTestSuite();
  const createSession = useCreateRagnarockSession();
  const createSrsSession = useCreateSrsSession();
  const submitSrsMessage = useSubmitSrsMessage();

  const applyPartialSrs = useRequirementsWorkspaceStore((s) => s.applyPartialSrs);
  const applyCompletedSrs = useRequirementsWorkspaceStore((s) => s.applyCompletedSrs);

  // Requirements agent socket — active only when in SRS mode
  useSrsSessionSocket({
    projectId: srsMode ? projectId : null,
    sessionId: srsSessionId,
    onSessionJoined: () => {
      // Socket is now subscribed to the session room — safe to send the first message
      const pending = pendingSrsStart.current;
      if (pending) {
        pendingSrsStart.current = null;
        submitSrsMessage.mutate(
          { projectId, sessionId: pending.sessionId, input: "/srs" },
          { onError: () => { setIsProcessing(false); setError("Failed to start requirements session."); } },
        );
      }
    },
    onProcessing: () => setIsProcessing(true),
    onTurnCompleted: ({ agent, assistantMessageId }) => {
      setIsProcessing(false);
      const answer =
        agent.status === "needs_clarification" && Array.isArray(agent.questions)
          ? (agent.questions as string[]).join("\n\n")
          : agent.status === "complete"
          ? "Requirements gathered! Your SRS has been saved."
          : String((agent as { answer?: unknown }).answer ?? "");
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", answer, detectedAction: null },
      ]);

      // Live-update the SRS panel after every turn
      if (agent.status === "complete") {
        applyCompletedSrs(
          agent as unknown as Parameters<typeof applyCompletedSrs>[0],
          (agent as { specificationId?: string }).specificationId ?? assistantMessageId,
          assistantMessageId,
        );
        onPanelChange?.({ mode: "srs" });
      } else if (agent.status === "needs_clarification") {
        // Fetch latest draftSrs from backend and push to store
        void getProjectAiDraft(projectId).then((draft) => {
          if (draft.draftSrs) {
            applyPartialSrs(
              draft.draftSrs,
              Array.isArray(agent.questions) ? (agent.questions as string[]) : [],
              assistantMessageId,
            );
          }
        });
      }
    },
    onTurnFailed: ({ error: err }) => {
      setIsProcessing(false);
      setError(err || "Requirements agent failed.");
    },
  });

  // Session is created lazily on first send, not on mount.

  const availableCommands = ALL_COMMANDS.filter((cmd) => {
    if (cmd.requiresRole === "editor" && !canEdit) return false;
    if (cmd.requiresSrs && !hasSrs) return false;
    return true;
  });

  // Socket: Ragnarock chat events
  useRagnarockSocket({
    projectId,
    enabled: true,
    onProcessing: ({ jobId }) => {
      if (pendingJobRef.current === jobId) setIsProcessing(true);
    },
    onCompleted: ({ jobId, answer, detectedAction }) => {
      if (pendingJobRef.current !== jobId) return;
      pendingJobRef.current = null;
      setIsProcessing(false);
      setMessages((prev) => [...prev, { id: jobId, role: "assistant", answer, detectedAction }]);

      // If AI detected a command intent, preview its panel immediately
      if (detectedAction && detectedAction.type !== "none") {
        if (detectedAction.type === "generate_srs") {
          onPanelChange?.({ mode: "srs" });
        } else if (detectedAction.type === "generate_plan") {
          onPanelChange?.({ mode: "plan", state: { generating: false } });
        } else if (detectedAction.type === "generate_doc") {
          onPanelChange?.({
            mode: "doc",
            state: { title: detectedAction.docType?.toUpperCase() ?? "Document", content: "", docType: detectedAction.docType ?? "sad", generating: false },
          });
        }
      }
    },
    onFailed: ({ jobId, error: err }) => {
      if (pendingJobRef.current !== jobId) return;
      pendingJobRef.current = null;
      setIsProcessing(false);
      setError(err || "Something went wrong.");
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const handleTextChange = (value: string) => {
    setDraft(value);
    setShowPalette(value === "/");
  };

  const send = useCallback(
    async (text: string) => {
      const body = text.trim();
      if (!body || isProcessing) return;
      setDraft("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setShowPalette(false);
      setError(null);

      const userMsgId = `user-${Date.now()}`;
      setMessages((prev) => [...prev, { id: userMsgId, role: "user", content: body }]);
      setIsProcessing(true);

      try {
        if (srsMode) {
          // Route through the requirements agent pipeline
          let activeSrsSessionId = srsSessionId;
          if (!activeSrsSessionId) {
            const created = await createSrsSession.mutateAsync({ projectId });
            activeSrsSessionId = created.id;
            setSrsSessionId(activeSrsSessionId);
          }
          await submitSrsMessage.mutateAsync({ projectId, sessionId: activeSrsSessionId, input: body });
          // Response comes via useSrsSessionSocket onTurnCompleted
        } else {
          // Regular Ragnarock Q&A
          let activeSessionId = sessionId;
          if (!activeSessionId) {
            const created = await createSession.mutateAsync({ projectId });
            activeSessionId = created.sessionId;
            setSessionId(activeSessionId);
          }
          const result = await sendMessage.mutateAsync({ projectId, sessionId: activeSessionId, message: body });
          pendingJobRef.current = result.jobId;
        }
      } catch (err) {
        setIsProcessing(false);
        setError(err instanceof Error ? err.message : "Failed to send message.");
      }
    },
    [projectId, sessionId, srsMode, srsSessionId, isProcessing, createSession, sendMessage, createSrsSession, submitSrsMessage],
  );

  // User confirms an action from the confirmation card
  const handleActionConfirm = useCallback(
    (action: RagnarockDetectedAction) => {
      if (action.type === "generate_srs") {
        setSrsMode(true);
        onPanelChange?.({ mode: "srs" });
        void (async () => {
          setIsProcessing(true);
          try {
            const created = await createSrsSession.mutateAsync({ projectId });
            pendingSrsStart.current = { sessionId: created.id };
            setSrsSessionId(created.id);
          } catch {
            setIsProcessing(false);
            setError("Failed to start requirements session.");
          }
        })();
      } else if (action.type === "generate_plan") {
        onPanelChange?.({ mode: "plan", state: { generating: true } });
        generatePlan.mutate({ projectId });
      } else if (action.type === "generate_doc") {
        const docType = (action.docType ?? "sad") as "sad" | "hld" | "lld" | "adr";
        onPanelChange?.({
          mode: "doc",
          state: { title: docType.toUpperCase(), content: "", docType, generating: true },
        });
        generateArchDoc.mutate({ projectId, docType });
      }
    },
    [onPanelChange, projectId, generatePlan, generateArchDoc, createSrsSession, submitSrsMessage],
  );

  const handleCommandSelect = (cmd: string) => {
    setShowPalette(false);
    if (cmd === "/srs") {
      setSrsMode(true);
      onPanelChange?.({ mode: "srs" });
      // Create the session, then store it as pending — the socket's onSessionJoined
      // fires the first message once the room subscription is confirmed.
      void (async () => {
        setIsProcessing(true);
        try {
          const created = await createSrsSession.mutateAsync({ projectId });
          pendingSrsStart.current = { sessionId: created.id };
          setSrsSessionId(created.id); // triggers useSrsSessionSocket re-effect → join → onSessionJoined
        } catch {
          setIsProcessing(false);
          setError("Failed to start requirements session.");
        }
      })();
    } else if (cmd === "/plan") {
      onPanelChange?.({ mode: "plan", state: { generating: true } });
      generatePlan.mutate({ projectId });
      void send(cmd);
    } else if (cmd.startsWith("/doc")) {
      const docType = (cmd.split(" ")[1] ?? "sad") as "sad" | "hld" | "lld" | "adr";
      onPanelChange?.({ mode: "doc", state: { title: docType.toUpperCase(), content: "", docType, generating: true } });
      generateArchDoc.mutate({ projectId, docType });
      void send(cmd);
    } else if (cmd === "/qa") {
      generateQa.mutate({ projectId });
      void send(cmd);
    }
  };

  const showHero = messages.length === 0 && !isProcessing;

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="relative flex h-full min-h-0 w-full flex-col overflow-hidden border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
        {/* Header */}
        <div className="shrink-0 border-b border-border/50 px-4 py-3 flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span className="text-sm font-semibold">
            {project?.name ?? "Ragnarock"}
          </span>
          {srsMode && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <FileText className="size-3" />
              Requirements session
            </Badge>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="ml-auto text-xs text-muted-foreground cursor-help">
                {srsMode ? "Answer the questions to build your SRS" : <>Ask anything · type <kbd className="rounded bg-muted px-1 py-px font-mono text-[10px]">/</kbd> for actions</>}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-xs">
              {srsMode ? "The requirements agent is gathering your project spec. Answer each question to continue." : "Ragnarock knows your full project — tasks, docs, team, SRS. Type / to trigger generation actions."}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setMessages([]);
                  setDraft("");
                  setError(null);
                  setIsProcessing(false);
                  setSessionId(null);
                  setSrsMode(false);
                  setSrsSessionId(null);
                  pendingJobRef.current = null;
                  pendingSrsMessageId.current = null;
                }}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <SquarePen className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              New chat
            </TooltipContent>
          </Tooltip>
          <RagnarockHistorySheet
            projectId={projectId}
            onSelectSession={async (detail) => {
              setSessionId(detail.session.id);
              setSrsMode(false);
              setSrsSessionId(null);
              setDraft("");
              setError(null);
              setIsProcessing(false);
              pendingJobRef.current = null;

              // Fetch any SRS session that overlaps with this ragnarock session and merge
              const ragnarockMsgs: RagnarockMessage[] = detail.messages.map((m) => ({
                ...(m.role === "user"
                  ? { id: m.id, role: "user" as const, content: m.content }
                  : { id: m.id, role: "assistant" as const, answer: m.content, detectedAction: m.detectedAction }),
                _ts: new Date(m.createdAt).getTime(),
              }));

              try {
                const { listProjectAiChatSessions, listProjectAiChatMessages } = await import("@/api/projects.api");
                const srsSessions = await listProjectAiChatSessions(projectId, { page: 1, limit: 10 });
                const srsSession = srsSessions.data?.[0] ?? null;
                if (srsSession) {
                  const srsMsgPage = await listProjectAiChatMessages(projectId, srsSession.id, { page: 1, limit: 100 });
                  const srsMsgs: RagnarockMessage[] = (srsMsgPage.data ?? []).map((m) => ({
                    ...(m.role === "user"
                      ? { id: m.id, role: "user" as const, content: m.content }
                      : { id: m.id, role: "assistant" as const, answer: m.content, detectedAction: null }),
                    _ts: new Date(m.createdAt).getTime(),
                  }));
                  const merged = [...ragnarockMsgs, ...srsMsgs].sort((a, b) => ((a as any)._ts ?? 0) - ((b as any)._ts ?? 0));
                  setMessages(merged.map(({ ...m }) => { delete (m as any)._ts; return m; }));
                  setSrsMode(true);
                  setSrsSessionId(srsSession.id);
                  return;
                }
              } catch { /* non-fatal — fall back to ragnarock-only */ }

              setMessages(ragnarockMsgs.map(({ ...m }) => { delete (m as any)._ts; return m; }));
            }}
          />
        </div>

        {/* Messages */}
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 scrollbar-none">
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2.5"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Error</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <button type="button" onClick={() => setError(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              </motion.div>
            )}

            {showHero && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center px-2 py-10 text-center"
              >
                <Sparkles className="mb-3 size-8 text-muted-foreground opacity-50" />
                <p className="text-xl font-semibold tracking-tight">
                  {project?.name ?? "Your project"}, at a glance
                </p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Ask anything about this project. Type{" "}
                  <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">/</kbd>{" "}
                  to trigger actions like generating docs or a task plan.
                </p>
                <div className="mt-5 grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
                  {QUICK_STARTERS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void send(q)}
                      className="rounded-lg border border-border/60 bg-background/70 px-3.5 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  {m.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-[min(100%,32rem)] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm">
                        {m.content}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="space-y-2 rounded-xl border border-border/60 bg-card/90 p-3.5 shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="px-2 py-0 text-xs font-normal">
                            <Sparkles className="mr-1 size-3" />
                            Ragnarock
                          </Badge>
                        </div>
                        <MarkdownContent content={m.answer} />
                      </div>
                      {m.detectedAction && m.detectedAction.type !== "none" && !dismissedActions.has(m.id) && (
                        <ActionConfirmCard
                          action={m.detectedAction}
                          hasSrs={hasSrs}
                          canEdit={canEdit}
                          onDismiss={() => setDismissedActions((s) => new Set([...s, m.id]))}
                          onConfirm={handleActionConfirm}
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isProcessing && (
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border/60 bg-card/90 px-3.5 py-3 shadow-sm">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "0ms", animationDuration: "1.2s" }} />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "200ms", animationDuration: "1.2s" }} />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "400ms", animationDuration: "1.2s" }} />
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="relative z-10 shrink-0 px-4 pb-3 pt-2">
          <div className="relative mx-auto max-w-2xl">
            <AnimatePresence>
              {showPalette && availableCommands.length > 0 && (
                <SlashPalette
                  commands={availableCommands}
                  onSelect={handleCommandSelect}
                  onDismiss={() => setShowPalette(false)}
                />
              )}
            </AnimatePresence>
            <div className="flex items-end gap-2 rounded-2xl border border-border/70 bg-background/90 px-3 py-2 shadow-lg shadow-black/5 backdrop-blur-md transition-shadow focus-within:shadow-xl focus-within:shadow-black/8 dark:bg-card/90">
              <Textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => {
                  handleTextChange(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                placeholder="Ask about this project… or type / for actions"
                rows={1}
                className="max-h-[160px] min-h-[36px] flex-1 resize-none overflow-y-auto border-0 bg-transparent py-1.5 text-sm shadow-none focus-visible:ring-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !showPalette) {
                    e.preventDefault();
                    void send(draft);
                  }
                  if (e.key === "Escape" && showPalette) setShowPalette(false);
                }}
              />
              <Button
                type="button"
                size="icon"
                className="mb-0.5 size-8 shrink-0 rounded-xl"
                disabled={!draft.trim() || isProcessing}
                onClick={() => void send(draft)}
              >
                {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
}
