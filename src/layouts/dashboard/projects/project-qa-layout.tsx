"use client";

import { useState } from "react";
import { AlertTriangle, Bot, FlaskConical, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DocumentationListSection } from "@/components/documentation/documentation-list-section";
import { useProjectDocumentations, useProjectRole, useProjectTasks } from "@/hooks/use-projects";
import { useProjectSpecifications } from "@/hooks/use-project-ai-chat";
import { useGenerateQaTestSuite, useRagnarockSocket, type QaIntelligenceCompletedEvent } from "@/hooks/use-ragnarock-chat";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";

export function ProjectQaLayout({ projectId }: { projectId: string }) {
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useProjectDocumentations(projectId, {
    page: 1,
    perPage: 20,
    type: "stp",
  });
  const { data: role } = useProjectRole(projectId);
  const { data: tasksData } = useProjectTasks(projectId, { page: 1, limit: 1 });
  const { data: specsData } = useProjectSpecifications(projectId, { page: 1, limit: 1 });
  const hasTasks = (tasksData?.pagination.totalItems ?? 0) > 0;
  const hasSrs = (specsData?.data.length ?? 0) > 0;

  const canGenerate = role?.role === "owner" || role?.role === "admin" || role?.role === "member";

  const generateQa = useGenerateQaTestSuite({
    onSuccess: () => {
      setGenerating(true);
      toast.info("Generating test suite — this may take a moment.");
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to start test suite generation.");
    },
  });

  useRagnarockSocket({
    projectId,
    onQaCompleted: (payload: QaIntelligenceCompletedEvent) => {
      setGenerating(false);
      toast.success(`Test suite ready: ${payload.title}`);
      void queryClient.invalidateQueries({ queryKey: ["projects", "detail", projectId, "documentations"] });
    },
    onQaFailed: () => {
      setGenerating(false);
      toast.error("Test suite generation failed. Please try again.");
    },
  });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-row flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 pb-4 sm:px-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <FlaskConical className="size-5 opacity-90" />
          Test Cases
        </h2>
        {canGenerate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  size="sm"
                  disabled={generating || generateQa.isPending || !hasSrs}
                  onClick={() => generateQa.mutate({ projectId })}
                >
                  {generating || generateQa.isPending ? (
                    <>
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-1.5 size-3.5" />
                      Generate Test Suite
                    </>
                  )}
                </Button>
              </span>
            </TooltipTrigger>
            {!hasSrs && (
              <TooltipContent side="bottom" className="text-xs max-w-[200px] text-center">
                Complete the SRS requirements first before generating test cases.
              </TooltipContent>
            )}
          </Tooltip>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 pt-4 pb-4 sm:px-6 sm:pb-6">
        {!hasSrs && !generating && (
          <div className="mb-3 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive shrink-0">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <span>
              No completed SRS found.{" "}
              <span className="font-medium">Complete the requirements session in Ragnarock</span>{" "}
              before generating test cases.
            </span>
          </div>
        )}

        {hasSrs && !hasTasks && !generating && (
          <div className="mb-3 flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-sm text-amber-700 dark:text-amber-400 shrink-0">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <span>
              No tasks have been generated yet. Test cases will be less traceable without a task breakdown.{" "}
              <span className="font-medium">Generate a plan first</span> for the best results.
            </span>
          </div>
        )}

        {generating && (
          <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary shrink-0">
            <Loader2 className="size-4 animate-spin shrink-0" />
            <span>QA Intelligence Agent is analyzing your SRS and generating test cases…</span>
          </div>
        )}

        {!generating && items.length === 0 && !isLoading && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <FlaskConical className="size-6 text-muted-foreground/60" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No test suites yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Click <strong>Generate Test Suite</strong> to let the QA Intelligence Agent
                produce test cases from your SRS.
              </p>
            </div>
            {canGenerate && hasSrs && (
              <Button
                size="sm"
                variant="outline"
                disabled={generateQa.isPending}
                onClick={() => generateQa.mutate({ projectId })}
              >
                <Bot className="mr-1.5 size-3.5" />
                Generate Test Suite
              </Button>
            )}
          </div>
        )}

        {(items.length > 0 || isLoading) && (
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-0.5 [-webkit-overflow-scrolling:touch]">
            {items.length > 0 && (
              <div className="mb-4 flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="gap-1 text-xs font-normal">
                  <Bot className="size-3" />
                  AI Generated
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {items.length} test suite{items.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            <DocumentationListSection
              projectId={projectId}
              items={items}
              isLoading={isLoading}
              page={1}
              totalPages={totalPages}
              total={data?.total ?? 0}
              onPageChange={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}
