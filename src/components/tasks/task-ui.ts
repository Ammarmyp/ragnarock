import { cn } from "@/lib/utils";

/**
 * Neutral focus (border ring) — overrides SelectTrigger’s default ring-ring so selects match
 * the rest of the app chrome and avoid strong primary/purple focus.
 */
export const taskSelectTriggerClassName = cn(
  "data-[size=default]:h-9 h-9 w-full min-w-0 justify-between rounded-md border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs",
  "focus-visible:border-border focus-visible:ring-2 focus-visible:ring-border/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "data-placeholder:text-muted-foreground",
);

export const taskSelectContentClassName = "border-border";
