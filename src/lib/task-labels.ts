import type { ProjectTask, TaskPhase, TaskStatus } from "@/api/projects.api";

export const TASK_STATUS_ORDER: TaskStatus[] = [
  "backlog",
  "todo",
  "in_progress",
  "reviewing",
  "reviewed",
  "done",
  "cancelled",
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To do",
  in_progress: "In progress",
  reviewing: "Reviewing",
  reviewed: "Reviewed",
  done: "Done",
  cancelled: "Cancelled",
};

export const TASK_PHASE_ORDER: TaskPhase[] = ["discovery", "planning", "build", "test", "release"];

export const TASK_PHASE_LABELS: Record<TaskPhase, string> = {
  discovery: "Discovery",
  planning: "Planning",
  build: "Build",
  test: "Test",
  release: "Release",
};

export const TASK_PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
} as const;

export const TASK_PRIORITY_ORDER = ["low", "medium", "high", "urgent"] as const satisfies readonly ProjectTask["priority"][];
