"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Clock,
  HelpCircle,
  Loader2,
  MessageCirclePlus,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "@/components/documentation/markdown-content";
import type { ChatMessage, DevIntelligencePayload } from "@/features/requirements-workspace/types";
import { useRequirementsWorkspaceStore } from "@/stores/requirements-workspace.store";
import {
  useCreateProjectAiChatSession,
  useSubmitAiRequirementsTurn,
} from "@/hooks/use-project-ai-chat";
import { useProject } from "@/hooks/use-projects";
import type { AgentSessionType, ProjectAiChatSession } from "@/api/projects.api";

const MeshGradient = dynamic(
  () => import("@paper-design/shaders-react").then((mod) => ({ default: mod.MeshGradient })),
  { ssr: false },
);

export function StageBar() {
  const stages = useRequirementsWorkspaceStore((s) => s.stages);
  const activeStageIndex = useRequirementsWorkspaceStore((s) => s.activeStageIndex);
  const srsProgress = useRequirementsWorkspaceStore((s) => s.srsProgress);
  const baseSpec = useRequirementsWorkspaceStore((s) => s.baseSpec);
  const completedSpec = useRequirementsWorkspaceStore((s) => s.completedSpec);

  const hasSpec = !!(completedSpec ?? baseSpec);

  if (hasSpec) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            SRS complete — continue refining
          </span>
          <span className="text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">100%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            initial={false}
            animate={{ width: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Progress bar + label */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Stage <span className="tabular-nums text-foreground">{activeStageIndex + 1}</span>
          <span className="mx-1 opacity-40">/</span>
          <span className="tabular-nums">{stages.length}</span>
          {stages[activeStageIndex] && (
            <span className="ml-1.5 text-foreground/70">· {stages[activeStageIndex].label}</span>
          )}
        </span>
        <span className="tabular-nums text-xs font-semibold text-foreground/60">{srsProgress}%</span>
      </div>

      {/* Segmented track */}
      <div className="flex items-center gap-0.5">
        {stages.map((st, i) => {
          const done = i < activeStageIndex || st.completion >= 0.95;
          const active = i === activeStageIndex;
          return (
            <div key={st.id} className="relative flex-1" title={st.label}>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    done ? "bg-primary" : active ? "bg-primary/60" : "bg-transparent",
                  )}
                  initial={false}
                  animate={{
                    width: done ? "100%" : active ? `${Math.max(8, srsProgress)}%` : "0%",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage dots */}
      <div className="flex items-center gap-0.5">
        {stages.map((st, i) => {
          const done = i < activeStageIndex || st.completion >= 0.95;
          const active = i === activeStageIndex;
          return (
            <div key={st.id} className="flex flex-1 flex-col items-center gap-1" title={st.label}>
              <div className={cn(
                "size-1.5 rounded-full transition-all duration-300",
                done && "bg-primary",
                active && "scale-125 bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.6)]",
                !done && !active && "bg-muted-foreground/25",
              )} />
              <span className={cn(
                "text-[9px] font-medium leading-none tracking-wide transition-colors",
                active ? "text-foreground" : done ? "text-primary/70" : "text-muted-foreground/50",
              )}>
                {st.short}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AssistantMessage({ msg }: { msg: Extract<ChatMessage, { role: "assistant"; kind: "srs" }> }) {
  return (
    <div className="space-y-2 rounded-xl border border-border/60 bg-card/90 p-3.5 shadow-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary" className="px-2 py-0 text-xs font-normal">
          AI Agent
        </Badge>
        {msg.structured.whyQuestion && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded p-0.5"
              >
                <HelpCircle className="size-3.5" />
                <span className="text-xs">Why?</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
              {msg.structured.whyQuestion}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {msg.structured.contextSummary && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {msg.structured.contextSummary}
        </p>
      )}

      {msg.structured.extractedInsights.length > 0 && (
        <ul className="text-muted-foreground list-inside list-disc space-y-0.5 text-sm leading-relaxed">
          {msg.structured.extractedInsights.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}

      <div className="border-border/50 space-y-2 border-t pt-2.5">
        {msg.structured.nextQuestion
          .split("\n\n")
          .filter(Boolean)
          .map((q, i) => (
            <p key={i} className="text-sm leading-relaxed font-medium">
              {q.replace(/^\d+\.\s*/, "")}
            </p>
          ))}
      </div>
    </div>
  );
}

function CompletedMessage({ msg }: { msg: Extract<ChatMessage, { role: "assistant"; kind: "srs" }> }) {
  return (
    <div className="space-y-2 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-3.5 shadow-sm">
      <Badge className="bg-emerald-600 px-2 py-0 text-xs font-normal text-white">
        SRS Complete
      </Badge>
      <p className="text-sm leading-relaxed font-medium">{msg.structured.contextSummary}</p>
      <p className="text-muted-foreground text-sm leading-relaxed">{msg.structured.nextQuestion}</p>
    </div>
  );
}

function DevIntelligenceMessage({
  payload,
  onFollowUp,
}: {
  payload: DevIntelligencePayload;
  onFollowUp: (prompt: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-card/90 p-3.5 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Badge variant="secondary" className="px-2 py-0 text-xs font-normal">
          Dev Intelligence
        </Badge>
      </div>

      <MarkdownContent content={payload.answer} />

      {payload.references.length > 0 && (
        <div className="border-border/40 border-t pt-2.5">
          <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
            References
          </p>
          <ul className="text-muted-foreground list-inside list-disc space-y-0.5 text-xs leading-relaxed">
            {payload.references.map((ref, i) => (
              <li key={i}>{ref}</li>
            ))}
          </ul>
        </div>
      )}

      {payload.follow_up_suggestions.length > 0 && (
        <div className="border-border/40 border-t pt-2.5">
          <p className="text-muted-foreground mb-1.5 text-xs font-medium uppercase tracking-wide">
            Follow-up questions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {payload.follow_up_suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onFollowUp(s)}
                className="text-muted-foreground bg-muted/50 hover:bg-muted hover:text-foreground rounded-full px-2.5 py-0.5 text-xs transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="bg-primary text-primary-foreground max-w-[min(100%,32rem)] rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm leading-relaxed shadow-sm">
        {content}
      </div>
    </div>
  );
}

function ProcessingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border/60 bg-card/90 px-3.5 py-3 shadow-sm">
        <span
          className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "1.2s" }}
        />
        <span
          className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: "200ms", animationDuration: "1.2s" }}
        />
        <span
          className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: "400ms", animationDuration: "1.2s" }}
        />
      </div>
    </div>
  );
}

function getQuickStarters(agentType: AgentSessionType, projectName?: string): string[] {
  if (agentType === "developer_intelligence") {
    return projectName
      ? [
          `What's the best architecture for ${projectName}?`,
          `What tech stack should I use for ${projectName}?`,
          `How should I handle authentication in ${projectName}?`,
          `What are the key technical risks in ${projectName}?`,
        ]
      : [
          "What architecture pattern fits this project best?",
          "What tech stack should I use based on the requirements?",
          "How should I structure the database schema?",
          "What are the main technical risks I should address?",
        ];
  }

  // requirements agent
  return projectName
    ? [
        `I'm building ${projectName}. Let me describe what it does...`,
        `${projectName} needs to solve the following problem...`,
        `The main users of ${projectName} are...`,
        `The core features I need in ${projectName} are...`,
      ]
    : [
        "I want to build a project management tool for small teams",
        "I need a mobile app for tracking daily habits and goals",
        "Build me an e-commerce platform with inventory management",
        "I want a customer support ticketing system with AI triage",
      ];
}

function getHeroText(agentType: AgentSessionType, projectName?: string): { title: string; subtitle: string } {
  if (agentType === "developer_intelligence") {
    return {
      title: projectName ? `Build ${projectName}` : "Developer Intelligence",
      subtitle: "Ask architecture, stack, or implementation questions grounded in your project SRS.",
    };
  }
  return {
    title: projectName ? `Define ${projectName}` : "Start the interview",
    subtitle: "Describe your project and the AI will ask focused questions to build your SRS section by section.",
  };
}

function QuickStarters({
  agentType,
  projectName,
  onSelect,
}: {
  agentType: AgentSessionType;
  projectName?: string;
  onSelect: (text: string) => void;
}) {
  const starters = getQuickStarters(agentType, projectName);

  return (
    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {starters.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onSelect(s)}
          className="rounded-lg border border-border/60 bg-background/70 px-3.5 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

type SessionItem = ProjectAiChatSession & { srsProgress?: number; _count?: { messages: number }; title?: string | null };

function sessionLabel(session: SessionItem, index: number): string {
  if (session.title?.trim()) return session.title.trim();
  const count = session._count?.messages ?? 0;
  return count > 0 ? `Session ${index + 1} · ${count} msg${count === 1 ? "" : "s"}` : `Session ${index + 1}`;
}

const AGENT_LABEL: Record<AgentSessionType, string> = {
  requirements: "Requirements",
  developer_intelligence: "Dev Intelligence",
  project_planner: "Project Planner",
  qa_intelligence: "QA Intelligence",
  change_impact: "Change Impact",
};

const ACTIVE_AGENT_TYPES: { type: AgentSessionType; label: string }[] = [
  { type: "requirements", label: "Requirements Agent" },
  { type: "developer_intelligence", label: "Developer Intelligence" },
];

export function SrsCenterPanel({
  interactionDisabledReason,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewSession,
}: {
  interactionDisabledReason?: string;
  sessions?: SessionItem[];
  activeSessionId?: string | null;
  onSelectSession?: (id: string) => void;
  onNewSession?: () => void;
} = {}) {
  const messages = useRequirementsWorkspaceStore((s) => s.messages);
  const projectId = useRequirementsWorkspaceStore((s) => s.projectId);
  const backendAiChatSessionId = useRequirementsWorkspaceStore((s) => s.backendAiChatSessionId);
  const isProcessing = useRequirementsWorkspaceStore((s) => s.isProcessing);
  const agentError = useRequirementsWorkspaceStore((s) => s.agentError);
  const completedSpec = useRequirementsWorkspaceStore((s) => s.completedSpec);

  const setBackendAiChatSessionId = useRequirementsWorkspaceStore((s) => s.setBackendAiChatSessionId);
  const setAgentError = useRequirementsWorkspaceStore((s) => s.setAgentError);
  const appendBackendUserMessage = useRequirementsWorkspaceStore((s) => s.appendBackendUserMessage);
  const resetSession = useRequirementsWorkspaceStore((s) => s.resetSession);
  const pendingPrompt = useRequirementsWorkspaceStore((s) => s.pendingPrompt);
  const setPendingPrompt = useRequirementsWorkspaceStore((s) => s.setPendingPrompt);

  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  const { data: project } = useProject(projectId ?? "", { enabled: Boolean(projectId) });

  const createSession = useCreateProjectAiChatSession();
  const submitTurn = useSubmitAiRequirementsTurn();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const send = useCallback(async (text: string, agentType?: AgentSessionType) => {
    const body = text.trim();
    if (!body || !projectId) return;

    setDraft("");

    try {
      let sessionId = backendAiChatSessionId;
      if (!sessionId) {
        const session = await createSession.mutateAsync({ projectId, data: agentType ? { agentType } : undefined });
        sessionId = session.id;
        setBackendAiChatSessionId(sessionId);
      }

      const result = await submitTurn.mutateAsync({ projectId, sessionId, input: body, type: "text" });
      appendBackendUserMessage(body, result.userMessageId);
    } catch (err) {
      setAgentError(err instanceof Error ? err.message : "Failed to send message.");
    }
  }, [
    projectId, backendAiChatSessionId,
    createSession, submitTurn, appendBackendUserMessage,
    setBackendAiChatSessionId, setAgentError,
  ]);

  useEffect(() => {
    if (!pendingPrompt) return;
    setPendingPrompt(null);
    void send(pendingPrompt);
  }, [pendingPrompt, setPendingPrompt, send]);

  const startNewSession = useCallback(async (agentType: AgentSessionType) => {
    if (!projectId) return;
    try {
      resetSession();
      const session = await createSession.mutateAsync({ projectId, data: { agentType } });
      setBackendAiChatSessionId(session.id);
    } catch (err) {
      setAgentError(err instanceof Error ? err.message : "Failed to create session.");
    }
  }, [projectId, createSession, resetSession, setBackendAiChatSessionId, setAgentError]);

  const isSending = createSession.isPending || submitTurn.isPending;
  const showHero = messages.length === 0 && !isProcessing && !isSending;

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const activeAgentType: AgentSessionType = (activeSession?.agentType as AgentSessionType | undefined) ?? "requirements";
  const heroText = getHeroText(activeAgentType, project?.name);
  const gradientColors: [string, string, string, string] =
    resolvedTheme === "dark"
      ? ["#C4B5DE", "#9B85C8", "#B09ED4", "#D6CAEB"]
      : ["#DBEAFE", "#93C5FD", "#BFDBFE", "#E0F2FE"];

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="relative flex h-full min-h-0 w-full flex-col overflow-hidden border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
        {/* Top-right session controls */}
        <div className="absolute right-2 top-2 z-20 flex items-center gap-1">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <MessageCirclePlus className="size-4" />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">New conversation</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Start with agent</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ACTIVE_AGENT_TYPES.map(({ type, label }) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => {
                    void startNewSession(type);
                    onNewSession?.();
                  }}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {sessions.length > 0 && onSelectSession && (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Clock className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Conversation history</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Conversations
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sessions.map((session, i) => {
                  const active = session.id === activeSessionId;
                  const pct = session.srsProgress ?? 0;
                  const agentType: AgentSessionType = session.agentType ?? "requirements";
                  return (
                    <DropdownMenuItem
                      key={session.id}
                      onSelect={() => onSelectSession(session.id)}
                      className="flex items-center gap-2.5 py-2"
                    >
                      <span className="min-w-0 flex-1 truncate text-xs">
                        {sessionLabel(session, i)}
                      </span>
                      {pct > 0 && agentType === "requirements" && (
                        <span className={cn(
                          "shrink-0 rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
                          pct === 100
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-primary/10 text-primary",
                        )}>
                          {pct === 100 ? "Done" : `${pct}%`}
                        </span>
                      )}
                      {agentType !== "requirements" && (
                        <span className="shrink-0 rounded-full bg-violet-500/15 px-1.5 py-px text-[10px] font-semibold text-violet-700 dark:text-violet-300">
                          {AGENT_LABEL[agentType]}
                        </span>
                      )}
                      {active && <Check className="size-3 shrink-0 text-primary" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <AnimatePresence>
          {showHero && (
            <motion.div
              key="mesh"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="pointer-events-none absolute inset-0 z-0"
            >
              <MeshGradient
                speed={0.9}
                colors={gradientColors}
                distortion={0.75}
                swirl={0.9}
                grainMixer={0}
                grainOverlay={0}
                style={{ height: "100%", width: "100%" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages — flex-1 min-h-0 so the card controls height, not the page */}
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-none px-3 py-3">
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {agentError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2.5"
              >
                <AlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
                <div className="flex-1">
                  <p className="text-destructive text-sm font-medium">Agent error</p>
                  <p className="text-muted-foreground text-sm">{agentError}</p>
                </div>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setAgentError(null)}
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            )}

            {showHero && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 flex flex-col items-center px-2 py-8 text-center"
              >
                <Sparkles className="text-muted-foreground mb-3 size-8 opacity-60" />
                <p className="text-foreground text-xl font-semibold tracking-tight">
                  {heroText.title}
                </p>
                <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                  {heroText.subtitle}
                </p>
                <QuickStarters
                  agentType={activeAgentType}
                  projectName={project?.name}
                  onSelect={(text) => void send(text)}
                />
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {m.role === "user" ? (
                    <UserBubble content={m.content} />
                  ) : m.kind === "dev_intelligence" ? (
                    <DevIntelligenceMessage payload={m.devIntelligence} onFollowUp={setPendingPrompt} />
                  ) : completedSpec && m === messages[messages.length - 1] ? (
                    <CompletedMessage msg={m as Extract<ChatMessage, { role: "assistant"; kind: "srs" }>} />
                  ) : (
                    <AssistantMessage msg={m as Extract<ChatMessage, { role: "assistant"; kind: "srs" }>} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {(isSending || isProcessing) && <ProcessingIndicator />}

            <div ref={endRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="relative z-10 shrink-0 px-4 pb-3 pt-2">
          <div className="mx-auto max-w-2xl">
            {interactionDisabledReason ? (
              <div className="flex items-center gap-1.5 rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                <AlertCircle className="size-4 shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">{interactionDisabledReason}</p>
              </div>
            ) : completedSpec ? (
              <div className="flex items-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 shadow-sm">
                <Check className="size-4 shrink-0 text-emerald-500" />
                <p className="text-muted-foreground text-sm">SRS is complete. Review the full document in the specification panel.</p>
              </div>
            ) : (
              <div className="flex items-end gap-2 rounded-2xl border border-border/70 bg-background/90 px-3 py-2 shadow-lg shadow-black/5 backdrop-blur-md transition-shadow focus-within:shadow-xl focus-within:shadow-black/8 dark:bg-card/90">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={
                    messages.length === 0
                      ? "Describe your project..."
                      : "Reply to the questions above..."
                  }
                  rows={1}
                  className="min-h-[36px] max-h-[120px] flex-1 resize-none border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 py-1.5"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(draft);
                    }
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  className="mb-0.5 size-8 shrink-0 rounded-xl"
                  disabled={!draft.trim() || isSending || isProcessing}
                  onClick={() => void send(draft)}
                >
                  {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-3.5" />}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
}
