"use client";

import { usePathname } from "next/navigation";
import {
  DashboardUserMenu,
  type DashboardUserMenuFallback,
} from "@/components/common/dashboard-user-menu";
import { useProject, useProjectRole } from "@/hooks/use-projects";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "@/components/mode-toggle";

type DashboardHeaderActionsProps = {
  user?: DashboardUserMenuFallback;
};

/**
 * Top-right header region: account avatar only.
 */
export function DashboardHeaderActions({ user }: DashboardHeaderActionsProps) {
  const pathname = usePathname();
  const projectId =
    pathname?.match(/^\/dashboard\/projects\/([^/]+)/)?.[1] ?? null;
  const { data: project, isPending: projectPending } = useProject(
    projectId ?? "",
    { enabled: Boolean(projectId) },
  );
  const { data: role, isPending: rolePending } = useProjectRole(
    projectId ?? "",
    { enabled: Boolean(projectId) },
  );

  return (
    <div className="flex shrink-0 items-center gap-3 pr-0.5">
      {projectId ? (
        <div className="hidden min-w-0 flex-col items-end leading-tight sm:flex">
          {projectPending ? (
            <Skeleton className="h-4 w-28" />
          ) : (
            <span className="max-w-2xs truncate text-sm font-semibold">
              {project?.name ?? "Project"}
            </span>
          )}
          {rolePending ? (
            <Skeleton className="mt-1 h-3.5 w-20" />
          ) : (
            <span className="text-muted-foreground max-w-2xs truncate text-xs">
              Role:{" "}
              {role?.role
                ? role.role[0]!.toUpperCase() + role.role.slice(1)
                : "—"}
            </span>
          )}
        </div>
      ) : null}
      <ModeToggle />
      <DashboardUserMenu user={user} />
    </div>
  );
}
