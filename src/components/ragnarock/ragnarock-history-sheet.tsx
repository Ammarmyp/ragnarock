"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight, History, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  listRagnarockSessions,
  getRagnarockSession,
  type RagnarockSession,
  type RagnarockSessionDetail,
} from "@/api/projects.api";

type Props = {
  projectId: string;
  onSelectSession: (detail: RagnarockSessionDetail) => void;
};

export function RagnarockHistorySheet({ projectId, onSelectSession }: Props) {
  const [open, setOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["ragnarock-sessions", projectId],
    queryFn: () => listRagnarockSessions(projectId),
    enabled: open,
    staleTime: 15_000,
  });

  const handleSelect = async (session: RagnarockSession) => {
    setLoadingId(session.id);
    try {
      const detail = await getRagnarockSession(projectId, session.id);
      onSelectSession(detail);
      setOpen(false);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpen(true)}
            className="cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <History className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Chat history
        </TooltipContent>
      </Tooltip>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-[380px] max-w-[95vw] flex-col gap-0 p-0 sm:max-w-[380px]">
          <SheetHeader className="shrink-0 border-b px-5 py-4">
            <SheetTitle className="flex items-center gap-2 text-base">
              <History className="size-4 text-muted-foreground" />
              Chat history
            </SheetTitle>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && (!sessions || sessions.length === 0) && (
              <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
                <MessageSquare className="size-7 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
                <p className="text-xs text-muted-foreground/70">
                  Start a chat with Ragnarock and it will appear here.
                </p>
              </div>
            )}

            {sessions && sessions.length > 0 && (
              <div className="divide-y divide-border/50">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => void handleSelect(session)}
                    disabled={loadingId === session.id}
                    className={cn(
                      "flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/50",
                      loadingId === session.id && "opacity-60",
                    )}
                  >
                    <MessageSquare className="size-4 shrink-0 text-muted-foreground/60" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium leading-snug">
                        {session.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {session.messageCount} message{session.messageCount !== 1 ? "s" : ""} ·{" "}
                        {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                    {loadingId === session.id
                      ? <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
                      : <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/40" />
                    }
                  </button>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
