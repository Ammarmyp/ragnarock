import { RagnarockPageLayout } from "@/layouts/dashboard/projects/ragnarock-page-layout";

export default async function ProjectRagnarockPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <RagnarockPageLayout projectId={projectId} />;
}
