import { ProjectQaLayout } from "@/layouts/dashboard/projects/project-qa-layout";

export default async function ProjectQaPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectQaLayout projectId={projectId} />;
}
