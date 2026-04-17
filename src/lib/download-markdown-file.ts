function sanitizeFilename(title: string): string {
  const s = title.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "");
  return s.slice(0, 80) || "document";
}

/** Triggers a browser download of the raw Markdown source. */
export function downloadMarkdownFile(title: string, markdown: string): void {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFilename(title)}.md`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
