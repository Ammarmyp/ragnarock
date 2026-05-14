import type { AgentRequirementPayload } from "@/api/projects.api";

export function specToMarkdown(spec: AgentRequirementPayload): string {
  const lines: string[] = [];

  lines.push(`# ${spec.project_name}`);
  lines.push(`\n## Summary\n\n${spec.summary}`);

  if (spec.features.length > 0) {
    lines.push("\n## Features");
    for (const f of spec.features) {
      lines.push(`\n### ${f.name}\n\n${f.description}`);
    }
  }

  if (spec.user_stories.length > 0) {
    lines.push("\n## User Stories");
    for (const us of spec.user_stories) {
      lines.push(`\n- As a **${us.role}**, I want to ${us.goal}, so that ${us.benefit}.`);
    }
  }

  if (spec.functional_requirements.length > 0) {
    lines.push("\n## Functional Requirements");
    for (const fr of spec.functional_requirements) {
      lines.push(`\n- ${fr}`);
    }
  }

  if (spec.non_functional_requirements.length > 0) {
    lines.push("\n## Non-Functional Requirements");
    for (const nfr of spec.non_functional_requirements) {
      lines.push(`\n- ${nfr}`);
    }
  }

  if (spec.acceptance_criteria.length > 0) {
    lines.push("\n## Acceptance Criteria");
    for (const ac of spec.acceptance_criteria) {
      lines.push(`\n- ${ac}`);
    }
  }

  if (spec.out_of_scope && spec.out_of_scope.length > 0) {
    lines.push("\n## Out of Scope");
    for (const oos of spec.out_of_scope) {
      lines.push(`\n- ${oos}`);
    }
  }

  if (spec.business_owner_summary) {
    lines.push(`\n## Executive Summary\n\n${spec.business_owner_summary}`);
  }

  return lines.join("\n");
}
