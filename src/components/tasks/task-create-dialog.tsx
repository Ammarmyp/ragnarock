"use client";

import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { useCreateProjectTask, useProjectMembers } from "@/hooks/use-projects";
import type { TaskPhase, TaskStatus } from "@/api/projects.api";
import { toast } from "@/lib/toast";

type TaskCreateDialogProps = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canSubmit: boolean;
  initialStatus?: TaskStatus;
};

export function TaskCreateDialog({ projectId, open, onOpenChange, canSubmit, initialStatus }: TaskCreateDialogProps) {
  const { data: members = [] } = useProjectMembers(projectId);

  const createTask = useCreateProjectTask({
    onSuccess: () => {
      toast.success("Task created");
      onOpenChange(false);
    },
    onError: (e) => {
      toast.error(e.message || "Could not create task");
    },
  });

  return (
    <TaskFormDialog
      open={open}
      onOpenChange={onOpenChange}
      projectId={projectId}
      members={members}
      mode="create"
      initialCreateStatus={initialStatus}
      canSubmit={canSubmit}
      isPending={createTask.isPending}
      onSubmit={async (value) => {
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
      }}
    />
  );
}
