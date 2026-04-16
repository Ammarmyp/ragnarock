"use client";

import { PanelLeft, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type RequirementsSideRailProps = {
  side: "left" | "right";
  onExpand: () => void;
  label: string;
};

/**
 * Narrow rail shown when a side panel is collapsed — same affordance as the app SidebarTrigger.
 */
export function RequirementsSideRail({ side, onExpand, label }: RequirementsSideRailProps) {
  const Icon = side === "left" ? PanelLeft : PanelRight;

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "bg-muted/30 flex shrink-0 border-border/60",
          "h-10 w-full flex-row items-center gap-2 px-2",
          "lg:h-full lg:w-10 lg:flex-col lg:justify-start lg:px-0 lg:py-2",
          side === "left" && "border-b lg:border-b-0 lg:border-r",
          side === "right" && "border-t lg:border-t-0 lg:border-l",
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-foreground/80 hover:bg-muted hover:text-foreground shrink-0"
              onClick={onExpand}
              aria-label={label}
              title={label}
            >
              <Icon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side === "left" ? "right" : "left"} className="text-xs">
            {label}
          </TooltipContent>
        </Tooltip>
        <span className="text-muted-foreground truncate text-xs font-medium lg:hidden">{label}</span>
      </div>
    </TooltipProvider>
  );
}
