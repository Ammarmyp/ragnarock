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

export type RestoredSession = {
  /** Ragnarock Q&A messages (may be empty) */
  ragnarockSessionId: string | null;
  ragnarockMessages: RagnarockSessionDetail["messages"];
  /** SRS agent messages (may be empty) */
  srsSessionId: string | null;
  srsMessages: ProjectAiChatMessage[];
} | null;

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

        // Hydrate the SRS store so SrsPanel shows correct progress + content.
        // If a completed spec exists, use setBaseSpec (shows as "Complete").
        // Otherwise fall back to the project's partial draft.
        const latestSpec = specsPage.data?.[0] ?? null;
        if (latestSpec?.payload) {
          setBaseSpec(latestSpec.payload);
          resetSession(); // clear partialSrs so baseSpec takes over as displaySpec
        } else if (draft?.draftSrs) {
          resetSession({ partialSrs: draft.draftSrs, progress: draft.draftSrsProgress });
        }

        const latestRagnarock = ragnarockSessions[0] ?? null;
        const latestSrs = srsSessions.data?.[0] ?? null;

        if (!latestRagnarock && !latestSrs) {
          if (!cancelled) setRestored(null);
          return;
        }

        // Fetch both in parallel — merge into one unified conversation
        const [ragnarockDetail, srsMsgs] = await Promise.all([
          latestRagnarock && latestRagnarock.messageCount > 0
            ? getRagnarockSession(projectId, latestRagnarock.id).catch(() => null)
            : Promise.resolve(null),
          latestSrs
            ? listProjectAiChatMessages(projectId, latestSrs.id, { page: 1, limit: 100 }).catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
        ]);

        if (!cancelled) {
          if (latestSrs) setPanelMode("srs");
          setRestored({
            ragnarockSessionId: latestRagnarock?.id ?? null,
            ragnarockMessages: ragnarockDetail?.messages ?? [],
            srsSessionId: latestSrs?.id ?? null,
            srsMessages: srsMsgs.data ?? [],
          });
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
