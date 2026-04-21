"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  Calendar,
  ChevronRight,
  Clock,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { TaskDateField } from "@/components/tasks/task-date-field";
import { useCreateProjectTask, useProjectRole, useUpdateProjectTask } from "@/hooks/use-projects";
import type { ProjectMember, ProjectTask, TaskPhase, TaskStatus } from "@/api/projects.api";
import {
  TaskListAssigneeMenu,
  TaskListPhaseMenu,
  TaskListPriorityMenu,
  TaskListStatusMenu,
} from "@/components/tasks/task-list-inline-menus";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from "@/lib/task-labels";
import { taskPriorityBadgeClass, taskStatusBadgeClass } from "@/lib/task-badge-styles";
import { TaskStatusIcon } from "@/lib/task-status-icons";
import { toast } from "@/lib/toast";
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
  projectId: string;
  task: ProjectTask | null | undefined;
  members: ProjectMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "detail" | "create";
  initialCreateStatus?: TaskStatus;
};

const taskFormSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string(),
  status: z.enum(
    ["backlog", "todo", "in_progress", "reviewing", "reviewed", "done", "cancelled"] as [
      TaskStatus,
      ...TaskStatus[],
    ],
  ),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  phase: z.string(),
  assigneeId: z.string(),
  startDate: z.string(),
  dueDate: z.string(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export function TaskDetailDialog({
  projectId,
  task,
  members,
  open,
  onOpenChange,
  mode = "detail",
  initialCreateStatus,
}: TaskDetailDialogProps) {
  const isCreateMode = mode === "create";
  const { data: role } = useProjectRole(projectId);
  const canEdit =
    role?.role === "owner" || role?.role === "admin" || role?.role === "member";
  const canSubmit = canEdit;
  const createTask = useCreateProjectTask({
    onSuccess: () => {
      toast.success("Task created");
      onOpenChange(false);
    },
    onError: (e) => {
      toast.error(e.message || "Could not create task");
    },
  });
  const updateTask = useUpdateProjectTask({
    onSuccess: () => {
      toast.success("Task updated");
    },
  });
  const assignee = task?.assignee;
  const assigneeLabel = assignee?.name?.trim() || assignee?.email || "Unassigned";
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      status: "todo" as TaskStatus,
      priority: "medium" as TaskFormValues["priority"],
      phase: "",
      assigneeId: "",
      startDate: "",
      dueDate: "",
    },
    validators: { onSubmit: taskFormSchema },
    onSubmit: async ({ value }) => {
      if (isCreateMode) {
        await createTask.mutateAsync({
          projectId,
          data: {
            title: value.title,
            description: value.description.trim() || undefined,
            status: value.status,
            priority: value.priority,
            phase: value.phase ? (value.phase as TaskPhase) : undefined,
            assigneeId: value.assigneeId || undefined,
            startDate: value.startDate || undefined,
            dueDate: value.dueDate || undefined,
          },
        });
        return;
      }
      if (!task) return;
      await updateTask.mutateAsync({
        projectId,
        taskId: task.id,
        data: {
          title: value.title,
          description: value.description.trim() || undefined,
          status: value.status,
          priority: value.priority,
          phase: value.phase === "" ? null : (value.phase as TaskPhase),
          assigneeId: value.assigneeId || null,
          startDate: value.startDate || null,
          dueDate: value.dueDate || null,
        },
      });
    },
  });

  useEffect(() => {
    if (!open) return;
    if (isCreateMode) {
      form.reset({
        title: "",
        description: "",
        status: initialCreateStatus ?? "todo",
        priority: "medium",
        phase: "",
        assigneeId: "",
        startDate: "",
        dueDate: "",
      });
      return;
    }
    if (!task) return;
    form.reset({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      phase: task.phase ?? "",
      assigneeId: task.assigneeId ?? "",
      startDate: task.startDate ? task.startDate.slice(0, 10) : "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
  }, [open, task, form, isCreateMode, initialCreateStatus]);

  function patchTask(
    data: Partial<{
      status: TaskStatus;
      priority: ProjectTask["priority"];
      assigneeId: string | null;
    }>,
  ) {
    if (!task || !canEdit) return;
    updateTask.mutate({
      projectId,
      taskId: task.id,
      data,
    });
  }

  return (
    <Dialog
      open={open && (isCreateMode || !!task)}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[min(92vh,940px)] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        {isCreateMode || task ? (
          <>
            <DialogHeader className="space-y-3 px-6 pt-6 pb-4 text-left">
              {isCreateMode ? (
                <DialogTitle className="text-2xl leading-tight font-semibold tracking-tight pr-10">
                  New task
                </DialogTitle>
              ) : (
                <>
                  <p className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                    <span>Task</span>
                    <ChevronRight className="size-3.5 opacity-60" aria-hidden />
                    <span className="font-mono tracking-wide uppercase">{shortId(task!.id)}</span>
                  </p>
                  <DialogTitle className="text-2xl leading-tight font-semibold tracking-tight pr-10">
                    {task!.title}
                  </DialogTitle>
                </>
              )}

              {!isCreateMode && (
                <div className="flex flex-wrap gap-2 pt-1">
                {canEdit ? (
                  <>
                    <TaskListStatusMenu
                      value={task!.status}
                      disabled={updateTask.isPending || createTask.isPending}
                      onCommit={(status) => patchTask({ status })}
                    />
                    <TaskListPriorityMenu
                      value={task!.priority}
                      disabled={updateTask.isPending || createTask.isPending}
                      onCommit={(priority) => patchTask({ priority })}
                    />
                  </>
                ) : (
                  <>
                    <span className={cn(taskStatusBadgeClass(task!.status), "h-8 px-2.5 py-0")}>
                      <TaskStatusIcon status={task!.status} />
                      {TASK_STATUS_LABELS[task!.status]}
                    </span>
                    <span className={cn(taskPriorityBadgeClass(task!.priority), "h-8 px-2.5 py-0")}>
                      {TASK_PRIORITY_LABELS[task!.priority]}
                    </span>
                  </>
                )}
                <span className={cn(metaPillClass, "min-w-0", canEdit && "pr-1")}>
                  <User className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
                  {canEdit ? (
                    <TaskListAssigneeMenu
                      assigneeId={task!.assigneeId}
                      assignee={assignee}
                      members={members}
                      disabled={updateTask.isPending || createTask.isPending}
                      onCommit={(assigneeId) => patchTask({ assigneeId })}
                    />
                  ) : (
                    <>
                      <Avatar className="size-5 border border-border">
                        {assignee?.image ? <AvatarImage src={assignee.image} alt="" /> : null}
                        <AvatarFallback className="text-[9px]">
                          {assigneeLabel.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{assigneeLabel}</span>
                    </>
                  )}
                </span>
                <span className={cn(metaPillClass, "text-muted-foreground")}>
                  <Calendar className="size-3.5 shrink-0 opacity-80" aria-hidden />
                  <span className="truncate">Start {formatDateOnly(task!.startDate)}</span>
                </span>
                <span className={cn(metaPillClass, "text-muted-foreground")}>
                  <Calendar className="size-3.5 shrink-0 opacity-80" aria-hidden />
                  <span className="truncate">Due {formatDateOnly(task!.dueDate)}</span>
                </span>
              </div>
              )}
            </DialogHeader>

            <Separator />

            <div className="max-h-[min(52vh,520px)] min-h-0 space-y-4 overflow-y-auto px-6 py-4">
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                  }}
                >
                  <form.Field name="title">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {!field.state.meta.isValid && field.state.meta.isTouched && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )}
                  </form.Field>
                  <form.Field name="description">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          rows={4}
                        />
                      </Field>
                    )}
                  </form.Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <form.Field name="phase">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>Phase</FieldLabel>
                          <TaskListPhaseMenu
                            value={field.state.value ? (field.state.value as ProjectTask["phase"]) : null}
                            disabled={updateTask.isPending || createTask.isPending}
                            onCommit={(phase) => field.handleChange(phase ?? "")}
                            fullWidth
                          />
                        </Field>
                      )}
                    </form.Field>
                    <form.Field name="assigneeId">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>Assignee</FieldLabel>
                          <TaskListAssigneeMenu
                            assigneeId={field.state.value || null}
                            assignee={members.find((m) => m.userId === field.state.value)?.user}
                            members={members}
                            disabled={updateTask.isPending || createTask.isPending}
                            onCommit={(assigneeId) => field.handleChange(assigneeId ?? "")}
                            fullWidth
                          />
                        </Field>
                      )}
                    </form.Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <form.Field name="startDate">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>Start date</FieldLabel>
                          <TaskDateField
                            id={field.name}
                            value={field.state.value}
                            onChange={(v) => field.handleChange(v)}
                            onBlur={field.handleBlur}
                            placeholder="Pick a date"
                          />
                        </Field>
                      )}
                    </form.Field>
                    <form.Field name="dueDate">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>Due date</FieldLabel>
                          <TaskDateField
                            id={field.name}
                            value={field.state.value}
                            onChange={(v) => field.handleChange(v)}
                            onBlur={field.handleBlur}
                            placeholder="Pick a date"
                          />
                        </Field>
                      )}
                    </form.Field>
                  </div>
                </form>
              {!isCreateMode && task ? (
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
              ) : null}
            </div>

            <DialogFooter className="border-border bg-muted/25 mt-0 flex flex-row items-center justify-between gap-3 border-t px-6 py-4 sm:justify-between">
              <span className="text-muted-foreground hidden text-xs sm:inline">
                {isCreateMode ? "Create task" : `View task · ${shortId(task!.id)}`}
              </span>
              {canSubmit && (
                <Button
                  type="button"
                  onClick={() => form.handleSubmit()}
                  disabled={updateTask.isPending || createTask.isPending}
                  className="gap-2"
                >
                  {createTask.isPending || updateTask.isPending
                    ? "Saving..."
                    : isCreateMode
                      ? "Create task"
                      : "Save changes"}
                </Button>
              )}
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
