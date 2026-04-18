"use client";

import {
  Calendar,
  ChevronRight,
  Clock,
  Flag,
  Pencil,
  Tag,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { ProjectTask } from "@/api/projects.api";
import {
  TASK_PHASE_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from "@/lib/task-labels";
import { taskPriorityBadgeClass, taskStatusBadgeClass } from "@/lib/task-badge-styles";
import { TaskStatusIcon } from "@/lib/task-status-icons";
import { cn } from "@/lib/utils";

function shortId(id: string) {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

function formatWhen(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function formatDateOnly(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return "—";
  }
}

const metaPillClass =
  "border-border bg-background text-foreground hover:bg-muted/40 inline-flex h-8 max-w-full shrink-0 items-center gap-1.5 rounded-sm border px-2.5 text-xs font-medium shadow-xs";

type TaskDetailDialogProps = {
  task: ProjectTask | null | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit: boolean;
  onEdit: (task: ProjectTask) => void;
};

export function TaskDetailDialog({ task, open, onOpenChange, canEdit, onEdit }: TaskDetailDialogProps) {
  const assignee = task?.assignee;
  const assigneeLabel = assignee?.name?.trim() || assignee?.email || "Unassigned";
  const desc = task?.description?.trim();

  return (
    <Dialog open={open && !!task} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(92vh,940px)] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        {task ? (
          <>
            <DialogHeader className="space-y-3 px-6 pt-6 pb-4 text-left">
              <p className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                <span>Task</span>
                <ChevronRight className="size-3.5 opacity-60" aria-hidden />
                <span className="font-mono tracking-wide uppercase">{shortId(task.id)}</span>
              </p>
              <DialogTitle className="text-2xl leading-tight font-semibold tracking-tight pr-10">
                {task.title}
              </DialogTitle>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className={cn(taskStatusBadgeClass(task.status), "h-8 px-2.5 py-0")}>
                  <TaskStatusIcon status={task.status} />
                  {TASK_STATUS_LABELS[task.status]}
                </span>
                <span className={cn(taskPriorityBadgeClass(task.priority), "h-8 px-2.5 py-0")}>
                  <Flag className="size-3 opacity-80" aria-hidden />
                  {TASK_PRIORITY_LABELS[task.priority]}
                </span>
                <span className={cn(metaPillClass, "min-w-0")}>
                  <User className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
                  <Avatar className="size-5 border border-border">
                    {assignee?.image ? <AvatarImage src={assignee.image} alt="" /> : null}
                    <AvatarFallback className="text-[9px]">{assigneeLabel.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{assigneeLabel}</span>
                </span>
                <span className={cn(metaPillClass, "text-muted-foreground")}>
                  <Calendar className="size-3.5 shrink-0 opacity-80" aria-hidden />
                  <span className="truncate">Start {formatDateOnly(task.startDate)}</span>
                </span>
                <span className={cn(metaPillClass, "text-muted-foreground")}>
                  <Calendar className="size-3.5 shrink-0 opacity-80" aria-hidden />
                  <span className="truncate">Due {formatDateOnly(task.dueDate)}</span>
                </span>
              </div>
            </DialogHeader>

            <Separator />

            <div className="max-h-[min(52vh,520px)] min-h-0 space-y-4 overflow-y-auto px-6 py-4">
              <div className="space-y-2">
                <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Description</h3>
                <Card className="rounded-sm border-border/80 bg-muted/20 py-0 shadow-none ring-0">
                  <CardContent className="px-3.5 py-3 text-sm leading-relaxed">
                    {desc ? (
                      <p className="text-foreground whitespace-pre-wrap">{desc}</p>
                    ) : (
                      <p className="text-muted-foreground text-sm italic">No description yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Properties</h3>
                <Collapsible defaultOpen className="space-y-2">
                  <CollapsibleTrigger className="!rounded-sm !border-border !bg-background !py-2.5 !shadow-xs hover:!bg-muted/40">
                    <span className="flex flex-1 items-center justify-between gap-2 pr-1">
                      <span>Details</span>
                      <span className="text-muted-foreground text-xs font-normal">Phase & dates</span>
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="data-[state=closed]:animate-none">
                    <div className="border-border space-y-2 rounded-sm border bg-muted/15 px-3 py-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Phase</span>
                        <span className="text-foreground font-medium">
                          {task.phase ? TASK_PHASE_LABELS[task.phase] : "—"}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Start</span>
                        <span className="text-foreground font-medium tabular-nums">{formatDateOnly(task.startDate)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Due</span>
                        <span className="text-foreground font-medium tabular-nums">{formatDateOnly(task.dueDate)}</span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground h-8 w-full justify-start rounded-sm border border-dashed border-border/70 bg-muted/10 hover:bg-muted/25"
                  disabled
                >
                  <Tag className="size-3.5 opacity-70" aria-hidden />
                  Add labels
                </Button>
              </div>

              <div className="text-muted-foreground flex flex-col gap-1.5 border-t border-border/60 pt-4 text-xs">
                <p className="flex items-center gap-2">
                  <Clock className="size-3.5 shrink-0 opacity-70" aria-hidden />
                  <span>
                    Updated <span className="text-foreground/90 tabular-nums">{formatWhen(task.updatedAt)}</span>
                  </span>
                </p>
                <p className="flex items-center gap-2 pl-5">
                  Created <span className="text-foreground/90 tabular-nums">{formatWhen(task.createdAt)}</span>
                </p>
              </div>
            </div>

            <DialogFooter className="border-border bg-muted/25 mt-0 flex flex-row items-center justify-between gap-3 border-t px-6 py-4 sm:justify-between">
              <span className="text-muted-foreground hidden text-xs sm:inline">View task · {shortId(task.id)}</span>
              {canEdit && (
                <Button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(task);
                  }}
                  className="gap-2"
                >
                  <Pencil className="size-4" />
                  Edit task
                </Button>
              )}
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
