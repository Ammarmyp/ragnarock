"use client";

import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type DocumentationMdEditorProps = {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: number;
};

export function DocumentationMdEditor({
  value,
  onChange,
  readOnly = false,
  height = 420,
}: DocumentationMdEditorProps) {
  return (
    <div data-color-mode="auto" className="documentation-md-editor w-full">
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
