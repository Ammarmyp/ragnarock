"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { codeToHtml, createHighlighter, type BundledLanguage, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: ["html", "css", "js", "ts", "tsx", "json", "md", "yaml", "bash"],
    });
  }
  return highlighterPromise;
}

if (typeof window !== "undefined") {
  void getHighlighter().catch(() => {
    // ignore eager load failures; we'll retry on demand
  });
}

export function useShiki() {
  const [isHighlighterReady, setIsHighlighterReady] = useState(false);
  const [cache, setCache] = useState<Record<string, string>>({});
  const highlighterRef = useRef<Highlighter | null>(null);

  useEffect(() => {
    void getHighlighter()
      .then((h) => {
        highlighterRef.current = h;
        setIsHighlighterReady(true);
      })
      .catch(() => {
        setIsHighlighterReady(false);
      });

    return () => {
      setIsHighlighterReady(false);
      setCache({});
      highlighterRef.current = null;
    };
  }, []);

  const highlightCode = useCallback(
    async (code: string, lang: string, theme: "github-light" | "github-dark") => {
      const cacheKey = `${theme}:${lang}:${code}`;
      const cached = cache[cacheKey];
      if (cached) return cached;

      if (!highlighterRef.current) {
        try {
          highlighterRef.current = await getHighlighter();
          setIsHighlighterReady(true);
        } catch {
          return code;
        }
      }

      try {
        const html = await codeToHtml(code, {
          lang: (lang || "text") as BundledLanguage,
          theme,
        });
        setCache((prev) => ({ ...prev, [cacheKey]: html }));
        return html;
      } catch {
        return code;
      }
    },
    [cache],
  );

  return { highlightCode, isHighlighterReady };
}

