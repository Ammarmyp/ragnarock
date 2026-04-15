"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "@/lib/toast";
import { setLastActiveOrganizationIdClient } from "@/lib/organization/last-active-organization";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type InvitationDetails = {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  status: string;
  expiresAt: string;
  organizationName: string;
  organizationSlug: string;
  inviterEmail: string;
};

export function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationId = searchParams.get("id");

  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const authFetch = authClient.$fetch as <T>(
    path: string,
    options: {
      method: "GET" | "POST";
      body?: Record<string, unknown>;
      query?: Record<string, unknown>;
    },
  ) => Promise<{ data: T; error: unknown }>;

  const [details, setDetails] = useState<InvitationDetails | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [acting, setActing] = useState(false);

  const redirectBack = `/dashboard/accept-invitation?id=${encodeURIComponent(invitationId ?? "")}`;
  const signInHref = `/sign-in?redirectTo=${encodeURIComponent(redirectBack)}`;

  useEffect(() => {
    if (!invitationId || !session?.user) {
      setDetails(null);
      setLoadError(null);
      return;
    }
    let cancelled = false;
    setLoadingDetails(true);
    setLoadError(null);
    void (async () => {
      const fetchInvitation = authClient.$fetch as typeof authFetch;
      const result = await fetchInvitation<InvitationDetails>("/organization/get-invitation", {
        method: "GET",
        query: { id: invitationId },
      });
      if (cancelled) return;
      setLoadingDetails(false);
      if (result.error) {
        setDetails(null);
        setLoadError("This invitation is invalid, expired, or not for your account.");
        return;
      }
      setDetails(result.data);
      setLoadError(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [invitationId, session?.user]);

  const handleAccept = async () => {
    if (!invitationId) return;
    setActing(true);
    try {
      const loadingToast = toast.loading("Joining organization...");
      const result = await authFetch("/organization/accept-invitation", {
        method: "POST",
        body: { invitationId },
      });
      if (result.error) {
        toast.error("Could not accept invitation", { id: loadingToast });
        return;
      }
      const orgId = details?.organizationId;
      if (orgId) {
        setLastActiveOrganizationIdClient(orgId);
      }
      toast.success("You joined the organization", { id: loadingToast });
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error("Failed to accept invitation");
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!invitationId) return;
    setActing(true);
    try {
      const loadingToast = toast.loading("Declining...");
      const result = await authFetch("/organization/reject-invitation", {
        method: "POST",
        body: { invitationId },
      });
      if (result.error) {
        toast.error("Could not decline invitation", { id: loadingToast });
        return;
      }
      toast.success("Invitation declined", { id: loadingToast });
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error("Failed to decline invitation");
    } finally {
      setActing(false);
    }
  };

  if (!invitationId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Missing invitation</CardTitle>
            <CardDescription>Use the link from your invitation email.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSessionPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-2 flex items-center gap-2 text-primary">
              <MailCheck className="size-5" />
              <span className="text-sm font-medium">Organization invitation</span>
            </div>
            <CardTitle>Sign in to continue</CardTitle>
            <CardDescription>
              Sign in with the email address this invitation was sent to, then you can accept or
              decline.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="flex-1">
              <Link href={signInHref}>Sign in</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/sign-up">Create account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <p className="text-muted-foreground text-sm">Loading invitation…</p>
      </div>
    );
  }

  if (loadError || !details) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation unavailable</CardTitle>
            <CardDescription>{loadError ?? "Something went wrong."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <MailCheck className="size-5" />
            <span className="text-sm font-medium">You&apos;re invited</span>
          </div>
          <CardTitle>{details.organizationName}</CardTitle>
          <CardDescription>
            <span className="text-foreground">{details.inviterEmail}</span> invited you to join as{" "}
            <span className="font-medium">{details.role}</span>. Invited address: {details.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" disabled={acting} onClick={() => void handleAccept()}>
            Accept
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            disabled={acting}
            onClick={() => void handleReject()}
          >
            Decline
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
