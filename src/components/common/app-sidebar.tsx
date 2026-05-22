"use client";

/**
 * App Sidebar Component
 * Main navigation sidebar with role-based access control
 * Based on shadcn sidebar-07 pattern with modular, configurable navigation
 */

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  FileText,
  FolderKanban,
  GitBranch,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Plug,
  Link2,
  ScrollText,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/types";
import { useProject } from "@/hooks/use-projects";
import { useProjectWorkspaceStore } from "@/stores/project-workspace.store";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  /**
   * Current user role for filtering navigation items
   * When auth is implemented, this will come from auth context
   */
  userRole?: UserRole;
}

type SidebarNavItem = {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  badge?: string | number;
};

type SidebarConfig = {
  navGroups: Array<{
    title?: string;
    items: SidebarNavItem[];
  }>;
  footerItems: SidebarNavItem[];
};

/**
 * AppSidebar Component
 * Displays hierarchical navigation with role-based filtering
 */
export function AppSidebar({
  userRole: _userRole = "user",
  ...props
}: AppSidebarProps) {
  void _userRole;
  const pathname = usePathname();
  const isAccountRoute = Boolean(pathname?.startsWith("/account"));

  const setSelectedProjectId = useProjectWorkspaceStore((state) => state.setSelectedProjectId);
  const projectMatch = pathname?.match(/^\/dashboard\/projects\/([^/]+)/);
  const activeProjectId = projectMatch?.[1] ?? null;
  const isProjectWorkspace = Boolean(activeProjectId);
  const { data: activeProject } = useProject(activeProjectId ?? "", {
    enabled: Boolean(activeProjectId),
  });
  const projectSectionTitle = activeProject?.name?.trim() || "Project Workspace";
  React.useEffect(() => {
    setSelectedProjectId(activeProjectId);
  }, [activeProjectId, setSelectedProjectId]);

  const config = React.useMemo<SidebarConfig>(() => {
    if (isAccountRoute) {
      return {
        navGroups: [
          {
            title: "Account",
            items: [
              { title: "Back to workspace", href: "/dashboard/projects", icon: ArrowLeft },
              { title: "Preferences", href: "/account/preferences", icon: SlidersHorizontal },
              { title: "Security", href: "/account/security", icon: KeyRound },
            ],
          },
        ],
        footerItems: [],
      };
    }

    const globalItems = [
      { title: "Projects", href: "/dashboard/projects", icon: FolderKanban },
      { title: "Integrations", href: "/dashboard/organization/integrations", icon: Plug },
      { title: "Organization", href: "/dashboard/organization", icon: Users },
    ];

    if (!isProjectWorkspace || !activeProjectId) {
      return {
        navGroups: [{ title: "Workspace", items: globalItems }],
        footerItems: [],
      };
    }

    const base = `/dashboard/projects/${activeProjectId}`;
    return {
      navGroups: [
        {
          title: projectSectionTitle,
          items: [
            { title: "Overview", href: `${base}/overview`, icon: LayoutDashboard },
            { title: "Ragnarock", href: `${base}/ragnarock`, icon: Bot },
            { title: "Documentation", href: `${base}/documentation`, icon: FileText },
            { title: "Tasks", href: `${base}/tasks`, icon: ListChecks },
            { title: "Members", href: `${base}/members`, icon: Users },
            { title: "Activity", href: `${base}/activity`, icon: FolderKanban },
            { title: "Repositories", href: `${base}/repositories`, icon: GitBranch },
            { title: "Linear", href: `${base}/linear`, icon: Link2 },
          ],
        },
      ],
      footerItems: [],
    };
  }, [isAccountRoute, isProjectWorkspace, activeProjectId, projectSectionTitle]);

  /**
   * Checks if a path is currently active
   */
  const isActivePath = (href: string) => {
    if (href === "/dashboard/projects") {
      return pathname === "/dashboard/projects" || pathname === "/dashboard";
    }
    if (href === "/dashboard/organization") {
      return pathname === "/dashboard/organization" || pathname === "/dashboard/organization/";
    }
    if (href === "/account/preferences") {
      return (
        pathname === "/account" ||
        pathname === "/account/" ||
        pathname === "/account/preferences" ||
        Boolean(pathname?.startsWith("/account/preferences/"))
      );
    }
    if (href === "/account/security") {
      return pathname === "/account/security" || Boolean(pathname?.startsWith("/account/security/"));
    }
    return pathname?.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Sidebar Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard/projects">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                  </svg>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Ragnarock</span>
                  <span className="truncate text-xs text-muted-foreground">
                    SDLC Automation
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        {config.navGroups.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = isActivePath(item.href);
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        disabled={item.disabled}
                      >
                        <Link href={item.href}>
                          {Icon && <Icon className="size-4" />}
                          <span>{item.title}</span>
                          {item.badge != null && (
                            <Badge
                              variant="secondary"
                              className="ml-auto h-5 px-1.5 text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
