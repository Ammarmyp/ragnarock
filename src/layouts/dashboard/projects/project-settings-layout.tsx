"use client";

import * as React from "react";
import { format } from "date-fns";
import { Copy, Eye, EyeOff, Key, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useProjectApiKeys,
  useCreateProjectApiKey,
  useRevokeProjectApiKey,
} from "@/hooks/use-projects";
import type { ProjectApiKey } from "@/api/projects.api";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={copy}>
      <Copy className="h-3.5 w-3.5" />
      <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}

function NewTokenBanner({ token }: { token: string }) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
      <p className="mb-2 text-sm font-medium text-green-800 dark:text-green-200">
        API key created — copy it now. It will not be shown again.
      </p>
      <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 font-mono text-sm">
        <span className="flex-1 truncate">
          {visible ? token : token.replace(/./g, "•")}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
        <CopyButton value={token} />
      </div>
    </div>
  );
}

function CreateKeyDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [newToken, setNewToken] = React.useState<string | null>(null);

  const createMutation = useCreateProjectApiKey(projectId);

  const handleCreate = () => {
    if (!name.trim()) return;
    createMutation.mutate(
      { name: name.trim() },
      {
        onSuccess: (data) => {
          setNewToken(data.rawToken);
          setName("");
        },
      },
    );
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setNewToken(null);
      setName("");
    }
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          New API key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create API key</DialogTitle>
          <DialogDescription>
            Give this key a descriptive name so you remember where it&apos;s used.
          </DialogDescription>
        </DialogHeader>

        {newToken ? (
          <div className="space-y-4">
            <NewTokenBanner token={newToken} />
            <p className="text-sm text-muted-foreground">
              Add it to your{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">.claude/settings.json</code>:
            </p>
            <pre className="overflow-x-auto rounded-lg border bg-muted p-3 text-xs">
              {JSON.stringify(
                {
                  mcpServers: {
                    ragnarock: {
                      type: "http",
                      url: `${process.env.NEXT_PUBLIC_MCP_URL ?? "http://localhost:8002"}/mcp`,
                      headers: { "x-ragnarock-key": newToken },
                    },
                  },
                },
                null,
                2,
              )}
            </pre>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key name</Label>
              <Input
                id="key-name"
                placeholder="e.g. Claude Code — local dev"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {newToken ? (
            <Button onClick={() => handleOpenChange(false)}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                )}
                Create
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ApiKeyRow({ apiKey, projectId }: { apiKey: ProjectApiKey; projectId: string }) {
  const revokeMutation = useRevokeProjectApiKey(projectId);
  const isExpired = apiKey.expiresAt ? new Date(apiKey.expiresAt) < new Date() : false;

  return (
    <div className="flex items-center gap-4 py-3">
      <Key className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{apiKey.name}</span>
          {isExpired && (
            <Badge variant="destructive" className="text-xs">
              Expired
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Created {format(new Date(apiKey.createdAt), "MMM d, yyyy")}</span>
          {apiKey.lastUsedAt ? (
            <span>Last used {format(new Date(apiKey.lastUsedAt), "MMM d, yyyy")}</span>
          ) : (
            <span>Never used</span>
          )}
          {apiKey.expiresAt && !isExpired && (
            <span>Expires {format(new Date(apiKey.expiresAt), "MMM d, yyyy")}</span>
          )}
        </div>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            disabled={revokeMutation.isPending}
          >
            {revokeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke &ldquo;{apiKey.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Any coding agent using this key will lose access immediately. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => revokeMutation.mutate(apiKey.id)}
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function ProjectSettingsLayout({ projectId }: { projectId: string }) {
  const { data: apiKeys, isLoading } = useProjectApiKeys(projectId);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Project settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage configuration and integrations for this project.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base">MCP API keys</CardTitle>
            <CardDescription className="mt-1">
              Keys used by coding agents (Claude Code, Cursor) to read project context via the MCP
              server. Each key is scoped to this project.
            </CardDescription>
          </div>
          <CreateKeyDialog projectId={projectId} />
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !apiKeys?.length ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Key className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium">No API keys yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Create a key and add it to your coding agent&apos;s MCP config to give it access to
                this project&apos;s requirements, tasks, and test cases.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {apiKeys.map((key) => (
                <ApiKeyRow key={key.id} apiKey={key} projectId={projectId} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
