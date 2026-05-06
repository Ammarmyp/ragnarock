"use client";

import { useEffect, useState } from "react";
import { RequirementsCollapsibleSide } from "@/components/requirements-workspace/requirements-collapsible-side";
import { SrsCenterPanel } from "@/components/requirements-workspace/srs-center-panel";
import { SrsLeftPanel } from "@/components/requirements-workspace/srs-left-panel";
import { SrsRightPanel } from "@/components/requirements-workspace/srs-right-panel";
import { useRequirementsWorkspaceStore } from "@/stores/requirements-workspace.store";

type RequirementsIntelligenceWorkspaceProps = {
  projectId: string;
};

export function RequirementsIntelligenceWorkspace({ projectId }: RequirementsIntelligenceWorkspaceProps) {
  const setProjectId = useRequirementsWorkspaceStore((s) => s.setProjectId);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  useEffect(() => {
    setProjectId(projectId);
    return () => setProjectId(null);
  }, [projectId, setProjectId]);

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-2 overflow-hidden [--req-chrome:11.5rem] max-h-[calc(100dvh-var(--req-chrome))] lg:h-[calc(100dvh-var(--req-chrome))]">
      <header className="shrink-0">
        <h2 className="text-base font-semibold tracking-tight">Requirements intelligence</h2>
        <p className="text-muted-foreground line-clamp-2 text-xs leading-snug md:line-clamp-1">
          SRS is the source of truth; chat and validation flank it — composer stays pinned to the viewport.
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden lg:flex-row lg:items-stretch lg:gap-2">
        <div className="order-2 flex min-h-[200px] flex-col lg:order-1 lg:min-h-0">
          <RequirementsCollapsibleSide
            side="left"
            open={leftOpen}
            railLabel="Show specification"
            onExpand={() => setLeftOpen(true)}
          >
            <SrsLeftPanel onCollapse={() => setLeftOpen(false)} />
          </RequirementsCollapsibleSide>
        </div>

        <div className="order-1 flex min-h-[min(360px,52dvh)] min-h-0 min-w-0 flex-1 flex-col lg:order-2 lg:min-h-0">
          <SrsCenterPanel />
        </div>

        {/* <div className="order-3 flex min-h-[200px] flex-col lg:order-3 lg:min-h-0">
          <RequirementsCollapsibleSide
            side="right"
            open={rightOpen}
            railLabel="Show validation"
            onExpand={() => setRightOpen(true)}
          >
            <SrsRightPanel onCollapse={() => setRightOpen(false)} />
          </RequirementsCollapsibleSide>
        </div> */}
      </div>
    </div>
  );
}
