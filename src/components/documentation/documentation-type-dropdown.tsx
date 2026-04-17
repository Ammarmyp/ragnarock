"use client";

import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DocumentationType } from "@/api/projects.api";
import { DOCUMENTATION_TYPE_LABELS, DOCUMENTATION_TYPE_ORDER } from "@/lib/documentation-labels";
import { cn } from "@/lib/utils";

type DocumentationTypeDropdownProps = {
  value: DocumentationType;
  onChange: (value: DocumentationType) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
};

export function DocumentationTypeDropdown({
  value,
  onChange,
  id,
  disabled,
  className,
}: DocumentationTypeDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn("h-auto min-h-9 w-full justify-between gap-2 py-2 text-left font-normal", className)}
          aria-label="Documentation type"
        >
          <span className="line-clamp-2 flex-1">{DOCUMENTATION_TYPE_LABELS[value]}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto p-1" align="start">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as DocumentationType)}>
          {DOCUMENTATION_TYPE_ORDER.map((t) => (
            <DropdownMenuRadioItem key={t} value={t} className="items-start py-2">
              <span className="line-clamp-none whitespace-normal pr-6">{DOCUMENTATION_TYPE_LABELS[t]}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
