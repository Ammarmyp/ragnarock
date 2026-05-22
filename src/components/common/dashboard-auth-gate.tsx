"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import {
  clearLastActiveOrganizationIdClient,
  getLastActiveOrganizationIdClient,
} from "@/lib/organization/last-active-organization";
import { WorkspaceLoadingState } from "@/components/feedback/feedback-state";

/**
 * Paths allowed when a user is signed in but has NO active organization yet.
 * Everything else is redirected to /dashboard/organization/select.
 */
const ORG_EXEMPT_PREFIXES = [
  "/dashboard/organization/select",
  "/dashboard/organization/create",
  "/dashboard/accept-invitation",
  "/account",
];

/**
 * Client-side active-organization gate for dashboard pages.
 *
 * The session-level auth gate lives in `proxy.ts` (Next.js 16 proxy) using
 * `getSessionCookie` so there is no flash. This component only handles the
 * post-login "pick a workspace" requirement, which needs session data that
 * the Edge proxy cannot reach.
 */
export function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: activeOrganization, isPending: activeLoading } =
    authClient.useActiveOrganization();
  const [restoreAttemptFinished, setRestoreAttemptFinished] = React.useState(false);
  const [restoreFailed, setRestoreFailed] = React.useState(false);
  const restoreStartedRef = React.useRef(false);
  const authFetch = authClient.$fetch as <T>(
    path: string,
    options: { method: "POST"; body: Record<string, unknown> },
  ) => Promise<{ data: T; error: unknown }>;

  const isExempt = ORG_EXEMPT_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  useEffect(() => {
    if (isExempt || restoreStartedRef.current) {
      setRestoreAttemptFinished(true);
      return;
    }
    if (activeLoading) return;
    if (activeOrganization?.id) {
      setRestoreAttemptFinished(true);
      return;
    }

    const lastOrgId = getLastActiveOrganizationIdClient();
    if (!lastOrgId) {
      setRestoreAttemptFinished(true);
      return;
    }

    restoreStartedRef.current = true;
    void (async () => {
      try {
        const response = await authFetch<{ id: string }>("/organization/set-active", {
          method: "POST",
          body: { organizationId: lastOrgId },
        });
        if (response.error) {
          setRestoreFailed(true);
          clearLastActiveOrganizationIdClient();
        }
      } catch {
        setRestoreFailed(true);
        clearLastActiveOrganizationIdClient();
      } finally {
        setRestoreAttemptFinished(true);
        router.refresh();
      }
    })();
  }, [activeLoading, activeOrganization?.id, authFetch, isExempt, router]);

  useEffect(() => {
    if (isExempt) return;
    if (!restoreAttemptFinished) return;
    if (activeLoading) return;
    if (activeOrganization?.id) return;
    if (restoreStartedRef.current && !restoreFailed) return;
    if (restoreFailed) {
      clearLastActiveOrganizationIdClient();
    }
    const redirectTo = encodeURIComponent(pathname ?? "/dashboard/projects");
    router.replace(`/dashboard/organization/select?redirectTo=${redirectTo}`);
  }, [activeLoading, activeOrganization?.id, isExempt, pathname, restoreAttemptFinished, restoreFailed, router]);

  if (!isExempt && (activeLoading || !restoreAttemptFinished || !activeOrganization?.id)) {
    return (
      <WorkspaceLoadingState
        title="Opening workspace"
        description="Restoring your organization session…"
      />
    );
  }

  return <>{children}</>;
}
