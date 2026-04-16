"use client";

import { useMemo } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Link2,
  PanelLeft,
  Sparkles,
  TestTube2,
  Wand2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { SrsRequirement } from "@/features/requirements-workspace/types";
import { useRequirementsWorkspaceStore } from "@/stores/requirements-workspace.store";

function priorityVariant(p: SrsRequirement["priority"]) {
  if (p === "critical") return "destructive" as const;
  if (p === "high") return "default" as const;
  if (p === "medium") return "secondary" as const;
  return "outline" as const;
}

function statusLabel(s: SrsRequirement["status"]) {
  return s.replace("-", " ");
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

export function SrsLeftPanel({ onCollapse }: { onCollapse?: () => void }) {
  const sections = useRequirementsWorkspaceStore((s) => s.sections);
  const expandedSections = useRequirementsWorkspaceStore((s) => s.expandedSections);
  const toggleSection = useRequirementsWorkspaceStore((s) => s.toggleSection);
  const selectedId = useRequirementsWorkspaceStore((s) => s.selectedRequirementId);
  const selectRequirement = useRequirementsWorkspaceStore((s) => s.selectRequirement);

  const sectionProgress = useMemo(() => {
    return sections.map((sec) => {
      const total = sec.items.length;
      const done = sec.items.filter((i) => i.status === "completed" || i.status === "validated").length;
      return { id: sec.id, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
    });
  }, [sections]);

  const progressMap = useMemo(() => Object.fromEntries(sectionProgress.map((p) => [p.id, p.pct])), [sectionProgress]);

  return (
    <Card className="flex h-full min-h-0 w-full flex-col overflow-hidden border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
      <div className="border-border/60 shrink-0 border-b px-2.5 pb-2 pt-2.5">
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0 space-y-0.5">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Live SRS</p>
            <h2 className="text-foreground text-[13px] font-semibold leading-tight">Specification</h2>
            <p className="text-muted-foreground text-[10px] leading-snug">Chat extracts into these sections.</p>
          </div>
          {onCollapse ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-foreground/80 hover:bg-muted hover:text-foreground -mr-1 -mt-0.5 shrink-0"
              onClick={onCollapse}
              aria-label="Collapse specification panel"
              title="Collapse panel"
            >
              <PanelLeft className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1.5 py-1.5">
        <div className="space-y-1">
          {sections.map((section) => {
            const open = expandedSections[section.id] ?? true;
            const pct = progressMap[section.id] ?? 0;
            return (
              <div key={section.id} className="rounded-lg border border-border/50 bg-muted/20">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center gap-2 px-2 py-2 text-left transition-colors hover:bg-muted/40"
                >
                  {open ? (
                    <ChevronDown className="text-muted-foreground size-4 shrink-0" />
                  ) : (
                    <ChevronRight className="text-muted-foreground size-4 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-medium">{section.label}</span>
                      <span className="text-muted-foreground shrink-0 text-[10px] tabular-nums">{pct}%</span>
                    </div>
                    <div className="bg-muted mt-1.5 h-1 overflow-hidden rounded-full">
                      <motion.div
                        className="bg-primary/80 h-full rounded-full"
                        initial={false}
                        animate={{ width: `${pct}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    </div>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="text-muted-foreground border-border/40 border-t px-2 pb-2 pt-0.5 text-[11px]">
                        {section.description}
                      </div>
                      <div className="space-y-2 px-1 pb-2">
                        {section.id === "functional" || section.id === "user-stories"
                          ? groupByFeature(section.items).map(([group, items]) => (
                              <div key={group} className="space-y-1">
                                <div className="text-muted-foreground flex items-center gap-1.5 px-1.5 pt-1 text-[10px] font-semibold tracking-wide uppercase">
                                  <GitBranch className="size-3" />
                                  {group}
                                </div>
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
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
    <motion.div layout initial={false} animate={{ opacity: 1 }} className="group/req relative">
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "w-full rounded-md border px-2 py-2 text-left transition-all",
          selected
            ? "border-primary/50 bg-primary/5 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.15)]"
            : "border-transparent bg-background/60 hover:border-border/80 hover:bg-muted/50",
          item.isNew && "ring-primary/30 animate-in fade-in slide-in-from-left-2 ring-2 duration-500",
        )}
      >
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[13px] leading-snug font-medium">{item.title}</p>
            <p className="text-muted-foreground line-clamp-2 text-[11px] leading-relaxed">{item.description}</p>
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              <Badge variant="outline" className="text-[10px] font-normal capitalize">
                {item.type}
              </Badge>
              <Badge variant={priorityVariant(item.priority)} className="text-[10px] font-normal capitalize">
                {item.priority}
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-normal capitalize">
                {statusLabel(item.status)}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-normal capitalize">
                {item.source}
              </Badge>
              {item.linkedUserStoryId && (
                <span className="text-muted-foreground inline-flex items-center gap-0.5 text-[10px]">
                  <Link2 className="size-3" />
                  {item.linkedUserStoryId}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      <div
        className={cn(
          "flex flex-wrap items-center gap-1 px-2 pb-1 pt-0.5 opacity-0 transition-opacity group-hover/req:opacity-100",
          selected && "opacity-100",
        )}
      >
        <Button
          type="button"
          size="xs"
          variant="ghost"
          className="h-6 text-[10px]"
          onClick={(e) => e.stopPropagation()}
        >
          <Sparkles className="size-3" />
          Improve with AI
        </Button>
        <Button type="button" size="xs" variant="ghost" className="h-6 text-[10px]" onClick={(e) => e.stopPropagation()}>
          <BookOpen className="size-3" />
          Stories
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="h-6 text-[10px]"
              onClick={(e) => e.stopPropagation()}
            >
              <Wand2 className="size-3" />
              More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem>
              <Link2 className="size-3.5" />
              Link to feature
            </DropdownMenuItem>
            <DropdownMenuItem>
              <TestTube2 className="size-3.5" />
              Generate test cases
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
