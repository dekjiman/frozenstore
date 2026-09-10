import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { CartContent } from "@/components/cart-content";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-[var(--cream-50)] text-[var(--ink-950)]">
      <StoreHeader />
      <CartContent />
      <StoreFooter />
    </main>
  );
}
