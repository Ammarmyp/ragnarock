"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function splitDisplayName(name: string | null | undefined): { first: string; last: string } {
  const n = (name ?? "").trim();
  if (!n) {
    return { first: "", last: "" };
  }
  const parts = n.split(/\s+/);
  if (parts.length === 1) {
    return { first: parts[0], last: "" };
  }
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}

function updateErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: string }).message === "string") {
    return (err as { message: string }).message;
  }
  return "Could not save profile";
}

type FieldRowProps = {
  label: string;
  description?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
};

function FieldRow({ label, description, htmlFor, children, className }: FieldRowProps) {
  return (
    <div
      className={cn(
        "grid gap-2 border-b border-border/50 py-5 last:border-b-0 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-start sm:gap-8",
        className,
      )}
    >
      <div className="space-y-1 pt-0.5">
        {htmlFor ? (
          <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
            {label}
          </Label>
        ) : (
          <span className="text-sm font-medium text-foreground">{label}</span>
        )}
        {description ? <p className="text-xs leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function AccountPreferencesForm() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!user?.name) {
      setFirstName("");
      setLastName("");
      return;
    }
    const { first, last } = splitDisplayName(user.name);
    setFirstName(first);
    setLastName(last);
  }, [user?.name]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const combined = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    if (!combined) {
      toast.error("Enter at least a first or last name");
      return;
    }
    setSaving(true);
    try {
      const result = await authClient.updateUser({ name: combined });
      if (result.error) {
        toast.error(updateErrorMessage(result.error));
        return;
      }
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const preview = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") || "—";

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading profile…
      </div>
    );
  }

  if (!user) {
    return <p className="text-sm text-muted-foreground">Sign in to manage your account.</p>;
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Account</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Preferences</h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Update how you appear to teammates. Your email is used for sign-in and notifications.
        </p>
      </header>

      <form onSubmit={(e) => void handleSave(e)}>
        <Card className="overflow-hidden rounded-xl border-border/60 bg-card/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm dark:bg-card/60">
          <CardHeader className="space-y-1 border-b border-border/50 bg-muted/20 px-6 py-5 md:px-8">
            <CardTitle className="text-base font-semibold">Profile</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              This information appears on projects, activity, and member lists.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 md:px-2">
            <div className="px-4 md:px-6">
              <FieldRow label="First name" htmlFor="acct-first-name">
                <Input
                  id="acct-first-name"
                  autoComplete="given-name"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={saving}
                  className="h-10 max-w-md rounded-lg border-border/80 bg-background/80 shadow-none"
                />
              </FieldRow>
              <FieldRow label="Last name" htmlFor="acct-last-name">
                <Input
                  id="acct-last-name"
                  autoComplete="family-name"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={saving}
                  className="h-10 max-w-md rounded-lg border-border/80 bg-background/80 shadow-none"
                />
              </FieldRow>
              <FieldRow
                label="Primary email"
                description="Used for sign-in and account notifications. Email changes use a separate verification flow."
                htmlFor="acct-email"
              >
                <Input
                  id="acct-email"
                  type="email"
                  value={user.email ?? ""}
                  disabled
                  readOnly
                  className="h-10 max-w-md cursor-not-allowed rounded-lg border-dashed border-border/80 bg-muted/30 text-muted-foreground shadow-none"
                />
              </FieldRow>
              <FieldRow label="Display name" description="Preview of how your name will be saved.">
                <div className="flex max-w-md items-center rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5 text-sm font-medium text-foreground">
                  {preview}
                </div>
              </FieldRow>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-border/50 bg-muted/10 px-6 py-4 md:px-8">
            <Button type="submit" disabled={saving} className="min-w-[7.5rem] rounded-lg">
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
