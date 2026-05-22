"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardCopy,
  Database,
  FileText,
  FolderGit2,
  Gauge,
  GitBranch,
  Layers,
  ListChecks,
  MoreHorizontal,
  Server,
  Sparkles,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProjectOverviewResponse, ProjectRequirement } from "@/api/projects.api";
import { TASK_STATUS_LABELS } from "@/lib/task-labels";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const REQ_STATUS_LABEL: Record<ProjectRequirement["status"], string> = {
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
  implemented: "Implemented",
};

const REQ_STATUS_CLASS: Record<ProjectRequirement["status"], string> = {
  draft: "border-border bg-muted/60 text-muted-foreground",
  in_review: "border-sky-500/35 bg-sky-500/12 text-sky-700 dark:text-sky-300",
  approved: "border-primary/35 bg-primary/12 text-primary",
  implemented: "border-emerald-500/35 bg-emerald-500/12 text-emerald-800 dark:text-emerald-300",
};

function roleLabel(role: string) {
  return role.replace("_", " ");
}

function StatMini({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="border-border/60 bg-card/50 hover:bg-muted/25 flex gap-3 rounded-lg border p-3 transition-colors">
      <div className="bg-muted/50 text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md">
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">{label}</p>
        <p className="text-foreground truncate text-sm font-semibold">{value}</p>
        {sub ? <p className="text-muted-foreground truncate text-[11px]">{sub}</p> : null}
      </div>
    </div>
  );
}

