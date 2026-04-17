"use client";

import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadMarkdownFile } from "@/lib/download-markdown-file";
import { downloadMarkdownAsPdf } from "@/lib/download-markdown-pdf";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type DocumentationDownloadMenuProps = {
  title: string;
  markdown: string;
  /** Icon + chevron only (e.g. list cards). */
  compact?: boolean;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
};

export function DocumentationDownloadMenu({
  title,
  markdown,
  compact = false,
  variant = "outline",
  size = "sm",
  className,
}: DocumentationDownloadMenuProps) {
  const [busy, setBusy] = useState<"md" | "pdf" | null>(null);

  const handleMarkdown = () => {
    try {
      setBusy("md");
      downloadMarkdownFile(title, markdown);
    } catch {
      toast.error("Could not download Markdown file.");
    } finally {
      setBusy(null);
    }
  };

  const handlePdf = async () => {
    try {
      setBusy("pdf");
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await downloadMarkdownAsPdf(title, markdown);
    } catch {
      toast.error("Could not generate PDF. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const disabled = busy !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          className={cn(compact ? "gap-0.5 px-2" : "gap-1", className)}
          disabled={disabled}
          aria-label="Download document"
        >
          <Download className="size-4 shrink-0" />
          {!compact && <span>Download</span>}
          <ChevronDown className="size-3.5 shrink-0 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Export as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={disabled} onSelect={() => handleMarkdown()}>
          {busy === "md" ? "Preparing…" : "Markdown (.md)"}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={disabled} onSelect={() => void handlePdf()}>
          {busy === "pdf" ? "Rendering…" : "PDF (.pdf)"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
