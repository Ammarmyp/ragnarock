"use client";

import { TasksKanbanView } from "@/components/tasks/tasks-kanban-view";
import { TasksListView } from "@/components/tasks/tasks-list-view";
import { TasksToolbar } from "@/components/tasks/tasks-toolbar";
import { useTasksWorkspaceStore } from "@/stores/tasks-workspace.store";

export function ProjectTasksLayout({ projectId }: { projectId: string }) {
  const viewMode = useTasksWorkspaceStore((s) => s.viewMode);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <TasksToolbar projectId={projectId} />
      <div className="min-h-0 flex-1 overflow-hidden px-4 sm:px-6">
        {viewMode === "list" ? (
          <TasksListView projectId={projectId} />
        ) : (
          <TasksKanbanView projectId={projectId} />
        )}
      </div>
    </div>
  );
}
