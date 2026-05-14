"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquarePlus, FileText } from "lucide-react";
import { ProjectAiChatRealtimeSync } from "@/components/projects/project-ai-chat-realtime-sync";
import { RequirementsCollapsibleSide } from "@/components/requirements-workspace/requirements-collapsible-side";
import { SrsCenterPanel } from "@/components/requirements-workspace/srs-center-panel";
import { SrsLeftPanel } from "@/components/requirements-workspace/srs-left-panel";
import { useRequirementsWorkspaceStore } from "@/stores/requirements-workspace.store";
import {
  useProjectAiChatSessions,
  useProjectAiChatMessages,
  useProjectSpecifications,
} from "@/hooks/use-project-ai-chat";
import { cn } from "@/lib/utils";
import type { AgentPartialSrs, AgentRequirementPayload } from "@/api/projects.api";

type RequirementsIntelligenceWorkspaceProps = {
  projectId: string;
};

function sessionLabel(session: { title?: string | null; _count?: { messages: number } }, index: number): string {
  if (session.title?.trim()) return session.title.trim();
  const count = session._count?.messages ?? 0;
  return count > 0 ? `Session ${index + 1} · ${count} msg${count === 1 ? "" : "s"}` : `Session ${index + 1}`;
}

export function RequirementsIntelligenceWorkspace({ projectId }: RequirementsIntelligenceWorkspaceProps) {
  const setProjectId = useRequirementsWorkspaceStore((s) => s.setProjectId);
  const backendAiChatSessionId = useRequirementsWorkspaceStore((s) => s.backendAiChatSessionId);
  const hydrateSession = useRequirementsWorkspaceStore((s) => s.hydrateSession);
  const resetSession = useRequirementsWorkspaceStore((s) => s.resetSession);
  const setBaseSpec = useRequirementsWorkspaceStore((s) => s.setBaseSpec);

  const [srsOpen, setSrsOpen] = useState(true);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const hydratedRef = useRef<string | null>(null);
  const baseSpecSetRef = useRef(false);

  useEffect(() => {
    setProjectId(projectId);
    return () => setProjectId(null);
  }, [projectId, setProjectId]);

  const { data: sessionsPage } = useProjectAiChatSessions(projectId, { page: 1, limit: 30 });
  const sessions = sessionsPage?.data ?? [];

  // Fetch the latest completed specification for this project
  const { data: specsPage } = useProjectSpecifications(projectId, { page: 1, limit: 1 });
  const latestSpec = specsPage?.data?.[0] ?? null;

  // Set baseSpec once when the latest spec loads — persists across session switches
  useEffect(() => {
    if (baseSpecSetRef.current) return;
    if (latestSpec) {
      baseSpecSetRef.current = true;
      setBaseSpec(latestSpec.payload);
    }
  }, [latestSpec, setBaseSpec]);

  const targetSessionId = loadingSessionId ?? backendAiChatSessionId;

  const { data: messagesPage } = useProjectAiChatMessages(
    projectId,
    targetSessionId,
    { page: 1, limit: 200 },
    { enabled: !!targetSessionId },
  );

  // Auto-restore most recent session on first mount
  useEffect(() => {
    if (sessions.length === 0) return;
    const mostRecent = sessions[0];
    if (hydratedRef.current === mostRecent.id) return;
    hydratedRef.current = mostRecent.id;
    setLoadingSessionId(mostRecent.id);
  }, [sessions]);

  // Hydrate store once messages arrive for the target session
  useEffect(() => {
    if (!targetSessionId || !messagesPage) return;
    const session = sessions.find((s) => s.id === targetSessionId);
    if (!session) return;

    const sessionWithProgress = session as typeof session & {
      partialSrs?: AgentPartialSrs | null;
      srsProgress?: number;
    };

    const msgs = messagesPage.data;
    const lastAssistant = [...msgs].reverse().find((m) => m.role === "assistant");
    const lastPayload = lastAssistant?.payload as Record<string, unknown> | null | undefined;
    const isComplete = lastPayload?.status === "complete";
    const completedSpec = isComplete ? (lastPayload as unknown as AgentRequirementPayload) : null;

    hydrateSession({
      sessionId: targetSessionId,
      messages: msgs,
      partialSrs: isComplete ? null : (sessionWithProgress.partialSrs ?? null),
      srsProgress: sessionWithProgress.srsProgress ?? 0,
      completedSpec,
      completedSpecId: null,
    });
    setLoadingSessionId(null);
  }, [messagesPage, targetSessionId, sessions, hydrateSession]);

  const handleNewSession = () => {
    hydratedRef.current = null;
    resetSession();
  };

  const handleSelectSession = (sessionId: string) => {
    if (sessionId === backendAiChatSessionId) return;
    setLoadingSessionId(sessionId);
  };

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-2 overflow-hidden [--req-chrome:11.5rem] max-h-[calc(100dvh-var(--req-chrome))] lg:h-[calc(100dvh-var(--req-chrome))]">
      <ProjectAiChatRealtimeSync projectId={projectId} sessionId={backendAiChatSessionId} />

      {/* Session history strip */}
      {sessions.length > 0 && (
        <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          <button
            type="button"
            onClick={handleNewSession}
            title="Start a new conversation"
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-dashed border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          >
            <MessageSquarePlus className="size-3.5" />
            New
          </button>
          {sessions.map((session, i) => {
            const active = session.id === backendAiChatSessionId;
            const loading = session.id === loadingSessionId;
            const s = session as typeof session & { srsProgress?: number };
            const pct = s.srsProgress ?? 0;
            return (
              <button
                key={session.id}
                type="button"
                onClick={() => handleSelectSession(session.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors",
                  active
                    ? "border-primary/40 bg-primary/8 text-foreground font-medium"
                    : "border-border/50 bg-muted/20 text-muted-foreground hover:border-border hover:text-foreground",
                  loading && "opacity-60",
                )}
              >
                <FileText className="size-3 shrink-0 opacity-50" />
                <span className="max-w-[12rem] truncate">
                  {sessionLabel(session, i)}
                </span>
                {pct > 0 && (
                  <span className={cn(
                    "rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
                    pct === 100
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "bg-primary/10 text-primary",
                  )}>
                    {pct === 100 ? "Done" : `${pct}%`}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden lg:flex-row lg:items-stretch">
        <div className="order-1 flex min-h-[min(360px,52dvh)] min-w-0 flex-1 flex-col lg:min-h-0">
          <SrsCenterPanel />
        </div>

        <div className="order-2 flex min-h-[200px] flex-col lg:min-h-0">
          <RequirementsCollapsibleSide
            side="right"
            open={srsOpen}
            railLabel="Show SRS"
            onExpand={() => setSrsOpen(true)}
          >
            <SrsLeftPanel onCollapse={() => setSrsOpen(false)} />
          </RequirementsCollapsibleSide>
        </div>
      </div>
    </div>
  );
}
