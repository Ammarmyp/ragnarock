"use client";

import {
  AlertTriangle,
  ArrowRight,
  FileDown,
  GitBranch,
  Layers,
  ListTodo,
  PanelRight,
  Shield,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ValidationIssue } from "@/features/requirements-workspace/types";
import { useRequirementsWorkspaceStore } from "@/stores/requirements-workspace.store";

function issueIcon(kind: ValidationIssue["kind"]) {
  if (kind === "ambiguity") return AlertTriangle;
  if (kind === "missing") return ListTodo;
  return GitBranch;
}

function issueStyles(kind: ValidationIssue["kind"]) {
  if (kind === "ambiguity")
    return "border-amber-500/25 bg-amber-500/[0.06] text-amber-900 dark:text-amber-100";
  if (kind === "missing")
    return "border-sky-500/25 bg-sky-500/[0.06] text-sky-900 dark:text-sky-100";
  return "border-rose-500/25 bg-rose-500/[0.06] text-rose-900 dark:text-rose-100";
}

function clarityLabel(clarity: "low" | "medium" | "high") {
  if (clarity === "high") return "High";
  if (clarity === "medium") return "Medium";
  return "Low";
}

export function SrsRightPanel({ onCollapse }: { onCollapse?: () => void }) {
  const health = useRequirementsWorkspaceStore((s) => s.health);
  const validation = useRequirementsWorkspaceStore((s) => s.validation);
  const coverage = useRequirementsWorkspaceStore((s) => s.coverage);
  const insightSuggestions = useRequirementsWorkspaceStore((s) => s.insightSuggestions);

  return (
    <Card className="flex h-full min-h-0 w-full flex-col overflow-hidden border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
      <div className="border-border/60 shrink-0 border-b px-2.5 pb-2 pt-2.5">
        <div className="flex items-start gap-1.5">
          {onCollapse ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-foreground/80 hover:bg-muted hover:text-foreground -ml-1 -mt-0.5 shrink-0"
              onClick={onCollapse}
              aria-label="Collapse validation panel"
              title="Collapse panel"
            >
              <PanelRight className="size-4" />
            </Button>
          ) : null}
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Validation</p>
            <h2 className="text-foreground text-[13px] font-semibold leading-tight">Quality gate</h2>
            <p className="text-muted-foreground text-[10px] leading-snug">BA + QA signals during the interview.</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-2.5 py-2">
        {/* Health */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="text-primary size-4" />
            <h3 className="text-[13px] font-semibold">Requirement health</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2 text-center">
              <p className="text-muted-foreground text-[10px] font-medium uppercase">Complete</p>
              <p className="text-foreground text-lg font-semibold tabular-nums">{health.completeness}%</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2 text-center">
              <p className="text-muted-foreground text-[10px] font-medium uppercase">Clarity</p>
              <p className="text-foreground text-sm font-semibold">{clarityLabel(health.clarity)}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2 text-center">
              <p className="text-muted-foreground text-[10px] font-medium uppercase">Risk</p>
              <p className="text-foreground text-sm font-semibold capitalize">{health.riskLevel}</p>
            </div>
          </div>
          <div className="bg-muted h-2 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
              style={{ width: `${health.completeness}%` }}
            />
          </div>
        </section>

        <Separator className="bg-border/60" />

        {/* Validation buckets */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="text-muted-foreground size-4" />
            <h3 className="text-[13px] font-semibold">Real-time checks</h3>
          </div>
          <div className="space-y-2">
            {validation.map((v) => {
              const Icon = issueIcon(v.kind);
              return (
                <div
                  key={v.id}
                  className={cn("rounded-lg border px-2.5 py-2 text-[12px] leading-snug", issueStyles(v.kind))}
                >
                  <div className="flex items-start gap-2">
                    <Icon className="mt-0.5 size-3.5 shrink-0 opacity-80" />
                    <div className="min-w-0">
                      <p className="font-medium">{v.title}</p>
                      <p className="opacity-90 mt-0.5 text-[11px] leading-relaxed">{v.detail}</p>
                      <Badge variant="outline" className="mt-1.5 border-current/20 text-[10px] capitalize">
                        {v.kind}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Separator className="bg-border/60" />

        {/* Coverage map */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Layers className="text-muted-foreground size-4" />
            <h3 className="text-[13px] font-semibold">Coverage map</h3>
          </div>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Features vs roles — highlights missing ownership or role gaps.
          </p>
          <div className="overflow-hidden rounded-lg border border-border/60">
            <div className="bg-muted/40 grid grid-cols-[1fr_auto] gap-2 border-b border-border/60 px-2 py-1.5 text-[10px] font-semibold tracking-wide uppercase">
              <span>Feature</span>
              <span className="text-right">Roles</span>
            </div>
            {coverage.map((row) => (
              <div
                key={row.feature}
                className="grid grid-cols-[1fr_auto] gap-2 border-b border-border/40 px-2 py-2 text-[12px] last:border-0"
              >
                <span className="font-medium leading-snug">{row.feature}</span>
                <div className="flex flex-col items-end gap-1 text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    {row.roles.length === 0 ? (
                      <Badge variant="destructive" className="text-[10px]">
                        Unassigned
                      </Badge>
                    ) : (
                      row.roles.map((r) => (
                        <Badge key={r} variant="secondary" className="text-[10px] font-normal">
                          {r}
                        </Badge>
                      ))
                    )}
                  </div>
                  {row.gap && (
                    <span className="text-muted-foreground max-w-[12rem] text-[10px]">Gap: {row.gap}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator className="bg-border/60" />

        {/* AI suggestions */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary size-4" />
            <h3 className="text-[13px] font-semibold">Suggested next captures</h3>
          </div>
          <ul className="space-y-2">
            {insightSuggestions.map((s) => (
              <li
                key={s}
                className="bg-muted/20 border-border/50 flex items-start gap-2 rounded-lg border px-2.5 py-2 text-[12px] leading-snug"
              >
                <ArrowRight className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>

        <Separator className="bg-border/60" />

        {/* Advanced UX placeholders */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="text-muted-foreground size-4" />
            <h3 className="text-[13px] font-semibold">Advanced (preview)</h3>
          </div>
          <div className="flex flex-col gap-2">
            <Button type="button" variant="outline" size="sm" className="h-8 justify-start gap-2 text-[12px]">
              <GitBranch className="size-3.5" />
              Simulate user flow
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 justify-start gap-2 text-[12px]">
              <Layers className="size-3.5" />
              Generate preview / wireframes
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 justify-start gap-2 text-[12px]">
              <FileDown className="size-3.5" />
              Export SRS (PDF / Markdown)
            </Button>
          </div>
        </section>
      </div>
    </Card>
  );
}
