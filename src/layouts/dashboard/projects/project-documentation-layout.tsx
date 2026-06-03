"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bot, Expand, Eye, FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SrsDocumentBody, buildSrsMarkdown } from "@/components/requirements-workspace/srs-document-body";
import { DocumentationCreateDialog } from "@/components/documentation/documentation-create-dialog";
import { DocumentationDownloadMenu } from "@/components/documentation/documentation-download-menu";
import { DocumentationListFilters } from "@/components/documentation/documentation-list-filters";
import { DocumentationListSection } from "@/components/documentation/documentation-list-section";
import { useProjectDocumentations, useProjectRole } from "@/hooks/use-projects";
import { useProjectAiChatSessionsWithProgress, useProjectSpecifications } from "@/hooks/use-project-ai-chat";
import { useDocumentationWorkspaceStore } from "@/stores/documentation-workspace.store";
import { cn } from "@/lib/utils";
import type { AgentPartialSrs, ProjectAiChatSessionWithProgress, ProjectSpecification } from "@/api/projects.api";

type SrsStatus = "complete" | "in_progress" | "not_started";

interface SrsCardData {
  status: SrsStatus;
  progress: number;
  spec: ProjectSpecification | null;
  partialSrs: AgentPartialSrs | null;
  title: string;
  summary: string;
  featureCount: number;
  requirementCount: number;
  nfrCount: number;
  userStoryCount: number;
  updatedAt: string;
}

function buildSrsCardData(
  latestSpec: ProjectSpecification | null,
  sessions: ProjectAiChatSessionWithProgress[],
): SrsCardData | null {
  if (latestSpec?.payload) {
    const p = latestSpec.payload;
    return {
      status: "complete",
      progress: 100,
      spec: latestSpec,
      partialSrs: null,
      title: p.project_name,
      summary: p.summary,
      featureCount: p.features.length,
      requirementCount: p.functional_requirements.length,
      nfrCount: p.non_functional_requirements.length,
      userStoryCount: p.user_stories.length,
      updatedAt: latestSpec.updatedAt,
    };
  }

  // Find the session with the highest srsProgress
  const best = sessions.reduce<ProjectAiChatSessionWithProgress | null>((acc, s) => {
    if (!acc) return s;
    return (s.srsProgress ?? 0) > (acc.srsProgress ?? 0) ? s : acc;
  }, null);

  const progress = best?.srsProgress ?? 0;
  if (progress === 0) return null;

  const partial = best?.partialSrs ?? null;
  return {
    status: "in_progress",
    progress,
    spec: null,
    partialSrs: partial,
    title: partial?.project_name ?? "SRS in progress",
    summary: partial?.summary ?? "Your SRS is being built. Continue the conversation to complete it.",
    featureCount: partial?.features?.length ?? 0,
    requirementCount: partial?.functional_requirements?.length ?? 0,
    nfrCount: partial?.non_functional_requirements?.length ?? 0,
    userStoryCount: partial?.user_stories?.length ?? 0,
    updatedAt: best?.updatedAt ?? new Date().toISOString(),
  };
}

