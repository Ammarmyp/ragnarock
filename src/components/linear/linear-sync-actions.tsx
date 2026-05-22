"use client";

import Link from "next/link";
import { Download, RefreshCw, Settings2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/lib/toast";
import {
  useLinearExport,
  useLinearImport,
  useLinearProjectStatus,
  useLinearSync,
} from "@/hooks/use-linear-sync";
import { isLinearErrorCode, LINEAR_ERROR_CODES } from "@/api/linear-sync.api";
import { cn } from "@/lib/utils";

type LinearSyncActionsProps = {
  projectId: string;
  /** Inline buttons for toolbars; stacked for dedicated panels */
  variant?: "inline" | "stacked";
  className?: string;
};

function formatSyncToast(stats: { created: number; updated: number; skipped: number }) {
  return `${stats.created} created, ${stats.updated} updated, ${stats.skipped} skipped`;
}

export function LinearSyncActions({
  projectId,
  variant = "inline",
  className,
}: LinearSyncActionsProps) {
  const { data: status } = useLinearProjectStatus(projectId);
  const mapping = status?.mapping;
  const isSyncing = mapping?.syncStatus === "syncing";

  const importMutation = useLinearImport(projectId, {
    onSuccess: (res) => toast.success(`Import complete: ${formatSyncToast(res.stats)}`),
    onError: (err) => toast.error(err.message || "Import failed"),
  });

  const exportMutation = useLinearExport(projectId, {
    onSuccess: (res) => toast.success(`Export complete: ${formatSyncToast(res.stats)}`),
    onError: (err) => toast.error(err.message || "Export failed"),
  });

  const syncMutation = useLinearSync(projectId, {
    onSuccess: (res) => toast.success(`Sync complete: ${formatSyncToast(res.stats)}`),
    onError: (err) => {
      if (isLinearErrorCode(err, LINEAR_ERROR_CODES.SYNC_IN_PROGRESS)) {
        toast.error("A sync is already in progress");
        return;
      }
      toast.error(err.message || "Sync failed");
    },
  });

  const pending =
    isSyncing ||
    importMutation.isPending ||
    exportMutation.isPending ||
    syncMutation.isPending;

  if (!mapping) {
    return null;
  }

  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col gap-2 sm:flex-row sm:flex-wrap", className)}>
        <Button
          variant="outline"
          className="h-10 flex-1 gap-2 sm:flex-none"
          onClick={() => exportMutation.mutate()}
          disabled={pending}
        >
          <Upload className="size-4 shrink-0" />
          Export to Linear
        </Button>
        <Button
          variant="outline"
          className="h-10 flex-1 gap-2 sm:flex-none"
          onClick={() => importMutation.mutate()}
          disabled={pending}
        >
          <Download className="size-4 shrink-0" />
          Import from Linear
        </Button>
        <Button
          className="h-10 flex-1 gap-2 sm:flex-none"
          onClick={() => syncMutation.mutate()}
          disabled={pending}
        >
          <RefreshCw className={cn("size-4 shrink-0", pending && "animate-spin")} />
          Sync now
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={pending}
          >
            <RefreshCw className={cn("size-3.5", pending && "animate-spin")} />
            Linear sync
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            className="gap-2"
            onClick={() => exportMutation.mutate()}
            disabled={pending}
          >
            <Upload className="size-4" />
            Export to Linear
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onClick={() => importMutation.mutate()}
            disabled={pending}
          >
            <Download className="size-4" />
            Import from Linear
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onClick={() => syncMutation.mutate()}
            disabled={pending}
          >
            <RefreshCw className="size-4" />
            Sync now
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/projects/${projectId}/linear`} className="gap-2">
              <Settings2 className="size-4" />
              Linear settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
