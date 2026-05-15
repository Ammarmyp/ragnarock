"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/layouts/dashboard/dashboard-layout";
import { useProject } from "@/hooks/use-projects";
import { useProjectWorkspaceStore } from "@/stores/project-workspace.store";

type ProjectWorkspaceLayoutProps = {
  projectId: string;
  children: React.ReactNode;
};

export function ProjectWorkspaceLayout({ projectId, children }: ProjectWorkspaceLayoutProps) {
  const pathname = usePathname();
  const isProjectOverview = pathname?.includes("/overview");
  const isFullBleed = isProjectOverview || pathname?.includes("/ragnarock");
  void useProject(projectId);
  const setSelectedProjectId = useProjectWorkspaceStore((state) => state.setSelectedProjectId);

  useEffect(() => {
    setSelectedProjectId(projectId);
    return () => setSelectedProjectId(null);
  }, [projectId, setSelectedProjectId]);

  return (
    <DashboardLayout>
      <div
        className={
          isFullBleed
            ? "flex min-h-0 flex-1 flex-col overflow-hidden"
            : "flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-4 md:p-5"
        }
      >
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
