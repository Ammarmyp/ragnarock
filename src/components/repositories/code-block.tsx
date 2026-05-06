"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useShiki } from "@/hooks/use-shiki";
import { useIsDark } from "@/hooks/use-is-dark";

type CodeBlockProps = {
  code: string;
  lang: string;
};

export function CodeBlock({ code, lang }: CodeBlockProps) {
  const { highlightCode, isHighlighterReady } = useShiki();
  const isDark = useIsDark();
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const theme = isDark ? "github-dark" : "github-light";
  const cacheKey = useMemo(() => `${theme}:${lang}:${code}`, [theme, lang, code]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!isHighlighterReady) {
        if (!cancelled) setLoading(false);
        return;
      }
      if (!cancelled) setLoading(true);
      const out = await highlightCode(code ?? "", lang, theme);
      if (!cancelled) {
        setHtml(out);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cacheKey, highlightCode, isHighlighterReady, code, lang, theme]);

  if (loading) {
    return (
      <div className="text-muted-foreground flex min-h-40 flex-1 items-center justify-center p-4">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  return html ? (
    <div
      className={`
        code-viewer h-full w-full min-h-0 min-w-0 bg-card text-foreground overflow-hidden
        [&_pre]:m-0 [&_pre]:h-full [&_pre]:w-full [&_pre]:max-w-full [&_pre]:min-w-0
        [&_pre]:overflow-x-auto [&_pre]:overflow-y-auto
        [&_pre]:whitespace-pre [&_code]:whitespace-pre
        [&_pre]:bg-transparent! [&_pre]:p-4
        [&_pre]:text-[13px] [&_pre]:leading-snug
        [&_pre]:font-sans [&_code]:font-sans
        [&_pre]:[font-variant-ligatures:normal]
      `}
      // shiki returns trusted markup from code; code comes from GitHub API response.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <pre className="m-0 overflow-auto bg-card p-4 font-sans text-xs leading-snug text-foreground">{code}</pre>
  );
}

