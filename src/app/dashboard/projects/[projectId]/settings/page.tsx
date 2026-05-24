import { ProjectSettingsLayout } from "@/layouts/dashboard/projects/project-settings-layout";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectSettingsLayout projectId={projectId} />;
}
