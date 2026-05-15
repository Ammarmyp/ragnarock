"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Expand,
  FileText,
  GitBranch,
  List,
  PanelRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SrsDocumentBody, buildSrsMarkdown } from "@/components/requirements-workspace/srs-document-body";
import type { SrsRequirement } from "@/features/requirements-workspace/types";
import { useRequirementsWorkspaceStore } from "@/stores/requirements-workspace.store";

type PanelTab = "sections" | "document";

function priorityVariant(p: SrsRequirement["priority"]) {
  if (p === "critical") return "destructive" as const;
  if (p === "high") return "default" as const;
  if (p === "medium") return "secondary" as const;
  return "outline" as const;
}

function groupByFeature(items: SrsRequirement[]) {
  const map = new Map<string, SrsRequirement[]>();
  for (const it of items) {
    const g = it.featureGroup || "General";
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(it);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}


function DocumentView({ onExpand }: { onExpand: () => void }) {
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

  return (
    <div className="flex h-full flex-col gap-2 px-3 py-3">
      {/* Expand button row */}
      <div className="flex shrink-0 justify-end">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onExpand}
          title="Expand document"
          className="text-muted-foreground hover:text-foreground"
        >
          <Expand className="size-3.5" />
        </Button>
      </div>

      {/* Shared document body — same rendering as the modal */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <SrsDocumentBody
          markdown={markdown}
          status={status}
          displayProgress={displayProgress}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
}

function SrsDocumentModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
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
  );
}

function RequirementRow({
  item,
  selected,
  onSelect,
}: {
  item: SrsRequirement;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border px-3 py-2.5 text-left transition-all",
        selected
          ? "border-primary/50 bg-primary/5 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.15)]"
          : "border-transparent bg-background/60 hover:border-border/60 hover:bg-muted/40",
        item.isNew && "ring-primary/30 animate-in fade-in slide-in-from-left-2 ring-2 duration-500",
      )}
    >
      <p className="text-sm font-medium leading-snug">{item.title}</p>
      {item.description && (
        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">{item.description}</p>
      )}
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        <Badge variant="outline" className="text-[10px] font-normal capitalize">{item.type}</Badge>
        <Badge variant={priorityVariant(item.priority)} className="text-[10px] font-normal capitalize">{item.priority}</Badge>
      </div>
    </button>
  );
}

