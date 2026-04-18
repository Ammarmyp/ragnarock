"use client";

import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { navigateToOAuthUrl, resolveAuthCallbackUrl } from "@/lib/auth/oauth-redirect";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LinkedAccount = {
  id: string;
  providerId: string;
  accountId: string;
  userId: string;
  scopes: string[];
};

const OAUTH_PROVIDERS = [
  { id: "google" as const, label: "Google" },
  { id: "github" as const, label: "GitHub" },
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
        callbackURL: resolveAuthCallbackUrl("/profile"),
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
    <Card>
      <CardHeader>
        <CardTitle>Connected accounts</CardTitle>
        <CardDescription>
          Link Google or GitHub to sign in faster. You can unlink a provider as long as another sign-in
          method remains on your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading connections…</p>
        ) : (
          <ul className="space-y-3">
            {OAUTH_PROVIDERS.map(({ id, label }) => {
              const linked = accounts.find((a) => a.providerId === id);
              return (
                <li
                  key={id}
                  className="flex flex-col gap-2 rounded-lg border border-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">
                      {linked ? "Connected" : "Not connected"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {linked ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending !== null}
                        onClick={() => void handleUnlink(linked.providerId, linked.accountId)}
                      >
                        {pending === `unlink-${id}` ? "Working…" : "Disconnect"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        disabled={pending !== null}
                        onClick={() => void handleLink(id)}
                      >
                        {pending === `link-${id}` ? "Redirecting…" : "Connect"}
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
