"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { MarkdownContent } from "@/components/documentation/markdown-content";
import { cn } from "@/lib/utils";
import type { AgentPartialSrs, AgentRequirementPayload } from "@/api/projects.api";

export const srsDocumentMarkdownClass = [
  "max-w-none space-y-2 text-sm leading-relaxed text-foreground/90",
  "[&_h1]:text-lg [&_h1]:font-semibold [&_h1]:mb-1",
  "[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:text-muted-foreground [&_h2]:mt-4 [&_h2]:mb-1.5",
  "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1",
  "[&_p]:my-1.5 [&_em]:text-muted-foreground [&_em]:text-xs [&_em]:not-italic",
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:my-0 [&_li]:marker:text-muted-foreground/50",
  "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1",
  "[&_strong]:font-semibold [&_strong]:text-foreground",
  "[&_hr]:my-3 [&_hr]:border-border/60",
].join(" ");

/** Single canonical markdown builder for both complete and partial SRS data. */
export function buildSrsMarkdown(
  partialSrs: AgentPartialSrs | null | undefined,
  completedSpec: AgentRequirementPayload | null | undefined,
): string {
  if (completedSpec) {
    const lines: string[] = [];
    lines.push(`# ${completedSpec.project_name}`);
    lines.push("");

    if (completedSpec.business_owner_summary) {
      lines.push("## In plain words");
      lines.push(completedSpec.business_owner_summary);
      lines.push("");
    }

    lines.push("## Overview");
    lines.push(completedSpec.summary);
    lines.push("");

    if (completedSpec.features.length > 0) {
      lines.push("## What the product does");
      for (const f of completedSpec.features) {
        lines.push(`- **${f.name}** — ${f.description}`);
      }
      lines.push("");
    }

    if (completedSpec.user_stories.length > 0) {
      lines.push("## User Stories");
      for (const us of completedSpec.user_stories) {
        lines.push(`- As a **${us.role}**, I want to ${us.goal} so that ${us.benefit}.`);
      }
      lines.push("");
    }

    if (completedSpec.functional_requirements.length > 0) {
      lines.push("## Functional Requirements");
      lines.push("_The specific things the system must be able to do._");
      lines.push("");
      for (const fr of completedSpec.functional_requirements) {
        lines.push(`- ${fr}`);
      }
      lines.push("");
    }

    if (completedSpec.acceptance_criteria.length > 0) {
      lines.push("## Acceptance Criteria");
      lines.push("_How we will know the work is done correctly._");
      lines.push("");
      for (const ac of completedSpec.acceptance_criteria) {
        lines.push(`- ${ac}`);
      }
      lines.push("");
    }

    if (completedSpec.non_functional_requirements.length > 0) {
      lines.push("## Quality & Constraints");
      lines.push("_Expectations around speed, security, and reliability._");
      lines.push("");
      for (const nfr of completedSpec.non_functional_requirements) {
        lines.push(`- ${nfr}`);
      }
      lines.push("");
    }

    if (completedSpec.out_of_scope && completedSpec.out_of_scope.length > 0) {
      lines.push("## Out of Scope");
      lines.push("_Things this project will **not** cover._");
      lines.push("");
      for (const oos of completedSpec.out_of_scope) {
        lines.push(`- ${oos}`);
      }
    }

    return lines.join("\n");
  }

  if (!partialSrs) {
    return "_Start the interview to begin building your SRS._";
  }

  const lines: string[] = [];
  lines.push(`# ${partialSrs.project_name ?? "Untitled Project"}`);
  lines.push("");

  if (partialSrs.summary) {
    lines.push("## Overview");
    lines.push(partialSrs.summary);
    lines.push("");
  }

  if (partialSrs.features?.length) {
    lines.push("## What the product does");
    for (const f of partialSrs.features) {
      lines.push(`- **${f.name}** — ${f.description}`);
    }
    lines.push("");
  }

  if (partialSrs.user_roles?.length) {
    lines.push("## Who uses it");
    for (const r of partialSrs.user_roles) {
      lines.push(`- ${r}`);
    }
    lines.push("");
  }

  if (partialSrs.functional_requirements?.length) {
    lines.push("## Functional Requirements");
    lines.push("_The specific things the system must be able to do._");
    lines.push("");
    for (const fr of partialSrs.functional_requirements) {
      lines.push(`- ${fr}`);
    }
    lines.push("");
  }

  if (partialSrs.user_stories?.length) {
    lines.push("## User Stories");
    for (const us of partialSrs.user_stories) {
      lines.push(`- As a **${us.role}**, I want to ${us.goal} so that ${us.benefit}.`);
    }
    lines.push("");
  }

  if (partialSrs.acceptance_criteria?.length) {
    lines.push("## Acceptance Criteria");
    lines.push("_How we will know the work is done correctly._");
    lines.push("");
    for (const ac of partialSrs.acceptance_criteria) {
      lines.push(`- ${ac}`);
    }
    lines.push("");
  }

  if (partialSrs.non_functional_requirements?.length) {
    lines.push("## Quality & Constraints");
    lines.push("_Expectations around speed, security, and reliability._");
    lines.push("");
    for (const nfr of partialSrs.non_functional_requirements) {
      lines.push(`- ${nfr}`);
    }
    lines.push("");
  }

  if (partialSrs.out_of_scope?.length) {
    lines.push("## Out of Scope");
    lines.push("_Things this project will **not** cover._");
    lines.push("");
    for (const oos of partialSrs.out_of_scope) {
      lines.push(`- ${oos}`);
    }
    lines.push("");
  }

  const missing: string[] = [];
  if (!partialSrs.project_name) missing.push("Project name");
  if (!partialSrs.summary) missing.push("Overview");
  if (!partialSrs.features?.length) missing.push("What the product does");
  if (!partialSrs.user_roles?.length) missing.push("Who uses it");
  if (!partialSrs.functional_requirements?.length) missing.push("Functional requirements");
  if (!partialSrs.user_stories?.length) missing.push("User stories");
  if (!partialSrs.acceptance_criteria?.length) missing.push("Acceptance criteria");
  if (!partialSrs.non_functional_requirements?.length) missing.push("Quality & constraints");

  if (missing.length > 0) {
    lines.push("---");
    lines.push("## Still to cover");
    lines.push("_The interview will fill these in as the conversation continues._");
    lines.push("");
    for (const m of missing) {
      lines.push(`- ${m}`);
    }
  }

  return lines.join("\n");
}

type SrsDocumentBodyProps = {
  markdown: string;
  status: "complete" | "in_progress" | "not_started";
  displayProgress: number;
  isProcessing?: boolean;
};

export function SrsDocumentBody({
  markdown,
  status,
  displayProgress,
  isProcessing = false,
}: SrsDocumentBodyProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge
            variant={status === "complete" ? "default" : status === "in_progress" ? "secondary" : "outline"}
            className={cn(
              "text-xs font-normal",
              status === "complete" && "bg-emerald-600 text-white",
            )}
          >
            {status === "complete" ? "Complete" : status === "in_progress" ? "In Progress" : "Not Started"}
          </Badge>
          {isProcessing && (
            <span className="text-muted-foreground text-xs">Updating...</span>
          )}
        </div>
        <span className="text-muted-foreground tabular-nums text-xs">{displayProgress}%</span>
      </div>

      <div>
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <motion.div
            className={cn(
              "h-full rounded-full",
              status === "complete" ? "bg-emerald-500" : "bg-primary/80",
            )}
            initial={false}
            animate={{ width: `${displayProgress}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          />
        </div>
      </div>

      <MarkdownContent content={markdown} className={srsDocumentMarkdownClass} />
    </div>
  );
}
