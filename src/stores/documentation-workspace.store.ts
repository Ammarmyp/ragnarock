import { create } from "zustand";
import type { DocumentationStatus, DocumentationType } from "@/api/projects.api";

export type DocumentationTypeFilter = DocumentationType | "all";
export type DocumentationStatusFilter = DocumentationStatus | "all";

type DocumentationWorkspaceState = {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: DocumentationStatusFilter;
  setStatusFilter: (value: DocumentationStatusFilter) => void;
  typeFilter: DocumentationTypeFilter;
  setTypeFilter: (value: DocumentationTypeFilter) => void;
  page: number;
  setPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
};

export const useDocumentationWorkspaceStore = create<DocumentationWorkspaceState>((set) => ({
  search: "",
  setSearch: (search) => set({ search, page: 1 }),
  statusFilter: "all",
  setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
  typeFilter: "all",
  setTypeFilter: (typeFilter) => set({ typeFilter, page: 1 }),
  page: 1,
  setPage: (page) => set({ page }),
  perPage: 20,
  setPerPage: (perPage) => set({ perPage, page: 1 }),
}));
