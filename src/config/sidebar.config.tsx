/**
 * Sidebar Navigation Configuration
 * Defines navigation structure with role-based access control
 *
 * Navigation items can be filtered based on user role when auth is implemented
 */

import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  Settings,
  BarChart3,
  Bell,
  Calendar,
  Search,
  Archive,
  Tag,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import type { SidebarConfig, UserRole } from "@/types";

/**
 * Main navigation groups for the sidebar
 */
export const sidebarConfig: SidebarConfig = {
  navGroups: [
    {
      title: "Overview",
      items: [
        {
          title: "Projects",
          href: "/dashboard/projects",
          icon: LayoutDashboard,
          roles: ["admin", "manager", "user", "viewer"],
        },
        {
          title: "Analytics",
          href: "/analytics",
          icon: BarChart3,
          roles: ["admin", "manager"],
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          title: "Projects",
          href: "/projects",
          icon: FolderKanban,
          roles: ["admin", "manager", "user", "viewer"],
        },
        {
          title: "Requirements",
          href: "/ragnarock",
          icon: FileText,
          roles: ["admin", "manager", "user"],
        },
        {
          title: "Tasks",
          href: "/tasks",
          icon: Calendar,
          roles: ["admin", "manager", "user"],
        },
      ],
    },
    {
      title: "Collaboration",
      items: [
        {
          title: "Team",
          href: "/dashboard/organization",
          icon: Users,
          roles: ["admin", "manager", "user"],
        },
        {
          title: "Messages",
          href: "/messages",
          icon: MessageSquare,
          roles: ["admin", "manager", "user"],
          badge: 3,
        },
        {
          title: "Notifications",
          href: "/notifications",
          icon: Bell,
          roles: ["admin", "manager", "user"],
        },
      ],
    },
    {
      title: "Tools",
      items: [
        {
          title: "Search",
          href: "/search",
          icon: Search,
          roles: ["admin", "manager", "user", "viewer"],
        },
        {
          title: "Archive",
          href: "/archive",
          icon: Archive,
          roles: ["admin", "manager"],
        },
        {
          title: "Tags",
          href: "/tags",
          icon: Tag,
          roles: ["admin", "manager", "user"],
        },
      ],
    },
  ],
  footerItems: [
    {
      title: "Help & Support",
      href: "/help",
      icon: HelpCircle,
      roles: ["admin", "manager", "user", "viewer"],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ["admin", "manager", "user"],
    },
  ],
};

/**
 * Filters navigation items based on user role
 * @param userRole - Current user's role (undefined if not authenticated)
 * @returns Filtered sidebar configuration
 */
export function getFilteredSidebarConfig(userRole?: UserRole): SidebarConfig {
  // If no role provided, return empty config (user not authenticated)
  if (!userRole) {
    return { navGroups: [], footerItems: [] };
  }

  // Filter nav groups and their items based on role
  const filteredNavGroups = sidebarConfig.navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.roles ? item.roles.includes(userRole) : true
      ),
    }))
    .filter((group) => group.items.length > 0); // Remove empty groups

  // Filter footer items based on role
  const filteredFooterItems = sidebarConfig.footerItems?.filter((item) =>
    item.roles ? item.roles.includes(userRole) : true
  );

  return {
    navGroups: filteredNavGroups,
    footerItems: filteredFooterItems,
  };
}

/**
 * Gets all available navigation paths for a given role
 * Useful for authorization checks
 * @param userRole - User role to check
 * @returns Array of allowed paths
 */
export function getAllowedPaths(userRole: UserRole): string[] {
  const config = getFilteredSidebarConfig(userRole);
  const paths: string[] = [];

  config.navGroups.forEach((group) => {
    group.items.forEach((item) => {
      paths.push(item.href);
    });
  });

  config.footerItems?.forEach((item) => {
    paths.push(item.href);
  });

  return paths;
}

/**
 * Checks if a user role has access to a specific path
 * @param path - Path to check
 * @param userRole - User role
 * @returns True if user has access, false otherwise
 */
export function hasAccessToPath(path: string, userRole?: UserRole): boolean {
  if (!userRole) return false;
  const allowedPaths = getAllowedPaths(userRole);
  return allowedPaths.includes(path);
}
