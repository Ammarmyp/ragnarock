"use client";

/**
 * Dashboard Layout
 * Main composition component for the dashboard view
 * Includes sidebar navigation, header, and content area
 */

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AppSidebar } from "@/components/common/app-sidebar";
import { DashboardHeaderActions } from "@/components/common/dashboard-header-actions";
import { DashboardAuthGate } from "@/components/common/dashboard-auth-gate";
import { OrganizationScopedQuerySync } from "@/components/common/organization-scoped-query-sync";
import { useProject } from "@/hooks/use-projects";
import { useProjectRepositoryDetail } from "@/hooks/use-repositories";
import type { UserRole } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  /**
   * User role for navigation filtering
   * When auth is implemented, this will come from auth context
   */
  userRole?: UserRole;
  /**
   * User data for display
   */
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

function segmentToTitle(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Breadcrumbs from pathname; under `/dashboard/projects/:projectId/...` the project segment shows the fetched project name.
 */
function useDashboardBreadcrumbs() {
  const pathname = usePathname();
  const projectId = React.useMemo(
    () => pathname?.match(/^\/dashboard\/projects\/([^/]+)/)?.[1] ?? null,
    [pathname],
  );
  const repositoryId = React.useMemo(() => {
    const m = pathname?.match(/^\/dashboard\/projects\/[^/]+\/repositories\/([^/]+)/);
    return m?.[1] ?? null;
  }, [pathname]);
  const { data: project } = useProject(projectId ?? "", { enabled: Boolean(projectId) });
  const projectTitle = project?.name?.trim() || undefined;
  const { data: repo } = useProjectRepositoryDetail(projectId ?? "", repositoryId ?? "", {
    enabled: Boolean(projectId && repositoryId),
  });
  const repoTitle = repo?.fullName?.trim() || repo?.name?.trim() || undefined;

  return React.useMemo(() => {
    if (!pathname || pathname === "/" || pathname === "/dashboard") {
      return [{ label: "Projects", href: "/dashboard/projects" }];
    }

    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "dashboard" && segments.length > 1) {
      const sub = segments.slice(1);
      return sub.map((segment, index) => {
        const href = "/dashboard/" + sub.slice(0, index + 1).join("/");
        const isProjectIdCrumb = sub[0] === "projects" && index === 1;
        const isRepositoryIdCrumb = sub[0] === "projects" && sub[2] === "repositories" && index === 3;
        const label = isProjectIdCrumb
          ? (projectTitle ?? "Project")
          : isRepositoryIdCrumb
            ? (repoTitle ?? "Repository")
            : segmentToTitle(segment);
        return { label, href };
      });
    }

    return segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      return { label: segmentToTitle(segment), href };
    });
  }, [pathname, projectId, projectTitle, repoTitle]);
}

/**
 * DashboardLayout Component
 * Provides the main structure for dashboard pages
 */
export function DashboardLayout({
  children,
  userRole = "user",
  user = {
    name: "Demo User",
    email: "demo@example.com",
  },
}: DashboardLayoutProps) {
  const breadcrumbs = useDashboardBreadcrumbs();

  return (
    <DashboardAuthGate>
      <OrganizationScopedQuerySync />
      <SidebarProvider>
        <AppSidebar userRole={userRole} />
        <SidebarInset className="min-h-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <SidebarTrigger className="-ml-1 shrink-0" />
            <Separator orientation="vertical" className="mr-1 hidden h-4 sm:block" />
            <Breadcrumb className="min-w-0">
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem className="min-w-0">
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href} className="truncate">
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <DashboardHeaderActions user={user} />
        </header>

        {/* Main Content — overflow-hidden so each route controls its own scroll */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
      </SidebarInset>
      </SidebarProvider>
    </DashboardAuthGate>
  );
}
