import { DashboardLayout } from "@/layouts/dashboard/dashboard-layout";
import { AccountSettingsShell } from "@/components/account/account-settings-shell";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <AccountSettingsShell>{children}</AccountSettingsShell>
    </DashboardLayout>
  );
}
