"use client";

import { ProjectOverviewDashboard } from "@/components/projects/project-overview-dashboard";
import { useProjectOverview } from "@/hooks/use-projects";

export function ProjectOverviewLayout({ projectId }: { projectId: string }) {
  const { data, isLoading, isError, error } = useProjectOverview(projectId);

  if (isError) {
    return (
      <p className="text-destructive text-sm">
        {error instanceof Error ? error.message : "Could not load project overview."}
      </p>
    );
  }

  return <ProjectOverviewDashboard projectId={projectId} data={data} isLoading={isLoading} />;
}
