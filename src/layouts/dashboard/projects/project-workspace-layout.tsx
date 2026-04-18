"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/layouts/dashboard/dashboard-layout";
import { useProject, useProjectRole } from "@/hooks/use-projects";
import { useProjectWorkspaceStore } from "@/stores/project-workspace.store";

type ProjectWorkspaceLayoutProps = {
  projectId: string;
  children: React.ReactNode;
};

export function ProjectWorkspaceLayout({ projectId, children }: ProjectWorkspaceLayoutProps) {
  const pathname = usePathname();
  const isProjectOverview = pathname?.includes("/overview");
  const { data: project } = useProject(projectId);
  const { data: role } = useProjectRole(projectId);
  const setSelectedProjectId = useProjectWorkspaceStore((state) => state.setSelectedProjectId);

  useEffect(() => {
    setSelectedProjectId(projectId);
    return () => setSelectedProjectId(null);
  }, [projectId, setSelectedProjectId]);

  return (
    <DashboardLayout>
      <div
        className={
          isProjectOverview
            ? "flex h-full min-h-0 flex-1 flex-col overflow-auto"
            : "flex h-full min-h-0 flex-1 flex-col gap-3 p-4 md:p-5"
        }
      >
        {!isProjectOverview ? (
          <div className="shrink-0">
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">{project?.name ?? "Project Workspace"}</h1>
            <p className="text-muted-foreground text-xs md:text-sm">
              Role: <span className="capitalize">{role?.role ?? "viewer"}</span>
            </p>
          </div>
        ) : null}
        <div
          className={
            isProjectOverview
              ? "flex min-h-0 flex-1 flex-col px-4 pb-8 pt-4 md:px-6"
              : "flex min-h-0 flex-1 flex-col overflow-hidden"
          }
        >
          {children}
        </div>
      </div>
    </DashboardLayout>
  );
}
