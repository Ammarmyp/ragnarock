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
      <footer className="relative isolate mt-10 overflow-hidden border-t border-border/70 bg-background/70 backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 left-1/2 h-[26rem] w-6xl -translate-x-1/2 opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--primary) 20%, transparent) 0%, transparent 70%)",
          }}
        />

        <div className="mx-auto w-full max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
          {/* Top: brand + navigation */}
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <div className="max-w-sm">
              <div className="flex items-center gap-2">
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
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                AI-powered requirement validation for modern product teams —
                from intent to developer-ready specifications.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground/70 uppercase">
                  Platform
                </p>
                <Link
                  href="/dashboard/projects"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Projects
                </Link>
                <Link
                  href="/dashboard/organization"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Organization
                </Link>
                <Link
                  href="/dashboard/organization/integrations"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Integrations
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground/70 uppercase">
                  Account
                </p>
                <Link
                  href={isSignedIn ? "/dashboard/projects" : "/sign-up"}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {isSignedIn ? "Dashboard" : "Get started"}
                </Link>
                {!isSignedIn && (
                  <Link
                    href="/sign-in"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    Sign in
                  </Link>
                )}
                <Link
                  href="/account/preferences"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Preferences
                </Link>
              </div>

              <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground/70 uppercase">
                  Built with
                </p>
                <span className="text-sm text-muted-foreground">NestJS · FastAPI</span>
                <span className="text-sm text-muted-foreground">Redis Streams</span>
                <span className="text-sm text-muted-foreground">Next.js · WebSocket</span>
              </div>
            </div>
          </div>

          {/* Oversized wordmark — sized to its container so it never clips */}
          <div className="@container mt-12 w-full select-none md:mt-16">
            <span className="block whitespace-nowrap bg-gradient-to-b from-foreground/80 to-foreground/[0.04] bg-clip-text text-center text-[clamp(2.25rem,15cqw,14rem)] font-bold leading-[0.82] tracking-tighter text-transparent">
              RAGNAROCK
            </span>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border/60 py-6 text-sm text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} Ragnarock. All rights reserved.</p>
            <p className="text-muted-foreground/70">
              Ship what was actually asked for.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
