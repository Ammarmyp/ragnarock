"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Code2,
  Expand,
  FileText,
  Loader2,
  PanelRightClose,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MarkdownContent } from "@/components/documentation/markdown-content";
import { SrsDocumentBody, buildSrsMarkdown } from "@/components/requirements-workspace/srs-document-body";
import { cn } from "@/lib/utils";
import { useRequirementsWorkspaceStore } from "@/stores/requirements-workspace.store";
import { useProjectTasks } from "@/hooks/use-projects";
import type { TaskStatus, TaskPhase } from "@/api/projects.api";

// ─── Panel mode driven by the last action ─────────────────────────────────────

export type RightPanelMode =
  | "idle"
  | "srs"
  | "plan"
  | "doc"
  | "dev_intelligence";

export type RightPanelDocState = {
  title: string;
  content: string;
  docType: string;
  generating: boolean;
};

export type RightPanelPlanState = {
  generating: boolean;
};

// ─── Idle state ───────────────────────────────────────────────────────────────

function IdlePanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <Sparkles className="size-8 text-muted-foreground/30" />
      <p className="text-sm font-medium text-muted-foreground">Nothing here yet</p>
      <p className="text-xs leading-relaxed text-muted-foreground/70">
        Start an SRS session, generate a plan, or create a doc and the output will preview here.
      </p>
    </div>
  );
}

// ─── SRS preview ──────────────────────────────────────────────────────────────

