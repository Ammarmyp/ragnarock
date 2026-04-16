import { ProjectMembersLayout } from "@/layouts/dashboard/projects/project-members-layout";

export default async function ProjectMembersPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectMembersLayout projectId={projectId} />;
}
