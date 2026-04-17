"use client";

import { useCallback, useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentationMdEditor } from "@/components/documentation/documentation-md-editor";
import { MarkdownContent } from "@/components/documentation/markdown-content";
import type { ProjectDocumentation } from "@/api/projects.api";

type DocumentationDetailContentPanelProps = {
  doc: ProjectDocumentation;
  canEdit: boolean;
  onSaveContent: (content: string) => Promise<void>;
  savePending: boolean;
};

export function DocumentationDetailContentPanel({
  doc,
  canEdit,
  onSaveContent,
  savePending,
}: DocumentationDetailContentPanelProps) {
  const [contentDraft, setContentDraft] = useState("");
  const [editing, setEditing] = useState(false);

  const startEdit = useCallback(() => {
    setContentDraft(doc.content);
    setEditing(true);
  }, [doc.content]);

  const cancelEdit = useCallback(() => {
    setContentDraft(doc.content);
    setEditing(false);
  }, [doc.content]);

  const save = useCallback(async () => {
    await onSaveContent(contentDraft);
    setEditing(false);
  }, [contentDraft, onSaveContent]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Content</p>
        {canEdit && !editing && (
          <Button type="button" variant="outline" size="sm" onClick={startEdit}>
            <Pencil className="mr-1 size-4" />
            Edit
          </Button>
        )}
        {canEdit && editing && (
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={cancelEdit} disabled={savePending}>
              <X className="mr-1 size-4" />
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={() => void save()} disabled={savePending}>
              <Save className="mr-1 size-4" />
              Save
            </Button>
          </div>
        )}
      </div>

      {editing && canEdit ? (
        <DocumentationMdEditor value={contentDraft} onChange={setContentDraft} height={480} />
      ) : (
        <div className="rounded-lg border bg-card p-4">
          <MarkdownContent content={doc.content} />
        </div>
      )}
    </div>
  );
}
