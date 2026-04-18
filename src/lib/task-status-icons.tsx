import type { TaskStatus } from "@/api/projects.api";
import {
  Ban,
  CheckCheck,
  CheckCircle2,
  Circle,
  CircleDashed,
  CircleDot,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconClass = "size-3.5 shrink-0 text-muted-foreground";

const accentBase = "size-3.5 shrink-0";

export function TaskStatusIcon({ status }: { status: TaskStatus }) {
  switch (status) {
    case "backlog":
      return <CircleDashed className={iconClass} aria-hidden />;
    case "todo":
      return <Circle className={iconClass} aria-hidden />;
    case "in_progress":
      return <CircleDot className={iconClass} aria-hidden />;
    case "reviewing":
      return <Eye className={iconClass} aria-hidden />;
    case "reviewed":
      return <CheckCheck className={iconClass} aria-hidden />;
    case "done":
      return <CheckCircle2 className={iconClass} aria-hidden />;
    case "cancelled":
      return <Ban className={iconClass} aria-hidden />;
  }
}

/** Saturated colors for menus / inline pickers (Plane-style). */
export function TaskStatusIconAccent({ status, className }: { status: TaskStatus; className?: string }) {
  switch (status) {
    case "backlog":
      return <CircleDashed className={cn(accentBase, "text-zinc-400", className)} aria-hidden />;
    case "todo":
      return <Circle className={cn(accentBase, "text-slate-300", className)} aria-hidden />;
    case "in_progress":
      return <CircleDot className={cn(accentBase, "text-orange-400", className)} aria-hidden />;
    case "reviewing":
      return <Eye className={cn(accentBase, "text-sky-400", className)} aria-hidden />;
    case "reviewed":
      return <CheckCheck className={cn(accentBase, "text-cyan-400", className)} aria-hidden />;
    case "done":
      return <CheckCircle2 className={cn(accentBase, "text-emerald-400", className)} aria-hidden />;
    case "cancelled":
      return <Ban className={cn(accentBase, "text-rose-400/90", className)} aria-hidden />;
  }
}
