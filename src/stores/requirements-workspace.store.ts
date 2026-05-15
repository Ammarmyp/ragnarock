"use client";

import { create } from "zustand";
import type {
  ChatMessage,
  ChatMode,
  CoverageRow,
  HealthScores,
  InterviewStage,
  PendingSrsProposal,
  SrsRequirement,
  SrsSection,
  SrsSectionId,
  ValidationIssue,
} from "@/features/requirements-workspace/types";
import type { AgentPartialSrs, AgentRequirementPayload } from "@/api/projects.api";

const stagesSeed: InterviewStage[] = [
  { id: "problem", label: "Problem Definition", short: "Problem", completion: 0 },
  { id: "stakeholders", label: "Users & Stakeholders", short: "Stakeholders", completion: 0 },
  { id: "features", label: "Core Features", short: "Features", completion: 0 },
  { id: "edge", label: "Edge Cases & Constraints", short: "Edge cases", completion: 0 },
  { id: "nfr", label: "Non-Functional Requirements", short: "NFRs", completion: 0 },
  { id: "review", label: "Review & Validation", short: "Review", completion: 0 },
];

const sectionsSeed: SrsSection[] = [
  { id: "project-overview", label: "Project Overview", description: "Vision, scope, and success criteria.", items: [] },
  { id: "stakeholders", label: "Stakeholders", description: "Who is involved and who signs off.", items: [] },
  { id: "user-roles", label: "User Roles", description: "Primary actors and permissions.", items: [] },
  { id: "user-stories", label: "User Stories", description: "Outcome-oriented backlog slices.", items: [] },
  { id: "functional", label: "Functional Requirements", description: "Grouped by feature / module.", items: [] },
  { id: "non-functional", label: "Non-Functional Requirements", description: "Performance, security, reliability.", items: [] },
  { id: "assumptions", label: "Assumptions & Constraints", description: "Explicit assumptions to validate later.", items: [] },
  { id: "risks", label: "Risks", description: "What could invalidate the spec.", items: [] },
];

const validationSeed: ValidationIssue[] = [];

const coverageSeed: CoverageRow[] = [];

const healthSeed: HealthScores = {
  completeness: 0,
  clarity: "low",
  riskLevel: "low",
};

const initialMessages: ChatMessage[] = [];

function uid() {
  return `req-${Math.random().toString(36).slice(2, 10)}`;
}

export interface RequirementsWorkspaceState {
  projectId: string | null;
  backendAiChatSessionId: string | null;
  stages: InterviewStage[];
  activeStageIndex: number;
  chatMode: ChatMode;
  reviewMode: boolean;
  sections: SrsSection[];
  selectedRequirementId: string | null;
  expandedSections: Record<SrsSectionId, boolean>;
  messages: ChatMessage[];
  suggestionSelection: string[];
  validation: ValidationIssue[];
  coverage: CoverageRow[];
  health: HealthScores;
  insightSuggestions: string[];

  isProcessing: boolean;
  agentError: string | null;
  completedSpecId: string | null;
  completedSpec: AgentRequirementPayload | null;
  partialSrs: AgentPartialSrs | null;
  srsProgress: number;
  /** Latest persisted spec for this project — survives session switches and resets. */
  baseSpec: AgentRequirementPayload | null;

  setProjectId: (id: string | null) => void;
  setBackendAiChatSessionId: (id: string | null) => void;
  setChatMode: (mode: ChatMode) => void;
  setReviewMode: (v: boolean) => void;
  toggleSection: (id: SrsSectionId) => void;
  selectRequirement: (id: string | null) => void;
  updateRequirement: (id: string, patch: Partial<SrsRequirement>) => void;
  clearNewFlags: () => void;
  acceptProposal: (messageId: string) => void;
  rejectProposal: (messageId: string) => void;
  appendUserMessage: (text: string) => void;
  simulateAssistantReply: () => void;
  toggleSuggestion: (text: string) => void;
  clearSuggestions: () => void;
  bumpStageProgress: () => void;

