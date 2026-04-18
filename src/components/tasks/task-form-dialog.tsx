"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskDateField } from "@/components/tasks/task-date-field";
import { taskSelectContentClassName, taskSelectTriggerClassName } from "@/components/tasks/task-ui";
import type { ProjectMember, ProjectTask, TaskStatus } from "@/api/projects.api";
import {
  TASK_PHASE_LABELS,
  TASK_PHASE_ORDER,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TASK_STATUS_ORDER,
} from "@/lib/task-labels";

const taskFormSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string(),
  status: z.enum([
    "backlog",
    "todo",
    "in_progress",
    "reviewing",
    "reviewed",
    "done",
    "cancelled",
  ] as [TaskStatus, ...TaskStatus[]]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  phase: z.string(),
  assigneeId: z.string(),
  startDate: z.string(),
  dueDate: z.string(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const PHASE_NONE = "__none__";
const ASSIGNEE_NONE = "__none__";

type TaskFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  members: ProjectMember[];
  mode: "create" | "edit";
  task?: ProjectTask | null;
  /** When mode is create, pre-select this status (e.g. “+” on a status group). */
  initialCreateStatus?: TaskStatus;
  canSubmit: boolean;
  isPending: boolean;
  onSubmit: (values: TaskFormValues) => void | Promise<void>;
};

export function TaskFormDialog({
  open,
  onOpenChange,
  members,
  mode,
  task,
  initialCreateStatus,
  canSubmit,
  isPending,
  onSubmit,
}: TaskFormDialogProps) {
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
      await onSubmit(value);
    },
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && task) {
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
    } else if (mode === "create") {
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
    }
  }, [open, mode, task, initialCreateStatus, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,880px)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New task" : "Edit task"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a task to this project." : "Update task details."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field name="title">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>Short, action-oriented title.</FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="description">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    rows={3}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>Optional details.</FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="status">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v as TaskStatus)}
                      onOpenChange={(open) => !open && field.handleBlur()}
                    >
                      <SelectTrigger id={field.name} className={taskSelectTriggerClassName} aria-invalid={isInvalid}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className={taskSelectContentClassName}>
                        {TASK_STATUS_ORDER.map((s) => (
                          <SelectItem key={s} value={s}>
                            {TASK_STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="priority">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Priority</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v as TaskFormValues["priority"])}
                      onOpenChange={(open) => !open && field.handleBlur()}
                    >
                      <SelectTrigger id={field.name} className={taskSelectTriggerClassName} aria-invalid={isInvalid}>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent className={taskSelectContentClassName}>
                        {(["low", "medium", "high", "urgent"] as const).map((p) => (
                          <SelectItem key={p} value={p}>
                            {TASK_PRIORITY_LABELS[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <form.Field name="phase">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Phase</FieldLabel>
                  <Select
                    value={field.state.value ? field.state.value : PHASE_NONE}
                    onValueChange={(v) => field.handleChange(v === PHASE_NONE ? "" : v)}
                    onOpenChange={(open) => !open && field.handleBlur()}
                  >
                    <SelectTrigger id={field.name} className={taskSelectTriggerClassName} aria-invalid={isInvalid}>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent className={taskSelectContentClassName}>
                      <SelectItem value={PHASE_NONE}>None</SelectItem>
                      {TASK_PHASE_ORDER.map((p) => (
                        <SelectItem key={p} value={p}>
                          {TASK_PHASE_LABELS[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>Where this work sits in the lifecycle.</FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="assigneeId">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Assignee</FieldLabel>
                  <Select
                    value={field.state.value ? field.state.value : ASSIGNEE_NONE}
                    onValueChange={(v) => field.handleChange(v === ASSIGNEE_NONE ? "" : v)}
                    onOpenChange={(open) => !open && field.handleBlur()}
                  >
                    <SelectTrigger id={field.name} className={taskSelectTriggerClassName} aria-invalid={isInvalid}>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent className={taskSelectContentClassName}>
                      <SelectItem value={ASSIGNEE_NONE}>Unassigned</SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.userId} value={m.userId}>
                          {m.user?.name?.trim() || m.user?.email || m.userId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="startDate">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Start date</FieldLabel>
                    <TaskDateField
                      id={field.name}
                      value={field.state.value}
                      onChange={(v) => field.handleChange(v)}
                      onBlur={field.handleBlur}
                      placeholder="Pick a date"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="dueDate">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Due date</FieldLabel>
                    <TaskDateField
                      id={field.name}
                      value={field.state.value}
                      onChange={(v) => field.handleChange(v)}
                      onBlur={field.handleBlur}
                      placeholder="Pick a date"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit || isPending}>
              {isPending ? "Saving…" : mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
