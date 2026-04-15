"use client";

/**
 * Unified App Provider
 * Composes all global providers into a single provider component
 * This keeps the root layout clean and maintains a single source of truth
 */

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sileo";
import { QueryProvider } from "./query-provider";
import { ThemesProvider } from "@/lib/providers/themes-provider";

interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * AppProvider Component
 * Wraps the application with all necessary providers in the correct order:
 * 1. QueryProvider (TanStack Query)
 * 2. ThemesProvider (next-themes for dark mode)
 * 3. NuqsAdapter (URL state management)
 * 4. TooltipProvider (Radix UI tooltips)
 * 5. Toaster (Toast notifications)
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryProvider>
      <ThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <NuqsAdapter>
          <TooltipProvider>
            {children}
            <Toaster position="top-right" />
          </TooltipProvider>
        </NuqsAdapter>
      </ThemesProvider>
    </QueryProvider>
  );
}
