import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { CheckoutFlow } from "@/components/checkout-flow";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[var(--cream-50)] text-[var(--ink-950)]">
      <StoreHeader />
      <CheckoutFlow />
      <StoreFooter />
    </main>
  );
}
