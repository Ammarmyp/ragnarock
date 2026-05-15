"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Code2,
  Expand,
  FileText,
  GitBranch,
  Lightbulb,
  List,
  PanelRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarkdownContent } from "@/components/documentation/markdown-content";
import { cn } from "@/lib/utils";
import { useProjectDocumentations } from "@/hooks/use-projects";
import { useRequirementsWorkspaceStore } from "@/stores/requirements-workspace.store";
import type { DocumentationType, ProjectDocumentation } from "@/api/projects.api";

/** Doc types relevant to a developer / architect context. */
const DEV_DOC_TYPES = new Set<DocumentationType>([
  "sad", "hld", "lld", "adr", "trd", "api", "dbd", "icd",
]);

const DEV_DOC_TYPE_SHORT: Partial<Record<DocumentationType, string>> = {
  sad: "SAD",
  hld: "HLD",
  lld: "LLD",
  adr: "ADR",
  trd: "TRD",
  api: "API",
  dbd: "DBD",
  icd: "ICD",
};

const SUGGESTIONS = [
  { icon: Code2,      label: "Suggest tech stack",   prompt: "Based on the SRS, what tech stack would you recommend?" },
  { icon: BookOpen,   label: "Explain architecture",  prompt: "Walk me through a suitable architecture for this project." },
  { icon: GitBranch,  label: "Plan repo structure",   prompt: "What should the repository structure look like?" },
  { icon: Lightbulb,  label: "Identify risks",        prompt: "What are the main technical risks and how do we mitigate them?" },
];

type PanelTab = "prompts" | "docs";

// ─── Doc card ──────────────────────────────────────────────────────────────

function DocCard({
  doc,
  onExpand,
}: {
  doc: ProjectDocumentation;
  onExpand: (doc: ProjectDocumentation) => void;
}) {
  return (
    <div className="group rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 transition-colors hover:border-border hover:bg-muted/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-snug">{doc.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <Badge variant="outline" className="text-[10px] font-normal uppercase">
              {DEV_DOC_TYPE_SHORT[doc.type] ?? doc.type}
            </Badge>
            <Badge
              variant={doc.status === "completed" ? "default" : "secondary"}
              className="text-[10px] font-normal capitalize"
            >
              {doc.status.replace("_", " ")}
            </Badge>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onExpand(doc)}
          className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
          title="Expand document"
        >
          <Expand className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Expand modal ──────────────────────────────────────────────────────────

function DocModal({
  doc,
  onClose,
}: {
  doc: ProjectDocumentation | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!doc} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex h-[90dvh] max-h-[90dvh] w-[min(90vw,900px)] max-w-[min(90vw,900px)] flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle className="text-base font-semibold">{doc?.title ?? ""}</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {doc && <MarkdownContent content={doc.content} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Docs tab content ──────────────────────────────────────────────────────

function DocsTab({ projectId }: { projectId: string }) {
  const [expandedDoc, setExpandedDoc] = useState<ProjectDocumentation | null>(null);

  const { data, isLoading } = useProjectDocumentations(projectId, { page: 1, perPage: 100 });

  const devDocs = useMemo(
    () => (data?.items ?? []).filter((d: ProjectDocumentation) => DEV_DOC_TYPES.has(d.type)),
    [data],
  );

  return (
    <>
      <div className="h-full overflow-y-auto overscroll-contain px-2 py-2">
        {isLoading ? (
          <p className="px-1 pt-1 text-xs text-muted-foreground">Loading…</p>
        ) : devDocs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
            <FileText className="size-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              No architecture or design documents yet.
              <br />
              Generate one from the{" "}
              <span className="font-medium text-foreground/70">Documentation</span> page.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {devDocs.map((doc: ProjectDocumentation) => (
              <DocCard key={doc.id} doc={doc} onExpand={setExpandedDoc} />
            ))}
          </div>
        )}
      </div>

      <DocModal doc={expandedDoc} onClose={() => setExpandedDoc(null)} />
    </>
  );
}

// ─── Main panel ────────────────────────────────────────────────────────────

export function DeveloperAdvisorPanel({
  onCollapse,
  onSuggestionSelect,
}: {
  onCollapse?: () => void;
  onSuggestionSelect?: (prompt: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<PanelTab>("prompts");
  const projectId = useRequirementsWorkspaceStore((s) => s.projectId);

  return (
    <Card className="flex h-full min-h-0 w-full flex-col overflow-hidden border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
      {/* Header */}
      <div className="border-border/60 shrink-0 border-b px-3 pb-0 pt-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Code2 className="size-3.5 text-primary" />
            <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              Developer Advisor
            </span>
          </div>
          {onCollapse && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-foreground/70 hover:text-foreground shrink-0"
              onClick={onCollapse}
              aria-label="Collapse panel"
            >
              <PanelRight className="size-4" />
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-2 flex gap-0.5">
          {(["prompts", "docs"] as PanelTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-1.5 rounded-t-md border-b-2 px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                activeTab === tab
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab === "prompts" ? <List className="size-3.5" /> : <FileText className="size-3.5" />}
              {tab === "prompts" ? "Quick prompts" : "Documents"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {activeTab === "prompts" ? (
          <div className="flex h-full flex-col gap-3 overflow-y-auto p-3 scrollbar-none">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ask me anything about implementation — architecture, tech choices, repo structure, or dev planning.
              I have full context of the project SRS.
            </p>
            <div className="space-y-1.5">
              {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onSuggestionSelect?.(prompt)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-left text-xs transition-colors",
                    "hover:border-border hover:bg-muted/40 hover:text-foreground",
                    "text-muted-foreground",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          projectId ? (
            <DocsTab projectId={projectId} />
          ) : (
            <p className="px-4 pt-4 text-xs text-muted-foreground">No project selected.</p>
          )
        )}
      </div>
    </Card>
  );
}
