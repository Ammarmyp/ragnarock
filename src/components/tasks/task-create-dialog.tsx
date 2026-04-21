"use client";

import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog";
import { useProjectMembers } from "@/hooks/use-projects";
import type { TaskStatus } from "@/api/projects.api";

type TaskCreateDialogProps = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canSubmit: boolean;
  initialStatus?: TaskStatus;
};

export function TaskCreateDialog({ projectId, open, onOpenChange, canSubmit, initialStatus }: TaskCreateDialogProps) {
  void canSubmit;
  const { data: members = [] } = useProjectMembers(projectId);

  return (
    <TaskDetailDialog
      open={open}
      onOpenChange={onOpenChange}
      projectId={projectId}
      members={members}
      task={null}
      mode="create"
      initialCreateStatus={initialStatus}
    />
  );
}