function SrsCard({
  projectId,
  data,
}: {
  projectId: string;
  data: SrsCardData;
}) {
  const [expandOpen, setExpandOpen] = useState(false);
  const markdown = useMemo(
    () => buildSrsMarkdown(data.partialSrs, data.spec?.payload ?? null),
    [data.partialSrs, data.spec],
  );
  const isComplete = data.status === "complete";
  const detailHref = `/dashboard/projects/${projectId}/ragnarock`;

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden shadow-sm",
          isComplete
            ? "border-emerald-500/30 bg-linear-to-br from-emerald-500/5 via-card to-card"
            : "border-primary/20 bg-linear-to-br from-primary/5 via-card to-card",
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1 border-transparent font-normal text-xs">
                <Bot className="size-3" />
                Ragnarock Generated
              </Badge>
              <Badge
                className={cn(
                  "font-normal text-xs",
                  isComplete
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "border-primary/30 bg-primary/10 text-primary",
                )}
              >
                SRS
              </Badge>
              {!isComplete && (
                <Badge variant="outline" className="gap-1 text-xs font-normal text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" />
                  In progress
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                Updated {new Date(data.updatedAt).toLocaleDateString()}
              </span>
            </div>
            {markdown && (
              <DocumentationDownloadMenu
                compact
                title={data.spec ? `${data.spec.payload.project_name} — SRS` : "SRS Document"}
                markdown={markdown}
              />
            )}
          </div>

          <h3 className="text-lg font-semibold tracking-tight leading-snug">{data.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{data.summary}</p>
        </CardHeader>

        <CardContent className="space-y-4 pb-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                {isComplete ? "Completion" : "Progress"}
              </span>
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  isComplete
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-primary",
                )}
              >
                {data.progress}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isComplete ? "bg-emerald-500" : "bg-primary",
                )}
                style={{ width: `${data.progress}%` }}
              />
            </div>
          </div>

          {(data.featureCount > 0 || data.requirementCount > 0 || data.nfrCount > 0 || data.userStoryCount > 0) && (
            <div className="grid grid-cols-4 divide-x divide-border/50 rounded-lg border border-border/50 bg-muted/30">
              {[
                { label: "Features", value: data.featureCount },
                { label: "Requirements", value: data.requirementCount },
                { label: "NFRs", value: data.nfrCount },
                { label: "User Stories", value: data.userStoryCount },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center gap-0.5 px-2 py-2.5">
                  <span className="text-base font-bold tabular-nums">{value}</span>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 border-t border-border/50 bg-muted/20 pt-3">
          <Button size="sm" asChild className="shadow-none">
            <Link href={detailHref}>
              <Eye className="mr-1 size-4" />
              Continue in Requirements
            </Link>
          </Button>
          {markdown && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shadow-none"
              onClick={() => setExpandOpen(true)}
            >
              <Expand className="mr-1 size-4" />
              Preview SRS
            </Button>
          )}
        </CardFooter>
      </Card>

      {markdown && (
        <Dialog open={expandOpen} onOpenChange={setExpandOpen}>
          <DialogContent className="flex h-[90dvh] max-h-[90dvh] w-[min(90vw,900px)] max-w-[min(90vw,900px)] flex-col gap-0 p-0">
            <DialogHeader className="shrink-0 border-b px-6 py-4">
              <div className="flex items-center justify-between gap-3 pr-8">
                <DialogTitle className="text-base font-semibold">{data.title}</DialogTitle>
                <Button size="sm" variant="outline" asChild className="shrink-0">
                  <Link href={detailHref} onClick={() => setExpandOpen(false)}>
                    <Eye className="mr-1 size-3.5" />
                    Open Requirements
                  </Link>
                </Button>
              </div>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <SrsDocumentBody
                markdown={markdown}
                status={data.status}
                displayProgress={data.progress}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export function ProjectDocumentationLayout({ projectId }: { projectId: string }) {
  const search = useDocumentationWorkspaceStore((s) => s.search);
  const setSearch = useDocumentationWorkspaceStore((s) => s.setSearch);
  const statusFilter = useDocumentationWorkspaceStore((s) => s.statusFilter);
  const setStatusFilter = useDocumentationWorkspaceStore((s) => s.setStatusFilter);
  const typeFilter = useDocumentationWorkspaceStore((s) => s.typeFilter);
  const setTypeFilter = useDocumentationWorkspaceStore((s) => s.setTypeFilter);
  const page = useDocumentationWorkspaceStore((s) => s.page);
  const setPage = useDocumentationWorkspaceStore((s) => s.setPage);
  const perPage = useDocumentationWorkspaceStore((s) => s.perPage);

  const listParams = useMemo(
    () => ({
      page,
      perPage,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      ...(typeFilter !== "all" ? { type: typeFilter } : {}),
    }),
    [page, perPage, search, statusFilter, typeFilter],
  );

  const { data, isLoading } = useProjectDocumentations(projectId, listParams);
  const { data: specsPage } = useProjectSpecifications(projectId, { page: 1, limit: 1 });
  const { data: sessionsPage } = useProjectAiChatSessionsWithProgress(projectId, { page: 1, limit: 30 });
  const { data: role } = useProjectRole(projectId);

  const canCreate = role?.role === "owner" || role?.role === "admin" || role?.role === "member";
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const latestSpec = specsPage?.data?.[0] ?? null;
  const sessions = sessionsPage?.data ?? [];

  const srsCardData = useMemo(
    () => buildSrsCardData(latestSpec, sessions),
    [latestSpec, sessions],
  );

  // Show SRS card unless filtered away by type or status
  const showSrsCard =
    !!srsCardData &&
    !search.trim() &&
    statusFilter === "all" &&
    (typeFilter === "all" || typeFilter === "srs");

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-row flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 pb-4 sm:px-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <FileText className="size-5 opacity-90" />
          Documentation
        </h2>
        {canCreate && <DocumentationCreateDialog projectId={projectId} />}
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 pt-4 pb-4 sm:px-6 sm:pb-6">
        <div className="shrink-0 space-y-4 pb-4">
          <DocumentationListFilters
            search={search}
            onSearchChange={setSearch}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-0.5 [-webkit-overflow-scrolling:touch] space-y-6">
          {showSrsCard && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bot className="size-4 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-medium">Software Requirements Specification</p>
              </div>
              <SrsCard projectId={projectId} data={srsCardData} />
              {items.length > 0 && <div className="border-t border-border/40 pt-2" />}
            </div>
          )}

          <DocumentationListSection
            projectId={projectId}
            items={items}
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            total={data?.total ?? 0}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
