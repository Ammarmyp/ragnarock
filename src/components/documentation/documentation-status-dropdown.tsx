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
import type { DocumentationStatus } from "@/api/projects.api";
import { DOCUMENTATION_STATUS_LABELS, DOCUMENTATION_STATUS_ORDER } from "@/lib/documentation-labels";
import { cn } from "@/lib/utils";

type DocumentationStatusDropdownProps = {
  value: DocumentationStatus;
  onChange: (value: DocumentationStatus) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
};

export function DocumentationStatusDropdown({
  value,
  onChange,
  id,
  disabled,
  className,
}: DocumentationStatusDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn("h-9 w-full justify-between gap-2 font-normal", className)}
          aria-label="Documentation status"
        >
          <span>{DOCUMENTATION_STATUS_LABELS[value]}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-1" align="start">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as DocumentationStatus)}>
          {DOCUMENTATION_STATUS_ORDER.map((s) => (
            <DropdownMenuRadioItem key={s} value={s}>
              {DOCUMENTATION_STATUS_LABELS[s]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
