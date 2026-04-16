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
import { DashboardAuthGate } from "@/components/common/dashboard-auth-gate";
import { OrganizationScopedQuerySync } from "@/components/common/organization-scoped-query-sync";
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

/**
 * Generates breadcrumbs from the current pathname
 */
function useBreadcrumbs() {
  const pathname = usePathname();

  return React.useMemo(() => {
    if (!pathname || pathname === "/" || pathname === "/dashboard") {
      return [{ label: "Dashboard", href: "/dashboard" }];
    }

    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return { label, href };
    });

    return breadcrumbs;
  }, [pathname]);
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
  const breadcrumbs = useBreadcrumbs();

  return (
    <DashboardAuthGate>
      <OrganizationScopedQuerySync />
      <SidebarProvider>
        <AppSidebar userRole={userRole} user={user} />
        <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
            {children}
          </div>
        </main>
      </SidebarInset>
      </SidebarProvider>
    </DashboardAuthGate>
  );
}
