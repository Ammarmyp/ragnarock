"use client";

import { useMemo } from "react";
import { FileText } from "lucide-react";
import { DocumentationCreateDialog } from "@/components/documentation/documentation-create-dialog";
import { DocumentationListFilters } from "@/components/documentation/documentation-list-filters";
import { DocumentationListSection } from "@/components/documentation/documentation-list-section";
import { useProjectDocumentations, useProjectRole } from "@/hooks/use-projects";
import { useDocumentationWorkspaceStore } from "@/stores/documentation-workspace.store";

export function ProjectDocumentationLayout({ projectId }: { projectId: string }) {
  const search = useDocumentationWorkspaceStore((s) => s.search);
  const setSearch = useDocumentationWorkspaceStore((s) => s.setSearch);
  const statusFilter = useDocumentationWorkspaceStore((s) => s.statusFilter);
  const setStatusFilter = useDocumentationWorkspaceStore((s) => s.setStatusFilter);
  const typeFilter = useDocumentationWorkspaceStore((s) => s.typeFilter);
  const setTypeFilter = useDocumentationWorkspaceStore((s) => s.setTypeFilter);
  const page = useDocumentationWorkspaceStore((s) => s.page);
  const setPage = useDocumentationWorkspaceStore((s) => s.setPage);
  const perPage = useDocumentationWorkspaceStore((s) => s.perPage);

  const listParams = useMemo(
    () => ({
      page,
      perPage,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      ...(typeFilter !== "all" ? { type: typeFilter } : {}),
    }),
    [page, perPage, search, statusFilter, typeFilter],
  );

  const { data, isLoading } = useProjectDocumentations(projectId, listParams);
  const { data: role } = useProjectRole(projectId);
  const canCreate = role?.role === "owner" || role?.role === "admin" || role?.role === "member";

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-row flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 pb-4 sm:px-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <FileText className="size-5 opacity-90" />
          Documentation
        </h2>
        {canCreate && <DocumentationCreateDialog projectId={projectId} />}
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-4 pt-4 pb-4 sm:px-6 sm:pb-6">
        <div className="shrink-0 space-y-4 pb-4">
          <DocumentationListFilters
            search={search}
            onSearchChange={setSearch}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-0.5 [-webkit-overflow-scrolling:touch]">
          <DocumentationListSection
            projectId={projectId}
            items={items}
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            total={data?.total ?? 0}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
