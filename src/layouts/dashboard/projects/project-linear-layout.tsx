"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Clock,
  Link2,
  Loader2,
  Unlink,
} from "lucide-react";
import { LinearSyncActions } from "@/components/linear/linear-sync-actions";
import { LinearSyncHistory } from "@/components/linear/linear-sync-history";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { useProjectRole } from "@/hooks/use-projects";
import {
  useLinearExport,
  useLinearImport,
  useLinearProjectStatus,
  useLinearProjects,
  useLinearSync,
  useLinearTeams,
  useLinkLinearProject,
  useUnlinkLinearProject,
  useUpdateLinearSettings,
} from "@/hooks/use-linear-sync";

type ProjectLinearLayoutProps = {
  projectId: string;
};

function syncStatusVariant(status: string | undefined) {
  if (status === "idle") return "default" as const;
  if (status === "syncing") return "secondary" as const;
  if (status === "error") return "destructive" as const;
  return "outline" as const;
}

export function ProjectLinearLayout({ projectId }: ProjectLinearLayoutProps) {
  const { data: role } = useProjectRole(projectId);
  const canManage = role?.role === "owner" || role?.role === "admin";

  const { data: status, isLoading: statusLoading, isError: statusError } =
    useLinearProjectStatus(projectId);
  const linearConnected = status?.linearConnected ?? false;
  const mapping = status?.mapping;
  const isSyncing = mapping?.syncStatus === "syncing";

  const [teamId, setTeamId] = useState(mapping?.linearTeamId ?? "");
  const [linearProjectId, setLinearProjectId] = useState(mapping?.linearProjectId ?? "");

  const teamsQuery = useLinearTeams(linearConnected && canManage);
  const projectsQuery = useLinearProjects(teamId, { enabled: Boolean(teamId) && linearConnected });

  const linkMutation = useLinkLinearProject(projectId, {
    onSuccess: () => toast.success("Linear project linked"),
    onError: (err) => toast.error(err.message || "Could not link Linear project"),
  });

  const unlinkMutation = useUnlinkLinearProject(projectId, {
    onSuccess: () => {
      toast.success("Linear project unlinked");
      setTeamId("");
      setLinearProjectId("");
    },
    onError: (err) => toast.error(err.message || "Could not unlink"),
  });

  const settingsMutation = useUpdateLinearSettings(projectId);

  const importMutation = useLinearImport(projectId);
  const exportMutation = useLinearExport(projectId);
  const syncMutation = useLinearSync(projectId);
  const anySyncPending =
    isSyncing ||
    importMutation.isPending ||
    exportMutation.isPending ||
    syncMutation.isPending;

  if (statusLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-auto pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
              <Link2 className="size-4" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Linear integration</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Keep tasks in sync with a Linear project. Connect your organization under{" "}
            <Link
              href="/dashboard/organization/integrations"
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              Organization integrations
            </Link>
            , then link a team and project below.
          </p>
        </div>
        {mapping && (
          <LinearSyncActions projectId={projectId} variant="stacked" className="shrink-0" />
        )}
      </div>

      {!linearConnected && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="text-destructive size-4" />
              Linear not connected
            </CardTitle>
            <CardDescription>
              Add a Linear personal access token at the organization level before linking this
              project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href="/dashboard/organization/integrations">
                Open integrations
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {statusError && (
        <Card className="border-destructive/30">
          <CardContent className="pt-6 text-sm text-destructive">
            Could not load Linear status.
          </CardContent>
        </Card>
      )}

      {linearConnected && (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project link</CardTitle>
                <CardDescription>
                  {mapping
                    ? "This Ragnarock project is connected to a Linear project."
                    : "Choose a Linear team and project to enable sync."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mapping ? (
                  <>
                    <div className="rounded-lg border border-border/70 bg-muted/25 p-4">
                      <p className="text-sm font-medium">
                        {mapping.linearProjectName ?? mapping.linearProjectId}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant={syncStatusVariant(mapping.syncStatus)}>
                          {mapping.syncStatus === "syncing" && (
                            <Loader2 className="mr-1 size-3 animate-spin" />
                          )}
                          {mapping.syncStatus}
                        </Badge>
                        {mapping.lastSyncAt && (
                          <span className="text-muted-foreground flex items-center gap-1 text-xs">
                            <Clock className="size-3" />
                            {new Date(mapping.lastSyncAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {mapping.lastSyncError && (
                        <p className="text-destructive mt-3 text-sm">{mapping.lastSyncError}</p>
                      )}
                    </div>
                    <div className="text-muted-foreground grid gap-2 text-xs sm:grid-cols-2">
                      <div className="rounded-md border border-border/50 px-3 py-2">
                        <span className="text-foreground font-medium">Last import</span>
                        <p className="mt-0.5">
                          {mapping.lastImportAt
                            ? new Date(mapping.lastImportAt).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                      <div className="rounded-md border border-border/50 px-3 py-2">
                        <span className="text-foreground font-medium">Last export</span>
                        <p className="mt-0.5">
                          {mapping.lastExportAt
                            ? new Date(mapping.lastExportAt).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  canManage && (
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label>Team</Label>
                        <Select value={teamId} onValueChange={setTeamId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            {(teamsQuery.data?.teams ?? []).map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Linear project</Label>
                        <Select
                          value={linearProjectId}
                          onValueChange={setLinearProjectId}
                          disabled={!teamId}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={teamId ? "Select project" : "Select a team first"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {(projectsQuery.data?.projects ?? []).map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )
                )}
              </CardContent>
              {canManage && (
                <>
                  <Separator />
                  <CardContent className="pt-0">
                    {mapping ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => unlinkMutation.mutate()}
                        disabled={unlinkMutation.isPending || anySyncPending}
                      >
                        <Unlink className="size-3.5" />
                        Unlink project
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() =>
                          linkMutation.mutate({
                            linearTeamId: teamId,
                            linearProjectId,
                          })
                        }
                        disabled={
                          !teamId || !linearProjectId || linkMutation.isPending || anySyncPending
                        }
                      >
                        Link Linear project
                      </Button>
                    )}
                  </CardContent>
                </>
              )}
            </Card>

            {mapping && canManage && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Automatic sync</CardTitle>
                  <CardDescription>Keep this project in sync with Linear on a schedule.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-4">
                    <Checkbox
                      id="auto-sync"
                      checked={mapping.autoSyncEnabled}
                      onCheckedChange={(checked) =>
                        settingsMutation.mutate(
                          { autoSyncEnabled: checked === true },
                          {
                            onSuccess: () =>
                              toast.success(
                                checked ? "Automatic sync enabled" : "Automatic sync disabled",
                              ),
                            onError: (err) =>
                              toast.error(err.message || "Could not update settings"),
                          },
                        )
                      }
                      disabled={settingsMutation.isPending || anySyncPending}
                    />
                    <Label htmlFor="auto-sync" className="text-sm font-medium leading-none">
                      Enable automatic sync
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-3">
            {mapping ? (
              <LinearSyncHistory projectId={projectId} className="h-full" />
            ) : (
              <Card className="border-dashed">
                <CardContent className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-16 text-center text-sm">
                  <Link2 className="size-8 opacity-40" />
                  <p className="max-w-sm">
                    Link a Linear project to see sync history and run import/export from this page
                    or the Tasks board.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
