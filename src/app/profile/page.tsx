/**
 * User profile — connected OAuth accounts and related settings.
 */

import { DashboardLayout } from "@/layouts/dashboard/dashboard-layout";
import { ConnectedAccountsCard } from "@/components/profile/connected-accounts-card";

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage how you sign in and link social providers to your account.
          </p>
        </div>
        <ConnectedAccountsCard />
      </div>
    </DashboardLayout>
  );
}
