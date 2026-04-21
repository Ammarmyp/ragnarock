"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  useDeleteProjectTask,
  useProjectMembers,
  useProjectRole,
  useProjectTasks,
  useReorderProjectTasks,
} from "@/hooks/use-projects";
import { useTasksWorkspaceStore } from "@/stores/tasks-workspace.store";
import { SortableTaskCard } from "@/components/tasks/sortable-task-card";
import { TaskDeleteDialog } from "@/components/tasks/task-delete-dialog";
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog";
import {
  applyKanbanDrag,
  tasksToColumnItems,
  updatesFromKanbanColumns,
} from "@/lib/tasks-reorder";
import type { ProjectMember, ProjectTask, TaskPhase, TaskStatus } from "@/api/projects.api";
import { TASK_STATUS_LABELS, TASK_STATUS_ORDER } from "@/lib/task-labels";
import { TaskStatusIcon } from "@/lib/task-status-icons";
import { taskStatusBadgeClass } from "@/lib/task-badge-styles";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

type TasksKanbanViewProps = {
  projectId: string;
};

function taskMap(tasks: ProjectTask[]): Map<string, ProjectTask> {
  return new Map(tasks.map((t) => [t.id, t]));
}

function resolveDropColumnId(overId: string | undefined, taskById: Map<string, ProjectTask>): TaskStatus | null {
  if (!overId) return null;
  if (TASK_STATUS_ORDER.includes(overId as TaskStatus)) return overId as TaskStatus;
  return taskById.get(overId)?.status ?? null;
}

