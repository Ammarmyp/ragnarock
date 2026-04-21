"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type CreateOrganizationResponse = {
  id: string;
  name: string;
  slug: string;
};

export default function CreateOrganizationOnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: activeOrganization, isPending: isActiveOrgPending } =
    authClient.useActiveOrganization();

  const authFetch = authClient.$fetch as <T>(
    path: string,
    options: {
      method: "POST";
      body: Record<string, unknown>;
    },
  ) => Promise<{ data: T; error: unknown }>;

  useEffect(() => {
    if (!isActiveOrgPending && activeOrganization?.id) {
      router.replace("/dashboard/projects");
    }
  }, [activeOrganization?.id, isActiveOrgPending, router]);

  const normalizeSlug = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const generatedSlug = normalizeSlug(name);

  const handleCreateOrganization = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedSlug = generatedSlug;

    if (!name.trim() || !normalizedSlug) {
      toast.error("Enter a valid organization name");
      return;
    }

    setIsLoading(true);
    try {
      const loadingToast = toast.loading("Creating organization...");
      const result = await authFetch<CreateOrganizationResponse>("/organization/create", {
        method: "POST",
        body: {
          name: name.trim(),
          slug: normalizedSlug,
        },
      });

      if (result.error) {
        toast.error("Could not create organization", { id: loadingToast });
        return;
      }

      // Explicitly set the just-created organization as active for this session
      // before navigating, so the app can land on /dashboard/projects immediately.
      const setActiveResult = await authFetch<{ success: boolean }>("/organization/set-active", {
        method: "POST",
        body: { organizationId: result.data.id },
      });
      if (setActiveResult.error) {
        toast.error("Organization created but activation failed", { id: loadingToast });
        return;
      }

      setLastActiveOrganizationIdClient(result.data.id);
      toast.success("Organization created", { id: loadingToast });
      router.replace("/dashboard/projects");
      router.refresh();
    } catch (error) {
      console.error("Organization creation failed", error);
      toast.error("Failed to create organization");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Building2 className="size-5" />
            <span className="text-sm font-medium">Organization setup</span>
          </div>
          <CardTitle>Create your organization</CardTitle>
          <CardDescription>
            Start by creating your workspace. You will be added as the owner automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleCreateOrganization}>
            <div className="space-y-2">
              <Label htmlFor="organization-name">Organization name</Label>
              <Input
                id="organization-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Inc"
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization-slug">Organization slug</Label>
              <Input
                id="organization-slug"
                value={generatedSlug}
                placeholder="acme-inc"
                disabled
                readOnly
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating organization..." : "Continue to dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
