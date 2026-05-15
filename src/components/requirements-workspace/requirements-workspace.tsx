"use client";

import { useEffect, useRef, useState } from "react";
import { Code2, FileText } from "lucide-react";
import { ProjectAiChatRealtimeSync } from "@/components/projects/project-ai-chat-realtime-sync";
import { RequirementsCollapsibleSide } from "@/components/requirements-workspace/requirements-collapsible-side";
import { SrsCenterPanel } from "@/components/requirements-workspace/srs-center-panel";
import { SrsLeftPanel } from "@/components/requirements-workspace/srs-left-panel";
import { DeveloperAdvisorPanel } from "@/components/requirements-workspace/developer-advisor-panel";
import { useRequirementsWorkspaceStore } from "@/stores/requirements-workspace.store";
import {
  useProjectAiChatSessions,
  useProjectAiChatMessages,
  useProjectAiDraft,
  useProjectSpecifications,
} from "@/hooks/use-project-ai-chat";
import { useProjectMembers } from "@/hooks/use-projects";
import { authClient } from "@/lib/auth/auth-client";
import type { AgentRequirementPayload, AgentSessionType } from "@/api/projects.api";

type RequirementsIntelligenceWorkspaceProps = {
  projectId: string;
};

/** Icon + label for each agent type shown in the session strip. */
const AGENT_META: Record<AgentSessionType, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  requirements: { icon: FileText, label: "Requirements" },
  developer_intelligence: { icon: Code2, label: "Dev Intelligence" },
  project_planner: { icon: FileText, label: "Project Planner" },
  qa_intelligence: { icon: FileText, label: "QA Intelligence" },
  change_impact: { icon: FileText, label: "Change Impact" },
};

/** Right-panel component for each agent type. */
function AgentRightPanel({
  agentType,
  onCollapse,
  onSuggestionSelect,
}: {
  agentType: AgentSessionType;
  onCollapse: () => void;
  onSuggestionSelect: (prompt: string) => void;
}) {
  if (agentType === "developer_intelligence") {
    return <DeveloperAdvisorPanel onCollapse={onCollapse} onSuggestionSelect={onSuggestionSelect} />;
  }
  return <SrsLeftPanel onCollapse={onCollapse} />;
}


