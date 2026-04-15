/**
 * useIsDark Hook
 * Detects if the current theme is dark mode
 * Works with next-themes and respects system preferences
 */

import { useTheme } from "next-themes";

/**
 * Hook to check if dark mode is active
 * @returns True if dark mode is active, false otherwise
 */
export function useIsDark(): boolean {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark";
}
