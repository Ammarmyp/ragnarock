"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, GitBranch, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { navigateToOAuthUrl, resolveAuthCallbackUrl } from "@/lib/auth/oauth-redirect";
import { toast } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LinkedAccount = {
  id: string;
  providerId: string;
  accountId: string;
  userId: string;
  scopes: string[];
};

const OAUTH_PROVIDERS = [
  { id: "google" as const, label: "Google", brand: "google" as const },
  { id: "github" as const, label: "GitHub", brand: "github" as const },
];

function authErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: string }).message === "string") {
    return (err as { message: string }).message;
  }
  return "Something went wrong";
}

export function ConnectedAccountsCard() {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await authClient.listAccounts();
      if (result.error) {
        toast.error(authErrorMessage(result.error));
        return;
      }
      const data = result.data;
      setAccounts(Array.isArray(data) ? (data as LinkedAccount[]) : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const handleLink = async (provider: "google" | "github") => {
    setPending(`link-${provider}`);
    try {
      const result = await authClient.linkSocial({
        provider,
        callbackURL: resolveAuthCallbackUrl("/account/preferences"),
      });
      if (result.error) {
        toast.error(authErrorMessage(result.error));
        return;
      }
      if (navigateToOAuthUrl(result.data)) {
        return;
      }
      await loadAccounts();
    } finally {
      setPending(null);
    }
  };

  const handleUnlink = async (providerId: string, accountId: string) => {
    setPending(`unlink-${providerId}`);
    try {
      const result = await authClient.unlinkAccount({
        providerId,
        accountId,
      });
      if (result.error) {
        toast.error(authErrorMessage(result.error));
        return;
      }
      toast.success("Account disconnected");
      await loadAccounts();
    } finally {
      setPending(null);
    }
  };

  return (
    <Card className="overflow-hidden rounded-xl border-border/60 bg-card/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm dark:bg-card/60">
      <CardHeader className="space-y-1 border-b border-border/50 bg-muted/20 px-6 py-5 md:px-8">
        <CardTitle className="text-base font-semibold">Connected accounts</CardTitle>
        <CardDescription className="max-w-2xl text-sm leading-relaxed">
          Link OAuth providers for one-click sign-in. Keep at least one sign-in method on your account before
          disconnecting a provider.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Loading connections…
          </div>
        ) : (
          <ul className="grid gap-3">
            {OAUTH_PROVIDERS.map(({ id, label, brand }) => {
              const linked = accounts.find((a) => a.providerId === id);
              return (
                <li
                  key={id}
                  className={cn(
                    "flex flex-col gap-4 rounded-xl border border-border/60 bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
                    linked && "border-primary/20 bg-primary/3 dark:bg-primary/5",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold shadow-sm",
                        linked
                          ? "border-border/80 bg-background text-foreground"
                          : "border-dashed border-muted-foreground/25 bg-muted/20 text-muted-foreground",
                      )}
                    >
                      {brand === "github" ? (
                        <GitBranch className="size-5" />
                      ) : (
                        <span className="font-sans text-base leading-none">G</span>
                      )}
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium leading-tight">{label}</p>
                        {linked ? (
                          <Badge variant="secondary" className="rounded-md px-2 py-0 text-[11px] font-medium">
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-md border-dashed px-2 py-0 text-[11px] font-medium">
                            Not linked
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {linked ? "You can use this provider to sign in to Ragnarock." : "Connect to sign in with one click."}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 sm:pl-2">
                    {linked ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        disabled={pending !== null}
                        onClick={() => void handleUnlink(linked.providerId, linked.accountId)}
                      >
                        {pending === `unlink-${id}` ? (
                          <>
                            <Loader2 className="mr-2 size-3.5 animate-spin" aria-hidden />
                            Working…
                          </>
                        ) : (
                          "Disconnect"
                        )}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-lg"
                        disabled={pending !== null}
                        onClick={() => void handleLink(id)}
                      >
                        {pending === `link-${id}` ? (
                          <>
                            <Loader2 className="mr-2 size-3.5 animate-spin" aria-hidden />
                            Redirecting…
                          </>
                        ) : (
                          <>
                            Connect
                            <ExternalLink className="ml-1.5 size-3.5 opacity-70" aria-hidden />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
