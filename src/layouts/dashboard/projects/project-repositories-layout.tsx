"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, FolderGit2, GitBranch, Loader2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getGithubIntegrationErrorCode,
  GITHUB_INTEGRATION_CODES,
  isGithubNotLinkedError,
} from "@/api/repositories.api";
import {
  useGithubRepoSearch,
  useLinkProjectRepository,
  useProjectRepositories,
  useUnlinkProjectRepository,
} from "@/hooks/use-repositories";
import { useProjectRole } from "@/hooks/use-projects";
import { toast } from "@/lib/toast";
import { cn } from "@/utils/cn";

const SEARCH_DEBOUNCE_MS = 350;

function visibilityBadgeClass(visibility: string) {
  switch (visibility) {
    case "public":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    case "private":
      return "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300";
    default:
      return "";
  }
}

function formatPushedAt(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

type ProjectRepositoriesLayoutProps = {
  projectId: string;
};

export function ProjectRepositoriesLayout({ projectId }: ProjectRepositoriesLayoutProps) {
  const { data: role } = useProjectRole(projectId);
  const canManage = role?.role === "owner" || role?.role === "admin";

  const {
    data: repos,
    isPending,
    isError,
    error,
    refetch,
  } = useProjectRepositories(projectId);

  const linkRepo = useLinkProjectRepository(projectId);
  const unlinkRepo = useUnlinkProjectRepository(projectId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"search" | "manual">("search");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [owner, setOwner] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  const searchParams = useMemo(
    () => ({ q: debouncedSearch || undefined, page: 1, perPage: 20 }),
    [debouncedSearch],
  );

  const githubSearch = useGithubRepoSearch(searchParams, {
    enabled: dialogOpen && mode === "search",
    retry: false,
  });

  const handleDialogOpenChange = (next: boolean) => {
    setDialogOpen(next);
    if (!next) {
      setSearchInput("");
      setDebouncedSearch("");
      setOwner("");
      setName("");
      setMode("search");
    }
  };

  const onLinkManual = async () => {
    const o = owner.trim();
    const n = name.trim();
    if (!o || !n) {
      toast.error("Enter owner and repository name");
      return;
    }
    try {
      await linkRepo.mutateAsync({ owner: o, name: n });
      toast.success("Repository linked");
      setDialogOpen(false);
    } catch (err) {
      const code = getGithubIntegrationErrorCode(err);
      if (code === GITHUB_INTEGRATION_CODES.NOT_LINKED) {
        toast.error("Connect GitHub under Account → Preferences, then try again.");
      } else {
        toast.error(err instanceof Error ? err.message : "Could not link repository");
      }
    }
  };

  const onLinkFromSearch = async (fullName: string) => {
    const [o, ...rest] = fullName.split("/");
    const repoName = rest.join("/");
    if (!o || !repoName) {
      toast.error("Invalid repository");
      return;
    }
    try {
      await linkRepo.mutateAsync({ owner: o, name: repoName });
      toast.success("Repository linked");
      setDialogOpen(false);
    } catch (err) {
      const code = getGithubIntegrationErrorCode(err);
      if (code === GITHUB_INTEGRATION_CODES.NOT_LINKED) {
        toast.error("Connect GitHub under Account → Preferences, then try again.");
      } else {
        toast.error(err instanceof Error ? err.message : "Could not link repository");
      }
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Repositories</h2>
          <p className="text-muted-foreground max-w-xl text-sm">
            Link GitHub repositories to this project to browse commits, contributors, pull requests, and issues.
          </p>
        </div>
        {canManage ? (
          <Button type="button" size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Link repository
          </Button>
        ) : null}
      </div>

      <div
        className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm leading-snug text-muted-foreground"
        role="note"
      >
        <span className="text-foreground font-medium">GitHub access:</span> linking and live data use your personal
        GitHub connection. Connect GitHub under{" "}
        <Link href="/account/preferences" className="text-primary font-medium underline-offset-4 hover:underline">
          Account → Preferences
        </Link>
        .
      </div>

      {isError ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Could not load linked repositories</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : "Something went wrong."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="p-0 sm:max-w-xl">
          <div className="space-y-5 p-6">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base sm:text-lg">Link a GitHub repository</DialogTitle>
              <DialogDescription className="text-sm">
                Choose a repository you can access with your GitHub account, or enter owner/name manually.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border bg-muted/30 p-1">
              <div className="grid grid-cols-2 gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant={mode === "search" ? "secondary" : "ghost"}
                  className={cn("h-9 justify-center", mode === "search" ? "shadow-sm" : "opacity-80")}
                  onClick={() => setMode("search")}
                >
                  Search my repos
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={mode === "manual" ? "secondary" : "ghost"}
                  className={cn("h-9 justify-center", mode === "manual" ? "shadow-sm" : "opacity-80")}
                  onClick={() => setMode("manual")}
                >
                  Owner / name
                </Button>
              </div>
            </div>

            {mode === "search" ? (
              <div className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="repo-search">Filter</FieldLabel>
                  <Input
                    id="repo-search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Type to filter repositories…"
                    autoComplete="off"
                    className="h-10"
                  />
                  <FieldDescription>Uses GitHub search over repositories you can access.</FieldDescription>
                </Field>

                {githubSearch.isError ? (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {isGithubNotLinkedError(githubSearch.error) ? (
                      <>
                        Connect GitHub under{" "}
                        <Link href="/account/preferences" className="font-medium underline underline-offset-4">
                          Account → Preferences
                        </Link>
                        .
                      </>
                    ) : (
                      githubSearch.error instanceof Error
                        ? githubSearch.error.message
                        : "Could not search repositories."
                    )}
                  </div>
                ) : null}

                <div className="max-h-64 overflow-y-auto rounded-lg border bg-background">
                  <div className="space-y-0 p-1.5">
                    {githubSearch.isPending ? (
                      <div className="space-y-2 p-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="space-y-1">
                            <Skeleton className="h-4 w-[75%]" />
                            <Skeleton className="h-3.5 w-full" />
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {!githubSearch.isPending &&
                      (githubSearch.data?.items.length ? (
                        githubSearch.data.items.map((item) => (
                          <button
                            key={item.githubRepoId}
                            type="button"
                            className={cn(
                              "group flex w-full flex-col items-start gap-0.5 rounded-md border border-transparent px-3 py-2.5 text-left text-sm transition-colors",
                              "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                              "disabled:opacity-60",
                            )}
                            onClick={() => void onLinkFromSearch(item.fullName)}
                            disabled={linkRepo.isPending}
                          >
                            <span className="font-medium group-hover:text-foreground">{item.fullName}</span>
                            {item.description ? (
                              <span className="text-muted-foreground line-clamp-2 text-xs leading-snug">
                                {item.description}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">No description</span>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="text-muted-foreground p-4 text-sm">No repositories match your filter.</div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border bg-background p-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                    <Field>
                      <FieldLabel htmlFor="repo-owner">Owner</FieldLabel>
                      <Input
                        id="repo-owner"
                        value={owner}
                        onChange={(e) => setOwner(e.target.value)}
                        placeholder="e.g. octocat"
                        autoComplete="off"
                        className="h-10"
                      />
                    </Field>
                    <div className="text-muted-foreground hidden select-none pb-2 text-center text-sm sm:block">/</div>
                    <Field>
                      <FieldLabel htmlFor="repo-name">Repository name</FieldLabel>
                      <Input
                        id="repo-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Hello-World"
                        autoComplete="off"
                        className="h-10"
                      />
                    </Field>
                  </div>
                  <div className="text-muted-foreground mt-2 text-xs">
                    Example: <span className="font-medium">vercel/next.js</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t bg-muted/20 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            {mode === "manual" ? (
              <Button type="button" onClick={() => void onLinkManual()} disabled={linkRepo.isPending}>
                {linkRepo.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Linking…
                  </>
                ) : (
                  "Link repository"
                )}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isPending ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : null}

      {!isPending && !isError && Array.isArray(repos) && repos.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No repositories linked</CardTitle>
            <CardDescription>
              {canManage
                ? "Link a GitHub repository to see activity, commits, and contributors here."
                : "Ask a project admin to link a GitHub repository."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {!isPending && Array.isArray(repos) && repos.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {repos.map((repo) => (
            <Card key={repo.id} className="flex flex-col overflow-hidden">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <FolderGit2 className="text-muted-foreground size-4 shrink-0" />
                    <CardTitle className="truncate text-base leading-tight">
                      <Link
                        href={`/dashboard/projects/${projectId}/repositories/${repo.id}`}
                        className="hover:text-primary underline-offset-4 hover:underline"
                      >
                        {repo.fullName}
                      </Link>
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0 capitalize", visibilityBadgeClass(repo.visibility))}>
                    {repo.visibility}
                  </Badge>
                </div>
                {repo.description ? (
                  <CardDescription className="line-clamp-2">{repo.description}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="mt-auto space-y-3 pt-0">
                <dl className="text-muted-foreground grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                  <dt>Default branch</dt>
                  <dd className="text-foreground text-right font-medium">{repo.defaultBranch}</dd>
                  <dt>Stars</dt>
                  <dd className="text-foreground text-right font-medium">{repo.stargazersCount}</dd>
                  <dt>Last push</dt>
                  <dd className="text-foreground text-right font-medium">{formatPushedAt(repo.pushedAt)}</dd>
                </dl>
                <Separator />
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <a href={repo.htmlUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-3.5" />
                      GitHub
                    </a>
                  </Button>
                  <Button variant="secondary" size="sm" className="gap-1" asChild>
                    <Link href={`/dashboard/projects/${projectId}/repositories/${repo.id}`}>
                      <GitBranch className="size-3.5" />
                      Open
                    </Link>
                  </Button>
                  {canManage ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive ml-auto gap-1"
                      disabled={unlinkRepo.isPending}
                      onClick={() => {
                        void (async () => {
                          try {
                            await unlinkRepo.mutateAsync(repo.id);
                            toast.success("Repository unlinked");
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Could not unlink");
                          }
                        })();
                      }}
                    >
                      <Trash2 className="size-3.5" />
                      Unlink
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
