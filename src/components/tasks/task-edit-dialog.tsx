"use client";

import { useProjectMembers, useProjectRole, useUpdateProjectTask } from "@/hooks/use-projects";
import type { ProjectTask, TaskPhase } from "@/api/projects.api";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { toast } from "@/lib/toast";

export function TaskEditDialogTrigger({
  projectId,
  task,
  open,
  onOpenChange,
}: {
  projectId: string;
  task: ProjectTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: members = [] } = useProjectMembers(projectId);
  const { data: role } = useProjectRole(projectId);
  const canEdit =
    role?.role === "owner" || role?.role === "admin" || role?.role === "member";

  const updateTask = useUpdateProjectTask({
    onSuccess: () => {
      toast.success("Task updated");
      onOpenChange(false);
    },
  });

  if (!task) return null;

  return (
    <TaskFormDialog
      open={open}
      onOpenChange={onOpenChange}
      projectId={projectId}
      members={members}
      mode="edit"
      task={task}
      canSubmit={canEdit}
      isPending={updateTask.isPending}
      onSubmit={async (value) => {
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
      }}
    />
  );
}