function KanbanDragPreview({
  task,
  fromStatus,
  toStatus,
}: {
  task: ProjectTask;
  fromStatus: TaskStatus;
  toStatus: TaskStatus | null;
}) {
  const isMove = toStatus != null && toStatus !== fromStatus;
  return (
    <div className="border-primary bg-card pointer-events-none flex w-[min(92vw,280px)] flex-col gap-1.5 rounded-sm border-2 p-3 shadow-xl ring-2 ring-primary/35">
      <p className="text-primary text-[10px] font-semibold tracking-wide uppercase">Moving task</p>
      <p className="text-foreground line-clamp-3 text-sm leading-snug font-medium">{task.title}</p>
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] leading-snug">
        <span>
          From{" "}
          <span className="text-foreground font-medium">{TASK_STATUS_LABELS[fromStatus]}</span>
        </span>
        {toStatus != null ? (
          <>
            <span className="text-primary/80" aria-hidden>
              →
            </span>
            <span className={cn(isMove && "text-primary font-medium")}>
              {isMove ? "Move to " : "Drop in "}
              <span className={cn("text-foreground", isMove && "text-primary")}>{TASK_STATUS_LABELS[toStatus]}</span>
            </span>
          </>
        ) : (
          <span className="text-muted-foreground/90">Drag over a column to choose where to place it</span>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({
  status,
  taskIds,
  taskById,
  projectId,
  members,
  canEdit,
  canDelete,
  onOpen,
  onEdit,
  onRequestDelete,
  isSourceColumn,
  isDragActive,
}: {
  status: TaskStatus;
  taskIds: string[];
  taskById: Map<string, ProjectTask>;
  projectId: string;
  members: ProjectMember[];
  canEdit: boolean;
  canDelete: boolean;
  onOpen: (t: ProjectTask) => void;
  onEdit: (t: ProjectTask) => void;
  onRequestDelete: (t: ProjectTask) => void;
  isSourceColumn: boolean;
  isDragActive: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border-border/80 bg-background flex h-full min-h-0 w-[min(100%,300px)] shrink-0 flex-col overflow-hidden rounded-sm border shadow-xs",
        "transition-[border-color,box-shadow,background-color]",
        isOver &&
          "border-primary bg-primary/12 ring-primary/40 shadow-md ring-2 dark:bg-primary/15",
        isSourceColumn && !isOver && isDragActive && "border-primary/45 bg-primary/5 ring-primary/25 ring-1 dark:bg-primary/8",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2 transition-colors",
          isOver && "border-primary/30 bg-primary/15 dark:bg-primary/20",
          isSourceColumn && !isOver && isDragActive && "border-primary/25 bg-primary/8",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className={cn(taskStatusBadgeClass(status), "max-w-full")}>
            <TaskStatusIcon status={status} />
            <span className="truncate">{TASK_STATUS_LABELS[status]}</span>
          </span>
          {isDragActive && isOver && (
            <span className="text-primary text-[10px] font-semibold tracking-wide uppercase">Drop here</span>
          )}
          {isDragActive && isSourceColumn && !isOver && (
            <span className="text-primary/90 text-[10px] font-medium tracking-wide uppercase">Dragging from here</span>
          )}
        </div>
        <span className="text-muted-foreground shrink-0 tabular-nums text-[11px]">{taskIds.length}</span>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-2 pb-3 [-webkit-overflow-scrolling:touch]">
          {taskIds.map((id) => {
            const task = taskById.get(id);
            if (!task) return null;
            return (
              <SortableTaskCard
                key={id}
                projectId={projectId}
                members={members}
                task={task}
                canEdit={canEdit}
                showDragGhost
                onOpen={() => onOpen(task)}
                onEdit={() => onEdit(task)}
                onDelete={canDelete ? () => onRequestDelete(task) : undefined}
              />
            );
          })}
        </div>
      </SortableContext>
    </div>
  );
}

export function TasksKanbanView({ projectId }: TasksKanbanViewProps) {
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

  const tasks = useMemo(() => data?.data ?? [], [data?.data]);
  const taskById = useMemo(() => taskMap(tasks), [tasks]);
  const columnItems = useMemo(() => tasksToColumnItems(tasks), [tasks]);

  const reorder = useReorderProjectTasks();
  const deleteTask = useDeleteProjectTask();

  const [viewing, setViewing] = useState<ProjectTask | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProjectTask | null>(null);
  const [activeTask, setActiveTask] = useState<ProjectTask | null>(null);
  const [overColumnId, setOverColumnId] = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function clearDragUi() {
    setActiveTask(null);
    setOverColumnId(null);
  }

  function handleDragStart(event: DragStartEvent) {
    const t = taskById.get(String(event.active.id));
    setActiveTask(t ?? null);
    setOverColumnId(t?.status ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const next = resolveDropColumnId(event.over ? String(event.over.id) : undefined, taskById);
    setOverColumnId(next);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    clearDragUi();
    if (!over || active.id === over.id || !canEdit) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const overIsColumn = TASK_STATUS_ORDER.includes(overId as TaskStatus);
    const next = applyKanbanDrag(columnItems, activeId, overId, overIsColumn);
    const updates = updatesFromKanbanColumns(next);
    reorder.mutate({ projectId, data: { updates } });
  }

  const liveDragMessage = useMemo(() => {
    if (!activeTask) return "";
    const from = TASK_STATUS_LABELS[activeTask.status];
    if (overColumnId == null) return `${activeTask.title}. Dragging from ${from}.`;
    const to = TASK_STATUS_LABELS[overColumnId];
    if (overColumnId === activeTask.status) {
      return `${activeTask.title}. Reordering in ${from}.`;
    }
    return `${activeTask.title}. Moving from ${from} to ${to}.`;
  }, [activeTask, overColumnId]);

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
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-2">
          {TASK_STATUS_ORDER.map((s) => (
            <Skeleton key={s} className="h-full min-h-[240px] w-[min(100%,300px)] shrink-0 rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={clearDragUi}
      >
        <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto overflow-y-hidden pb-4 pt-0.5 [-webkit-overflow-scrolling:touch]">
          {TASK_STATUS_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              taskIds={columnItems[status]}
              taskById={taskById}
              projectId={projectId}
              members={members}
              canEdit={canEdit}
              canDelete={canDelete}
              isDragActive={!!activeTask}
              isSourceColumn={!!activeTask && activeTask.status === status}
              onOpen={setViewing}
              onEdit={setViewing}
              onRequestDelete={setPendingDelete}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <KanbanDragPreview task={activeTask} fromStatus={activeTask.status} toStatus={overColumnId} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="sr-only" aria-live="polite" aria-atomic>
        {liveDragMessage}
      </div>

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
    </div>
  );
}
