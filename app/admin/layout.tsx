import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";
import { AdminShell } from "@/components/admin-shell";

export const metadata: Metadata = {
  ...noIndex(),
  title: {
    default: "Admin",
    template: "%s | Admin Jasmine Frozen Food",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
