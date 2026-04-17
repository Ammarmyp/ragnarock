"use client";

import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { DocumentationStatus, DocumentationType } from "@/api/projects.api";
import {
  DOCUMENTATION_STATUS_LABELS,
  DOCUMENTATION_STATUS_ORDER,
  DOCUMENTATION_TYPE_LABELS,
  DOCUMENTATION_TYPE_ORDER,
} from "@/lib/documentation-labels";
import type { DocumentationStatusFilter, DocumentationTypeFilter } from "@/stores/documentation-workspace.store";
import { cn } from "@/lib/utils";

type DocumentationListFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: DocumentationTypeFilter;
  onTypeFilterChange: (value: DocumentationTypeFilter) => void;
  statusFilter: DocumentationStatusFilter;
  onStatusFilterChange: (value: DocumentationStatusFilter) => void;
};

export function DocumentationListFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
}: DocumentationListFiltersProps) {
  const typeLabel =
    typeFilter === "all" ? "All types" : DOCUMENTATION_TYPE_LABELS[typeFilter as DocumentationType];
  const statusLabel =
    statusFilter === "all"
      ? "All statuses"
      : DOCUMENTATION_STATUS_LABELS[statusFilter as DocumentationStatus];

  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
      <Field className="min-w-[200px] flex-1">
        <FieldLabel htmlFor="doc-search">Search</FieldLabel>
        <Input
          id="doc-search"
          placeholder="Title or content…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </Field>

      <Field className="w-full md:w-56">
        <FieldLabel>Type</FieldLabel>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn("h-9 w-full justify-between gap-2 font-normal")}
              aria-label="Filter by type"
            >
              <span className="line-clamp-1 text-left">{typeLabel}</span>
              <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto" align="start">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={typeFilter}
              onValueChange={(v) => onTypeFilterChange(v as DocumentationTypeFilter)}
            >
              <DropdownMenuRadioItem value="all">All types</DropdownMenuRadioItem>
              {DOCUMENTATION_TYPE_ORDER.map((t) => (
                <DropdownMenuRadioItem key={t} value={t} className="items-start py-2">
                  <span className="line-clamp-none whitespace-normal pr-6">{DOCUMENTATION_TYPE_LABELS[t]}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Field>

      <Field className="w-full md:w-48">
        <FieldLabel>Status</FieldLabel>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn("h-9 w-full justify-between gap-2 font-normal")}
              aria-label="Filter by status"
            >
              <span className="line-clamp-1 text-left">{statusLabel}</span>
              <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={statusFilter}
              onValueChange={(v) => onStatusFilterChange(v as DocumentationStatusFilter)}
            >
              <DropdownMenuRadioItem value="all">All statuses</DropdownMenuRadioItem>
              {DOCUMENTATION_STATUS_ORDER.map((s) => (
                <DropdownMenuRadioItem key={s} value={s}>
                  {DOCUMENTATION_STATUS_LABELS[s]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Field>
    </div>
  );
}
