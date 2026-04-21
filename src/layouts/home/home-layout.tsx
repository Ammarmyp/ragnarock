"use client";

/**
 * Home Layout
 * Layout component for the landing/home page
 * Provides a simple structure for marketing and landing content
 */

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HomeLayoutProps {
  children: React.ReactNode;
}

/**
 * HomeLayout Component
 * Simple layout for public-facing pages without navigation sidebar
 */
export function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
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

          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard/projects"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Projects
            </Link>
            <Link
              href="/sign-in"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Sign In
            </Link>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with Next.js, Tailwind CSS, and shadcn/ui.
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
