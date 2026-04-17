"use client";

import { DocumentationDetailView } from "@/components/documentation/documentation-detail-view";

type ProjectDocumentationDetailLayoutProps = {
  projectId: string;
  documentationId: string;
};

export function ProjectDocumentationDetailLayout({
  projectId,
  documentationId,
}: ProjectDocumentationDetailLayoutProps) {
  return <DocumentationDetailView projectId={projectId} documentationId={documentationId} />;
}