export function SrsLeftPanel({ onCollapse }: { onCollapse?: () => void }) {
  const [activeTab, setActiveTab] = useState<PanelTab>("sections");
  const [docModalOpen, setDocModalOpen] = useState(false);

  const sections = useRequirementsWorkspaceStore((s) => s.sections);
  const expandedSections = useRequirementsWorkspaceStore((s) => s.expandedSections);
  const toggleSection = useRequirementsWorkspaceStore((s) => s.toggleSection);
  const selectedId = useRequirementsWorkspaceStore((s) => s.selectedRequirementId);
  const selectRequirement = useRequirementsWorkspaceStore((s) => s.selectRequirement);
  const srsProgress = useRequirementsWorkspaceStore((s) => s.srsProgress);
  const completedSpec = useRequirementsWorkspaceStore((s) => s.completedSpec);
  const baseSpec = useRequirementsWorkspaceStore((s) => s.baseSpec);
  const partialSrs = useRequirementsWorkspaceStore((s) => s.partialSrs);

  // Use session spec if available, otherwise the latest persisted project spec
  const displaySpec = completedSpec ?? baseSpec;
  const displayProgress = displaySpec ? 100 : srsProgress;

  const liveSections = useMemo(() => {
    if (!partialSrs && !displaySpec) return sections;

    const spec = displaySpec;
    const partial = partialSrs;

    return sections.map((sec) => {
      if (spec) {
        if (sec.id === "project-overview") {
          return {
            ...sec,
            items: [
              {
                id: "live-name",
                title: spec.project_name,
                description: spec.summary,
                type: "functional" as const,
                priority: "high" as const,
                status: "validated" as const,
                source: "ai" as const,
              },
            ],
          };
        }
        if (sec.id === "user-roles") {
          return { ...sec, items: [] };
        }
        if (sec.id === "functional") {
          return {
            ...sec,
            items: spec.functional_requirements.map((fr, i) => ({
              id: `live-fr-${i}`,
              title: fr,
              description: "",
              type: "functional" as const,
              priority: "medium" as const,
              status: "validated" as const,
              source: "ai" as const,
            })),
          };
        }
        if (sec.id === "user-stories") {
          return {
            ...sec,
            items: spec.user_stories.map((us, i) => ({
              id: `live-us-${i}`,
              title: `As a ${us.role}, I want to ${us.goal}`,
              description: `So that ${us.benefit}`,
              type: "functional" as const,
              priority: "medium" as const,
              status: "validated" as const,
              source: "ai" as const,
            })),
          };
        }
        if (sec.id === "non-functional") {
          return {
            ...sec,
            items: spec.non_functional_requirements.map((nfr, i) => ({
              id: `live-nfr-${i}`,
              title: nfr,
              description: "",
              type: "nfr" as const,
              priority: "medium" as const,
              status: "validated" as const,
              source: "ai" as const,
            })),
          };
        }
      } else if (partial) {
        if (sec.id === "project-overview" && partial.project_name) {
          return {
            ...sec,
            items: [
              {
                id: "live-name",
                title: partial.project_name,
                description: partial.summary ?? "",
                type: "functional" as const,
                priority: "high" as const,
                status: "draft" as const,
                source: "ai" as const,
              },
            ],
          };
        }
        if (sec.id === "user-roles" && partial.user_roles?.length) {
          return {
            ...sec,
            items: partial.user_roles.map((r, i) => ({
              id: `live-ur-${i}`,
              title: r,
              description: "",
              type: "technical" as const,
              priority: "medium" as const,
              status: "draft" as const,
              source: "ai" as const,
            })),
          };
        }
        if (sec.id === "functional" && partial.functional_requirements?.length) {
          return {
            ...sec,
            items: partial.functional_requirements.map((fr, i) => ({
              id: `live-fr-${i}`,
              title: fr,
              description: "",
              type: "functional" as const,
              priority: "medium" as const,
              status: "draft" as const,
              source: "ai" as const,
            })),
          };
        }
        if (sec.id === "user-stories" && partial.user_stories?.length) {
          return {
            ...sec,
            items: partial.user_stories.map((us, i) => ({
              id: `live-us-${i}`,
              title: `As a ${us.role}, I want to ${us.goal}`,
              description: `So that ${us.benefit}`,
              type: "functional" as const,
              priority: "medium" as const,
              status: "draft" as const,
              source: "ai" as const,
            })),
          };
        }
        if (sec.id === "non-functional" && partial.non_functional_requirements?.length) {
          return {
            ...sec,
            items: partial.non_functional_requirements.map((nfr, i) => ({
              id: `live-nfr-${i}`,
              title: nfr,
              description: "",
              type: "nfr" as const,
              priority: "medium" as const,
              status: "draft" as const,
              source: "ai" as const,
            })),
          };
        }
      }
      return sec;
    });
  }, [sections, partialSrs, displaySpec]);

  const progressMap = useMemo(() => {
    return Object.fromEntries(
      liveSections.map((sec) => {
        const total = sec.items.length;
        const done = sec.items.filter((i) => i.status === "completed" || i.status === "validated").length;
        return [sec.id, total === 0 ? 0 : Math.round((done / total) * 100)];
      }),
    );
  }, [liveSections]);

  return (
    <Card className="flex h-full min-h-0 w-full flex-col overflow-hidden border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
      {/* Header */}
      <div className="border-border/60 shrink-0 border-b px-3 pb-0 pt-3">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Live SRS</p>
            <h2 className="text-sm font-semibold leading-tight">Specification</h2>
          </div>
          {onCollapse && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-foreground/70 hover:text-foreground shrink-0"
              onClick={onCollapse}
              aria-label="Collapse specification panel"
            >
              <PanelRight className="size-4" />
            </Button>
          )}
        </div>

        <div className="mt-2.5 flex gap-0.5">
          {(["sections", "document"] as PanelTab[]).map((tab) => (
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
              {tab === "sections" ? <List className="size-3.5" /> : <FileText className="size-3.5" />}
              {tab}
              {tab === "document" && displayProgress > 0 && (
                <span className={cn(
                  "rounded-full px-1 py-px text-[10px] font-semibold",
                  displaySpec ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-primary/15 text-primary",
                )}>
                  {displayProgress === 100 ? "Done" : `${displayProgress}%`}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {activeTab === "sections" ? (
          <div className="h-full overflow-y-auto overscroll-contain px-2 py-2">
            <div className="space-y-1.5">
              {liveSections.map((section) => {
                const open = expandedSections[section.id] ?? true;
                const pct = progressMap[section.id] ?? 0;
                return (
                  <div key={section.id} className="rounded-lg border border-border/50 bg-muted/20">
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="flex w-full items-center gap-2 px-2.5 py-2.5 text-left transition-colors hover:bg-muted/40"
                    >
                      {open ? (
                        <ChevronDown className="text-muted-foreground size-4 shrink-0" />
                      ) : (
                        <ChevronRight className="text-muted-foreground size-4 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium">{section.label}</span>
                          <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                            {section.items.length > 0 ? `${section.items.length}` : ""}
                          </span>
                        </div>
                        {pct > 0 && (
                          <div className="bg-muted mt-1.5 h-1 overflow-hidden rounded-full">
                            <motion.div
                              className="bg-primary/70 h-full rounded-full"
                              initial={false}
                              animate={{ width: `${pct}%` }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          </div>
                        )}
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <p className="text-muted-foreground border-border/40 border-t px-3 pb-1.5 pt-1 text-xs leading-relaxed">
                            {section.description}
                          </p>
                          {section.items.length === 0 ? (
                            <p className="px-3 pb-2.5 text-xs text-muted-foreground italic">
                              Not yet filled. Answer the interview questions to populate this section.
                            </p>
                          ) : (
                            <div className="space-y-1.5 px-2 pb-2">
                              {section.id === "functional" || section.id === "user-stories"
                                ? groupByFeature(section.items).map(([group, items]) => (
                                    <div key={group} className="space-y-1">
                                      {group !== "General" && (
                                        <div className="text-muted-foreground flex items-center gap-1.5 px-1 pt-1 text-xs font-semibold tracking-wide uppercase">
                                          <GitBranch className="size-3" />
                                          {group}
                                        </div>
                                      )}
                                      {items.map((item) => (
                                        <RequirementRow
                                          key={item.id}
                                          item={item}
                                          selected={selectedId === item.id}
                                          onSelect={() => selectRequirement(item.id)}
                                        />
                                      ))}
                                    </div>
                                  ))
                                : section.items.map((item) => (
                                    <RequirementRow
                                      key={item.id}
                                      item={item}
                                      selected={selectedId === item.id}
                                      onSelect={() => selectRequirement(item.id)}
                                    />
                                  ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <DocumentView onExpand={() => setDocModalOpen(true)} />
        )}
      </div>

      <SrsDocumentModal open={docModalOpen} onClose={() => setDocModalOpen(false)} />
    </Card>
  );
}
