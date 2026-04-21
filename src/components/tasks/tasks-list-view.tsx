"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import {
  useDeleteProjectTask,
  useProjectMembers,
  useProjectRole,
  useProjectTasks,
  useReorderProjectTasks,
} from "@/hooks/use-projects";
import { useTasksWorkspaceStore } from "@/stores/tasks-workspace.store";
import { SortableTaskCard } from "@/components/tasks/sortable-task-card";
import { TaskCreateDialog } from "@/components/tasks/task-create-dialog";
import { TaskDeleteDialog } from "@/components/tasks/task-delete-dialog";
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog";
import { applyKanbanDrag, tasksToColumnItems, updatesFromKanbanColumns } from "@/lib/tasks-reorder";
import type { ProjectTask, TaskPhase, TaskStatus } from "@/api/projects.api";
import { TASK_STATUS_LABELS, TASK_STATUS_ORDER } from "@/lib/task-labels";
import { TaskStatusIcon } from "@/lib/task-status-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type TasksListViewProps = {
  projectId: string;
};

function sortTasksForList(tasks: ProjectTask[]): ProjectTask[] {
  const orderIndex = (s: TaskStatus) => TASK_STATUS_ORDER.indexOf(s);
  return [...tasks].sort((a, b) => {
    const c = orderIndex(a.status) - orderIndex(b.status);
    if (c !== 0) return c;
    const so = a.sortOrder - b.sortOrder;
    if (so !== 0) return so;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

function StatusGroupHeader({
  status,
  count,
  canEdit,
  onAdd,
}: {
  status: TaskStatus;
  count: number;
  canEdit: boolean;
  onAdd: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border-border/60 bg-muted/20 flex min-h-10 items-center justify-between gap-2 border-b px-2 py-2 transition-colors sm:px-3",
        "supports-backdrop-filter:backdrop-blur-[2px]",
        isOver && "border-primary bg-primary/12 ring-primary/35 border ring-2 dark:bg-primary/15",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <TaskStatusIcon status={status} />
        <span className="text-foreground truncate text-sm font-semibold tracking-tight">{TASK_STATUS_LABELS[status]}</span>
        <span className="text-muted-foreground tabular-nums text-xs font-medium">{count}</span>
      </div>
      {canEdit && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground size-7 shrink-0"
          onClick={onAdd}
          aria-label={`Add task to ${TASK_STATUS_LABELS[status]}`}
        >
          <Plus className="size-4" />
        </Button>
      )}
    </div>
  );
}

export function TasksListView({ projectId }: TasksListViewProps) {
  const search = useTasksWorkspaceStore((s) => s.search);
  const statusFilter = useTasksWorkspaceStore((s) => s.statusFilter);
  const phaseFilter = useTasksWorkspaceStore((s) => s.phaseFilter);
  const assigneeFilter = useTasksWorkspaceStore((s) => s.assigneeFilter);

  const listParams = useMemo(
    () => ({
      page: 1,
      limit: 500,
      search: search.trim() || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      phase: phaseFilter === "all" ? undefined : (phaseFilter as TaskPhase),
      assigneeId: assigneeFilter === "all" ? undefined : assigneeFilter,
    }),
    [search, statusFilter, phaseFilter, assigneeFilter],
  );

  const { data, isLoading } = useProjectTasks(projectId, listParams);
  const { data: members = [] } = useProjectMembers(projectId);
  const { data: role } = useProjectRole(projectId);
  const canEdit =
    role?.role === "owner" || role?.role === "admin" || role?.role === "member";
  const canDelete = role?.role === "owner" || role?.role === "admin";

  const reorder = useReorderProjectTasks();
  const deleteTask = useDeleteProjectTask();

  const tasks = useMemo(() => sortTasksForList(data?.data ?? []), [data?.data]);

  const tasksByStatus = useMemo(() => {
    const m = new Map<TaskStatus, ProjectTask[]>();
    for (const s of TASK_STATUS_ORDER) {
      m.set(s, []);
    }
    for (const t of tasks) {
      m.get(t.status)?.push(t);
    }
    return m;
  }, [tasks]);

  const columnItems = useMemo(() => tasksToColumnItems(tasks), [tasks]);

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const [viewing, setViewing] = useState<ProjectTask | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProjectTask | null>(null);
  const [createForStatus, setCreateForStatus] = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !canEdit) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const overIsColumn = TASK_STATUS_ORDER.includes(overId as TaskStatus);
    const next = applyKanbanDrag(columnItems, activeId, overId, overIsColumn);
    const updates = updatesFromKanbanColumns(next);
    reorder.mutate({ projectId, data: { updates } });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    deleteTask.mutate(
      { projectId, taskId: pendingDelete.id },
      {
        onSuccess: () => {
          setPendingDelete(null);
          toast.success("Task deleted");
        },
        onError: (e) => {
          toast.error(e.message || "Could not delete task");
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-1">
        {TASK_STATUS_ORDER.slice(0, 4).map((s) => (
          <div key={s} className="space-y-0">
            <Skeleton className="h-10 w-full rounded-sm" />
            <Skeleton className="h-11 w-full rounded-none" />
            <Skeleton className="h-11 w-full rounded-none" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <p className="text-muted-foreground px-1 py-8 text-center text-sm">
        No tasks match your filters. Create a task or adjust filters.
      </p>
    );
  }

  const visibleStatuses = TASK_STATUS_ORDER.filter((s) => (tasksByStatus.get(s)?.length ?? 0) > 0);

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-0 overflow-y-auto rounded-sm border border-border/50 bg-card/30 pb-8 ring-1 ring-foreground/4">
            {visibleStatuses.map((status) => {
              const group = tasksByStatus.get(status) ?? [];
              return (
                <section
                  key={status}
                  className="border-border/40 border-b last:border-b-0"
                  aria-labelledby={`task-group-${status}`}
                >
                  <div id={`task-group-${status}`} className="sr-only">
                    {TASK_STATUS_LABELS[status]} · {group.length} tasks
                  </div>
                  <StatusGroupHeader
                    status={status}
                    count={group.length}
                    canEdit={canEdit}
                    onAdd={() => setCreateForStatus(status)}
                  />
                  <div className="divide-border/35 bg-background/20 divide-y">
                    {group.map((task) => (
                      <SortableTaskCard
                        key={task.id}
                        projectId={projectId}
                        members={members}
                        task={task}
                        variant="list"
                        canEdit={canEdit}
                        onOpen={() => setViewing(task)}
                        onEdit={() => setViewing(task)}
                        onDelete={canDelete ? () => setPendingDelete(task) : undefined}
                      />
                    ))}
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      className="text-muted-foreground hover:bg-muted/45 hover:text-foreground w-full px-2 py-2.5 text-left text-xs font-medium transition-colors sm:px-3"
                      onClick={() => setCreateForStatus(status)}
                    >
                      + New task
                    </button>
                  )}
                </section>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <TaskCreateDialog
        projectId={projectId}
        open={createForStatus !== null}
        onOpenChange={(o) => !o && setCreateForStatus(null)}
        canSubmit={canEdit}
        initialStatus={createForStatus ?? undefined}
      />

      <TaskDeleteDialog
        task={pendingDelete}
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        isPending={deleteTask.isPending}
        onConfirm={confirmDelete}
      />
      <TaskDetailDialog
        projectId={projectId}
        task={viewing}
        members={members}
        open={!!viewing}
        onOpenChange={(o) => !o && setViewing(null)}
      />
    </>
  );
}
