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

type TaskCardProps = {
  task: ProjectTask;
  /** Project members for assignee picker (inline menus when `canEdit`). */
  members?: ProjectMember[];
  isDragging?: boolean;
  className?: string;
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

export function TaskCard({
  task,
  members = [],
  isDragging,
  className,
  onOpen,
  onEdit,
  onDelete,
  canEdit,
}: TaskCardProps) {
  const assignee = task.assignee;
  const label = assignee?.name?.trim() || assignee?.email || "Unassigned";
  const due = formatDateShort(task.dueDate);

  const updateTask = useUpdateProjectTask();

  function patch(data: UpdateProjectTaskDto) {
    updateTask.mutate(
      { projectId: task.projectId, taskId: task.id, data },
      {
        onError: (e) => {
          toast.error(e.message || "Could not update task");
        },
      },
    );
  }

  const busy = !!canEdit && updateTask.isPending;

  const readOnlyBadges = (
    <div className="mb-2 flex flex-wrap gap-1">
      <span className={cn(taskStatusBadgeClass(task.status), "max-w-full")}>
        <TaskStatusIcon status={task.status} />
        <span className="truncate">{TASK_STATUS_LABELS[task.status]}</span>
      </span>
      <span className={taskPriorityBadgeClass(task.priority)}>{TASK_PRIORITY_LABELS[task.priority]}</span>
    </div>
  );

  const readOnlyFooter = (
    <div className="text-muted-foreground mt-2.5 flex items-center justify-between gap-2 border-t border-border/50 pt-2 text-[11px]">
      {due ? (
        <span className="inline-flex min-w-0 items-center gap-1 tabular-nums opacity-90">
          <Calendar className="size-3 shrink-0 opacity-70" aria-hidden />
          {due}
        </span>
      ) : (
        <span className="min-w-0" />
      )}
      <Avatar className="border-border size-5 shrink-0 border">
        {assignee?.image ? <AvatarImage src={assignee.image} alt="" /> : null}
        <AvatarFallback className="text-[9px]">{label.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
    </div>
  );

  const editableMeta = (
    <div
      className="mb-2 flex max-w-full flex-wrap items-center gap-1"
      onPointerDown={stopRowDrag}
    >
      <TaskListStatusMenu value={task.status} disabled={busy} onCommit={(status) => patch({ status })} />
      <TaskListPriorityMenu
        value={task.priority}
        disabled={busy}
        onCommit={(priority) => patch({ priority })}
      />
      {due ? (
        <span className="text-muted-foreground inline-flex shrink-0 items-center gap-1 px-0.5 text-[11px] tabular-nums">
          <Calendar className="size-3 opacity-70" aria-hidden />
          {due}
        </span>
      ) : null}
      <TaskListAssigneeMenu
        assigneeId={task.assigneeId}
        assignee={assignee}
        members={members}
        disabled={busy}
        onCommit={(userId) => patch({ assigneeId: userId })}
      />
    </div>
  );

  const titleBlock = (
    <>
      <p className="text-foreground text-sm leading-snug font-medium tracking-tight">{task.title}</p>
      {task.description ? (
        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">{task.description}</p>
      ) : null}
    </>
  );

  return (
    <div
      className={cn(
        "group bg-card text-card-foreground border-border/80 relative rounded-sm border shadow-xs transition-[box-shadow,border-color,opacity]",
        "hover:border-border hover:shadow-sm",
        isDragging &&
          "border-primary z-[1] border-2 border-dashed bg-primary/5 shadow-md ring-2 ring-primary/35 dark:bg-primary/10",
        onOpen && canEdit && "cursor-grab active:cursor-grabbing",
        onOpen && !canEdit && "cursor-pointer",
        className,
      )}
    >
      {canEdit && (onEdit || onDelete) && (
        <div className="absolute top-1 right-1 z-10 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="bg-background/90 text-muted-foreground hover:text-foreground size-7 cursor-pointer backdrop-blur-sm"
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
              className="bg-background/90 text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-7 cursor-pointer backdrop-blur-sm"
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

      <div className="flex gap-1.5 p-2.5 pr-9">
        <div className="min-w-0 flex-1">
          <div className="text-muted-foreground mb-1.5 font-mono text-[10px] leading-none tracking-wide uppercase">
            {shortId(task.id)}
          </div>
          {canEdit ? editableMeta : readOnlyBadges}
          {onOpen ? (
            <button
              type="button"
              className="w-full cursor-[inherit] rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={() => onOpen()}
            >
              {titleBlock}
            </button>
          ) : (
            <div>{titleBlock}</div>
          )}
          {!canEdit ? readOnlyFooter : null}
        </div>
      </div>
    </div>
  );
}
