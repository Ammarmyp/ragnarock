import { ProjectDocumentationLayout } from "@/layouts/dashboard/projects/project-documentation-layout";

export default async function ProjectDocumentationPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectDocumentationLayout projectId={projectId} />;
}
