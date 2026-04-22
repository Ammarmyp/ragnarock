import { AccountPreferencesForm } from "@/components/account/account-preferences-form";
import { ConnectedAccountsCard } from "@/components/account/connected-accounts-card";

export default function AccountPreferencesPage() {
  return (
    <div className="space-y-12">
      <AccountPreferencesForm />
      <ConnectedAccountsCard />
    </div>
  );
}
