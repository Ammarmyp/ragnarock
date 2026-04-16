"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";
import { projectKeys } from "@/hooks/use-projects";

/**
 * When the active Better Auth organization changes, drop cached org-scoped
 * TanStack Query data so lists refetch against the new workspace.
 */
export function OrganizationScopedQuerySync() {
  const queryClient = useQueryClient();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const activeId = activeOrganization?.id;
  const hasMounted = useRef(false);
  const previousId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      previousId.current = activeId;
      return;
    }
    if (previousId.current !== activeId) {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    }
    previousId.current = activeId;
  }, [activeId, queryClient]);

  return null;
}
