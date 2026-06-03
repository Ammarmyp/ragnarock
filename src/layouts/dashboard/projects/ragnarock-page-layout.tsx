"use client";

import { useCallback, useEffect, useState } from "react";
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
import { useRequirementsWorkspaceStore } from "@/stores/requirements-workspace.store";
import {
  listRagnarockSessions,
  getRagnarockSession,
  listProjectAiChatSessions,
  listProjectAiChatMessages,
  getProjectAiDraft,
  listProjectSpecifications,
  type RagnarockSessionDetail,
  type ProjectAiChatMessage,
} from "@/api/projects.api";

type RestoredSession =
  | { type: "ragnarock"; detail: RagnarockSessionDetail }
  | { type: "srs"; sessionId: string; messages: ProjectAiChatMessage[] }
  | null;

export function RagnarockPageLayout({ projectId }: { projectId: string }) {
  const [panelMode, setPanelMode] = useState<RightPanelMode>("idle");
  const [docState, setDocState] = useState<RightPanelDocState | null>(null);
  const [planState, setPlanState] = useState<RightPanelPlanState | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [restored, setRestored] = useState<RestoredSession>(undefined as unknown as RestoredSession);

  const setBaseSpec = useRequirementsWorkspaceStore((s) => s.setBaseSpec);
  const resetSession = useRequirementsWorkspaceStore((s) => s.resetSession);

  // On mount: restore chat session + hydrate SRS store from DB
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const [ragnarockSessions, srsSessions, draft, specsPage] = await Promise.all([
          listRagnarockSessions(projectId).catch(() => []),
          listProjectAiChatSessions(projectId, { page: 1, limit: 1 }).catch(() => ({ data: [] })),
          getProjectAiDraft(projectId).catch(() => null),
          listProjectSpecifications(projectId, { page: 1, limit: 1 }).catch(() => ({ data: [] })),
        ]);

        if (cancelled) return;

        // Hydrate the SRS store so SrsPanel shows correct progress + content
        const latestSpec = specsPage.data?.[0] ?? null;
        if (latestSpec?.payload) setBaseSpec(latestSpec.payload);
        if (draft) resetSession({ partialSrs: draft.draftSrs, progress: draft.draftSrsProgress });

        const latestRagnarock = ragnarockSessions[0] ?? null;
        const latestSrs = srsSessions.data?.[0] ?? null;

        const useRagnarock =
          latestRagnarock &&
          (!latestSrs || new Date(latestRagnarock.updatedAt) >= new Date(latestSrs.updatedAt));

        if (useRagnarock && latestRagnarock.messageCount > 0) {
          const detail = await getRagnarockSession(projectId, latestRagnarock.id);
          if (!cancelled) setRestored({ type: "ragnarock", detail });
        } else if (latestSrs) {
          const msgs = await listProjectAiChatMessages(projectId, latestSrs.id, { page: 1, limit: 100 });
          if (!cancelled) {
            setRestored({ type: "srs", sessionId: latestSrs.id, messages: msgs.data ?? [] });
            setPanelMode("srs");
          }
        } else {
          if (!cancelled) setRestored(null);
        }
      } catch {
        if (!cancelled) setRestored(null);
      }
    }

    void restore();
    return () => { cancelled = true; };
  }, [projectId, setBaseSpec, resetSession]);

  const handlePanelChange = useCallback((event: PanelChangeEvent) => {
    setPanelMode(event.mode);
    if (event.mode === "doc") setDocState(event.state);
    if (event.mode === "plan") setPlanState(event.state);
  }, []);

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

  const handleCollapse = useCallback(() => setPanelOpen(false), []);

  // Still loading the session — render nothing to avoid a flash of empty state
  if (restored === undefined) return null;

  return (
    <div className="flex h-full min-h-0 gap-2 p-2">
      <div className="min-w-0 flex-1">
        <RagnarockWorkspace
          projectId={projectId}
          onPanelChange={handlePanelChange}
          initialRestoredSession={restored}
        />
      </div>

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
