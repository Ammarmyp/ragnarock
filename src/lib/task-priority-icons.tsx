import type { ProjectTask } from "@/api/projects.api";
import { Flag, SignalHigh, SignalLow, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const base = "size-3.5 shrink-0";

/** Saturated icons for inline priority menus (Plane-style). */
export function TaskPriorityIconAccent({
  priority,
  className,
}: {
  priority: ProjectTask["priority"];
  className?: string;
}) {
  switch (priority) {
    case "low":
      return <SignalLow className={cn(base, "text-slate-400", className)} aria-hidden />;
    case "medium":
      return <Flag className={cn(base, "text-sky-400", className)} aria-hidden />;
    case "high":
      return <SignalHigh className={cn(base, "text-amber-400", className)} aria-hidden />;
    case "urgent":
      return <Zap className={cn(base, "text-rose-400", className)} aria-hidden />;
  }
}