function SrsPanel() {
  const [modalOpen, setModalOpen] = useState(false);

  const partialSrs = useRequirementsWorkspaceStore((s) => s.partialSrs);
  const completedSpec = useRequirementsWorkspaceStore((s) => s.completedSpec);
  const baseSpec = useRequirementsWorkspaceStore((s) => s.baseSpec);
  const srsProgress = useRequirementsWorkspaceStore((s) => s.srsProgress);
  const isProcessing = useRequirementsWorkspaceStore((s) => s.isProcessing);

  const displaySpec = completedSpec ?? baseSpec;
  const displayProgress = displaySpec ? 100 : srsProgress;
  const markdown = useMemo(
    () => buildSrsMarkdown(partialSrs, displaySpec),
    [partialSrs, displaySpec],
  );
  const status = displaySpec ? "complete" : partialSrs ? "in_progress" : "not_started";
  const title = displaySpec?.project_name ?? partialSrs?.project_name ?? "SRS Document";

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Subheader */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <FileText className="size-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              SRS Preview
            </span>
            {displayProgress > 0 && (
              <span className={cn(
                "rounded-full px-1.5 py-px text-[10px] font-semibold",
                displaySpec
                  ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                  : "bg-primary/15 text-primary",
              )}>
                {displayProgress === 100 ? "Done" : `${displayProgress}%`}
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setModalOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Expand className="size-3.5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          <SrsDocumentBody
            markdown={markdown}
            status={status}
            displayProgress={displayProgress}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={(v) => !v && setModalOpen(false)}>
        <DialogContent className="flex h-[90dvh] max-h-[90dvh] w-[min(90vw,900px)] max-w-[min(90vw,900px)] flex-col gap-0 p-0">
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <SrsDocumentBody
              markdown={markdown}
              status={status}
              displayProgress={displayProgress}
              isProcessing={isProcessing}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Plan preview ─────────────────────────────────────────────────────────────

const PHASE_ORDER: TaskPhase[] = ["discovery", "planning", "build", "test", "release"];
const STATUS_COLOR: Record<TaskStatus, string> = {
  backlog: "bg-muted-foreground/30",
  todo: "bg-blue-400",
  in_progress: "bg-amber-400",
  reviewing: "bg-violet-400",
  reviewed: "bg-violet-600",
  done: "bg-emerald-500",
  cancelled: "bg-muted-foreground/20",
};

function PlanPanel({ projectId, generating }: { projectId: string; generating: boolean }) {
  const { data } = useProjectTasks(projectId, { page: 1, limit: 50 });
  const tasks = data?.data ?? [];

  const byPhase = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    for (const t of tasks) {
      const phase = t.phase ?? "build";
      if (!map.has(phase)) map.set(phase, []);
      map.get(phase)!.push(t);
    }
    return map;
  }, [tasks]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-1.5 border-b border-border/40 px-3 py-2">
        <ClipboardList className="size-3.5 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Task Plan Preview
        </span>
        {generating && <Loader2 className="ml-auto size-3.5 animate-spin text-muted-foreground" />}
        {!generating && tasks.length > 0 && (
          <span className="ml-auto text-[10px] text-muted-foreground">{tasks.length} tasks</span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
        {generating && tasks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">Generating task plan…</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
            <ClipboardList className="size-7 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">No tasks yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {PHASE_ORDER.filter((p) => byPhase.has(p)).map((phase) => (
              <div key={phase}>
                <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {phase}
                </p>
                <div className="space-y-1">
                  {byPhase.get(phase)!.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-start gap-2 rounded-lg border border-border/40 bg-muted/20 px-2.5 py-2"
                    >
                      <span
                        className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", STATUS_COLOR[t.status])}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium leading-snug">{t.title}</p>
                        <div className="mt-1 flex items-center gap-1">
                          <Badge variant="outline" className="text-[9px] font-normal capitalize">
                            {t.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Doc preview ──────────────────────────────────────────────────────────────

function DocPanel({ doc }: { doc: RightPanelDocState }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <BookOpen className="size-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {doc.docType.toUpperCase()} Preview
            </span>
            {doc.generating && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
            {!doc.generating && doc.content && (
              <CheckCircle2 className="size-3 text-emerald-500" />
            )}
          </div>
          {doc.content && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setModalOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Expand className="size-3.5" />
            </Button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          {doc.generating && !doc.content ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">Generating {doc.docType.toUpperCase()}…</p>
            </div>
          ) : doc.content ? (
            <MarkdownContent content={doc.content} />
          ) : (
            <p className="px-1 pt-2 text-xs text-muted-foreground">Document will appear here once generated.</p>
          )}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={(v) => !v && setModalOpen(false)}>
        <DialogContent className="flex h-[90dvh] max-h-[90dvh] w-[min(90vw,900px)] max-w-[min(90vw,900px)] flex-col gap-0 p-0">
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle className="text-base font-semibold">{doc.title}</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <MarkdownContent content={doc.content} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Dev Intelligence preview ─────────────────────────────────────────────────

function DevIntelligencePanel({ onSuggestionSelect }: { onSuggestionSelect?: (p: string) => void }) {
  const messages = useRequirementsWorkspaceStore((s) => s.messages);

  // Find last dev intelligence message
  const lastDevMsg = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.kind === "dev_intelligence");

  const payload = lastDevMsg?.kind === "dev_intelligence" ? lastDevMsg.devIntelligence : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-1.5 border-b border-border/40 px-3 py-2">
        <Code2 className="size-3.5 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Dev Intelligence
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
        {!payload ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Code2 className="size-7 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">Dev Intelligence answer will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <MarkdownContent content={payload.answer} />

            {payload.references.length > 0 && (
              <div className="border-t border-border/40 pt-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  References
                </p>
                <ul className="space-y-0.5 text-xs text-muted-foreground list-disc list-inside">
                  {payload.references.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {payload.follow_up_suggestions.length > 0 && (
              <div className="border-t border-border/40 pt-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Follow-ups
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {payload.follow_up_suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onSuggestionSelect?.(s)}
                      className="rounded-full bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mode label + icon ────────────────────────────────────────────────────────

const MODE_META: Record<RightPanelMode, { label: string; icon: React.ReactNode }> = {
  idle: { label: "Context", icon: <Sparkles className="size-3.5" /> },
  srs: { label: "SRS", icon: <FileText className="size-3.5" /> },
  plan: { label: "Plan", icon: <ClipboardList className="size-3.5" /> },
  doc: { label: "Document", icon: <BookOpen className="size-3.5" /> },
  dev_intelligence: { label: "Dev Intelligence", icon: <Code2 className="size-3.5" /> },
};

// ─── Main right panel ─────────────────────────────────────────────────────────

export function RagnarockRightPanel({
  projectId,
  mode,
  docState,
  planState,
  onCollapse,
  onSuggestionSelect,
}: {
  projectId: string;
  mode: RightPanelMode;
  docState?: RightPanelDocState | null;
  planState?: RightPanelPlanState | null;
  onCollapse?: () => void;
  onSuggestionSelect?: (prompt: string) => void;
}) {
  const meta = MODE_META[mode];

  return (
    <Card className="flex h-full min-h-0 w-full flex-col overflow-hidden border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-3 py-2.5">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {meta.icon}
          <span className="text-xs font-semibold uppercase tracking-wider">{meta.label}</span>
        </div>
        {onCollapse && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onCollapse}
            className="text-muted-foreground hover:text-foreground"
          >
            <PanelRightClose className="size-4" />
          </Button>
        )}
      </div>

      {/* Content — switches by mode */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            {mode === "idle" && <IdlePanel />}
            {mode === "srs" && <SrsPanel />}
            {mode === "plan" && (
              <PlanPanel projectId={projectId} generating={planState?.generating ?? false} />
            )}
            {mode === "doc" && docState && <DocPanel doc={docState} />}
            {mode === "dev_intelligence" && (
              <DevIntelligencePanel onSuggestionSelect={onSuggestionSelect} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  );
}
