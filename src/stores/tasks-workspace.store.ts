import { create } from "zustand";
import type { TaskPhase, TaskStatus } from "@/api/projects.api";

export type TaskStatusFilter = TaskStatus | "all";
export type TaskPhaseFilter = TaskPhase | "all";

type TasksWorkspaceState = {
  viewMode: "list" | "kanban";
  setViewMode: (m: "list" | "kanban") => void;
  search: string;
  setSearch: (s: string) => void;
  statusFilter: TaskStatusFilter;
  setStatusFilter: (s: TaskStatusFilter) => void;
  phaseFilter: TaskPhaseFilter;
  setPhaseFilter: (p: TaskPhaseFilter) => void;
  assigneeFilter: string | "all";
  setAssigneeFilter: (a: string | "all") => void;
};

export const useTasksWorkspaceStore = create<TasksWorkspaceState>((set) => ({
  viewMode: "kanban",
  setViewMode: (viewMode) => set({ viewMode }),
  search: "",
  setSearch: (search) => set({ search }),
  statusFilter: "all",
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  phaseFilter: "all",
  setPhaseFilter: (phaseFilter) => set({ phaseFilter }),
  assigneeFilter: "all",
  setAssigneeFilter: (assigneeFilter) => set({ assigneeFilter }),
}));
