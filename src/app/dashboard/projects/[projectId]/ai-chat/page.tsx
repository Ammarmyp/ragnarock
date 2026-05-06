import { ProjectAiChatWorkspace } from "@/components/project-ai-chat/project-ai-chat-workspace";

export default async function ProjectAiChatPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectAiChatWorkspace projectId={projectId} />;
}
