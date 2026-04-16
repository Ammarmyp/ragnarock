import { create } from "zustand";

type ProjectWorkspaceState = {
  selectedProjectId: string | null;
  setSelectedProjectId: (projectId: string | null) => void;
  projectsSearch: string;
  setProjectsSearch: (value: string) => void;
};

export const useProjectWorkspaceStore = create<ProjectWorkspaceState>((set) => ({
  selectedProjectId: null,
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  projectsSearch: "",
  setProjectsSearch: (projectsSearch) => set({ projectsSearch }),
}));
