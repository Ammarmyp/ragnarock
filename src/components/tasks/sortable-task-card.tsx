"use client";

import { useRef } from "react";
import { useDndMonitor } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ProjectMember, ProjectTask } from "@/api/projects.api";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskListRow } from "@/components/tasks/task-list-row";
import { cn } from "@/lib/utils";

type SortableTaskCardProps = {
  task: ProjectTask;
  canEdit: boolean;
  /** Kanban card vs compact list row. */
  variant?: "card" | "list";
  /** When true (e.g. kanban + DragOverlay), the list item fades to a placeholder. */
  showDragGhost?: boolean;
  /** Required for list variant (inline property menus). */
  projectId?: string;
  members?: ProjectMember[];
  onOpen?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function SortableTaskCard({
  task,
  canEdit,
  variant = "card",
  showDragGhost = false,
  projectId,
  members = [],
  onOpen,
  onEdit,
  onDelete,
}: SortableTaskCardProps) {
  const suppressOpenClick = useRef(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !canEdit,
  });

  useDndMonitor({
    onDragEnd(event) {
      if (String(event.active.id) === task.id) {
        suppressOpenClick.current = true;
        window.setTimeout(() => {
          suppressOpenClick.current = false;
        }, 120);
      }
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    /** Ghost placeholder while the DragOverlay shows the live preview (kanban). */
    opacity: isDragging && showDragGhost ? 0.48 : isDragging && variant === "list" ? 0.5 : undefined,
  };

  const handleOpen = () => {
    if (suppressOpenClick.current) return;
    onOpen?.();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "outline-none",
        canEdit && "touch-none cursor-grab active:cursor-grabbing",
        isDragging && "z-10",
      )}
      {...(canEdit ? attributes : {})}
      {...(canEdit ? listeners : {})}
    >
      {variant === "list" ? (
        <TaskListRow
          projectId={projectId ?? task.projectId}
          members={members}
          task={task}
          isDragging={isDragging}
          canEdit={canEdit}
          onOpen={onOpen ? handleOpen : undefined}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <TaskCard
          task={task}
          members={members}
          isDragging={isDragging}
          canEdit={canEdit}
          onOpen={onOpen ? handleOpen : undefined}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
