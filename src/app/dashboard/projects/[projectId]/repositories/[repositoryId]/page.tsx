import { ProjectRepositoryDetailLayout } from "@/layouts/dashboard/projects/project-repository-detail-layout";

export default async function ProjectRepositoryDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; repositoryId: string }>;
}) {
  const { projectId, repositoryId } = await params;
  return <ProjectRepositoryDetailLayout projectId={projectId} repositoryId={repositoryId} />;
}
