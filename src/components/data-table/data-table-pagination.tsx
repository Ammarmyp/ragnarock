"use client";

import type { Table as TanstackTable } from "@tanstack/react-table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type DataTablePaginationProps<TData> = {
  table: TanstackTable<TData>;
  /** Total items across all pages (server-side) or filtered count (client-side). */
  totalRowCount: number;
  pageSizeOptions?: number[];
  className?: string;
};

/** 1-based `currentPage`, `totalPages` >= 1 */
function getVisiblePages(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 1) return [1];
  if (totalPages <= 9) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const delta = 2;
  const range: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }
  const withEllipsis: (number | "ellipsis")[] = [];
  let prev: number | undefined;
  for (const i of range) {
    if (prev !== undefined && i - prev > 1) {
      withEllipsis.push("ellipsis");
    }
    withEllipsis.push(i);
    prev = i;
  }
  return withEllipsis;
}

export function DataTablePagination<TData>({
  table,
  totalRowCount,
  pageSizeOptions = [10, 20, 30, 50],
  className,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = Math.max(table.getPageCount(), 1);
  const currentPage = pageIndex + 1;

  const from = totalRowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRowCount);

  const pageItems = getVisiblePages(currentPage, pageCount);

  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-muted-foreground text-sm tabular-nums">
        {totalRowCount === 0 ? (
          "No results"
        ) : (
          <>
            Showing <span className="text-foreground font-medium">{from}</span>–
            <span className="text-foreground font-medium">{to}</span> of{" "}
            <span className="text-foreground font-medium">{totalRowCount}</span>
          </>
        )}
      </p>
      <div className="flex flex-wrap items-center justify-end gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground whitespace-nowrap text-sm">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger size="sm" className="h-8 w-[4.5rem] border-border/60 bg-background/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              />
            </PaginationItem>
            {pageCount > 1 &&
              pageItems.map((item, idx) => (
                <PaginationItem key={item === "ellipsis" ? `e-${idx}` : `p-${item}`}>
                  {item === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      type="button"
                      size="icon"
                      isActive={item === currentPage}
                      onClick={() => table.setPageIndex(item - 1)}
                      aria-label={`Go to page ${item}`}
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
            <PaginationItem>
              <PaginationNext
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
