import { AdminArticlesPage } from "@/components/admin-articles-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Artikel - Admin",
};

export default function Page() {
  return <AdminArticlesPage />;
}
