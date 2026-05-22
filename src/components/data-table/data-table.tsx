"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "./data-table-pagination";

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Total rows (all pages) — required for manual pagination footer copy. */
  totalRowCount: number;
  isLoading?: boolean;
  /** When true, pagination is controlled via `pagination` / `onPaginationChange` / `pageCount`. */
  manualPagination?: boolean;
  /** Total page count (manual mode). Use at least 1 while loading to avoid an empty pager. */
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  pageSizeOptions?: number[];
  className?: string;
  /** Optional table caption (accessibility). */
  caption?: string;
  getRowId?: (originalRow: TData, index: number, parent?: unknown) => string;
  onRowClick?: (row: TData) => void;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  totalRowCount,
  isLoading = false,
  manualPagination = false,
  pageCount,
  pagination,
  onPaginationChange,
  pageSizeOptions,
  className,
  caption,
  getRowId,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  // TanStack Table returns unstable function refs; React Compiler skips this hook by design.
  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable from @tanstack/react-table
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { pagination },
    pageCount: manualPagination ? Math.max(pageCount, 1) : undefined,
    onPaginationChange,
    manualPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
  });

  const showPagination = manualPagination && Boolean(onPaginationChange);

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-border/60 bg-card text-card-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <Table>
          {caption ? <TableCaption>{caption}</TableCaption> : null}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border/60 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-muted-foreground h-11 bg-muted/30 px-3 text-xs font-semibold tracking-wide uppercase"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pagination.pageSize }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="border-border/50 hover:bg-transparent">
                  {columns.map((col, j) => (
                    <TableCell key={j} className="px-3 py-2.5">
                      <Skeleton className="h-4 w-full max-w-[8rem]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "border-border/50",
                    onRowClick && "cursor-pointer hover:bg-muted/40",
                  )}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2.5 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center text-sm">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination ? (
        <DataTablePagination
          table={table}
          totalRowCount={totalRowCount}
          pageSizeOptions={pageSizeOptions}
        />
      ) : null}
    </div>
  );
}