  setProcessing: (v: boolean) => void;
  setAgentError: (err: string | null) => void;
  appendBackendUserMessage: (text: string, messageId: string) => void;
  applyPartialSrs: (partial: AgentPartialSrs, questions: string[], assistantMessageId: string) => void;
  applyCompletedSrs: (spec: AgentRequirementPayload, specId: string, assistantMessageId: string) => void;
  hydrateSession: (params: {
    sessionId: string;
    messages: { id: string; role: "user" | "assistant"; content: string; payload?: unknown; createdAt: string }[];
    partialSrs: AgentPartialSrs | null;
    srsProgress: number;
    completedSpec: AgentRequirementPayload | null;
    completedSpecId: string | null;
  }) => void;
  resetSession: (projectDraft?: { partialSrs: AgentPartialSrs | null; progress: number }) => void;
  setBaseSpec: (spec: AgentRequirementPayload | null) => void;
}

const defaultExpanded: Record<SrsSectionId, boolean> = {
  "project-overview": true,
  stakeholders: true,
  "user-roles": true,
  "user-stories": true,
  functional: true,
  "non-functional": false,
  assumptions: false,
  risks: true,
};

export const useRequirementsWorkspaceStore = create<RequirementsWorkspaceState>((set, get) => ({
  projectId: null,
  backendAiChatSessionId: null,
  stages: stagesSeed,
  activeStageIndex: 0,
  chatMode: "guided",
  reviewMode: false,
  sections: sectionsSeed,
  selectedRequirementId: null,
  expandedSections: defaultExpanded,
  messages: initialMessages,
  suggestionSelection: [],
  validation: validationSeed,
  coverage: coverageSeed,
  health: healthSeed,
  insightSuggestions: [],

  isProcessing: false,
  agentError: null,
  completedSpecId: null,
  completedSpec: null,
  partialSrs: null,
  srsProgress: 0,
  baseSpec: null,

  setProjectId: (id) => set({ projectId: id }),
  setBackendAiChatSessionId: (id) => set({ backendAiChatSessionId: id }),
  setChatMode: (mode) => set({ chatMode: mode }),
  setReviewMode: (v) => set({ reviewMode: v }),
  toggleSection: (id) =>
    set((s) => ({
      expandedSections: { ...s.expandedSections, [id]: !s.expandedSections[id] },
    })),
  selectRequirement: (id) => set({ selectedRequirementId: id }),
  updateRequirement: (id, patch) =>
    set((s) => ({
      sections: s.sections.map((sec) => ({
        ...sec,
        items: sec.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      })),
    })),
  clearNewFlags: () =>
    set((s) => ({
      sections: s.sections.map((sec) => ({
        ...sec,
        items: sec.items.map((it) => ({ ...it, isNew: false })),
      })),
    })),
  acceptProposal: (messageId) =>
    set((s) => {
      const msg = s.messages.find((m) => m.id === messageId);
      if (!msg || msg.role !== "assistant" || !msg.proposal) return s;
      const p: PendingSrsProposal = msg.proposal;
      const nextSections = s.sections.map((sec) => {
        if (sec.id !== p.sectionId) return sec;
        const item: SrsRequirement = {
          id: uid(),
          title: p.title,
          description: p.description,
          type: p.type,
          priority: "medium",
          status: "draft",
          source: "ai",
          featureGroup: p.featureGroup,
          isNew: true,
        };
        return { ...sec, items: [...sec.items, item] };
      });
      const messages = s.messages.map((m) =>
        m.id === messageId && m.role === "assistant"
          ? { ...m, proposalStatus: "accepted" as const }
          : m,
      );
      return { sections: nextSections, messages };
    }),
  rejectProposal: (messageId) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId && m.role === "assistant"
          ? { ...m, proposalStatus: "rejected" as const }
          : m,
      ),
    })),
  appendUserMessage: (text) => {
    const id = uid();
    set((s) => ({
      messages: [...s.messages, { id, role: "user", content: text, createdAt: Date.now() }],
    }));
    queueMicrotask(() => get().simulateAssistantReply());
  },
  simulateAssistantReply: () => {
    const proposal: PendingSrsProposal = {
      id: uid(),
      sectionId: "functional",
      title: "Traceability from chat turn to SRS item",
      description: "Each accepted proposal stores originating message ids for audit.",
      type: "technical",
      featureGroup: "Live SRS",
    };
    const structured = {
      contextSummary: "You confirmed scope priorities; next we tighten measurable quality bars.",
      extractedInsights: [
        "Interview mode should remain stage-locked in guided flow.",
        "Export formats can wait until review stage is green.",
      ],
      nextQuestion: "Which two non-functional categories matter most in v1: security, performance, or compliance?",
      whyQuestion: "Ordering NFRs early prevents rework when validation finds conflicts.",
    };
    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: uid(),
          role: "assistant" as const,
          createdAt: Date.now(),
          structured,
          proposal,
          proposalStatus: "pending" as const,
        },
      ],
      health: {
        ...s.health,
        completeness: Math.min(95, s.health.completeness + 3),
      },
    }));
  },
  toggleSuggestion: (text) =>
    set((s) => {
      const has = s.suggestionSelection.includes(text);
      return {
        suggestionSelection: has
          ? s.suggestionSelection.filter((t) => t !== text)
          : [...s.suggestionSelection, text],
      };
    }),
  clearSuggestions: () => set({ suggestionSelection: [] }),
  bumpStageProgress: () =>
    set((s) => {
      const stages = s.stages.map((st, i) =>
        i === s.activeStageIndex ? { ...st, completion: Math.min(1, st.completion + 0.08) } : st,
      );
      return { stages };
    }),

  setProcessing: (v) => set({ isProcessing: v, agentError: null }),
  setAgentError: (err) => set({ agentError: err, isProcessing: false }),

  appendBackendUserMessage: (text, messageId) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { id: messageId, role: "user" as const, content: text, createdAt: Date.now() },
      ],
      isProcessing: true,
      agentError: null,
    })),

  applyPartialSrs: (partial, questions, assistantMessageId) =>
    set((s) => {
      const progress = computeProgressFromPartial(partial);
      const stageIndex = progressToStageIndex(progress);
      const stages = s.stages.map((st, i) => ({
        ...st,
        completion: i < stageIndex ? 1 : i === stageIndex ? Math.min(1, progress / 100) : st.completion,
      }));
      const questionText = questions.length === 1
        ? questions[0]
        : questions.map((q, i) => `${i + 1}. ${q}`).join("\n\n");
      const assistantMsg: ChatMessage = {
        id: assistantMessageId,
        role: "assistant" as const,
        createdAt: Date.now(),
        structured: {
          contextSummary: `SRS is ${progress}% complete.`,
          extractedInsights: partial.features?.map((f) => f.name) ?? [],
          nextQuestion: questionText,
          whyQuestion: "Filling in the missing sections to complete the SRS.",
        },
      };
      return {
        messages: [...s.messages, assistantMsg],
        partialSrs: partial,
        srsProgress: progress,
        stages,
        isProcessing: false,
        agentError: null,
        health: { ...s.health, completeness: progress },
      };
    }),

  applyCompletedSrs: (spec, specId, assistantMessageId) =>
    set((s) => {
      const assistantMsg: ChatMessage = {
        id: assistantMessageId,
        role: "assistant" as const,
        createdAt: Date.now(),
        structured: {
          contextSummary: spec.business_owner_summary,
          extractedInsights: spec.features.map((f) => f.name),
          nextQuestion: "Please review the specification above and confirm it matches your vision.",
          whyQuestion: "This is the final SRS ready for developer handoff.",
        },
      };
      const stages = s.stages.map((st) => ({ ...st, completion: 1 }));
      return {
        messages: [...s.messages, assistantMsg],
        completedSpec: spec,
        completedSpecId: specId,
        baseSpec: spec,
        srsProgress: 100,
        partialSrs: null,
        stages,
        isProcessing: false,
        agentError: null,
        health: { completeness: 100, clarity: "high" as const, riskLevel: "low" as const },
      };
    }),

  hydrateSession: ({ sessionId, messages, partialSrs, srsProgress, completedSpec, completedSpecId }) =>
    set((s) => {
      const chatMessages: ChatMessage[] = messages.map((m) => {
        if (m.role === "user") {
          return { id: m.id, role: "user" as const, content: m.content, createdAt: new Date(m.createdAt).getTime() };
        }
        // Assistant — reconstruct structured shape from payload if present, else wrap content
        const payload = m.payload as Record<string, unknown> | null | undefined;
        const structured = payload?.status === "needs_clarification"
          ? {
              contextSummary: `SRS is ${srsProgress}% complete.`,
              extractedInsights: (payload.partial_srs as Record<string, unknown> | undefined)?.features
                ? ((payload.partial_srs as Record<string, { name: string }[]>).features ?? []).map((f) => f.name)
                : [],
              nextQuestion: m.content,
              whyQuestion: "Filling in the missing sections to complete the SRS.",
            }
          : payload?.status === "complete"
          ? {
              contextSummary: (payload.business_owner_summary as string) ?? m.content,
              extractedInsights: ((payload.features as { name: string }[]) ?? []).map((f) => f.name),
              nextQuestion: "Please review the specification above and confirm it matches your vision.",
              whyQuestion: "This is the final SRS ready for developer handoff.",
            }
          : {
              contextSummary: "",
              extractedInsights: [],
              nextQuestion: m.content,
              whyQuestion: "",
            };
        return { id: m.id, role: "assistant" as const, createdAt: new Date(m.createdAt).getTime(), structured };
      });

      const progress = completedSpec ? 100 : srsProgress;
      const stageIndex = progressToStageIndex(progress);
      const stages = s.stages.map((st, i) => ({
        ...st,
        completion: completedSpec ? 1 : i < stageIndex ? 1 : i === stageIndex ? Math.min(1, progress / 100) : st.completion,
      }));

      return {
        backendAiChatSessionId: sessionId,
        messages: chatMessages,
        partialSrs,
        srsProgress: progress,
        completedSpec,
        completedSpecId,
        stages,
        isProcessing: false,
        agentError: null,
        health: { ...s.health, completeness: progress },
      };
    }),

  resetSession: (projectDraft) =>
    set((s) => {
      // A new chat always continues from the project's shared draft SRS. Prefer
      // the explicitly passed draft; otherwise fall back to whatever the store
      // already holds (completed baseSpec, then current partial).
      const draftPartial = projectDraft ? projectDraft.partialSrs : s.partialSrs;
      const inheritedProgress = s.baseSpec
        ? 100
        : projectDraft
          ? projectDraft.progress
          : computeProgressFromPartial(s.partialSrs ?? ({} as AgentPartialSrs));
      const inheritedStageIndex = progressToStageIndex(inheritedProgress);
      const stages = stagesSeed.map((st, i) => ({
        ...st,
        completion: s.baseSpec
          ? 1
          : i < inheritedStageIndex
            ? 1
            : i === inheritedStageIndex
              ? Math.min(1, inheritedProgress / 100)
              : 0,
      }));
      return {
        backendAiChatSessionId: null,
        messages: [],
        partialSrs: s.baseSpec ? null : draftPartial,
        srsProgress: inheritedProgress,
        completedSpec: null,
        completedSpecId: null,
        isProcessing: false,
        agentError: null,
        stages,
        activeStageIndex: s.baseSpec ? stagesSeed.length - 1 : inheritedStageIndex,
        health: { ...s.health, completeness: inheritedProgress },
      };
    }),

  setBaseSpec: (spec) => set({ baseSpec: spec }),
}));

function computeProgressFromPartial(p: AgentPartialSrs): number {
  const fields: (keyof AgentPartialSrs)[] = [
    "project_name", "summary", "features", "user_roles",
    "functional_requirements", "non_functional_requirements",
    "user_stories", "acceptance_criteria", "out_of_scope",
  ];
  const filled = fields.filter((f) => {
    const v = p[f];
    if (v === null || v === undefined) return false;
    if (Array.isArray(v)) return v.length > 0;
    return Boolean(v);
  });
  return Math.round((filled.length / fields.length) * 100);
}

function progressToStageIndex(pct: number): number {
  if (pct < 34) return 0;
  if (pct < 56) return 1;
  if (pct < 78) return 2;
  if (pct < 100) return 3;
  return 5;
}
