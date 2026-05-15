export type RequirementSource = "ai" | "user" | "imported";
export type ReqType = "functional" | "technical" | "nfr";
export type Priority = "low" | "medium" | "high" | "critical";
export type ReqStatus = "draft" | "validated" | "completed";

export type SrsSectionId =
  | "project-overview"
  | "stakeholders"
  | "user-roles"
  | "user-stories"
  | "functional"
  | "non-functional"
  | "assumptions"
  | "risks";

export interface SrsRequirement {
  id: string;
  title: string;
  description: string;
  type: ReqType;
  priority: Priority;
  status: ReqStatus;
  linkedUserStoryId?: string;
  source: RequirementSource;
  featureGroup?: string;
  isNew?: boolean;
}

export interface SrsSection {
  id: SrsSectionId;
  label: string;
  description: string;
  items: SrsRequirement[];
}

export type InterviewStageId =
  | "problem"
  | "stakeholders"
  | "features"
  | "edge"
  | "nfr"
  | "review";

export interface InterviewStage {
  id: InterviewStageId;
  label: string;
  short: string;
  /** 0–1 completion for progress UI */
  completion: number;
}

export type ChatMode = "guided" | "free";

export interface StructuredAssistantPayload {
  contextSummary: string;
  extractedInsights: string[];
  nextQuestion: string;
  whyQuestion?: string;
}

export interface PendingSrsProposal {
  id: string;
  sectionId: SrsSectionId;
  title: string;
  description: string;
  type: ReqType;
  featureGroup: string;
}

export interface DevIntelligencePayload {
  answer: string;
  references: string[];
  follow_up_suggestions: string[];
}

export type ChatMessage =
  | {
      id: string;
      role: "user";
      content: string;
      createdAt: number;
    }
  | {
      id: string;
      role: "assistant";
      kind: "srs";
      createdAt: number;
      structured: StructuredAssistantPayload;
      proposal?: PendingSrsProposal;
      proposalStatus?: "pending" | "accepted" | "rejected" | "edited";
    }
  | {
      id: string;
      role: "assistant";
      kind: "dev_intelligence";
      createdAt: number;
      devIntelligence: DevIntelligencePayload;
    };

export interface ValidationIssue {
  id: string;
  kind: "ambiguity" | "missing" | "conflict";
  title: string;
  detail: string;
}

export interface CoverageRow {
  feature: string;
  roles: string[];
  gap?: string;
}

export interface HealthScores {
  completeness: number;
  clarity: "low" | "medium" | "high";
  riskLevel: "low" | "medium" | "high";
}
