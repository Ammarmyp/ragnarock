"use client";

import { useEffect, useState } from "react";
import { Kanban, LayoutList, Loader2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { taskSelectContentClassName, taskSelectTriggerClassName } from "@/components/tasks/task-ui";
import { LinearSyncActions } from "@/components/linear/linear-sync-actions";
import { TaskCreateDialog } from "@/components/tasks/task-create-dialog";
import { useGenerateProjectPlan, useProjectMembers, useProjectRole } from "@/hooks/use-projects";
import { useProjectSpecifications } from "@/hooks/use-project-ai-chat";
import { useRagnarockSocket } from "@/hooks/use-ragnarock-chat";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TaskPhase, TaskStatus } from "@/api/projects.api";
import {
  TASK_PHASE_LABELS,
  TASK_PHASE_ORDER,
  TASK_STATUS_LABELS,
  TASK_STATUS_ORDER,
} from "@/lib/task-labels";
import { useTasksWorkspaceStore } from "@/stores/tasks-workspace.store";
type TasksToolbarProps = {
  projectId: string;
};

export function TasksToolbar({ projectId }: TasksToolbarProps) {
  const viewMode = useTasksWorkspaceStore((s) => s.viewMode);
  const setViewMode = useTasksWorkspaceStore((s) => s.setViewMode);
  const search = useTasksWorkspaceStore((s) => s.search);
  const setSearch = useTasksWorkspaceStore((s) => s.setSearch);
  const statusFilter = useTasksWorkspaceStore((s) => s.statusFilter);
  const setStatusFilter = useTasksWorkspaceStore((s) => s.setStatusFilter);
  const phaseFilter = useTasksWorkspaceStore((s) => s.phaseFilter);
  const setPhaseFilter = useTasksWorkspaceStore((s) => s.setPhaseFilter);
  const assigneeFilter = useTasksWorkspaceStore((s) => s.assigneeFilter);
  const setAssigneeFilter = useTasksWorkspaceStore((s) => s.setAssigneeFilter);

  const { data: members = [] } = useProjectMembers(projectId);
  const { data: role } = useProjectRole(projectId);
  const canEdit =
    role?.role === "owner" || role?.role === "admin" || role?.role === "member";

  const [createOpen, setCreateOpen] = useState(false);

  const generatePlan = useGenerateProjectPlan();
  const { data: specs } = useProjectSpecifications(projectId, { page: 1, limit: 1 });
  const hasSrs = (specs?.data?.length ?? 0) > 0;

  const queueKey = `plan-queued:${projectId}`;
  const [isQueued, setIsQueued] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(queueKey) === "true";
  });

  // Clear queued flag when the planner completes or fails
  useRagnarockSocket({
    projectId,
    onPlannerCompleted: () => {
      localStorage.removeItem(queueKey);
      setIsQueued(false);
    },
    onPlannerFailed: () => {
      localStorage.removeItem(queueKey);
      setIsQueued(false);
    },
  });

  const isGenerating = generatePlan.isPending || isQueued;

  return (
    <>
      <div className="flex shrink-0 flex-col gap-4 border-b border-border/50 px-4 pb-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Tasks</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-muted/50 flex rounded-lg border p-0.5">
              <Button
                type="button"
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="size-4" />
                List
              </Button>
              <Button
                type="button"
                variant={viewMode === "kanban" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5"
                onClick={() => setViewMode("kanban")}
              >
                <Kanban className="size-4" />
                Board
              </Button>
            </div>
            <LinearSyncActions projectId={projectId} variant="inline" />
            {canEdit && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsQueued(true);
                          localStorage.setItem(queueKey, "true");
                          generatePlan.mutate({ projectId }, {
                            onError: () => {
                              setIsQueued(false);
                              localStorage.removeItem(queueKey);
                            },
                          });
                        }}
                        disabled={!hasSrs || isGenerating}
                      >
                        {isGenerating
                          ? <Loader2 className="mr-1 size-4 animate-spin" />
                          : <Sparkles className="mr-1 size-4" />
                        }
                        {isGenerating ? "Generating Tasks…" : "Generate Tasks"}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!hasSrs && (
                    <TooltipContent>
                      Complete the requirements session first to generate tasks.
                    </TooltipContent>
                  )}
                  {isGenerating && (
                    <TooltipContent>
                      Task generation is in progress — please wait.
                    </TooltipContent>
                  )}
                </Tooltip>
                <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-1 size-4" />
                  New task
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search tasks"
          />
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as TaskStatus | "all")}
          >
            <SelectTrigger className={taskSelectTriggerClassName} aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className={taskSelectContentClassName}>
              <SelectItem value="all">All statuses</SelectItem>
              {TASK_STATUS_ORDER.map((s) => (
                <SelectItem key={s} value={s}>
                  {TASK_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={phaseFilter}
            onValueChange={(v) => setPhaseFilter(v as TaskPhase | "all")}
          >
            <SelectTrigger className={taskSelectTriggerClassName} aria-label="Filter by phase">
              <SelectValue placeholder="Phase" />
            </SelectTrigger>
            <SelectContent className={taskSelectContentClassName}>
              <SelectItem value="all">All phases</SelectItem>
              {TASK_PHASE_ORDER.map((p) => (
                <SelectItem key={p} value={p}>
                  {TASK_PHASE_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className={taskSelectTriggerClassName} aria-label="Filter by assignee">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent className={taskSelectContentClassName}>
              <SelectItem value="all">All assignees</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.userId} value={m.userId}>
                  {m.user?.name?.trim() || m.user?.email || m.userId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TaskCreateDialog
        projectId={projectId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        canSubmit={canEdit}
      />
    </>
  );
}
