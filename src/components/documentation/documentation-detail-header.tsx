"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProjectDocumentation } from "@/api/projects.api";
import { DOCUMENTATION_STATUS_LABELS, DOCUMENTATION_TYPE_LABELS } from "@/lib/documentation-labels";
import { DocumentationDownloadMenu } from "@/components/documentation/documentation-download-menu";

type DocumentationDetailHeaderProps = {
  doc: ProjectDocumentation;
  canDelete: boolean;
  deletePending: boolean;
  onDelete: () => void;
};

export function DocumentationDetailHeader({
  doc,
  canDelete,
  deletePending,
  onDelete,
}: DocumentationDetailHeaderProps) {
  return (
    <div className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0 border-b border-border/50 px-4 pb-4 sm:px-6">
      <div className="min-w-0 flex-1 space-y-2">
        <h1 className="break-words text-xl font-semibold tracking-tight">{doc.title}</h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{DOCUMENTATION_TYPE_LABELS[doc.type]}</Badge>
          <Badge variant="outline">{DOCUMENTATION_STATUS_LABELS[doc.status]}</Badge>
          <span className="text-muted-foreground self-center text-xs">v{doc.version}</span>
        </div>
        <p className="text-muted-foreground text-xs">
          {doc.author?.name ?? doc.author?.email ?? "Unknown author"} · Updated {new Date(doc.updatedAt).toLocaleString()}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <DocumentationDownloadMenu title={doc.title} markdown={doc.content} variant="outline" size="sm" />
        {canDelete && (
          <Button type="button" variant="destructive" size="sm" onClick={onDelete} disabled={deletePending}>
            <Trash2 className="mr-1 size-4" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
