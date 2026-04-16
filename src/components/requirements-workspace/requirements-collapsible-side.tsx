"use client";

import * as React from "react";
import { RequirementsSideRail } from "@/components/requirements-workspace/requirements-side-rail";
import { cn } from "@/lib/utils";

type RequirementsCollapsibleSideProps = {
  side: "left" | "right";
  open: boolean;
  railLabel: string;
  onExpand: () => void;
  children: React.ReactNode;
};

/**
 * Side column: fixed width on lg (`26rem` open, `2.5rem` collapsed) with the same
 * `duration-200 ease-linear` feel as shadcn Sidebar. No `overflow-hidden` here so
 * panel headers (collapse controls) are not clipped during layout.
 */
export function RequirementsCollapsibleSide({
  side,
  open,
  railLabel,
  onExpand,
  children,
}: RequirementsCollapsibleSideProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 w-full flex-col",
        "transition-[width] duration-200 ease-linear",
        open
          ? "min-h-[200px] lg:h-full lg:min-h-0 lg:min-w-0 lg:w-[26rem] lg:max-w-[26rem] lg:shrink"
          : "min-h-0 lg:h-full lg:w-10 lg:shrink-0",
      )}
    >
      {open ? children : <RequirementsSideRail side={side} onExpand={onExpand} label={railLabel} />}
    </div>
  );
}
