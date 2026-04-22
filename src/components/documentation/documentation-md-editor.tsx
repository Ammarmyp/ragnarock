"use client";

import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import { cn } from "@/lib/utils";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type DocumentationMdEditorProps = {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: number;
  className?: string;
};

export function DocumentationMdEditor({
  value,
  onChange,
  readOnly = false,
  height = 420,
  className,
}: DocumentationMdEditorProps) {
  return (
    <div data-color-mode="auto" className={cn("documentation-md-editor w-full", className)}>
      <MDEditor
        value={value}
        onChange={(v) => onChange(typeof v === "string" ? v : "")}
        height={height}
        visibleDragbar={false}
        preview={readOnly ? "preview" : "live"}
        hideToolbar={readOnly}
      />
    </div>
  );
}
