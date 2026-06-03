"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardCopy,
  FileText,
  FolderGit2,
  Layers,
  ListChecks,
  Sparkles,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  ProjectOverviewResponse,
  ProjectRequirement,
  TaskStatus,
} from "@/api/projects.api";
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from "@/lib/task-labels";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { PROJECT_PERSONA_LABELS } from "@/api/projects.api";

// ─── Constants ────────────────────────────────────────────────────────────────

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

const TASK_STATUS_COLOR: Record<TaskStatus, string> = {
  backlog: "bg-muted-foreground/40",
  todo: "bg-sky-400",
  in_progress: "bg-primary",
  reviewing: "bg-amber-400",
  reviewed: "bg-violet-400",
  done: "bg-emerald-500",
  cancelled: "bg-rose-400",
};

const PRIORITY_CLASS = {
  low: "border-border text-muted-foreground",
  medium: "border-sky-400/50 text-sky-600 dark:text-sky-400",
  high: "border-amber-400/50 text-amber-600 dark:text-amber-400",
  urgent: "border-rose-400/50 text-rose-600 dark:text-rose-400",
} as const;

const DOC_STATUS_CLASS: Record<string, string> = {
  draft: "border-border bg-muted/60 text-muted-foreground",
  pending_review: "border-amber-400/40 bg-amber-400/10 text-amber-700 dark:text-amber-300",
  completed: "border-emerald-500/35 bg-emerald-500/12 text-emerald-800 dark:text-emerald-300",
  rejected: "border-rose-400/40 bg-rose-400/10 text-rose-700 dark:text-rose-300",
};

