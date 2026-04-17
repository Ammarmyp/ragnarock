import type { DocumentationStatus, DocumentationType } from "@/api/projects.api";

export const DOCUMENTATION_TYPE_ORDER = [
  "brd",
  "prd",
  "frd",
  "srs",
  "srd",
  "trd",
  "sad",
  "adr",
  "hld",
  "lld",
  "icd",
  "dbd",
  "api",
  "stp",
  "std",
  "rtm",
  "ug",
  "om",
  "wbs",
  "raci",
  "note",
] as const satisfies readonly DocumentationType[];

export const DOCUMENTATION_TYPE_LABELS: Record<DocumentationType, string> = {
  brd: "BRD — Business Requirements Document",
  prd: "PRD — Product Requirements Document",
  frd: "FRD — Functional Requirements Document",
  srs: "SRS — Software Requirements Specification",
  srd: "SRD — Software Requirements Document",
  trd: "TRD — Technical Requirements Document",
  sad: "SAD — Software Architecture Document",
  adr: "ADR — Architecture Decision Record",
  hld: "HLD — High-Level Design",
  lld: "LLD — Low-Level Design",
  icd: "ICD — Interface Control Document",
  dbd: "DBD — Database Design Document",
  api: "API — API specification",
  stp: "STP — Software Test Plan",
  std: "STD — Software Test Description",
  rtm: "RTM — Requirements Traceability Matrix",
  ug: "UG — User Guide",
  om: "OM — Operations Manual",
  wbs: "WBS — Work Breakdown Structure",
  raci: "RACI — Responsibility matrix",
  note: "Note — Miscellaneous",
};

export const DOCUMENTATION_STATUS_ORDER: DocumentationStatus[] = [
  "draft",
  "pending_review",
  "completed",
  "rejected",
];

export const DOCUMENTATION_STATUS_LABELS: Record<DocumentationStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  completed: "Completed",
  rejected: "Rejected",
};
