"use client";

import { useCallback, useState } from "react";
import { PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RagnarockWorkspace, type PanelChangeEvent } from "@/components/ragnarock/ragnarock-workspace";
import {
  RagnarockRightPanel,
  type RightPanelMode,
  type RightPanelDocState,
  type RightPanelPlanState,
} from "@/components/ragnarock/ragnarock-right-panel";
import { useRagnarockSocket } from "@/hooks/use-ragnarock-chat";

export function RagnarockPageLayout({ projectId }: { projectId: string }) {
  const [panelMode, setPanelMode] = useState<RightPanelMode>("idle");
  const [docState, setDocState] = useState<RightPanelDocState | null>(null);
  const [planState, setPlanState] = useState<RightPanelPlanState | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  const handlePanelChange = useCallback((event: PanelChangeEvent) => {
    setPanelMode(event.mode);
    if (event.mode === "doc") setDocState(event.state);
    if (event.mode === "plan") setPlanState(event.state);
  }, []);

  // Wire action-completion events so the panel stops showing "generating…"
  // useRagnarockSocket stores callbacks in a ref internally, so stale closure on panelOpen
  // is safe — setPanelOpen(true) is always fine to call even if already open.
  useRagnarockSocket({
    projectId,
    onArchDocCompleted: (payload) => {
      setDocState((prev) =>
        prev
          ? { ...prev, content: payload.content, title: payload.title, generating: false }
          : { title: payload.title, content: payload.content, docType: payload.docType, generating: false },
      );
      setPanelMode("doc");
      setPanelOpen(true);
    },
    onArchDocFailed: () => {
      setDocState((prev) => (prev ? { ...prev, generating: false } : null));
    },
    onPlannerCompleted: () => {
      setPlanState({ generating: false });
      setPanelMode("plan");
      setPanelOpen(true);
    },
    onPlannerFailed: () => {
      setPlanState({ generating: false });
    },
  });

  const handleCollapse = useCallback(() => {
    setPanelOpen(false);
  }, []);

  return (
    <div className="flex h-full min-h-0 gap-2 p-2">
      {/* Left — chat */}
      <div className="min-w-0 flex-1">
        <RagnarockWorkspace projectId={projectId} onPanelChange={handlePanelChange} />
      </div>

      {/* Right — context panel */}
      {panelOpen ? (
        <div className="w-[360px] shrink-0">
          <RagnarockRightPanel
            projectId={projectId}
            mode={panelMode}
            docState={docState}
            planState={planState}
            onCollapse={handleCollapse}
          />
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setPanelOpen(true)}
          className="self-start text-muted-foreground hover:text-foreground"
        >
          <PanelRightOpen className="size-4" />
        </Button>
      )}
    </div>
  );
}
