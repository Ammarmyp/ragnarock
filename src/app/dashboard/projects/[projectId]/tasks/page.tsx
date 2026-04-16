import { ProjectTasksLayout } from "@/layouts/dashboard/projects/project-tasks-layout";

export default async function ProjectTasksPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectTasksLayout projectId={projectId} />;
}
