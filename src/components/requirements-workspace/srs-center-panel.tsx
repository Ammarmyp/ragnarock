"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ClipboardList,
  HelpCircle,
  MessageSquare,
  Pencil,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ChatMessage, SrsRequirement } from "@/features/requirements-workspace/types";
import { useRequirementsWorkspaceStore } from "@/stores/requirements-workspace.store";

const MeshGradient = dynamic(
  () => import("@paper-design/shaders-react").then((mod) => ({ default: mod.MeshGradient })),
  { ssr: false },
);

const suggestionPool = [
  "We need SSO for enterprise tenants",
  "Audit log for every SRS change",
  "Mobile web is in scope; native apps are not",
  "Integrate with Jira for two-way sync",
];

function StageBar() {
  const stages = useRequirementsWorkspaceStore((s) => s.stages);
  const activeStageIndex = useRequirementsWorkspaceStore((s) => s.activeStageIndex);
  const bumpStageProgress = useRequirementsWorkspaceStore((s) => s.bumpStageProgress);
  const active = stages[activeStageIndex];
  const overall =
    stages.reduce((acc, st) => acc + st.completion, 0) / Math.max(1, stages.length);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
          Stage {activeStageIndex + 1} of {stages.length}
          {active ? <span className="text-foreground ml-1 font-normal normal-case">· {active.label}</span> : null}
        </p>
        <Button type="button" size="xs" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => bumpStageProgress()}>
          + Progress
        </Button>
      </div>
      <div className="bg-muted h-1 overflow-hidden rounded-full">
        <motion.div
          className="from-primary to-primary/70 h-full rounded-full bg-gradient-to-r"
          initial={false}
          animate={{ width: `${Math.round(overall * 100)}%` }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        />
      </div>
      <div className="flex gap-0.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stages.map((st, i) => {
          const on = i === activeStageIndex;
          const done = st.completion >= 0.95;
          return (
            <div
              key={st.id}
              className={cn(
                "min-w-[4.25rem] shrink-0 rounded border px-1.5 py-0.5 text-center text-[9px] font-medium transition-colors",
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

function StructuredAssistantMessage({
  msg,
  onAccept,
  onReject,
}: {
  msg: Extract<ChatMessage, { role: "assistant" }>;
  onAccept: () => void;
  onReject: () => void;
}) {
  const pending = msg.proposal && msg.proposalStatus === "pending";

  return (
    <div className="space-y-2 rounded-lg border border-border/70 bg-card/90 p-2.5 shadow-sm">
      <div className="flex flex-wrap items-center gap-1">
        <Badge variant="secondary" className="px-1.5 py-0 text-[9px] font-normal">
          PM + BA
        </Badge>
        {msg.proposal && (
          <Badge variant={pending ? "default" : "outline"} className="text-[10px] font-normal">
            {pending ? "Added to SRS (pending)" : msg.proposalStatus === "accepted" ? "Accepted into SRS" : "Rejected"}
          </Badge>
        )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded-md p-1"
              >
                <HelpCircle className="size-3.5" />
                <span className="text-[11px]">Why this question?</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
              {msg.structured.whyQuestion ?? "Keeps the interview aligned to gaps in your SRS."}
            </TooltipContent>
          </Tooltip>
      </div>

      <div className="space-y-1">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Context</p>
        <p className="text-[12px] leading-relaxed">{msg.structured.contextSummary}</p>
      </div>

      <div className="space-y-1">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Insights</p>
        <ul className="text-muted-foreground list-inside list-disc space-y-0.5 text-[12px] leading-relaxed">
          {msg.structured.extractedInsights.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="border-border/60 space-y-1 border-t pt-1.5">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Next question</p>
        <p className="text-[12px] leading-relaxed font-medium">{msg.structured.nextQuestion}</p>
      </div>

      {msg.proposal && (
        <div className="bg-muted/40 border-border/60 rounded-md border p-2">
          <p className="text-muted-foreground text-[9px] font-semibold uppercase">Proposal</p>
          <p className="text-[12px] font-medium">{msg.proposal.title}</p>
          <p className="text-muted-foreground mt-0.5 text-[11px] leading-snug">{msg.proposal.description}</p>
          {pending && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Button size="sm" className="h-7 gap-1 px-2 text-[11px]" onClick={onAccept}>
                <Check className="size-3.5" />
                Accept
              </Button>
              <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-[11px]">
                <Pencil className="size-3.5" />
                Edit
              </Button>
              <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-[11px]" onClick={onReject}>
                <X className="size-3.5" />
                Reject
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="bg-primary text-primary-foreground max-w-[min(100%,28rem)] rounded-2xl rounded-br-md px-2.5 py-1.5 text-[12px] leading-relaxed shadow-sm">
        {content}
      </div>
    </div>
  );
}

export function SrsCenterPanel() {
  const messages = useRequirementsWorkspaceStore((s) => s.messages);
  const seedDemo = () => {
    useRequirementsWorkspaceStore.setState((s) => ({
      messages: [
        ...s.messages,
        {
          id: `seed-${Date.now()}`,
          role: "assistant" as const,
          createdAt: Date.now(),
          structured: {
            contextSummary:
              "SRS is the source of truth; this chat is a staged interview—not a generic assistant.",
            extractedInsights: [
              "Organize requirements by module to avoid flat lists.",
              "Validation runs continuously on the right rail.",
            ],
            nextQuestion: "What problem are we solving in one sentence, and who feels the pain most?",
            whyQuestion: "A crisp problem statement anchors every downstream requirement.",
          },
        },
      ],
    }));
  };
  const appendUserMessage = useRequirementsWorkspaceStore((s) => s.appendUserMessage);
  const acceptProposal = useRequirementsWorkspaceStore((s) => s.acceptProposal);
  const rejectProposal = useRequirementsWorkspaceStore((s) => s.rejectProposal);
  const chatMode = useRequirementsWorkspaceStore((s) => s.chatMode);
  const setChatMode = useRequirementsWorkspaceStore((s) => s.setChatMode);
  const reviewMode = useRequirementsWorkspaceStore((s) => s.reviewMode);
  const setReviewMode = useRequirementsWorkspaceStore((s) => s.setReviewMode);
  const suggestionSelection = useRequirementsWorkspaceStore((s) => s.suggestionSelection);
  const toggleSuggestion = useRequirementsWorkspaceStore((s) => s.toggleSuggestion);
  const clearSuggestions = useRequirementsWorkspaceStore((s) => s.clearSuggestions);
  const selectedId = useRequirementsWorkspaceStore((s) => s.selectedRequirementId);
  const sections = useRequirementsWorkspaceStore((s) => s.sections);
  const updateRequirement = useRequirementsWorkspaceStore((s) => s.updateRequirement);

  const [draft, setDraft] = useState("");
  const [chipDraft, setChipDraft] = useState<Record<string, string>>({});
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  let selectedReq: { section: string; item: SrsRequirement } | null = null;
  if (selectedId) {
    for (const sec of sections) {
      const found = sec.items.find((i) => i.id === selectedId);
      if (found) {
        selectedReq = { section: sec.label, item: found };
        break;
      }
    }
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const showHero = messages.length === 0;
  const gradientColors: [string, string, string, string] =
    resolvedTheme === "dark"
      ? ["#C4B5DE", "#9B85C8", "#B09ED4", "#D6CAEB"]
      : ["#DBEAFE", "#93C5FD", "#BFDBFE", "#E0F2FE"];

  const chips = suggestionPool;

  const sendComposed = () => {
    const chipText = suggestionSelection
      .map((key) => chipDraft[key] ?? key)
      .filter(Boolean)
      .join("\n• ");
    const body = [draft.trim(), chipText ? `Context:\n• ${chipText}` : ""].filter(Boolean).join("\n\n");
    if (!body.trim()) return;
    appendUserMessage(body);
    setDraft("");
    clearSuggestions();
  };

  return (
    <TooltipProvider delayDuration={200}>
      <>
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

      <div className="border-border/60 relative z-10 shrink-0 space-y-2 border-b bg-background/80 px-2.5 py-2 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-foreground text-[13px] font-medium leading-none">Interview</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="bg-muted/60 flex rounded-md border border-border/60 p-px">
              <Button
                type="button"
                size="xs"
                variant={chatMode === "guided" ? "secondary" : "ghost"}
                className="h-6 rounded-[5px] px-2 text-[10px]"
                onClick={() => setChatMode("guided")}
              >
                Guided
              </Button>
              <Button
                type="button"
                size="xs"
                variant={chatMode === "free" ? "secondary" : "ghost"}
                className="h-6 rounded-[5px] px-2 text-[10px]"
                onClick={() => setChatMode("free")}
              >
                Free
              </Button>
            </div>
            <Button
              type="button"
              size="xs"
              variant={reviewMode ? "default" : "outline"}
              className="h-6 gap-0.5 px-2 text-[10px]"
              onClick={() => setReviewMode(!reviewMode)}
            >
              <ClipboardList className="size-3" />
              Review
            </Button>
          </div>
        </div>
        <StageBar />
      </div>

      {reviewMode ? (
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2">
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="text-sm font-semibold">Review mode</p>
              <p className="text-muted-foreground mt-1 text-[13px] leading-relaxed">
                Clean document pass: validate assumptions, resolve ambiguities, and approve sections before export.
                This preview is local-only until backend sync ships.
              </p>
            </div>
            {sections.map((sec) => (
              <div key={sec.id} className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">{sec.label}</h3>
                  <Badge variant="outline" className="text-[10px]">
                    {sec.items.length} items
                  </Badge>
                </div>
                <ul className="mt-3 space-y-2">
                  {sec.items.map((it) => (
                    <li key={it.id} className="text-[13px] leading-relaxed">
                      <span className="font-medium">{it.title}</span>
                      <span className="text-muted-foreground"> — {it.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-2">
            <div className="mx-auto flex max-w-2xl flex-col gap-3">
              {selectedReq && (
                <div className="bg-muted/30 border-border/60 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-[12px]">
                  <div>
                    <span className="text-muted-foreground">Pinned from SRS · </span>
                    <span className="font-medium">{selectedReq.section}</span>
                    <span className="text-muted-foreground"> · </span>
                    <span>{selectedReq.item.title}</span>
                  </div>
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    className="h-7"
                    onClick={() => {
                      setEditTitle(selectedReq.item.title);
                      setEditDescription(selectedReq.item.description);
                      setEditOpen(true);
                    }}
                  >
                    <Pencil className="size-3" />
                    Edit
                  </Button>
                </div>
              )}

              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative z-10 flex flex-col items-center justify-center px-2 py-8 text-center"
                >
                  <p className="text-foreground text-lg font-semibold tracking-tight">Start the interview</p>
                  <p className="text-muted-foreground mt-1.5 max-w-md text-xs leading-relaxed">
                    Progressive questions, structured SRS updates, validation on the right.
                  </p>
                  <Button type="button" variant="secondary" size="sm" className="mt-3 h-8 gap-1.5 text-xs" onClick={seedDemo}>
                    <Sparkles className="size-3.5" />
                    Sample turn
                  </Button>
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
                    ) : (
                      <StructuredAssistantMessage
                        msg={m}
                        onAccept={() => acceptProposal(m.id)}
                        onReject={() => rejectProposal(m.id)}
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={endRef} />
            </div>
          </div>

          <div className="border-border/60 relative z-10 shrink-0 border-t bg-background/90 px-2.5 py-2 backdrop-blur-md">
            <div className="mx-auto max-w-2xl space-y-1.5">
              <p className="text-muted-foreground text-[10px] font-medium">Suggestions (multi-select)</p>
              <div className="flex flex-wrap gap-2">
                {chips.map((c) => {
                  const on = suggestionSelection.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleSuggestion(c)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                        on
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/70 bg-muted/30 text-muted-foreground hover:bg-muted/50",
                      )}
                    >
                      {on ? <Check className="mr-1 inline size-3" /> : null}
                      {c}
                    </button>
                  );
                })}
              </div>
              {suggestionSelection.length > 0 && (
                <div className="space-y-2 rounded-lg border border-dashed border-border/70 bg-muted/20 p-2">
                  {suggestionSelection.map((key) => (
                    <div key={key} className="flex flex-col gap-1 sm:flex-row sm:items-center">
                      <span className="text-muted-foreground w-full min-w-0 shrink-0 text-[11px] sm:w-40">{key}</span>
                      <Input
                        value={chipDraft[key] ?? key}
                        onChange={(e) => setChipDraft((d) => ({ ...d, [key]: e.target.value }))}
                        className="h-8 text-[12px]"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="relative flex items-end gap-1.5 rounded-xl border border-border/80 bg-muted/25 p-1 focus-within:border-border focus-within:shadow-sm">
                <MessageSquare className="text-muted-foreground mx-0.5 mb-1.5 size-3.5 shrink-0" />
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={
                    chatMode === "guided"
                      ? "Reply to the next question…"
                      : "Free-form notes…"
                  }
                  rows={2}
                  className="min-h-[44px] flex-1 resize-none border-0 bg-transparent text-[12px] shadow-none focus-visible:ring-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendComposed();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  className="mb-0.5 size-8 shrink-0 rounded-lg"
                  disabled={!draft.trim() && suggestionSelection.length === 0}
                  onClick={sendComposed}
                >
                  <Send className="size-3.5" />
                </Button>
              </div>
              <p className="text-muted-foreground flex items-center gap-1 text-[9px]">
                <Sparkles className="size-2.5" />
                Local demo — each send simulates a structured reply.
              </p>
            </div>
          </div>
        </>
      )}
    </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit requirement</DialogTitle>
            <DialogDescription>
              Changes stay in this workspace until backend sync is enabled. AI will weight future questions against the
              updated text.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="req-title">Title</Label>
              <Input
                id="req-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="req-desc">Description</Label>
              <Textarea
                id="req-desc"
                rows={4}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!selectedId) return;
                updateRequirement(selectedId, { title: editTitle, description: editDescription });
                setEditOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
    </TooltipProvider>
  );
}
