"use client";

import { Calendar, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  TaskListAssigneeMenu,
  TaskListPriorityMenu,
  TaskListStatusMenu,
} from "@/components/tasks/task-list-inline-menus";
import type { ProjectMember, ProjectTask, UpdateProjectTaskDto } from "@/api/projects.api";
import { taskPriorityBadgeClass, taskStatusBadgeClass } from "@/lib/task-badge-styles";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/task-labels";
import { TaskStatusIcon } from "@/lib/task-status-icons";
import { toast } from "@/lib/toast";
import { useUpdateProjectTask } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

type TaskListRowProps = {
  projectId: string;
  members: ProjectMember[];
  task: ProjectTask;
  isDragging?: boolean;
  onOpen?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
};

function shortId(id: string) {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

function formatDateShort(iso: string | null | undefined) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: "short" });
  } catch {
    return null;
  }
}

function stopRowDrag(e: React.PointerEvent) {
  e.stopPropagation();
}

export function TaskListRow({
  projectId,
  members,
  task,
  isDragging,
  onOpen,
  onEdit,
  onDelete,
  canEdit,
}: TaskListRowProps) {
  const assignee = task.assignee;
  const label = assignee?.name?.trim() || assignee?.email || "—";
  const due = formatDateShort(task.dueDate);

  const updateTask = useUpdateProjectTask();

  function patch(data: UpdateProjectTaskDto) {
    updateTask.mutate(
      { projectId, taskId: task.id, data },
      {
        onError: (e) => {
          toast.error(e.message || "Could not update task");
        },
      },
    );
  }

  const busy = !!canEdit && updateTask.isPending;

  return (
    <div
      className={cn(
        "group border-border/50 bg-background/30 hover:bg-muted/35 relative flex min-h-10 items-center gap-2 border-b px-2 py-1.5 transition-colors sm:gap-3 sm:px-3",
        isDragging &&
          "border-primary bg-primary/8 z-1 border border-dashed shadow-sm ring-2 ring-primary/30 dark:bg-primary/12",
        onOpen && canEdit && "cursor-grab active:cursor-grabbing",
        onOpen && !canEdit && "cursor-pointer",
      )}
    >
      {canEdit && (onEdit || onDelete) && (
        <div className="absolute top-1/2 right-1.5 z-10 flex -translate-y-1/2 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground size-7"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              aria-label="Edit task"
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-7"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label="Delete task"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      )}

      {onOpen ? (
        <div className="flex min-w-0 flex-1 items-center gap-2 pr-14 sm:gap-3">
          <button
            type="button"
            className="flex min-w-0 flex-1 cursor-[inherit] items-center gap-2 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:gap-3"
            onClick={() => onOpen()}
          >
            <span className="text-muted-foreground w-[4.5rem] shrink-0 font-mono text-[10px] tracking-wide uppercase sm:w-[5.25rem]">
              {shortId(task.id)}
            </span>
            <span className="text-foreground min-w-0 flex-1 truncate text-sm leading-tight font-medium tracking-tight">
              {task.title}
            </span>
          </button>

          {canEdit ? (
            <div
              className="flex max-w-[min(100%,52vw)] shrink-0 items-center gap-1 overflow-x-auto [scrollbar-width:thin] sm:max-w-none sm:gap-1.5 sm:overflow-visible"
              onPointerDown={stopRowDrag}
            >
              <TaskListStatusMenu
                value={task.status}
                disabled={busy}
                onCommit={(status) => patch({ status })}
              />
              <TaskListPriorityMenu
                value={task.priority}
                disabled={busy}
                onCommit={(priority) => patch({ priority })}
              />
              {due ? (
                <span className="text-muted-foreground hidden shrink-0 items-center gap-1 text-[11px] tabular-nums lg:inline-flex">
                  <Calendar className="size-3 opacity-70" aria-hidden />
                  {due}
                </span>
              ) : (
                <span className="hidden w-14 shrink-0 lg:block" aria-hidden />
              )}
              <TaskListAssigneeMenu
                assigneeId={task.assigneeId}
                assignee={assignee}
                members={members}
                disabled={busy}
                onCommit={(userId) => patch({ assigneeId: userId })}
              />
            </div>
          ) : (
            <>
              <span className={cn(taskStatusBadgeClass(task.status), "hidden shrink-0 sm:inline-flex")}>
                <TaskStatusIcon status={task.status} />
                <span className="max-w-[7rem] truncate">{TASK_STATUS_LABELS[task.status]}</span>
              </span>
              <span className={cn(taskPriorityBadgeClass(task.priority), "hidden md:inline-flex")}>
                {TASK_PRIORITY_LABELS[task.priority]}
              </span>
              {due ? (
                <span className="text-muted-foreground hidden shrink-0 items-center gap-1 text-[11px] tabular-nums lg:inline-flex">
                  <Calendar className="size-3 opacity-70" aria-hidden />
                  {due}
                </span>
              ) : (
                <span className="hidden w-16 shrink-0 lg:block" />
              )}
              <Avatar className="border-border size-6 shrink-0 border">
                {assignee?.image ? <AvatarImage src={assignee.image} alt="" /> : null}
                <AvatarFallback className="text-[9px]">{label.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </>
          )}
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <span className="text-muted-foreground w-[4.5rem] shrink-0 font-mono text-[10px] tracking-wide uppercase sm:w-[5.25rem]">
            {shortId(task.id)}
          </span>
          <span className="text-foreground min-w-0 flex-1 truncate text-sm font-medium">{task.title}</span>
        </div>
      )}
    </div>
  );
}
