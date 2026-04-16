"use client";

import { RequirementsIntelligenceWorkspace } from "@/components/requirements-workspace/requirements-workspace";

export function ProjectRequirementsLayout({ projectId }: { projectId: string }) {
  return <RequirementsIntelligenceWorkspace projectId={projectId} />;
}
