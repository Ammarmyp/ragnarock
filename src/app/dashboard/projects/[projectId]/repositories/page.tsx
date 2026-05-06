import { ProjectRepositoriesLayout } from "@/layouts/dashboard/projects/project-repositories-layout";

export default async function ProjectRepositoriesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectRepositoriesLayout projectId={projectId} />;
}