const DOC_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  completed: "Completed",
  rejected: "Rejected",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name?: string | null, email?: string | null) {
  const src = name?.trim() || email?.trim() || "?";
  return src.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function relativeTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({
  value,
  colorClass = "from-primary to-primary/80",
  className,
}: {
  value: number;
  colorClass?: string;
  className?: string;
}) {
  return (
    <div className={cn("bg-muted h-2 w-full overflow-hidden rounded-full", className)}>
      <div
        className={cn("h-full rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out", colorClass)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  iconClass,
  href,
  linkLabel,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("size-4", iconClass ?? "text-primary")} />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        {href ? (
          <Button variant="link" className="h-auto px-0 py-0 text-xs" asChild>
            <Link href={href}>{linkLabel ?? "View"}</Link>
          </Button>
        ) : sub ? (
          <p className="text-muted-foreground text-xs">{sub}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** Stacked bar showing distribution of values across labelled segments. */
function DistributionBar({
  segments,
}: {
  segments: { label: string; value: number; colorClass: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <div className="bg-muted h-2 w-full rounded-full" />;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full">
      {segments
        .filter((s) => s.value > 0)
        .map((s) => (
          <div
            key={s.label}
            className={cn("h-full transition-[width] duration-500", s.colorClass)}
            style={{ width: `${(s.value / total) * 100}%` }}
            title={`${s.label}: ${s.value}`}
          />
        ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-36 rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const {
    project,
    organization,
    team,
    stats,
    progress,
    highlights,
    activityByEntity,
    tasksByStatus,
    requirementsByStatus,
    recentRequirements,
    recentTasks,
    recentDocumentations,
  } = data;

  // ── Derived values ──────────────────────────────────────────────────────────

  const statusBadgeVariant =
    project.status === "active" ? "default" : project.status === "completed" ? "secondary" : "outline";

  const taskStatusSegments = (
    ["backlog", "todo", "in_progress", "reviewing", "reviewed", "done", "cancelled"] as TaskStatus[]
  )
    .map((s) => ({
      label: TASK_STATUS_LABELS[s],
      value: tasksByStatus[s] ?? 0,
      colorClass: TASK_STATUS_COLOR[s],
    }));

  const reqStatusSegments = (
    ["draft", "in_review", "approved", "implemented"] as ProjectRequirement["status"][]
  ).map((s) => ({
    label: REQ_STATUS_LABEL[s],
    value: requirementsByStatus[s] ?? 0,
    colorClass:
      s === "draft" ? "bg-muted-foreground/40" :
      s === "in_review" ? "bg-sky-400" :
      s === "approved" ? "bg-primary" :
      "bg-emerald-500",
  }));

  const taskEvents = activityByEntity.task ?? 0;
  const reqEvents = activityByEntity.requirement ?? 0;
  const docEvents = activityByEntity.documentation ?? 0;
  const projEvents = activityByEntity.project ?? 0;

  const inProgressTasks = tasksByStatus.in_progress ?? 0;
  const reviewingTasks = (tasksByStatus.reviewing ?? 0) + (tasksByStatus.reviewed ?? 0);

  return (
    <div className="space-y-8 pb-10">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
              {project.name}
            </h1>
            <Badge variant={statusBadgeVariant} className="capitalize">
              {project.status}
            </Badge>
          </div>
          {project.description ? (
            <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
              {project.description}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm italic">No description yet.</p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <code className="bg-muted/60 text-muted-foreground rounded-md px-2 py-1 font-mono text-[11px]">
              {projectUrl || base}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={copyUrl}
            >
              <ClipboardCopy className="size-3.5" />
              Copy link
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="h-7 gap-0.5 px-2">
                  <ChevronDown className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={copyId}>
                  {copied ? "Copied!" : "Copy project ID"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-muted-foreground text-xs">
            {organization?.name ?? "—"}
            {organization?.slug ? (
              <span className="font-mono"> · /{organization.slug}</span>
            ) : null}
            {" · Created "}
            {new Date(project.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
          </p>
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

      {/* ── KPI strip ────────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Tasks"
          value={`${stats.tasksDone} / ${stats.totalTasks}`}
          sub={`${inProgressTasks} in progress · ${reviewingTasks} in review`}
          icon={ListChecks}
          iconClass="text-emerald-600 dark:text-emerald-400"
          href={`${base}/tasks`}
          linkLabel="Open board"
        />
        <KpiCard
          title="Requirements"
          value={stats.totalRequirements}
          sub={`${stats.requirementsImplemented} implemented`}
          icon={FileText}
          href={`${base}/ragnarock`}
          linkLabel="View all"
        />
        <KpiCard
          title="Team members"
          value={stats.memberCount}
          icon={Users}
          href={`${base}/members`}
          linkLabel="Manage"
        />
        <KpiCard
          title="7-day activity"
          value={stats.activitiesLast7Days}
          sub="Events recorded"
          icon={Activity}
          iconClass="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* ── Progress ─────────────────────────────────────────────────────── */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Project progress</CardTitle>
            <CardDescription>
              Last activity {relativeTime(highlights.lastActivityAt)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-muted-foreground text-xs">Tasks</p>
              <p className="text-primary text-xl font-bold tabular-nums">
                {progress.taskCompletionPercent}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Requirements</p>
              <p className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {progress.requirementCompletionPercent}%
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Tasks by status</span>
              <span>{stats.totalTasks} total</span>
            </div>
            <DistributionBar segments={taskStatusSegments} />
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
              {taskStatusSegments.filter((s) => s.value > 0).map((s) => (
                <span key={s.label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className={cn("inline-block size-2 rounded-full", s.colorClass)} />
                  {s.label} ({s.value})
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Requirements by status</span>
              <span>{stats.totalRequirements} total</span>
            </div>
            <DistributionBar segments={reqStatusSegments} />
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
              {reqStatusSegments.filter((s) => s.value > 0).map((s) => (
                <span key={s.label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className={cn("inline-block size-2 rounded-full", s.colorClass)} />
                  {s.label} ({s.value})
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Activity breakdown ────────────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold tracking-tight">
            Activity breakdown
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              {stats.activitiesLast7Days} events · last 7 days
            </span>
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Task events", value: taskEvents, icon: ListChecks, href: `${base}/tasks` },
            { label: "Requirement events", value: reqEvents, icon: FileText, href: `${base}/ragnarock` },
            { label: "Documentation events", value: docEvents, icon: Layers, href: `${base}/documentation` },
            { label: "Project events", value: projEvents, icon: FolderGit2, href: undefined },
          ].map(({ label, value, icon: Icon, href }) => {
            const pct = stats.activitiesLast7Days > 0
              ? Math.round((value / stats.activitiesLast7Days) * 100)
              : 0;
            return (
              <Card key={label} className="border-border/60">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                      {label}
                    </p>
                    <Icon className="text-muted-foreground size-3.5" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-end justify-between gap-2">
                    <span className="text-3xl font-bold tabular-nums">{value}</span>
                    <span className="text-muted-foreground mb-1 text-xs">{pct}% of total</span>
                  </div>
                  <ProgressBar value={pct} />
                  {href && (
                    <Button variant="link" size="sm" className="h-auto px-0 py-0 text-xs" asChild>
                      <Link href={href}>
                        View <ArrowRight className="ml-1 size-3" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Requirements + Team ───────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Recent requirements */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Recent requirements</CardTitle>
              <CardDescription>{stats.totalRequirements} total</CardDescription>
            </div>
            <Button variant="link" className="text-primary h-auto px-0 text-sm" asChild>
              <Link href={`${base}/ragnarock`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentRequirements.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <FileText className="text-muted-foreground/50 size-8" />
                <p className="text-muted-foreground text-sm">No requirements yet.</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`${base}/ragnarock`}>Start a session</Link>
                </Button>
              </div>
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
                      <div className="border-primary/40 flex size-4 items-center justify-center rounded-full border-2 border-dashed text-[10px] text-primary">
                        ·
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-tight">{req.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] font-normal", REQ_STATUS_CLASS[req.status])}
                      >
                        {REQ_STATUS_LABEL[req.status]}
                      </Badge>
                      {req.author && (
                        <span className="text-muted-foreground text-[10px]">
                          by {req.author.name?.trim() || req.author.email || "Unknown"}
                        </span>
                      )}
                      <span className="text-muted-foreground ml-auto text-[10px]">
                        {relativeTime(req.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Team */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Team</CardTitle>
              <CardDescription>{stats.memberCount} {stats.memberCount === 1 ? "member" : "members"}</CardDescription>
            </div>
            <Button variant="link" className="text-primary h-auto px-0 text-sm" asChild>
              <Link href={`${base}/members`}>Manage</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {team.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Users className="text-muted-foreground/50 size-8" />
                <p className="text-muted-foreground text-sm">No members yet.</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`${base}/members`}>Add member</Link>
                </Button>
              </div>
            ) : (
              <>
                {team.map((m) => {
                  const name = m.user?.name?.trim() || m.user?.email || m.userId;
                  const email = m.user?.email;
                  const ini = initials(m.user?.name, m.user?.email);
                  return (
                    <div key={m.id} className="flex items-start gap-3">
                      <Avatar className="border-border mt-0.5 size-8 shrink-0 border">
                        {m.user?.image ? <AvatarImage src={m.user.image} alt="" /> : null}
                        <AvatarFallback className="text-xs">{ini}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">{name}</p>
                          <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px] capitalize">
                            {m.role}
                          </Badge>
                        </div>
                        {email && (
                          <p className="text-muted-foreground truncate text-xs">{email}</p>
                        )}
                        {m.personas && m.personas.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {m.personas.map((p) => (
                              <Badge
                                key={p}
                                variant="secondary"
                                className="px-1.5 py-0 text-[10px] font-normal"
                              >
                                {PROJECT_PERSONA_LABELS[p]}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <Separator />
                <Button variant="outline" className="w-full border-dashed text-muted-foreground" asChild>
                  <Link href={`${base}/members`}>+ Add member</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent tasks ─────────────────────────────────────────────────── */}
      {recentTasks.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Recent tasks</CardTitle>
              <CardDescription>{stats.totalTasks} total · {stats.tasksDone} done</CardDescription>
            </div>
            <Button variant="link" className="text-primary h-auto px-0" asChild>
              <Link href={`${base}/tasks`}>Open board</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-border/50 divide-y">
              {recentTasks.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      className={cn("size-2 shrink-0 rounded-full", TASK_STATUS_COLOR[t.status])}
                    />
                    <span className="truncate text-sm font-medium">{t.title}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {t.assignee && (
                      <Avatar className="size-5">
                        {t.assignee.image ? <AvatarImage src={t.assignee.image} alt="" /> : null}
                        <AvatarFallback className="text-[9px]">
                          {initials(t.assignee.name, t.assignee.email)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 px-1.5 text-[10px] font-normal",
                        PRIORITY_CLASS[t.priority],
                      )}
                    >
                      {TASK_PRIORITY_LABELS[t.priority]}
                    </Badge>
                    <Badge variant="secondary" className="shrink-0 font-normal capitalize">
                      {TASK_STATUS_LABELS[t.status]}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ── Recent documentation ─────────────────────────────────────────── */}
      {recentDocumentations.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Recent documentation</CardTitle>
              <CardDescription>
                {stats.totalDocumentations} {stats.totalDocumentations === 1 ? "document" : "documents"} ·{" "}
                last updated {relativeTime(highlights.lastDocumentationUpdateAt)}
              </CardDescription>
            </div>
            <Button variant="link" className="text-primary h-auto px-0" asChild>
              <Link href={`${base}/documentation`}>
                <BookOpen className="mr-1 size-3.5" />
                View all
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-border/50 divide-y">
              {recentDocumentations.map((doc) => (
                <li
                  key={doc.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{doc.title}</p>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      {doc.type}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      {relativeTime(doc.updatedAt)}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-normal",
                        DOC_STATUS_CLASS[doc.status] ?? "",
                      )}
                    >
                      {DOC_STATUS_LABEL[doc.status] ?? doc.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
