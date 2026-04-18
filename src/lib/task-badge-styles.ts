import type { ProjectTask, TaskStatus } from "@/api/projects.api";
import { cn } from "@/lib/utils";

/** Subtle, token-based surfaces — primary, secondary, chart, destructive — not flat gray everywhere. */
export function taskStatusBadgeClass(status: TaskStatus): string {
  return cn(
    "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-medium leading-none",
    status === "backlog" && "border-border bg-muted/60 text-muted-foreground",
    status === "todo" && "border-primary/30 bg-primary/12 text-primary",
    status === "in_progress" && "border-primary/35 bg-primary/18 text-primary",
    status === "reviewing" && "border-accent/45 bg-accent/35 text-accent-foreground",
    status === "reviewed" && "border-secondary/55 bg-secondary/90 text-secondary-foreground",
    status === "done" && "border-primary/25 bg-primary/10 text-primary",
    status === "cancelled" && "border-destructive/35 bg-destructive/12 text-destructive",
  );
}

export function taskPriorityBadgeClass(priority: ProjectTask["priority"]): string {
  return cn(
    "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-medium leading-none",
    priority === "low" && "border-border bg-muted/50 text-muted-foreground",
    priority === "medium" && "border-secondary/60 bg-secondary/80 text-secondary-foreground",
    priority === "high" && "border-primary/30 bg-primary/10 text-primary",
    priority === "urgent" && "border-destructive/35 bg-destructive/12 text-destructive",
  );
}
