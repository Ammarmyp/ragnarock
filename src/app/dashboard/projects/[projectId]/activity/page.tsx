import { ProjectActivityLayout } from "@/layouts/dashboard/projects/project-activity-layout";

export default async function ProjectActivityPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectActivityLayout projectId={projectId} />;
}
