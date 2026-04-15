import { Suspense } from "react";
import { SelectOrganizationContent } from "./select-organization-content";

export default function SelectOrganizationPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-muted/30 flex min-h-screen items-center justify-center p-4">
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      }
    >
      <SelectOrganizationContent />
    </Suspense>
  );
}
