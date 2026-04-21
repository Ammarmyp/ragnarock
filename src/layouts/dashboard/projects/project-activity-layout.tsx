"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useProjectActivity } from "@/hooks/use-projects";

function formatDateTime(value: string) {
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function paginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis-left" | "ellipsis-right"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis-left" | "ellipsis-right"> = [1];
  if (currentPage > 3) items.push("ellipsis-left");
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }
  if (currentPage < totalPages - 2) items.push("ellipsis-right");
  items.push(totalPages);
  return items;
}

const SEARCH_DEBOUNCE_MS = 400;

export function ProjectActivityLayout({ projectId }: { projectId: string }) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionInput, setActionInput] = useState("");
  const [debouncedAction, setDebouncedAction] = useState("");
  const [entityType, setEntityType] = useState("all");
  const lastDebouncedFilters = useRef({ search: "", action: "" });

  useEffect(() => {
    const id = window.setTimeout(() => {
      const nextSearch = searchInput.trim();
      const nextAction = actionInput.trim();
      const changed =
        lastDebouncedFilters.current.search !== nextSearch ||
        lastDebouncedFilters.current.action !== nextAction;
      lastDebouncedFilters.current = { search: nextSearch, action: nextAction };
      setDebouncedSearch(nextSearch);
      setDebouncedAction(nextAction);
      if (changed) {
        setPage(1);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [searchInput, actionInput]);

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      entityType: entityType === "all" ? undefined : entityType,
      action: debouncedAction || undefined,
    }),
    [debouncedAction, debouncedSearch, entityType, page],
  );

  const { data, isLoading, isFetching } = useProjectActivity(projectId, params);

  const entityTypeOptions = useMemo(() => {
    const set = new Set((data?.data ?? []).map((item) => item.entityType).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [data?.data]);

  const totalPages = data?.pagination.totalPages ?? 0;
  const currentPage = data?.pagination.currentPage ?? 1;
  const pageItems = paginationItems(currentPage, totalPages);

  const onEntityTypeChange = (value: string) => {
    setEntityType(value);
    setPage(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search action, actor, entity id..."
              className="pl-8"
            />
          </div>
          <Select value={entityType} onValueChange={onEntityTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Entity type" />
            </SelectTrigger>
            <SelectContent>
              {entityTypeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === "all" ? "All entity types" : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={actionInput}
            onChange={(event) => setActionInput(event.target.value)}
            placeholder="Filter action (e.g. task.)"
          />
        </div>

        {(isLoading || isFetching) && (
          <p className="text-sm text-muted-foreground">Loading activity...</p>
        )}

        {!isLoading && (data?.data.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">
            No activity found for the selected filters.
          </p>
        )}

        {data?.data.map((item) => (
          <div key={item.id} className="rounded-md border p-3">
            <p className="font-medium">{item.action}</p>
            <p className="text-xs text-muted-foreground">
              {item.entityType} {item.entityId ? `#${item.entityId}` : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {item.actor?.name || item.actor?.email || "System"} · {formatDateTime(item.createdAt)}
            </p>
          </div>
        ))}

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  disabled={!data?.pagination.hasPrev}
                />
              </PaginationItem>
              {pageItems.map((item, index) => (
                <PaginationItem key={`${item}-${index}`}>
                  {typeof item === "number" ? (
                    <PaginationLink
                      isActive={item === currentPage}
                      onClick={() => setPage(item)}
                    >
                      {item}
                    </PaginationLink>
                  ) : (
                    <PaginationEllipsis />
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                  disabled={!data?.pagination.hasNext}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
}
