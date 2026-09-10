import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { AccountPage } from "@/components/account-page";

export default function CustomerAccountPage() {
  return (
    <main className="min-h-screen bg-[var(--cream-50)] text-[var(--ink-950)]">
      <StoreHeader />
      <AccountPage />
      <StoreFooter />
    </main>
  );
}
