"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  Layers,
  ListChecks,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectFeatures } from "@/hooks/use-projects";
import { useProjectSpecifications } from "@/hooks/use-project-ai-chat";
import type { ProjectFeature } from "@/api/projects.api";

const REQUIREMENT_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  in_review: "In Review",
  approved: "Approved",
  implemented: "Implemented",
};

const REQUIREMENT_STATUS_VARIANTS: Record<
  string,
  "secondary" | "outline" | "default" | "destructive"
> = {
  draft: "secondary",
  in_review: "outline",
  approved: "default",
  implemented: "default",
};

function FeatureCard({ feature }: { feature: ProjectFeature }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
      <button
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="mt-0.5 shrink-0 text-muted-foreground">
          {open ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {feature.externalId}
            </span>
            <span className="text-sm font-medium truncate">{feature.name}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
            {feature.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 ml-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ListChecks className="size-3.5" />
            {feature._count.tasks}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <FlaskConical className="size-3.5" />
            {feature._count.testCases}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ClipboardList className="size-3.5" />
            {feature.requirements.length}
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-border/40 px-4 py-3 bg-muted/20">
          <p className="mb-3 text-sm text-foreground/80">{feature.description}</p>

          {feature.requirements.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Requirements
              </p>
              {feature.requirements.map((req) => (
                <div
                  key={req.id}
                  className="flex items-start gap-2.5 rounded-md border border-border/40 bg-background px-3 py-2"
                >
                  <CheckCircle2 className="size-3.5 mt-0.5 shrink-0 text-muted-foreground/60" />
                  <span className="flex-1 text-xs text-foreground/90">{req.title}</span>
                  <Badge
                    variant={REQUIREMENT_STATUS_VARIANTS[req.status] ?? "secondary"}
                    className="text-[10px] h-4 px-1.5 shrink-0"
                  >
                    {REQUIREMENT_STATUS_LABELS[req.status] ?? req.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No requirements linked yet.</p>
          )}

          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground border-t border-border/30 pt-3">
            <span className="flex items-center gap-1.5">
              <ListChecks className="size-3.5" />
              <strong>{feature._count.tasks}</strong> task{feature._count.tasks !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <FlaskConical className="size-3.5" />
              <strong>{feature._count.testCases}</strong> test case{feature._count.testCases !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 bg-card px-4 py-3.5 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

export function ProjectFeaturesLayout({ projectId }: { projectId: string }) {
  const { data: features, isLoading } = useProjectFeatures(projectId);
  const { data: specsData } = useProjectSpecifications(projectId, { page: 1, limit: 1 });
  const hasSrs = (specsData?.data.length ?? 0) > 0;

  const totalTasks = features?.reduce((sum, f) => sum + f._count.tasks, 0) ?? 0;
  const totalTestCases = features?.reduce((sum, f) => sum + f._count.testCases, 0) ?? 0;
  const totalRequirements = features?.reduce((sum, f) => sum + f.requirements.length, 0) ?? 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 flex-row flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 pb-4 sm:px-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Layers className="size-5 opacity-90" />
          Features
        </h2>

        {features && features.length > 0 && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Layers className="size-3.5" />
              {features.length} feature{features.length !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <ListChecks className="size-3.5" />
              {totalTasks} tasks
            </span>
            <span className="flex items-center gap-1">
              <FlaskConical className="size-3.5" />
              {totalTestCases} tests
            </span>
            <span className="flex items-center gap-1">
              <ClipboardList className="size-3.5" />
              {totalRequirements} requirements
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col px-4 pt-4 pb-4 sm:px-6 sm:pb-6 overflow-y-auto">
        {/* No SRS warning */}
        {!hasSrs && !isLoading && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive shrink-0">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <span>
              No completed SRS found.{" "}
              <span className="font-medium">
                Complete the requirements session in Ragnarock
              </span>{" "}
              to generate features.
            </span>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <FeatureSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && hasSrs && features?.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Layers className="size-6 text-muted-foreground/60" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No features extracted yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Features are created when the SRS session completes. Try finishing a
                requirements session in Ragnarock.
              </p>
            </div>
          </div>
        )}

        {/* Feature list */}
        {!isLoading && features && features.length > 0 && (
          <div className="space-y-2.5">
            {features.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