export function RequirementsIntelligenceWorkspace({ projectId }: RequirementsIntelligenceWorkspaceProps) {
  const setProjectId = useRequirementsWorkspaceStore((s) => s.setProjectId);
  const backendAiChatSessionId = useRequirementsWorkspaceStore((s) => s.backendAiChatSessionId);
  const hydrateSession = useRequirementsWorkspaceStore((s) => s.hydrateSession);
  const resetSession = useRequirementsWorkspaceStore((s) => s.resetSession);
  const setBaseSpec = useRequirementsWorkspaceStore((s) => s.setBaseSpec);
  const setPendingPrompt = useRequirementsWorkspaceStore((s) => s.setPendingPrompt);

  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const hydratedRef = useRef<string | null>(null);
  const baseSpecSetRef = useRef(false);

  useEffect(() => {
    setProjectId(projectId);
    return () => setProjectId(null);
  }, [projectId, setProjectId]);

  const { data: sessionsPage } = useProjectAiChatSessions(projectId, { page: 1, limit: 30 }, { staleTime: 0 });
  const sessions = sessionsPage?.data ?? [];

  const { data: specsPage } = useProjectSpecifications(projectId, { page: 1, limit: 1 });
  const latestSpec = specsPage?.data?.[0] ?? null;

  const { data: projectDraft } = useProjectAiDraft(projectId);

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
    { enabled: !!targetSessionId, staleTime: 0 },
  );

  // Auto-restore most recent session on first mount
  useEffect(() => {
    if (sessions.length === 0) return;
    const mostRecent = sessions[0];
    if (hydratedRef.current === mostRecent.id) return;
    hydratedRef.current = mostRecent.id;
    setLoadingSessionId(mostRecent.id);
  }, [sessions]);

  useEffect(() => {
    if (!targetSessionId || !messagesPage || !projectDraft) return;
    const session = sessions.find((s) => s.id === targetSessionId);
    if (!session) return;

    const msgs = messagesPage.data;
    const lastAssistant = [...msgs].reverse().find((m) => m.role === "assistant");
    const lastPayload = lastAssistant?.payload as Record<string, unknown> | null | undefined;
    const isComplete = lastPayload?.status === "complete";
    const completedSpec = isComplete ? (lastPayload as unknown as AgentRequirementPayload) : null;

    hydrateSession({
      sessionId: targetSessionId,
      messages: msgs,
      partialSrs: isComplete ? null : projectDraft.draftSrs,
      srsProgress: projectDraft.draftSrsProgress,
      completedSpec,
      completedSpecId: null,
    });
    setLoadingSessionId(null);
  }, [messagesPage, targetSessionId, sessions, projectDraft, hydrateSession]);

  const handleNewSession = () => {
    hydratedRef.current = null;
    resetSession(
      projectDraft
        ? { partialSrs: projectDraft.draftSrs, progress: projectDraft.draftSrsProgress }
        : undefined,
    );
  };

  const handleSelectSession = (sessionId: string) => {
    if (sessionId === backendAiChatSessionId) return;
    setLoadingSessionId(sessionId);
  };

  // Derive the active session's agent type for the right panel registry
  const activeSession = sessions.find((s) => s.id === backendAiChatSessionId);
  const activeAgentType: AgentSessionType = (activeSession as typeof activeSession & { agentType?: AgentSessionType })?.agentType ?? "requirements";

  const rightPanelLabel = activeAgentType === "developer_intelligence" ? "Dev Advisor" : "Show SRS";

  // Persona-based capability gating
  const { data: authSession } = authClient.useSession();
  const currentUserId = authSession?.user?.id;
  const { data: members } = useProjectMembers(projectId, { enabled: !!projectId && !!currentUserId });
  const currentMember = members?.find((m) => m.userId === currentUserId);
  const currentPersona = (currentMember as typeof currentMember & { persona?: string })?.persona ?? null;

  let interactionDisabledReason: string | undefined;
  if (currentPersona === "stakeholder") {
    interactionDisabledReason = "Stakeholders have read-only access. Contact the project admin to change your persona.";
  } else if (activeAgentType === "developer_intelligence" && currentPersona !== "developer") {
    interactionDisabledReason = "The Developer Advisor is only available to members with the Developer persona.";
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden p-2">
      <ProjectAiChatRealtimeSync projectId={projectId} sessionId={backendAiChatSessionId} />

      {/* Main panels — chat fills full height, SRS panel sits alongside on lg+ */}
      <div className="flex min-h-0 flex-1 gap-2 overflow-hidden lg:flex-row lg:items-stretch flex-col">
        {/* Chat panel: full height always */}
        <div className="min-h-0 min-w-0 flex-1 flex flex-col">
          <SrsCenterPanel
            interactionDisabledReason={interactionDisabledReason}
            sessions={sessions}
            activeSessionId={backendAiChatSessionId}
            onSelectSession={handleSelectSession}
            onNewSession={handleNewSession}
          />
        </div>

        {/* Right panel: beside chat on lg+, collapsible rail on smaller */}
        <div className="flex shrink-0 min-h-0 flex-col lg:w-auto">
          <RequirementsCollapsibleSide
            side="right"
            open={rightPanelOpen}
            railLabel={rightPanelLabel}
            onExpand={() => setRightPanelOpen(true)}
          >
            <AgentRightPanel
              agentType={activeAgentType}
              onCollapse={() => setRightPanelOpen(false)}
              onSuggestionSelect={setPendingPrompt}
            />
          </RequirementsCollapsibleSide>
        </div>
      </div>
    </div>
  );
}
