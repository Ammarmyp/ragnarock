"use client";

import { useCallback, useState } from "react";
import { ChevronDown, Copy, Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DocumentationMdEditor } from "@/components/documentation/documentation-md-editor";
import { MarkdownContent } from "@/components/documentation/markdown-content";
import { SrsDocumentBody } from "@/components/requirements-workspace/srs-document-body";
import type { ProjectDocumentation } from "@/api/projects.api";
import { toast } from "@/lib/toast";
import { copyToClipboard } from "@/utils/helpers";

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
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const startEdit = useCallback(() => {
    setContentDraft(doc.content);
    setEditSheetOpen(true);
  }, [doc.content]);

  const cancelEdit = useCallback(() => {
    setContentDraft(doc.content);
    setEditSheetOpen(false);
  }, [doc.content]);

  const save = useCallback(async () => {
    await onSaveContent(contentDraft);
    setEditSheetOpen(false);
  }, [contentDraft, onSaveContent]);

  const toPlainText = useCallback((markdown: string) => {
    return markdown
      .replace(/^```[\w-]*\n?/gm, "")
      .replace(/^```$/gm, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^>\s?/gm, "")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/[*_~]/g, "")
      .replace(/^\s*[-+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }, []);

  const copyContent = useCallback(
    async (format: "markdown" | "text") => {
      const source = doc.content ?? "";
      const text = format === "markdown" ? source : toPlainText(source);
      const copied = await copyToClipboard(text);
      if (!copied) {
        toast.error("Could not copy");
        return;
      }
      toast.success(format === "markdown" ? "Copied as Markdown" : "Copied as plain text");
    },
    [doc.content, toPlainText],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Content</p>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Copy className="mr-1 size-4" />
                Copy
                <ChevronDown className="ml-1 size-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Copy as</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void copyContent("markdown")}>Markdown</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void copyContent("text")}>Plain text</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {canEdit && (
            <Button type="button" variant="outline" size="sm" onClick={startEdit}>
              <Pencil className="mr-1 size-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        {doc.type === "srs" ? (
          <SrsDocumentBody
            markdown={doc.content}
            status="complete"
            displayProgress={100}
          />
        ) : (
          <MarkdownContent content={doc.content} />
        )}
      </div>

      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent
          side="right"
          className="flex h-full w-full max-w-none flex-col gap-0 p-0 sm:w-[min(72vw,1400px)]! sm:max-w-[min(72vw,1400px)]!"
          style={{ width: "min(72vw, 1400px)", maxWidth: "min(72vw, 1400px)" }}
        >
          <SheetHeader className="shrink-0 border-b px-6 py-4">
            <SheetTitle>Edit documentation</SheetTitle>
            <SheetDescription>Update content in Markdown with live preview.</SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <DocumentationMdEditor
              value={contentDraft}
              onChange={setContentDraft}
              className="documentation-md-editor--create"
              height={680}
            />
          </div>
          <SheetFooter className="shrink-0 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={cancelEdit} disabled={savePending}>
              <X className="mr-1 size-4" />
              Cancel
            </Button>
            <Button type="button" onClick={() => void save()} disabled={savePending}>
              <Save className="mr-1 size-4" />
              {savePending ? "Saving…" : "Save"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
