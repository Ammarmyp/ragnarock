"use client";

import { Button } from "@/components/ui/button";
import type { ProjectDocumentation } from "@/api/projects.api";
import { DocumentationListCard } from "@/components/documentation/documentation-list-card";

type DocumentationListSectionProps = {
  projectId: string;
  items: ProjectDocumentation[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function DocumentationListSection({
  projectId,
  items,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
}: DocumentationListSectionProps) {
  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">No documents match your filters.</p>;
  }

  return (
    <div className="space-y-6">
      <ul className="grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((doc) => (
          <li key={doc.id}>
            <DocumentationListCard projectId={projectId} doc={doc} />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 border-t pt-4">
          <p className="text-muted-foreground text-xs">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
