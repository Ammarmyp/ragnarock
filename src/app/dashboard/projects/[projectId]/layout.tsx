import { ProjectWorkspaceLayout } from "@/layouts/dashboard/projects/project-workspace-layout";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectWorkspaceLayout projectId={projectId}>{children}</ProjectWorkspaceLayout>;
}