function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("bg-muted h-2 w-full overflow-hidden rounded-full", className)}>
      <div
        className="from-primary to-primary/80 h-full rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function ProjectOverviewDashboard({
  projectId,
  data,
  isLoading,
}: {
  projectId: string;
  data: ProjectOverviewResponse | undefined;
  isLoading: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const base = `/dashboard/projects/${projectId}`;

  const projectUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${base}`;
  }, [base]);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(projectId);
      setCopied(true);
      toast.success("Project ID copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl || projectId);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  const { project, organization, team, stats, progress, highlights, activityByEntity, recentRequirements } = data;

  const statusBadge =
    project.status === "active"
      ? "default"
      : project.status === "completed"
        ? "secondary"
        : "outline";

  const lastDoc = highlights.lastDocumentationUpdateAt
    ? formatDistanceToNow(new Date(highlights.lastDocumentationUpdateAt), { addSuffix: true })
    : "—";

  const lastProj = formatDistanceToNow(new Date(highlights.lastProjectUpdateAt), { addSuffix: true });

  const taskEvents = activityByEntity.task ?? 0;
  const reqEvents = activityByEntity.requirement ?? 0;
  const docEvents = activityByEntity.documentation ?? 0;
  const projEvents = activityByEntity.project ?? 0;
  const totalEvents = stats.activitiesLast7Days;

  return (
    <div className="space-y-8 pb-10">
      {/* Header row — light-image style */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" asChild>
              <Link href="/dashboard/projects">
                <ArrowLeft className="mr-1 size-4" />
                Projects
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">{project.name}</h1>
            <Badge variant={statusBadge} className="capitalize">
              {project.status}
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest">
              Workspace
            </Badge>
          </div>
          {project.description ? (
            <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">{project.description}</p>
          ) : (
            <p className="text-muted-foreground text-sm italic">No description yet.</p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <code className="bg-muted/60 text-muted-foreground rounded-md px-2 py-1 font-mono text-[11px]">{projectUrl || base}</code>
            <Button type="button" variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={copyUrl}>
              <ClipboardCopy className="size-3.5" />
              Copy link
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="h-8 gap-0.5 px-2">
                  <ChevronDown className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={copyId}>{copied ? "Copied" : "Copy project ID"}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`${base}/tasks`}>
              <ListChecks className="mr-1.5 size-4" />
              Tasks
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`${base}/ragnarock`}>
              <FileText className="mr-1.5 size-4" />
              Requirements
            </Link>
          </Button>
          <Button size="sm" className="gap-1.5" asChild>
            <Link href={`${base}/documentation`}>
              <Sparkles className="size-4" />
              Docs
            </Link>
          </Button>
        </div>
      </div>

      {/* Top grid: system-style + primary workspace card */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-2 gap-3 lg:col-span-2">
          <StatMini icon={Gauge} label="Project status" value={project.status} sub="Workspace health" />
          <StatMini icon={Activity} label="Last update" value={lastProj} sub="Metadata & settings" />
          <StatMini icon={BookOpen} label="Documentation" value={lastDoc} sub="Latest doc change" />
          <StatMini icon={GitBranch} label="Activity (7d)" value={String(totalEvents)} sub="Audit trail events" />
        </div>
        <Card className="border-border/70 from-muted/20 via-card to-card relative overflow-hidden bg-gradient-to-br shadow-sm ring-1 ring-foreground/5">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "16px 16px",
            }}
          />
          <CardHeader className="relative pb-2">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Database className="size-4" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-base">Primary workspace</CardTitle>
                <CardDescription>Organization & project context</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">Organization</p>
              <p className="font-medium">{organization?.name ?? "—"}</p>
              {organization?.slug ? (
                <p className="text-muted-foreground font-mono text-xs">/{organization.slug}</p>
              ) : null}
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-xs">Project ID</span>
              <Button variant="ghost" size="sm" className="h-7 gap-1 font-mono text-[10px]" onClick={copyId}>
                {projectId.slice(0, 10)}…
                <ClipboardCopy className="size-3" />
              </Button>
            </div>
            <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span>
                <Server className="mr-1 inline size-3.5 opacity-70" />
                {stats.totalDocumentations} docs
              </span>
              <span>
                <Users className="mr-1 inline size-3.5 opacity-70" />
                {stats.memberCount} members
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI strip — second image */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Total requirements</CardTitle>
            <FileText className="text-primary size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{stats.totalRequirements}</p>
            <p className="text-muted-foreground text-xs">{stats.requirementsImplemented} implemented</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Tasks completed</CardTitle>
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {stats.tasksDone}/{stats.totalTasks || 0}
            </p>
            <p className="text-muted-foreground text-xs">Done vs total</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Team members</CardTitle>
            <Users className="text-primary size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{stats.memberCount}</p>
            <Button variant="link" className="h-auto px-0 py-0 text-xs" asChild>
              <Link href={`${base}/members`}>Manage</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">7-day activity</CardTitle>
            <Activity className="text-amber-600 dark:text-amber-400 size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{totalEvents}</p>
            <p className="text-muted-foreground text-xs">Events recorded</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Project progress</CardTitle>
            <CardDescription>Weighted from task completion</CardDescription>
          </div>
          <span className="text-primary text-2xl font-bold tabular-nums">{progress.taskCompletionPercent}%</span>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProgressBar value={progress.taskCompletionPercent} />
          <div className="text-muted-foreground flex flex-wrap justify-between gap-2 text-xs">
            <span>
              Started{" "}
              <span className="text-foreground font-medium">
                {new Date(project.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </span>
            </span>
            <span>
              Last activity{" "}
              <span className="text-foreground font-medium">
                {highlights.lastActivityAt
                  ? formatDistanceToNow(new Date(highlights.lastActivityAt), { addSuffix: true })
                  : "—"}
              </span>
            </span>
          </div>
          <div className="text-muted-foreground text-xs">
            Requirements completion:{" "}
            <span className="text-foreground font-semibold">{progress.requirementCompletionPercent}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Activity breakdown — Supabase-style metrics */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            {totalEvents} total events <span className="text-muted-foreground text-sm font-normal">· last 7 days</span>
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Task activity", value: taskEvents, icon: ListChecks },
            { label: "Requirement activity", value: reqEvents, icon: FileText },
            { label: "Documentation activity", value: docEvents, icon: Layers },
            { label: "Project activity", value: projEvents, icon: FolderGit2 },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="border-border/60">
              <CardHeader className="pb-2">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">{label}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="text-muted-foreground size-5" />
                  <span className="text-3xl font-bold tabular-nums">{value}</span>
                </div>
                <div className="bg-muted/40 h-8 w-full rounded-sm" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Two columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Requirements</CardTitle>
            <Button variant="link" className="text-primary h-auto px-0 text-sm" asChild>
              <Link href={`${base}/ragnarock`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentRequirements.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">No requirements yet.</p>
            ) : (
              recentRequirements.map((req) => (
                <div
                  key={req.id}
                  className="border-border/50 hover:bg-muted/30 flex items-start gap-3 rounded-lg border p-3 transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    {req.status === "implemented" ? (
                      <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <div className="border-primary/40 text-primary flex size-4 items-center justify-center rounded-full border-2 border-dashed text-[10px]">
                        ·
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-tight">{req.title}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Badge variant="outline" className={cn("text-[10px] font-normal", REQ_STATUS_CLASS[req.status])}>
                        {REQ_STATUS_LABEL[req.status]}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="size-8 shrink-0" asChild>
                    <Link href={`${base}/ragnarock`} aria-label="Open requirements">
                      <MoreHorizontal className="size-4" />
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Team</CardTitle>
            <Button variant="link" className="text-primary h-auto px-0 text-sm" asChild>
              <Link href={`${base}/members`}>Manage</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {team.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">No members.</p>
            ) : (
              team.map((m) => {
                const name = m.user?.name?.trim() || m.user?.email || m.userId;
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <Avatar className="border-border size-9 border">
                      {m.user?.image ? <AvatarImage src={m.user.image} alt="" /> : null}
                      <AvatarFallback className="text-xs">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{name}</p>
                      <p className="text-muted-foreground truncate text-xs capitalize">{roleLabel(m.role)}</p>
                    </div>
                  </div>
                );
              })
            )}
            <Button
              variant="outline"
              className="border-dashed text-muted-foreground w-full"
              asChild
            >
              <Link href={`${base}/members`}>+ Add member</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent tasks snapshot */}
      {data.recentTasks.length > 0 ? (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recently updated tasks</CardTitle>
            <Button variant="link" className="text-primary h-auto px-0" asChild>
              <Link href={`${base}/tasks`}>Open board</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-border/50 divide-y">
              {data.recentTasks.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm first:pt-0 last:pb-0">
                  <span className="min-w-0 flex-1 truncate font-medium">{t.title}</span>
                  <Badge variant="secondary" className="shrink-0 font-normal capitalize">
                    {TASK_STATUS_LABELS[t.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
