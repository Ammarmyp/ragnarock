"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useDeleteProjectDocumentation,
  useProjectDocumentation,
  useProjectRole,
  useUpdateProjectDocumentation,
} from "@/hooks/use-projects";
import { toast } from "@/lib/toast";
import { DocumentationDetailHeader } from "@/components/documentation/documentation-detail-header";
import { DocumentationDetailMetadataForm } from "@/components/documentation/documentation-detail-metadata-form";
import { DocumentationDetailContentPanel } from "@/components/documentation/documentation-detail-content-panel";

type DocumentationDetailViewProps = {
  projectId: string;
  documentationId: string;
};

export function DocumentationDetailView({ projectId, documentationId }: DocumentationDetailViewProps) {
  const router = useRouter();
  const { data: doc, isLoading, isError } = useProjectDocumentation(projectId, documentationId);
  const { data: role } = useProjectRole(projectId);
  const canEdit = role?.role === "owner" || role?.role === "admin" || role?.role === "member";
  const canDelete = role?.role === "owner" || role?.role === "admin";

  const updateDoc = useUpdateProjectDocumentation({
    onSuccess: () => toast.success("Saved"),
  });
  const deleteDoc = useDeleteProjectDocumentation({
    onSuccess: () => {
      toast.success("Document deleted");
      router.push(`/dashboard/projects/${projectId}/documentation`);
    },
  });

  const handleDelete = () => {
    if (typeof window !== "undefined" && !window.confirm("Delete this document permanently?")) {
      return;
    }
    deleteDoc.mutate({ projectId, documentationId });
  };

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (isError || !doc) {
    return (
      <div className="space-y-2">
        <p className="text-destructive text-sm">Could not load this document.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/projects/${projectId}/documentation`}>Back to list</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link href={`/dashboard/projects/${projectId}/documentation`}>
          <ArrowLeft className="mr-1 size-4" />
          Back to documentation
        </Link>
      </Button>
      <div className="min-h-0 flex-1 overflow-hidden">
        <DocumentationDetailHeader
          doc={doc}
          canDelete={canDelete}
          deletePending={deleteDoc.isPending}
          onDelete={handleDelete}
        />
        <div className="space-y-6 px-4 pt-4 pb-4 sm:px-6 sm:pb-6">
          {canEdit && (
            <DocumentationDetailMetadataForm
              doc={doc}
              isPending={updateDoc.isPending}
              onSave={async (data) => {
                await updateDoc.mutateAsync({ projectId, documentationId, data });
              }}
            />
          )}
          <DocumentationDetailContentPanel
            doc={doc}
            canEdit={canEdit}
            savePending={updateDoc.isPending}
            onSaveContent={async (content) => {
              await updateDoc.mutateAsync({ projectId, documentationId, data: { content } });
            }}
          />
        </div>
      </div>
    </div>
  );
}
