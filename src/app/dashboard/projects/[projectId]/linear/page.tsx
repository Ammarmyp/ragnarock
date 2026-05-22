import { ProjectLinearLayout } from "@/layouts/dashboard/projects/project-linear-layout";

export default async function ProjectLinearPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectLinearLayout projectId={projectId} />;
}
