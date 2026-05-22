"use client";

import { useCallback, useMemo, useState } from "react";
import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { CheckCircle2 } from "lucide-react";
import type { LinearSyncRun, SyncStats } from "@/api/linear-sync.api";
import { DataTable } from "@/components/data-table";
import { createLinearSyncHistoryColumns } from "@/components/linear/linear-sync-history-columns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLinearSyncRuns } from "@/hooks/use-linear-sync";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

function runStatusVariant(status: string) {
  if (status === "completed") return "default" as const;
  if (status === "failed") return "destructive" as const;
  if (status === "partial") return "secondary" as const;
  return "outline" as const;
}

function isSyncStats(value: unknown): value is SyncStats {
  return (
    value != null &&
    typeof value === "object" &&
    "created" in value &&
    "updated" in value &&
    "skipped" in value &&
    "failed" in value
  );
}

function StatsBlock({ label, stats }: { label: string; stats: SyncStats }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <p className="text-foreground mb-2 text-xs font-medium uppercase tracking-wide">{label}</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <dt className="text-muted-foreground">Created</dt>
        <dd className="tabular-nums">{stats.created}</dd>
        <dt className="text-muted-foreground">Updated</dt>
        <dd className="tabular-nums">{stats.updated}</dd>
        <dt className="text-muted-foreground">Skipped</dt>
        <dd className="tabular-nums">{stats.skipped}</dd>
        <dt className="text-muted-foreground">Failed</dt>
        <dd className="tabular-nums">{stats.failed}</dd>
      </dl>
    </div>
  );
}

function SyncRunDetailSheet({
  run,
  open,
  onOpenChange,
}: {
  run: LinearSyncRun | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!run) return null;

  const stats = run.stats;
  const hasNested =
    stats != null && typeof stats === "object" && ("export" in stats || "import" in stats);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b border-border/60 pb-4">
          <SheetTitle className="capitalize">{run.type} run</SheetTitle>
          <SheetDescription>
            Started {new Date(run.startedAt).toLocaleString()}
            {run.finishedAt
              ? ` · Finished ${new Date(run.finishedAt).toLocaleString()}`
              : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-6">
          <Badge variant={runStatusVariant(run.status)}>{run.status}</Badge>

          {stats != null && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Changes</p>
              {hasNested ? (
                <>
                  {stats.export && isSyncStats(stats.export) && (
                    <StatsBlock label="Export" stats={stats.export} />
                  )}
                  {stats.import && isSyncStats(stats.import) && (
                    <StatsBlock label="Import" stats={stats.import} />
                  )}
                </>
              ) : isSyncStats(stats) ? (
                <StatsBlock label="Summary" stats={stats} />
              ) : null}
            </div>
          )}

          {run.error && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive">Error</p>
              <pre className="bg-destructive/5 text-destructive max-h-64 overflow-auto rounded-lg border border-destructive/20 p-3 text-xs leading-relaxed whitespace-pre-wrap break-words">
                {run.error}
              </pre>
            </div>
          )}

          {!run.error && !stats && (
            <p className="text-muted-foreground text-sm">No additional details for this run.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

type LinearSyncHistoryProps = {
  projectId: string;
  className?: string;
};

export function LinearSyncHistory({ projectId, className }: LinearSyncHistoryProps) {
  const [tablePagination, setTablePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [selectedRun, setSelectedRun] = useState<LinearSyncRun | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const runsQuery = useLinearSyncRuns(projectId, {
    page: tablePagination.pageIndex + 1,
    limit: tablePagination.pageSize,
  });

  const runs = runsQuery.data?.data ?? [];
  const totalItems = runsQuery.data?.pagination?.totalItems ?? 0;
  const pageCount = Math.max(runsQuery.data?.pagination?.totalPages ?? 1, 1);

  const columns = useMemo(() => createLinearSyncHistoryColumns(), []);

  const onPaginationChange = useCallback<OnChangeFn<PaginationState>>((updater) => {
    setTablePagination((prev) => (typeof updater === "function" ? updater(prev) : updater));
  }, []);

  const openRun = useCallback((run: LinearSyncRun) => {
    setSelectedRun(run);
    setSheetOpen(true);
  }, []);

  const showEmpty = !runsQuery.isLoading && runs.length === 0;

  return (
    <>
      <Card
        className={cn(
          "flex max-h-[min(32rem,calc(100dvh-14rem))] min-h-[18rem] flex-col",
          className,
        )}
      >
        <CardHeader className="shrink-0 space-y-1">
          <CardTitle className="text-base">Sync history</CardTitle>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col pt-0">
          {showEmpty ? (
            <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center text-sm">
              <CheckCircle2 className="text-muted-foreground/60 size-8" />
              <p>No sync runs yet. Use Export, Import, or Sync now to get started.</p>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto pr-0.5">
                <DataTable
                  columns={columns}
                  data={runs}
                  totalRowCount={totalItems}
                  isLoading={runsQuery.isLoading}
                  manualPagination
                  pageCount={pageCount}
                  pagination={tablePagination}
                  onPaginationChange={onPaginationChange}
                  pageSizeOptions={[10, 20, 30]}
                  getRowId={(row) => row.id}
                  onRowClick={openRun}
                  className="min-w-[36rem] space-y-3 pb-1"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <SyncRunDetailSheet
        run={selectedRun}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setSelectedRun(null);
        }}
      />
    </>
  );
}
