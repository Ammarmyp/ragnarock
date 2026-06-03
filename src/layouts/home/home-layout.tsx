"use client";

/**
 * Home Layout
 * Layout component for the landing/home page
 * Provides a simple structure for marketing and landing content
 */

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { authClient } from "@/lib/auth/auth-client";

interface HomeLayoutProps {
  children: React.ReactNode;
}

/**
 * HomeLayout Component
 * Simple layout for public-facing pages without navigation sidebar
 */
export function HomeLayout({ children }: HomeLayoutProps) {
  const { data: session } = authClient.useSession();
  const isSignedIn = Boolean(session?.user);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/50">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-primary backdrop-blur">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                </svg>
              </div>
              <span className="font-bold">Ragnarock</span>
            </Link>
          </div>

          <nav className="flex items-center gap-2 sm:gap-4">
            <ModeToggle />
            <Link
              href="/dashboard/projects"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:inline-flex"
            >
              Projects
            </Link>
            {!isSignedIn && (
              <Link
                href="/sign-in"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Sign In
              </Link>
            )}
            <Button asChild>
              <Link href={isSignedIn ? "/dashboard/projects" : "/sign-up"}>
                {isSignedIn ? "Go to Dashboard" : "Get Started"}
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/70 bg-background/70 py-6 backdrop-blur-xl md:py-0">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:h-16 md:flex-row lg:px-8">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            AI-powered requirement validation for modern product teams.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/help"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Help
            </Link>
            <Link
              href="/privacy"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
