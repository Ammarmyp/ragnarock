"use client";

import { useEffect } from "react";
import { DashboardLayout } from "@/layouts/dashboard/dashboard-layout";
import { useProject, useProjectRole } from "@/hooks/use-projects";
import { useProjectWorkspaceStore } from "@/stores/project-workspace.store";

type ProjectWorkspaceLayoutProps = {
  projectId: string;
  children: React.ReactNode;
};

export function ProjectWorkspaceLayout({ projectId, children }: ProjectWorkspaceLayoutProps) {
  const { data: project } = useProject(projectId);
  const { data: role } = useProjectRole(projectId);
  const setSelectedProjectId = useProjectWorkspaceStore((state) => state.setSelectedProjectId);

  useEffect(() => {
    setSelectedProjectId(projectId);
    return () => setSelectedProjectId(null);
  }, [projectId, setSelectedProjectId]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{project?.name ?? "Project Workspace"}</h1>
          <p className="text-sm text-muted-foreground">
            Role: <span className="capitalize">{role?.role ?? "viewer"}</span>
          </p>
        </div>
        {children}
      </div>
    </DashboardLayout>
  );
}
