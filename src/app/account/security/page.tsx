import Link from "next/link";
import { KeyRound, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountSecurityPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Account</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Security</h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Password, sessions, and two-factor authentication will live here as we expand account controls.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-xl border-border/60 bg-card/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm dark:bg-card/60">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground ring-1 ring-border/60">
              <Shield className="size-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-base font-semibold">Hardening roadmap</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Session list, device trust, and security alerts are planned for a future release.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm leading-relaxed text-muted-foreground">
              You will be able to review active sessions and revoke access from unfamiliar devices in one place.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/60 bg-card/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm dark:bg-card/60">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground ring-1 ring-border/60">
              <Lock className="size-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-base font-semibold">Password</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Reset your password securely if you signed up with email and password.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Use the forgot-password flow from the sign-in page.</p>
            <Button variant="secondary" size="sm" className="shrink-0 rounded-lg" asChild>
              <Link href="/forgot-password">
                <KeyRound className="mr-2 size-4" />
                Forgot password
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
