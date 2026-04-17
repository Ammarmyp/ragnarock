import { ProjectDocumentationDetailLayout } from "@/layouts/dashboard/projects/project-documentation-detail-layout";

export default async function ProjectDocumentationDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; documentationId: string }>;
}) {
  const { projectId, documentationId } = await params;
  return <ProjectDocumentationDetailLayout projectId={projectId} documentationId={documentationId} />;
}
