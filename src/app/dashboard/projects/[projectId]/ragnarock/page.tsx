import { ProjectRequirementsLayout } from "@/layouts/dashboard/projects/project-requirements-layout";

export default async function ProjectRequirementsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectRequirementsLayout projectId={projectId} />;
}
