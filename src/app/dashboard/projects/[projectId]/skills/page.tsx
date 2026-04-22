import { ProjectSkillsLayout } from "@/layouts/dashboard/projects/project-skills-layout";

export default async function ProjectSkillsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectSkillsLayout projectId={projectId} />;
}
