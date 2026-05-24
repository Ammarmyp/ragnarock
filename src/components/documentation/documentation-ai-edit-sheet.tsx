"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  BookOpen,
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownContent } from "@/components/documentation/markdown-content";
import { useSendRagnarockMessage, useRagnarockSocket, useCreateRagnarockSession } from "@/hooks/use-ragnarock-chat";
import type { RagnarockDetectedAction } from "@/api/projects.api";

type RagnarockMessage =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; answer: string; detectedAction: RagnarockDetectedAction | null };

type DocumentationAiEditSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  docTitle: string;
  docContent: string;
};

export function DocumentationAiEditSheet({
  open,
  onOpenChange,
  projectId,
  docTitle,
  docContent,
}: DocumentationAiEditSheetProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<RagnarockMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const pendingJobRef = useRef<string | null>(null);

  const sendMessage = useSendRagnarockMessage();
  const createSession = useCreateRagnarockSession();

  // Create session when sheet opens
  useEffect(() => {
    if (!open) return;
    if (initialized) return;

    setMessages([]);
    setError(null);
    setIsProcessing(false);
    pendingJobRef.current = null;

    createSession.mutate({ projectId }, {
      onSuccess: (data) => {
        setSessionId(data.sessionId);
        setDraft(`I want to update "${docTitle}"`);
        setInitialized(true);
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId]);

  // Reset initialized when sheet closes
  useEffect(() => {
    if (!open) {
      setInitialized(false);
      setSessionId(null);
      setMessages([]);
      setDraft("");
      setError(null);
    }
  }, [open]);

  useRagnarockSocket({
    projectId,
    enabled: open,
    onCompleted: ({ jobId, answer, detectedAction }) => {
      if (pendingJobRef.current !== jobId) return;
      pendingJobRef.current = null;
      setIsProcessing(false);
      setMessages((prev) => [...prev, { id: jobId, role: "assistant", answer, detectedAction }]);
    },
    onFailed: ({ jobId, error: err }) => {
      if (pendingJobRef.current !== jobId) return;
      pendingJobRef.current = null;
      setIsProcessing(false);
      setError(err || "Something went wrong.");
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const send = useCallback(
    async (text: string) => {
      const body = text.trim();
      if (!body || isProcessing || !sessionId) return;
      setDraft("");
      setError(null);

      const userMsgId = `user-${Date.now()}`;
      setMessages((prev) => [...prev, { id: userMsgId, role: "user", content: body }]);
      setIsProcessing(true);

      try {
        const result = await sendMessage.mutateAsync({ projectId, sessionId, message: body });
        pendingJobRef.current = result.jobId;
      } catch (err) {
        setIsProcessing(false);
        setError(err instanceof Error ? err.message : "Failed to send message.");
      }
    },
    [projectId, sessionId, isProcessing, sendMessage],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full max-w-none flex-col gap-0 p-0 sm:w-[min(90vw,1400px)]! sm:max-w-[min(90vw,1400px)]!"
        style={{ width: "min(90vw, 1400px)", maxWidth: "min(90vw, 1400px)" }}
      >
        <SheetHeader className="shrink-0 border-b px-6 py-3.5">
          <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-primary" />
            Edit with AI
            <Badge variant="outline" className="ml-1 text-xs font-normal text-muted-foreground">
              {docTitle}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {/* Split: chat left, doc right */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Chat panel */}
          <div className="flex w-[420px] shrink-0 flex-col border-r border-border/50">
            {/* Messages */}
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              <div className="flex flex-col gap-3">
                {/* Greeting */}
                {messages.length === 0 && !isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border/60 bg-card/90 p-3.5"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <Badge variant="secondary" className="px-2 py-0 text-xs font-normal">
                        <Sparkles className="mr-1 size-3" />
                        Ragnarock
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      I&apos;m ready to help you update <strong className="text-foreground">{docTitle}</strong>. Describe what you&apos;d like to change — I&apos;ll suggest specific edits you can review before applying.
                    </p>
                  </motion.div>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2.5">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-destructive">Error</p>
                      <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                    <button type="button" onClick={() => setError(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="size-4" />
                    </button>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {m.role === "user" ? (
                        <div className="flex justify-end">
                          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm">
                            {m.content}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-border/60 bg-card/90 p-3.5 shadow-sm">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Badge variant="secondary" className="px-2 py-0 text-xs font-normal">
                              <Sparkles className="mr-1 size-3" />
                              Ragnarock
                            </Badge>
                          </div>
                          <MarkdownContent content={m.answer} />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isProcessing && (
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border/60 bg-card/90 px-3.5 py-3 shadow-sm w-fit">
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "0ms", animationDuration: "1.2s" }} />
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "200ms", animationDuration: "1.2s" }} />
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "400ms", animationDuration: "1.2s" }} />
                  </div>
                )}

                <div ref={endRef} />
              </div>
            </div>

            {/* Composer */}
            <div className="shrink-0 border-t border-border/50 px-3 pb-3 pt-2">
              <div className="flex items-end gap-2 rounded-2xl border border-border/70 bg-background/90 px-3 py-2 shadow-lg shadow-black/5 backdrop-blur-md">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Describe what to change…"
                  rows={1}
                  className="max-h-[120px] min-h-[36px] flex-1 resize-none border-0 bg-transparent py-1.5 text-sm shadow-none focus-visible:ring-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(draft);
                    }
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  className="mb-0.5 size-8 shrink-0 rounded-xl"
                  disabled={!draft.trim() || isProcessing || !sessionId}
                  onClick={() => void send(draft)}
                >
                  {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-3.5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Doc preview panel */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex shrink-0 items-center gap-1.5 border-b border-border/40 px-4 py-2.5">
              <BookOpen className="size-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Document Preview
              </span>
              <span className="ml-2 truncate text-xs text-muted-foreground/60">{docTitle}</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <MarkdownContent content={docContent} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
