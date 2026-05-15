"use client";

import { Code2, BookOpen, GitBranch, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  { icon: Code2, label: "Suggest tech stack", prompt: "Based on the SRS, what tech stack would you recommend?" },
  { icon: BookOpen, label: "Explain architecture", prompt: "Walk me through a suitable architecture for this project." },
  { icon: GitBranch, label: "Plan repo structure", prompt: "What should the repository structure look like?" },
  { icon: Lightbulb, label: "Identify risks", prompt: "What are the main technical risks and how do we mitigate them?" },
];

export function DeveloperAdvisorPanel({
  onCollapse,
  onSuggestionSelect,
}: {
  onCollapse?: () => void;
  onSuggestionSelect?: (prompt: string) => void;
}) {
  return (
    <Card className="flex h-full min-h-0 w-full flex-col overflow-hidden border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
      <div className="border-border/60 shrink-0 border-b px-3 pb-2 pt-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="size-3.5 text-primary" />
            <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Developer Advisor</span>
          </div>
          {onCollapse && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-foreground/60 hover:text-foreground -mr-1"
              onClick={onCollapse}
            >
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 scrollbar-none">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Ask me anything about implementation — architecture, tech choices, repo structure, or dev planning.
          I have full context of the project SRS.
        </p>

        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">Quick prompts</p>
          {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
            <button
              key={label}
              type="button"
              onClick={() => onSuggestionSelect?.(prompt)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-left text-xs transition-colors",
                "hover:border-border hover:bg-muted/40 hover:text-foreground",
                "text-muted-foreground",
              )}
            >
              <Icon className="size-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
