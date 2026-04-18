import { arrayMove } from "@dnd-kit/sortable";
import type { ProjectTask, TaskStatus } from "@/api/projects.api";
import { TASK_STATUS_ORDER } from "@/lib/task-labels";

export type ReorderUpdate = { id: string; sortOrder: number; status?: TaskStatus };

/** After reordering a flat list (mixed statuses), assign sortOrder within each status group by visual order. */
export function updatesFromListOrder(orderedTasks: ProjectTask[]): ReorderUpdate[] {
  const updates: ReorderUpdate[] = [];
  const byStatus = new Map<TaskStatus, ProjectTask[]>();
  for (const t of orderedTasks) {
    const list = byStatus.get(t.status) ?? [];
    list.push(t);
    byStatus.set(t.status, list);
  }
  for (const [, group] of byStatus) {
    group.forEach((t, i) => {
      updates.push({ id: t.id, sortOrder: i, status: t.status });
    });
  }
  return updates;
}

export function applyListMove(
  tasks: ProjectTask[],
  activeId: string,
  overId: string,
): ProjectTask[] {
  const oldIndex = tasks.findIndex((t) => t.id === activeId);
  const newIndex = tasks.findIndex((t) => t.id === overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
    return tasks;
  }
  return arrayMove(tasks, oldIndex, newIndex);
}

/** Build column item id lists from tasks (sorted by sortOrder within status). */
export function tasksToColumnItems(tasks: ProjectTask[]): Record<TaskStatus, string[]> {
  const map = Object.fromEntries(TASK_STATUS_ORDER.map((s) => [s, [] as string[]])) as Record<
    TaskStatus,
    string[]
  >;
  const grouped = new Map<TaskStatus, ProjectTask[]>();
  for (const t of tasks) {
    const g = grouped.get(t.status) ?? [];
    g.push(t);
    grouped.set(t.status, g);
  }
  for (const s of TASK_STATUS_ORDER) {
    const list = grouped.get(s) ?? [];
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.updatedAt.localeCompare(b.updatedAt));
    map[s] = list.map((t) => t.id);
  }
  return map;
}

export function findContainer(
  items: Record<TaskStatus, string[]>,
  id: string,
): TaskStatus | undefined {
  for (const s of TASK_STATUS_ORDER) {
    if (items[s].includes(id)) {
      return s;
    }
  }
  return undefined;
}

/** Kanban: reorder within column or move to another column / position. `overId` is a task id, or a column status when dropping on column. */
export function applyKanbanDrag(
  items: Record<TaskStatus, string[]>,
  activeId: string,
  overId: string,
  overIsColumnDrop: boolean,
): Record<TaskStatus, string[]> {
  const next: Record<TaskStatus, string[]> = { ...items };
  for (const s of TASK_STATUS_ORDER) {
    next[s] = [...items[s]];
  }

  const from = findContainer(next, activeId);
  if (!from) {
    return items;
  }

  let to: TaskStatus | undefined;
  if (overIsColumnDrop && TASK_STATUS_ORDER.includes(overId as TaskStatus)) {
    to = overId as TaskStatus;
  } else {
    to = findContainer(next, overId);
  }
  if (!to) {
    return items;
  }

  if (from === to && !overIsColumnDrop) {
    const oldIndex = next[from].indexOf(activeId);
    const newIndex = next[from].indexOf(overId);
    if (oldIndex >= 0 && newIndex >= 0) {
      next[from] = arrayMove(next[from], oldIndex, newIndex);
    }
    return next;
  }

  next[from] = next[from].filter((id) => id !== activeId);

  if (overIsColumnDrop) {
    next[to] = [...next[to], activeId];
    return next;
  }

  const destArr = next[to].filter((id) => id !== activeId);
  const overIndex = destArr.indexOf(overId);
  if (overIndex >= 0) {
    const copy = [...destArr];
    copy.splice(overIndex, 0, activeId);
    next[to] = copy;
  } else {
    next[to] = [...destArr, activeId];
  }

  return next;
}

export function updatesFromKanbanColumns(columns: Record<TaskStatus, string[]>): ReorderUpdate[] {
  const updates: ReorderUpdate[] = [];
  for (const s of TASK_STATUS_ORDER) {
    columns[s].forEach((id, i) => {
      updates.push({ id, sortOrder: i, status: s });
    });
  }
  return updates;
}
