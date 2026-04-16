import { ProjectOverviewLayout } from "@/layouts/dashboard/projects/project-overview-layout";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectOverviewLayout projectId={projectId} />;
}
