"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, ExternalLink, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RepositoryCodeBrowser } from "@/components/repositories/repository-code-browser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getGithubIntegrationErrorCode, GITHUB_INTEGRATION_CODES } from "@/api/repositories.api";
import {
  useProjectRepositoryDetail,
  useRefreshProjectRepository,
  useRepositoryCommits,
  useRepositoryContributors,
  useRepositoryIssues,
  useRepositoryPulls,
  useUnlinkProjectRepository,
} from "@/hooks/use-repositories";
import { useProjectRole } from "@/hooks/use-projects";
import { toast } from "@/lib/toast";
import { cn } from "@/utils/cn";

type TabKey = "overview" | "code" | "commits" | "contributors" | "pulls" | "issues";

function TableLoadingSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-16 shrink-0" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-28 shrink-0" />
        </div>
      ))}
    </div>
  );
}

function ListLoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

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

type ProjectRepositoryDetailLayoutProps = {
  projectId: string;
  repositoryId: string;
};

export function ProjectRepositoryDetailLayout({ projectId, repositoryId }: ProjectRepositoryDetailLayoutProps) {
  const router = useRouter();
  const { data: role } = useProjectRole(projectId);
  const canManage = role?.role === "owner" || role?.role === "admin";

  const [tab, setTab] = useState<TabKey>("overview");
  const [commitPage, setCommitPage] = useState(1);

  const detailQuery = useProjectRepositoryDetail(projectId, repositoryId);
  const refreshRepo = useRefreshProjectRepository(projectId);
  const unlinkRepo = useUnlinkProjectRepository(projectId);

  const commitsQuery = useRepositoryCommits(projectId, repositoryId, { page: commitPage, perPage: 20 });

  const contributorsQuery = useRepositoryContributors(projectId, repositoryId, {
    enabled: tab === "contributors",
  });

  const pullsQuery = useRepositoryPulls(projectId, repositoryId, { state: "open", page: 1, perPage: 30 }, {
    enabled: tab === "pulls",
  });

  const issuesQuery = useRepositoryIssues(projectId, repositoryId, { state: "open", page: 1, perPage: 30 }, {
    enabled: tab === "issues",
  });

  const detail = detailQuery.data;
  const display = detail?.live ?? detail;

  const tabButtons: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "code", label: "Code" },
    { key: "commits", label: "Commits" },
    { key: "contributors", label: "Contributors" },
    { key: "pulls", label: "Pull requests" },
    { key: "issues", label: "Issues" },
  ];

  const githubAlert =
    detailQuery.isError &&
    getGithubIntegrationErrorCode(detailQuery.error) === GITHUB_INTEGRATION_CODES.NOT_LINKED;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="shrink-0 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          {detailQuery.isPending ? (
            <>
              <Skeleton className="h-7 w-[min(100%,20rem)]" />
              <Skeleton className="h-4 w-48" />
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-semibold tracking-tight">{detail?.fullName ?? "Repository"}</h2>
                {display ? (
                  <Badge
                    variant="outline"
                    className={cn("capitalize", visibilityBadgeClass(display.visibility))}
                  >
                    {display.visibility}
                  </Badge>
                ) : null}
              </div>
              {detail?.description ? (
                <p className="text-muted-foreground max-w-2xl text-sm">{detail.description}</p>
              ) : null}
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {display ? (
            <Button variant="outline" size="sm" className="gap-1" asChild>
              <a href={display.htmlUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-3.5" />
                Open on GitHub
              </a>
            </Button>
          ) : null}
          {canManage ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1"
                disabled={refreshRepo.isPending}
                onClick={() => {
                  void (async () => {
                    try {
                      await refreshRepo.mutateAsync(repositoryId);
                      toast.success("Repository metadata refreshed");
                      await detailQuery.refetch();
                    } catch (err) {
                      const code = getGithubIntegrationErrorCode(err);
                      if (code === GITHUB_INTEGRATION_CODES.NOT_LINKED) {
                        toast.error("Connect GitHub under Account → Preferences.");
                      } else {
                        toast.error(err instanceof Error ? err.message : "Refresh failed");
                      }
                    }
                  })();
                }}
              >
                {refreshRepo.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                Refresh
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive gap-1"
                disabled={unlinkRepo.isPending}
                onClick={() => {
                  void (async () => {
                    try {
                      await unlinkRepo.mutateAsync(repositoryId);
                      toast.success("Repository unlinked");
                      router.push(`/dashboard/projects/${projectId}/repositories`);
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Could not unlink");
                    }
                  })();
                }}
              >
                <Trash2 className="size-3.5" />
                Unlink
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {githubAlert ? (
        <div
          className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            Connect GitHub under{" "}
            <Link href="/account/preferences" className="font-medium underline underline-offset-4">
              Account → Preferences
            </Link>{" "}
            to load live repository data (commits, PRs, issues). Cached info may still appear above.
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-muted/20 p-1">
        {tabButtons.map((b) => (
          <Button
            key={b.key}
            type="button"
            size="sm"
            variant={tab === b.key ? "secondary" : "ghost"}
            className="h-8"
            onClick={() => {
              setTab(b.key);
              if (b.key === "commits") setCommitPage(1);
            }}
          >
            {b.label}
          </Button>
        ))}
      </div>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">

      {tab === "overview" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Repository details</CardTitle>
            <CardDescription>
              {detail?.live
                ? "Merged from your cached link and a live GitHub snapshot."
                : "Showing cached metadata. Connect GitHub for live refresh."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Full name</dt>
                <dd className="font-medium">{display?.fullName ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Default branch</dt>
                <dd className="font-medium">{display?.defaultBranch ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Stars</dt>
                <dd className="font-medium">{display?.stargazersCount ?? "—"}</dd>
              </div>
            </dl>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Last push</dt>
                <dd className="font-medium">
                  {display?.pushedAt
                    ? formatDistanceToNow(new Date(display.pushedAt), { addSuffix: true })
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Cached at</dt>
                <dd className="text-muted-foreground text-xs">
                  {detail?.cachedAt ? new Date(detail.cachedAt).toLocaleString() : "—"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : null}

      {tab === "code" ? (
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <RepositoryCodeBrowser projectId={projectId} repositoryId={repositoryId} />
        </div>
      ) : null}

      {tab === "commits" ? (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">Recent commits</CardTitle>
              <CardDescription>Branch: {detail?.defaultBranch ?? "default"}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={commitPage <= 1 || commitsQuery.isPending}
                onClick={() => setCommitPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={commitsQuery.isPending || (commitsQuery.data?.length ?? 0) < 20}
                onClick={() => setCommitPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {commitsQuery.isPending ? (
              <TableLoadingSkeleton rows={10} />
            ) : commitsQuery.isError ? (
              <p className="text-destructive text-sm">
                {getGithubIntegrationErrorCode(commitsQuery.error) === GITHUB_INTEGRATION_CODES.NOT_LINKED ? (
                  <>
                    Connect GitHub under{" "}
                    <Link href="/account/preferences" className="underline">
                      Account → Preferences
                    </Link>
                    .
                  </>
                ) : (
                  (commitsQuery.error as Error).message
                )}
              </p>
            ) : !commitsQuery.data?.length ? (
              <p className="text-muted-foreground text-sm">No commits found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[7rem]">SHA</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="w-[10rem]">When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commitsQuery.data.map((c) => (
                    <TableRow key={c.sha}>
                      <TableCell className="font-mono text-xs">
                        <a
                          className="text-primary hover:underline"
                          href={c.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {c.sha.slice(0, 7)}
                        </a>
                      </TableCell>
                      <TableCell className="max-w-[min(100vw,28rem)] truncate">{c.message}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {c.committedAt
                          ? formatDistanceToNow(new Date(c.committedAt), { addSuffix: true })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : null}

      {tab === "contributors" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contributors</CardTitle>
            <CardDescription>Top contributors by commit count (GitHub API).</CardDescription>
          </CardHeader>
          <CardContent>
            {contributorsQuery.isPending ? (
              <ListLoadingSkeleton rows={8} />
            ) : contributorsQuery.isError ? (
              <p className="text-destructive text-sm">
                {getGithubIntegrationErrorCode(contributorsQuery.error) === GITHUB_INTEGRATION_CODES.NOT_LINKED ? (
                  <>
                    Connect GitHub under{" "}
                    <Link href="/account/preferences" className="underline">
                      Account → Preferences
                    </Link>
                    .
                  </>
                ) : (
                  (contributorsQuery.error as Error).message
                )}
              </p>
            ) : !contributorsQuery.data?.length ? (
              <p className="text-muted-foreground text-sm">No contributors returned.</p>
            ) : (
              <ul className="space-y-3">
                {contributorsQuery.data.map((c) => (
                  <li key={c.login} className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={c.avatarUrl} alt="" />
                      <AvatarFallback>{c.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <a
                        href={c.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:underline"
                      >
                        {c.login}
                      </a>
                      <p className="text-muted-foreground text-xs">{c.contributions} commits</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}

      {tab === "pulls" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Open pull requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pullsQuery.isPending ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-border/60 p-3">
                    <Skeleton className="h-4 w-[70%]" />
                    <div className="mt-2 flex items-center gap-2">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3.5 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pullsQuery.isError ? (
              <p className="text-destructive text-sm">
                {getGithubIntegrationErrorCode(pullsQuery.error) === GITHUB_INTEGRATION_CODES.NOT_LINKED ? (
                  <>
                    Connect GitHub under{" "}
                    <Link href="/account/preferences" className="underline">
                      Account → Preferences
                    </Link>
                    .
                  </>
                ) : (
                  (pullsQuery.error as Error).message
                )}
              </p>
            ) : !pullsQuery.data?.length ? (
              <p className="text-muted-foreground text-sm">No open pull requests.</p>
            ) : (
              pullsQuery.data.map((pr) => (
                <div
                  key={pr.number}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border/60 p-3"
                >
                  <div className="min-w-0 space-y-1">
                    <a href={pr.htmlUrl} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                      #{pr.number} {pr.title}
                    </a>
                    <p className="text-muted-foreground text-xs">
                      {pr.authorLogin ?? "unknown"} ·{" "}
                      {formatDistanceToNow(new Date(pr.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {pr.draft ? <Badge variant="secondary">Draft</Badge> : null}
                    <Badge variant="outline" className="capitalize">
                      {pr.state}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}

      {tab === "issues" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Open issues</CardTitle>
            <CardDescription>Pull requests are excluded.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {issuesQuery.isPending ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-border/60 p-3">
                    <Skeleton className="h-4 w-[65%]" />
                    <div className="mt-2 flex items-center gap-2">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3.5 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : issuesQuery.isError ? (
              <p className="text-destructive text-sm">
                {getGithubIntegrationErrorCode(issuesQuery.error) === GITHUB_INTEGRATION_CODES.NOT_LINKED ? (
                  <>
                    Connect GitHub under{" "}
                    <Link href="/account/preferences" className="underline">
                      Account → Preferences
                    </Link>
                    .
                  </>
                ) : (
                  (issuesQuery.error as Error).message
                )}
              </p>
            ) : !issuesQuery.data?.length ? (
              <p className="text-muted-foreground text-sm">No open issues.</p>
            ) : (
              issuesQuery.data.map((issue) => (
                <div
                  key={issue.number}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border/60 p-3"
                >
                  <div className="min-w-0 space-y-1">
                    <a
                      href={issue.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium hover:underline"
                    >
                      #{issue.number} {issue.title}
                    </a>
                    <p className="text-muted-foreground text-xs">
                      {issue.authorLogin ?? "unknown"} ·{" "}
                      {formatDistanceToNow(new Date(issue.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {issue.state}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}

      </div>
    </div>
  );
}
