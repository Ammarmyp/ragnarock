"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Building2,
  Loader2,
  RefreshCw,
  Search,
  WifiOff,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
  error: {
    card: "border-destructive/30 bg-destructive/5",
    iconWrap: "bg-destructive/10 text-destructive",
    defaultIcon: AlertCircle,
  },
  empty: {
    card: "border-dashed border-border/80 bg-muted/20",
    iconWrap: "bg-muted text-muted-foreground",
    defaultIcon: Search,
  },
  loading: {
    card: "border-border/80 bg-muted/20",
    iconWrap: "bg-muted text-muted-foreground",
    defaultIcon: Loader2,
  },
  offline: {
    card: "border-border/80 bg-muted/20",
    iconWrap: "bg-muted text-muted-foreground",
    defaultIcon: WifiOff,
  },
} as const;

export type FeedbackStateVariant = keyof typeof VARIANT_STYLES;

export type FeedbackStateProps = {
  variant: FeedbackStateVariant;
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Action buttons or links rendered below the description. */
  actions?: React.ReactNode;
  className?: string;
  /** Centered full-viewport shell (organization select, auth gates). */
  layout?: "inline" | "page";
};

export function FeedbackState({
  variant,
  title,
  description,
  icon,
  actions,
  className,
  layout = "inline",
}: FeedbackStateProps) {
  const styles = VARIANT_STYLES[variant];
  const Icon = icon ?? styles.defaultIcon;
  const isLoading = variant === "loading";

  const card = (
    <Card className={cn("w-full", styles.card, layout === "page" && "max-w-lg", className)}>
      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            styles.iconWrap,
          )}
          aria-hidden
        >
          <Icon className={cn("size-5", isLoading && "animate-spin")} />
        </div>
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="text-lg leading-snug">{title}</CardTitle>
          {description ? (
            <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
          ) : null}
        </div>
      </CardHeader>
      {actions ? <CardContent className="flex flex-wrap gap-2 pt-0">{actions}</CardContent> : null}
    </Card>
  );

  if (layout === "page") {
    return (
      <div className="bg-muted/30 flex min-h-screen items-center justify-center p-4">
        {card}
      </div>
    );
  }

  return card;
}

type FeedbackRetryProps = {
  onRetry: () => void;
  retryLabel?: string;
  secondaryAction?: React.ReactNode;
};

export function FeedbackRetryActions({
  onRetry,
  retryLabel = "Try again",
  secondaryAction,
}: FeedbackRetryProps) {
  return (
    <>
      <Button type="button" size="sm" onClick={onRetry} className="gap-1.5">
        <RefreshCw className="size-3.5" />
        {retryLabel}
      </Button>
      {secondaryAction}
    </>
  );
}

/** Preset for organization / workspace load failures. */
export function OrganizationLoadError({
  onRetry,
  message,
  layout = "page",
}: {
  onRetry?: () => void;
  message?: string;
  layout?: "inline" | "page";
}) {
  return (
    <FeedbackState
      variant="error"
      layout={layout}
      icon={Building2}
      title="Could not load your workspaces"
      description={
        message ??
        "Your session may have expired or the server is temporarily unavailable. Try again or sign in again."
      }
      actions={
        onRetry ? (
          <FeedbackRetryActions
            onRetry={onRetry}
            retryLabel="Refresh"
            secondaryAction={
              <Button type="button" variant="outline" size="sm" asChild>
                <a href="/sign-in">Sign in again</a>
              </Button>
            }
          />
        ) : (
          <Button type="button" variant="outline" size="sm" asChild>
            <a href="/sign-in">Sign in again</a>
          </Button>
        )
      }
    />
  );
}

/** Preset for workspace / organization loading. */
export function WorkspaceLoadingState({
  title = "Loading workspace",
  description = "Fetching your organizations…",
  layout = "page",
  className,
}: {
  title?: string;
  description?: string;
  layout?: "inline" | "page";
  className?: string;
}) {
  return (
    <FeedbackState
      variant="loading"
      layout={layout}
      icon={Building2}
      title={title}
      description={description}
      className={className}
    />
  );
}
