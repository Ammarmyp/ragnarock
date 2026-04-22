"use client";

import { DashboardUserMenu, type DashboardUserMenuFallback } from "@/components/common/dashboard-user-menu";

type DashboardHeaderActionsProps = {
  user?: DashboardUserMenuFallback;
};

/**
 * Top-right header region: account avatar only.
 */
export function DashboardHeaderActions({ user }: DashboardHeaderActionsProps) {
  return (
    <div className="flex shrink-0 items-center pr-0.5">
      <DashboardUserMenu user={user} />
    </div>
  );
}
