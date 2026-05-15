import { Suspense } from "react";
import { WorkspaceLoadingState } from "@/components/feedback/feedback-state";
import { SelectOrganizationContent } from "./select-organization-content";

export default function SelectOrganizationPage() {
  return (
    <Suspense fallback={<WorkspaceLoadingState />}>
      <SelectOrganizationContent />
    </Suspense>
  );
}
