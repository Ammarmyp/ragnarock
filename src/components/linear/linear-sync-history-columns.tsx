"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { LinearSyncRun, SyncStats } from "@/api/linear-sync.api";
import { Badge } from "@/components/ui/badge";

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

export function formatSyncChangesSummary(stats: LinearSyncRun["stats"]): string {
  if (!stats) return "—";
  if (isSyncStats(stats)) {
    return `+${stats.created} · ~${stats.updated} · skip ${stats.skipped}`;
  }
  const parts: string[] = [];
  if (stats.export && isSyncStats(stats.export)) {
    parts.push(`export +${stats.export.created}/~${stats.export.updated}`);
  }
  if (stats.import && isSyncStats(stats.import)) {
    parts.push(`import +${stats.import.created}/~${stats.import.updated}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function createLinearSyncHistoryColumns(): ColumnDef<LinearSyncRun>[] {
  return [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="font-medium capitalize">{row.original.type}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={runStatusVariant(row.original.status)}>{row.original.status}</Badge>
      ),
    },
    {
      accessorKey: "startedAt",
      header: "Started",
      cell: ({ row }) => (
        <span className="text-muted-foreground whitespace-nowrap text-sm tabular-nums">
          {new Date(row.original.startedAt).toLocaleString()}
        </span>
      ),
    },
    {
      id: "changes",
      header: "Changes",
      cell: ({ row }) => (
        <span className="text-muted-foreground max-w-[14rem] truncate text-xs tabular-nums">
          {formatSyncChangesSummary(row.original.stats)}
        </span>
      ),
    },
  ];
}
