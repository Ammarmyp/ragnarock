"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { safeDashboardRedirect } from "@/lib/auth/redirect";
import { toast } from "@/lib/toast";
import { setLastActiveOrganizationIdClient } from "@/lib/organization/last-active-organization";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SelectOrganizationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(
    () => safeDashboardRedirect(searchParams.get("redirectTo")),
    [searchParams],
  );

  const { data: organizations, isPending, error } = authClient.useListOrganizations();
  const { data: activeOrganization, isPending: isActivePending } =
    authClient.useActiveOrganization();

  const authFetch = authClient.$fetch as <T>(
    path: string,
    options: {
      method: "POST";
      body: Record<string, unknown>;
    },
  ) => Promise<{ data: T; error: unknown }>;

  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [singleOrgActivationFailed, setSingleOrgActivationFailed] = useState(false);
  const singleOrgAutoActivateStarted = useRef(false);
  const navigateToDashboard = (target: string) => {
    window.location.assign(target);
  };

  useEffect(() => {
    if (isActivePending) return;
    if (activeOrganization?.id) {
      navigateToDashboard(redirectTo);
    }
  }, [activeOrganization?.id, isActivePending, redirectTo]);

  useEffect(() => {
    if (isPending || !organizations) return;
    if (organizations.length === 0) {
      router.replace("/dashboard/organization/create");
    }
  }, [isPending, organizations, router]);

  /** Exactly one org: activate automatically — never show the multi-org chooser. */
  useEffect(() => {
    if (isPending || !organizations || organizations.length !== 1) return;
    const only = organizations[0];
    if (activeOrganization?.id === only.id) {
      router.replace(redirectTo);
      return;
    }
    if (singleOrgAutoActivateStarted.current || singleOrgActivationFailed) return;
    singleOrgAutoActivateStarted.current = true;

    setActivatingId(only.id);
    void (async () => {
      const fetchSetActive = authClient.$fetch as <T>(
        path: string,
        options: { method: "POST"; body: Record<string, unknown> },
      ) => Promise<{ data: T; error: unknown }>;
      try {
        const loadingToast = toast.loading("Opening workspace...");
        const result = await fetchSetActive<{ id: string }>("/organization/set-active", {
          method: "POST",
          body: { organizationId: only.id },
        });
        if (result.error) {
          setSingleOrgActivationFailed(true);
          toast.error("Could not activate organization", { id: loadingToast });
          return;
        }
        setLastActiveOrganizationIdClient(only.id);
        toast.success("Workspace ready", { id: loadingToast });
        navigateToDashboard(redirectTo);
      } catch (e) {
        console.error(e);
        setSingleOrgActivationFailed(true);
        toast.error("Failed to open workspace");
      } finally {
        setActivatingId(null);
      }
    })();
  }, [activeOrganization?.id, isPending, organizations, redirectTo, router, singleOrgActivationFailed]);

  const handleSelect = async (organizationId: string) => {
    setActivatingId(organizationId);
    try {
      const loadingToast = toast.loading("Opening workspace...");
      const result = await authFetch<{ id: string }>("/organization/set-active", {
        method: "POST",
        body: { organizationId },
      });
      if (result.error) {
        toast.error("Could not activate organization", { id: loadingToast });
        return;
      }
      setLastActiveOrganizationIdClient(organizationId);
      toast.success("Organization selected", { id: loadingToast });
      navigateToDashboard(redirectTo);
    } catch (e) {
      console.error(e);
      toast.error("Failed to select organization");
    } finally {
      setActivatingId(null);
    }
  };

  const orgCount = organizations?.length ?? 0;
  const showMultiOrgChooser = !isPending && !error && orgCount > 1;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      {error && (
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">
              Could not load organizations. Refresh the page or try again later.
            </p>
          </CardContent>
        </Card>
      )}
      {isPending && (
        <p className="text-muted-foreground text-sm">Loading organizations…</p>
      )}
      {!isPending && !error && orgCount === 1 && !singleOrgActivationFailed && (
        <div className="flex flex-col items-center gap-2 text-center">
          <Building2 className="text-muted-foreground size-8" />
          <p className="text-muted-foreground text-sm">Opening your workspace…</p>
        </div>
      )}
      {(showMultiOrgChooser || (orgCount === 1 && singleOrgActivationFailed)) && (
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Building2 className="size-5" />
              <span className="text-sm font-medium">Choose workspace</span>
            </div>
            <CardTitle>Select an organization</CardTitle>
            <CardDescription>
              Pick one to continue, or we will remember your choice for next time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {organizations!.map((org) => (
              <Button
                key={org.id}
                variant="outline"
                className="h-auto w-full justify-start py-3 text-left"
                disabled={activatingId !== null}
                onClick={() => void handleSelect(org.id)}
              >
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">{org.name}</span>
                  <span className="text-muted-foreground text-xs">{org.slug ?? org.id}</span>
                </span>
                {activatingId === org.id && (
                  <span className="text-muted-foreground ml-auto text-xs">…</span>
                )}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
