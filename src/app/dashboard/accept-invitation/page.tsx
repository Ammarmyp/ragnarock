import { Suspense } from "react";
import { AcceptInvitationContent } from "./accept-invitation-content";

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-muted/30 flex min-h-screen items-center justify-center p-4">
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
