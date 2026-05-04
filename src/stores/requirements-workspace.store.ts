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

const stagesSeed: InterviewStage[] = [
  { id: "problem", label: "Problem Definition", short: "Problem", completion: 1 },
  { id: "stakeholders", label: "Users & Stakeholders", short: "Stakeholders", completion: 0.85 },
  { id: "features", label: "Core Features", short: "Features", completion: 0.55 },
  { id: "edge", label: "Edge Cases & Constraints", short: "Edge cases", completion: 0.2 },
  { id: "nfr", label: "Non-Functional Requirements", short: "NFRs", completion: 0.1 },
  { id: "review", label: "Review & Validation", short: "Review", completion: 0 },
];

const sectionsSeed: SrsSection[] = [
  {
    id: "project-overview",
    label: "Project Overview",
    description: "Vision, scope, and success criteria.",
    items: [
      {
        id: "ov-1",
        title: "Unified workspace for product discovery",
        description:
          "Single place where PM, BA, and QA align on requirements before build.",
        type: "functional",
        priority: "high",
        status: "validated",
        source: "user",
        featureGroup: "Platform",
      },
    ],
  },
  {
    id: "stakeholders",
    label: "Stakeholders",
    description: "Who is involved and who signs off.",
    items: [
      {
        id: "st-1",
        title: "Org admin approves SRS before export",
        description: "Final sign-off from organization owner or delegate.",
        type: "functional",
        priority: "medium",
        status: "draft",
        source: "ai",
        featureGroup: "Governance",
      },
    ],
  },
  {
    id: "user-roles",
    label: "User Roles",
    description: "Primary actors and permissions.",
    items: [
      {
        id: "ur-1",
        title: "Product Manager — owns interview flow",
        description: "Can run guided sessions, accept/reject AI proposals.",
        type: "technical",
        priority: "high",
        status: "validated",
        source: "imported",
        featureGroup: "RBAC",
      },
      {
        id: "ur-2",
        title: "Viewer — read-only SRS",
        description: "Stakeholders who comment but do not edit structure.",
        type: "technical",
        priority: "medium",
        status: "draft",
        source: "ai",
        featureGroup: "RBAC",
      },
    ],
  },
  {
    id: "user-stories",
    label: "User Stories",
    description: "Outcome-oriented backlog slices.",
    items: [
      {
        id: "us-1",
        title: "As a PM, I want guided questions so I don’t miss edge cases",
        description: "Interview mode proposes next best question from gaps.",
        type: "functional",
        priority: "high",
        status: "validated",
        linkedUserStoryId: "us-1",
        source: "user",
        featureGroup: "Interview",
      },
    ],
  },
  {
    id: "functional",
    label: "Functional Requirements",
    description: "Grouped by feature / module.",
    items: [
      {
        id: "fr-1",
        title: "SRS sections update in real time when AI extracts requirements",
        description: "New items animate in and land under the correct module.",
        type: "functional",
        priority: "critical",
        status: "draft",
        linkedUserStoryId: "us-1",
        source: "ai",
        featureGroup: "Live SRS",
      },
      {
        id: "fr-2",
        title: "Structured assistant responses (summary → insights → question)",
        description: "Assistant never returns unstructured blobs as the only signal.",
        type: "functional",
        priority: "high",
        status: "draft",
        source: "ai",
        featureGroup: "Interview",
      },
      {
        id: "fr-3",
        title: "Multi-select suggestion chips with edit-before-send",
        description: "User can toggle chips and tweak text before submitting.",
        type: "functional",
        priority: "medium",
        status: "draft",
        source: "user",
        featureGroup: "Interview",
      },
    ],
  },
  {
    id: "non-functional",
    label: "Non-Functional Requirements",
    description: "Performance, security, reliability.",
    items: [
      {
        id: "nfr-1",
        title: "P95 chat round-trip under 3s on broadband",
        description: "Measured client-side; excludes model provider outages.",
        type: "nfr",
        priority: "medium",
        status: "draft",
        source: "ai",
        featureGroup: "Performance",
      },
    ],
  },
  {
    id: "assumptions",
    label: "Assumptions & Constraints",
    description: "Explicit assumptions to validate later.",
    items: [
      {
        id: "as-1",
        title: "Single org active per session",
        description: "Cross-org SRS is out of scope for MVP.",
        type: "technical",
        priority: "low",
        status: "draft",
        source: "user",
        featureGroup: "Scope",
      },
    ],
  },
  {
    id: "risks",
    label: "Risks",
    description: "What could invalidate the spec.",
    items: [
      {
        id: "rk-1",
        title: "Ambiguous superlatives in chat (“fast”, “easy”)",
        description: "Validation panel flags until converted to metrics.",
        type: "nfr",
        priority: "high",
        status: "draft",
        source: "ai",
        featureGroup: "Quality",
      },
    ],
  },
];

const validationSeed: ValidationIssue[] = [
  {
    id: "v1",
    kind: "ambiguity",
    title: '“Fast system” is not measurable',
    detail: "Ask for latency targets (P95), throughput, or perceived speed metrics.",
  },
  {
    id: "v2",
    kind: "missing",
    title: "Error handling for failed AI extraction",
    detail: "Define fallback: retry, manual capture, or skip with audit log.",
  },
  {
    id: "v3",
    kind: "missing",
    title: "Admin vs editor role for SRS approval",
    detail: "Stakeholders section mentions approval but RBAC is incomplete.",
  },
  {
    id: "v4",
    kind: "conflict",
    title: "Offline editing vs real-time sync",
    detail: "Clarify whether offline drafts merge or overwrite server SRS.",
  },
];

const coverageSeed: CoverageRow[] = [
  { feature: "Guided interview", roles: ["PM", "BA"], gap: "QA sign-off" },
  { feature: "Live SRS", roles: ["PM", "Viewer"], gap: undefined },
  { feature: "Export / Jira", roles: [], gap: "No owner" },
];

const healthSeed: HealthScores = {
  completeness: 72,
  clarity: "medium",
  riskLevel: "low",
};

/** Start empty so the interview hero + mesh gradient can shine; first reply is simulated after send. */
const initialMessages: ChatMessage[] = [];

function uid() {
  return `req-${Math.random().toString(36).slice(2, 10)}`;
}

export interface RequirementsWorkspaceState {
  projectId: string | null;
  /** Backend Nest `ProjectAiChatSession` id when wired to persisted AI chat; drives Socket.IO sync. */
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
  /** Demo: advance stage slightly */
  bumpStageProgress: () => void;
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
  activeStageIndex: 2,
  chatMode: "guided",
  reviewMode: false,
  sections: sectionsSeed,
  selectedRequirementId: "fr-1",
  expandedSections: defaultExpanded,
  messages: initialMessages,
  suggestionSelection: [],
  validation: validationSeed,
  coverage: coverageSeed,
  health: healthSeed,
  insightSuggestions: [
    "Add payment failure handling and retry policy",
    "Define onboarding flow for first-time PM users",
    "Specify performance benchmarks for concurrent interviews",
  ],

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
}));
