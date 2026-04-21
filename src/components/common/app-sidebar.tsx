"use client";

/**
 * App Sidebar Component
 * Main navigation sidebar with role-based access control
 * Based on shadcn sidebar-07 pattern with modular, configurable navigation
 */

import * as React from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronsUpDown, FileText, FolderKanban, LayoutDashboard, ListChecks, LogOut, MessageSquare, Palette, ScrollText, User, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "@/lib/toast";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/types";
import { getInitials } from "@/utils/helpers";
import { authClient } from "@/lib/auth/auth-client";
import { clearBearerToken } from "@/lib/auth/bearer-token";
import { clearLastActiveOrganizationIdClient } from "@/lib/organization/last-active-organization";
import { useProjectWorkspaceStore } from "@/stores/project-workspace.store";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  /**
   * Current user role for filtering navigation items
   * When auth is implemented, this will come from auth context
   */
  userRole?: UserRole;

  /**
   * Current user data for display in footer
   */
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

/**
 * AppSidebar Component
 * Displays hierarchical navigation with role-based filtering
 */
export function AppSidebar({
  userRole: _userRole = "user",
  user = {
    name: "Demo User",
    email: "demo@example.com",
  },
  ...props
}: AppSidebarProps) {
  void _userRole;
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const { theme, setTheme } = useTheme();

  const resolvedUser = {
    name: session?.user?.name || user.name,
    email: session?.user?.email || user.email,
    avatar: session?.user?.image || user.avatar,
  };

  const setSelectedProjectId = useProjectWorkspaceStore((state) => state.setSelectedProjectId);
  const projectMatch = pathname?.match(/^\/dashboard\/projects\/([^/]+)/);
  const activeProjectId = projectMatch?.[1] ?? null;
  const isProjectWorkspace = Boolean(activeProjectId);
  React.useEffect(() => {
    setSelectedProjectId(activeProjectId);
  }, [activeProjectId, setSelectedProjectId]);

  const config = React.useMemo(() => {
    const globalItems = [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Projects", href: "/dashboard/projects", icon: FolderKanban },
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
        { title: "Workspace", items: globalItems },
        {
          title: "Project",
          items: [
            { title: "Overview", href: `${base}/overview`, icon: LayoutDashboard },
            { title: "Documentation", href: `${base}/documentation`, icon: FileText },
            { title: "Tasks", href: `${base}/tasks`, icon: ListChecks },
            { title: "Requirements", href: `${base}/requirements`, icon: ScrollText },
            { title: "Members", href: `${base}/members`, icon: Users },
            { title: "Activity", href: `${base}/activity`, icon: FolderKanban },
            { title: "AI Chat", href: `${base}/ai-chat`, icon: MessageSquare, badge: "Soon", disabled: true },
          ],
        },
      ],
      footerItems: [],
    };
  }, [isProjectWorkspace, activeProjectId]);

  const handleSignOut = async () => {
    try {
      const loadingToast = toast.loading("Logging out...");
      const result = await authClient.signOut();
      if (result.error) {
        toast.error("Could not log out", { id: loadingToast });
        return;
      }
      clearBearerToken();
      clearLastActiveOrganizationIdClient();
      queryClient.clear();
      toast.success("Logged out", { id: loadingToast });
      window.location.assign("/sign-in");
    } catch (error) {
      console.error("Sign out failed", error);
      toast.error("Failed to log out");
    }
  };

  /**
   * Checks if a path is currently active
   */
  const isActivePath = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
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
              <Link href="/dashboard">
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
                    Requirements Management
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
            {group.title && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
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
                          {item.badge !== undefined && (
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

      {/* Sidebar Footer */}
      <SidebarFooter>
        {/* User Profile Dropdown */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={resolvedUser.avatar} alt={resolvedUser.name} />
                    <AvatarFallback className="rounded-lg">
                      {getInitials(resolvedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{resolvedUser.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {resolvedUser.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={resolvedUser.avatar} alt={resolvedUser.name} />
                      <AvatarFallback className="rounded-lg">
                        {getInitials(resolvedUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{resolvedUser.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {resolvedUser.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Palette className="mr-2 size-4" />
                    Theme
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={theme ?? "system"}
                      onValueChange={setTheme}
                    >
                      <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
