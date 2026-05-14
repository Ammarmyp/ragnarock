"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  HelpCircle,
  Loader2,
  MessageSquare,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/features/requirements-workspace/types";
import { useRequirementsWorkspaceStore } from "@/stores/requirements-workspace.store";
import {
  useCreateProjectAiChatSession,
  useSubmitAiRequirementsTurn,
} from "@/hooks/use-project-ai-chat";
import { useProject } from "@/hooks/use-projects";

const MeshGradient = dynamic(
  () => import("@paper-design/shaders-react").then((mod) => ({ default: mod.MeshGradient })),
  { ssr: false },
);

function StageBar() {
  const stages = useRequirementsWorkspaceStore((s) => s.stages);
  const activeStageIndex = useRequirementsWorkspaceStore((s) => s.activeStageIndex);
  const srsProgress = useRequirementsWorkspaceStore((s) => s.srsProgress);
  const baseSpec = useRequirementsWorkspaceStore((s) => s.baseSpec);
  const completedSpec = useRequirementsWorkspaceStore((s) => s.completedSpec);
  const active = stages[activeStageIndex];
  const overall = srsProgress / 100;

  // When an SRS exists (from this or a prior session), show a compact "refining" bar
  // instead of the interview stage tracker — the interview is done.
  const hasSpec = !!(completedSpec ?? baseSpec);
  if (hasSpec) {
    return (
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs font-medium">
          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
            SRS complete — continue refining
          </span>
        </p>
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">100%</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Stage {activeStageIndex + 1} of {stages.length}
          {active ? (
            <span className="text-foreground ml-1 font-normal normal-case">
              {" · "}{active.label}
            </span>
          ) : null}
        </p>
        <span className="text-muted-foreground text-xs tabular-nums">{srsProgress}%</span>
      </div>
      <div className="bg-muted h-1 overflow-hidden rounded-full">
        <motion.div
          className="from-primary to-primary/70 h-full rounded-full bg-linear-to-r"
          initial={false}
          animate={{ width: `${Math.round(overall * 100)}%` }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        />
      </div>
      <div className="flex gap-0.5 overflow-x-auto pb-0.5 scrollbar-none">
        {stages.map((st, i) => {
          const on = i === activeStageIndex;
          const done = st.completion >= 0.95;
          return (
            <div
              key={st.id}
              className={cn(
                "min-w-[4.5rem] shrink-0 rounded border px-1.5 py-0.5 text-center text-xs font-medium transition-colors",
                on && "border-primary/50 bg-primary/8 text-foreground",
                done && !on && "border-emerald-500/25 bg-emerald-500/5 text-emerald-800 dark:text-emerald-200",
                !on && !done && "border-border/50 bg-muted/30 text-muted-foreground",
              )}
              title={st.label}
            >
              {st.short}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AssistantMessage({ msg }: { msg: Extract<ChatMessage, { role: "assistant" }> }) {
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

function CompletedMessage({ msg }: { msg: Extract<ChatMessage, { role: "assistant" }> }) {
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
    <div className="flex items-center gap-2 py-1">
      <Loader2 className="text-muted-foreground size-4 animate-spin" />
      <span className="text-muted-foreground text-sm">Agent is thinking...</span>
    </div>
  );
}

const QUICK_STARTERS = [
  "I want to build a project management tool for small teams",
  "I need a mobile app for tracking daily habits and goals",
  "Build me an e-commerce platform with inventory management",
  "I want a customer support ticketing system with AI triage",
];

function QuickStarters({
  projectName,
  onSelect,
}: {
  projectName?: string;
  onSelect: (text: string) => void;
}) {
  const starters = projectName
    ? [
        `I'm building ${projectName}. Let me describe what it does...`,
        `${projectName} needs to solve the following problem...`,
        `The main users of ${projectName} are...`,
        `The core features I need in ${projectName} are...`,
      ]
    : QUICK_STARTERS;

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

export function SrsCenterPanel() {
  const messages = useRequirementsWorkspaceStore((s) => s.messages);
  const projectId = useRequirementsWorkspaceStore((s) => s.projectId);
  const backendAiChatSessionId = useRequirementsWorkspaceStore((s) => s.backendAiChatSessionId);
  const isProcessing = useRequirementsWorkspaceStore((s) => s.isProcessing);
  const agentError = useRequirementsWorkspaceStore((s) => s.agentError);
  const completedSpec = useRequirementsWorkspaceStore((s) => s.completedSpec);

  const setBackendAiChatSessionId = useRequirementsWorkspaceStore((s) => s.setBackendAiChatSessionId);
  const setAgentError = useRequirementsWorkspaceStore((s) => s.setAgentError);
  const appendBackendUserMessage = useRequirementsWorkspaceStore((s) => s.appendBackendUserMessage);

  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  const { data: project } = useProject(projectId ?? "", { enabled: Boolean(projectId) });

  const createSession = useCreateProjectAiChatSession();
  const submitTurn = useSubmitAiRequirementsTurn();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const send = useCallback(async (text: string) => {
    const body = text.trim();
    if (!body || !projectId) return;

    setDraft("");

    try {
      let sessionId = backendAiChatSessionId;
      if (!sessionId) {
        const session = await createSession.mutateAsync({ projectId });
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

  const showHero = messages.length === 0 && !isProcessing;
  const gradientColors: [string, string, string, string] =
    resolvedTheme === "dark"
      ? ["#C4B5DE", "#9B85C8", "#B09ED4", "#D6CAEB"]
      : ["#DBEAFE", "#93C5FD", "#BFDBFE", "#E0F2FE"];

  const isSending = createSession.isPending || submitTurn.isPending;

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="relative flex h-full min-h-0 w-full flex-col overflow-hidden border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
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

        {/* Header */}
        <div className="border-border/60 relative z-10 shrink-0 space-y-2 border-b bg-background/80 px-3 py-2.5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold leading-none">Interview</p>
            {completedSpec && (
              <Badge className="bg-emerald-600 text-xs font-normal text-white">
                <Check className="mr-1 size-3" /> SRS Complete
              </Badge>
            )}
          </div>
          <StageBar />
        </div>

        {/* Messages */}
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
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
                  {project?.name ? `Define ${project.name}` : "Start the interview"}
                </p>
                <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                  Describe your project and the AI will ask focused questions to build your SRS section by section.
                </p>
                <QuickStarters
                  projectName={project?.name}
                  onSelect={(text) => {
                    setDraft(text);
                  }}
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
                  ) : completedSpec && m === messages[messages.length - 1] ? (
                    <CompletedMessage msg={m} />
                  ) : (
                    <AssistantMessage msg={m} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isProcessing && <ProcessingIndicator />}

            <div ref={endRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="border-border/60 relative z-10 shrink-0 border-t bg-background/90 px-3 py-2.5 backdrop-blur-md">
          <div className="mx-auto max-w-2xl">
            {completedSpec ? (
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <Check className="size-4 text-emerald-500" />
                SRS is complete. Review the full document in the specification panel.
              </p>
            ) : (
              <>
                <div className="relative flex items-end gap-1.5 rounded-xl border border-border/80 bg-muted/25 p-1.5 focus-within:border-border focus-within:shadow-sm">
                  <MessageSquare className="text-muted-foreground mx-0.5 mb-1.5 size-4 shrink-0" />
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={
                      messages.length === 0
                        ? "Describe your project..."
                        : "Reply to the questions above..."
                    }
                    rows={2}
                    className="min-h-[44px] flex-1 resize-none border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
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
                    className="mb-0.5 size-8 shrink-0 rounded-lg"
                    disabled={!draft.trim() || isSending || isProcessing}
                    onClick={() => void send(draft)}
                  >
                    {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  </Button>
                </div>
                <p className="text-muted-foreground mt-1.5 flex items-center gap-1 text-xs">
                  <Sparkles className="size-3" />
                  Enter to send, Shift+Enter for new line
                </p>
              </>
            )}
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
}
