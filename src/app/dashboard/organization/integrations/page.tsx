"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Plug, PlugZap } from "lucide-react";
import { FeedbackState, FeedbackRetryActions } from "@/components/feedback/feedback-state";
import { DashboardLayout } from "@/layouts/dashboard/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "@/lib/toast";
import {
  useConnectLinear,
  useDisconnectIntegration,
  useIntegrations,
  useVerifyIntegration,
} from "@/hooks/use-integrations";
import type { IntegrationListItem } from "@/api/integrations.api";

function statusBadgeVariant(status: IntegrationListItem["status"]) {
  if (status === "active") {
    return "default" as const;
  }
  if (status === "error") {
    return "destructive" as const;
  }
  if (status === "disconnected") {
    return "secondary" as const;
  }
  return "outline" as const;
}

export default function OrganizationIntegrationsPage() {
  const { data: activeMemberRole } = authClient.useActiveMemberRole();
  const isOrgAdmin = activeMemberRole?.role === "owner" || activeMemberRole?.role === "admin";

  const { data, isLoading, isError, refetch } = useIntegrations();
  const [linearPat, setLinearPat] = useState("");

  const connectLinearMutation = useConnectLinear({
    onSuccess: () => {
      toast.success("Linear connected");
      setLinearPat("");
    },
    onError: (err) => {
      toast.error(err.message || "Could not connect Linear");
    },
  });

  const disconnect = useDisconnectIntegration({
    onSuccess: () => toast.success("Integration disconnected"),
    onError: (err) => toast.error(err.message || "Disconnect failed"),
  });

  const verify = useVerifyIntegration({
    onSuccess: () => toast.success("Connection verified"),
    onError: (err) => toast.error(err.message || "Verify failed"),
  });

  const connections = data?.connections ?? [];

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" className="w-fit gap-2 px-0 text-muted-foreground" asChild>
            <Link href="/dashboard/organization">
              <ArrowLeft className="size-4" />
              Back to organization
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Plug className="size-6" />
            <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Connect third-party tools for your active organization. Tokens are stored encrypted on the server; only
            organization owners and admins can connect or disconnect. After connecting Linear, open a project and use
            Linear in the sidebar to link and sync tasks.
          </p>
        </div>

        {isLoading ? (
          <FeedbackState
            variant="loading"
            icon={PlugZap}
            title="Loading integrations"
            description="Fetching connection status for your organization."
          />
        ) : isError ? (
          <FeedbackState
            variant="error"
            icon={Plug}
            title="Could not load integrations"
            description="Make sure you have an active organization selected, then try again."
            actions={
              <FeedbackRetryActions
                onRetry={() => void refetch()}
                secondaryAction={
                  <Button type="button" variant="outline" size="sm" asChild>
                    <Link href="/dashboard/organization/select">Choose organization</Link>
                  </Button>
                }
              />
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {connections.map((c) => (
              <Card key={c.provider}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <CardTitle>{c.displayName}</CardTitle>
                      <CardDescription>{c.description}</CardDescription>
                    </div>
                    <Badge variant={statusBadgeVariant(c.status)}>
                      {c.status === null ? "Not connected" : c.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    Auth: {c.authModes.join(", ")}
                    {c.connectImplemented ? "" : " · Connect flow not available yet"}
                  </p>
                  {c.lastError ? (
                    <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-destructive">
                      {c.lastError}
                    </p>
                  ) : null}
                  {c.lastVerifiedAt ? (
                    <p className="text-xs text-muted-foreground">
                      Last verified: {new Date(c.lastVerifiedAt).toLocaleString()}
                    </p>
                  ) : null}

                  {c.provider === "linear" && isOrgAdmin && c.connectImplemented ? (
                    <div className="space-y-2 pt-2">
                      <Label htmlFor={`linear-pat-${c.provider}`}>Personal API token</Label>
                      <Input
                        id={`linear-pat-${c.provider}`}
                        type="password"
                        autoComplete="off"
                        placeholder="lin_api_…"
                        value={linearPat}
                        onChange={(e) => setLinearPat(e.target.value)}
                        disabled={connectLinearMutation.isPending}
                      />
                    </div>
                  ) : null}
                </CardContent>
                {isOrgAdmin ? (
                  <CardFooter className="flex flex-wrap gap-2 border-t bg-muted/30">
                    {c.provider === "linear" && c.connectImplemented ? (
                      <Button
                        type="button"
                        disabled={connectLinearMutation.isPending || !linearPat.trim()}
                        onClick={() => connectLinearMutation.mutate({ pat: linearPat.trim() })}
                      >
                        {c.status ? "Update token" : "Connect"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {c.connectImplemented ? "" : "This connector is not available yet."}
                      </span>
                    )}
                    {c.status ? (
                      <>
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={verify.isPending}
                          onClick={() => verify.mutate({ provider: c.provider })}
                        >
                          Verify
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={disconnect.isPending}
                          onClick={() => disconnect.mutate({ provider: c.provider })}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : null}
                  </CardFooter>
                ) : (
                  <CardFooter className="border-t bg-muted/20 text-xs text-muted-foreground">
                    Only organization owners and admins can manage connections.
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
