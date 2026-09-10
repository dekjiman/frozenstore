import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { db } from "@/db/client";
import { articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artikel & Tips Memasak — Jasmine Shop Premium Product",
  description: "Temukan berbagai artikel menarik, tips memasak, dan inspirasi resep hidangan keluarga dari Jasmine Shop Premium Product.",
};

async function getArticles() {
  return await db.query.articles.findMany({
    where: eq(articles.isPublished, true),
    orderBy: [desc(articles.publishedAt)],
  });
}

export default async function ArticlesPage() {
  const items = await getArticles();

  return (
    <div className="min-h-screen bg-[var(--cream-50)] flex flex-col">
      <StoreHeader />

      <main className="flex-1 py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand-100)] px-4 py-1.5 text-sm font-semibold tracking-wide text-[var(--brand-700)] mb-4">
              <BookOpen size={16} />
              TIPS & INSPIRASI
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--ink-950)] sm:text-5xl">
              Artikel & Resep Pilihan
            </h1>
            <p className="mt-4 text-lg text-stone-600">
              Jelajahi panduan praktis, resep hidangan lezat, dan ide sajian istimewa menggunakan produk andalan Jasmine Shop Premium Product.
            </p>
          </div>

          {items.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((article) => (
                <Link
                  key={article.id}
                  href={`/artikel/${article.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:border-[var(--brand-300)] hover:shadow-lg hover:shadow-[var(--brand-100)]"
                >
                  <div className="aspect-[16/9] w-full overflow-hidden bg-stone-100">
                    {article.coverImage ? (
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-stone-100 text-stone-300">
                        <BookOpen size={48} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru'}
                    </p>
                    <h3 className="font-serif text-xl font-bold leading-tight text-stone-900 transition group-hover:text-[var(--brand-600)]">
                      {article.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-stone-600">
                      {article.excerpt}
                    </p>
                    <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-600)]">
                      Baca selengkapnya <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center">
              <p className="text-stone-500">Belum ada artikel yang diterbitkan saat ini. Nantikan segera!</p>
            </div>
          )}
        </Container>
      </main>

      <StoreFooter />
    </div>
  );
}
