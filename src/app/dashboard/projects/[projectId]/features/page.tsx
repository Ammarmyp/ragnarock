import { ProjectFeaturesLayout } from "@/layouts/dashboard/projects/project-features-layout";

export default async function ProjectFeaturesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectFeaturesLayout projectId={projectId} />;
}
