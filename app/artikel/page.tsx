import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { db } from "@/db/client";
import { articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { AdUnit } from "@/components/ads/ad-unit";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
  canonical,
  jsonLdScript,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

const ARTIKEL_DESCRIPTION =
  "Temukan berbagai artikel menarik, tips memasak, dan inspirasi resep hidangan keluarga dari Jasmine Frozen Food.";

export const metadata: Metadata = {
  title: "Artikel & Tips Memasak",
  description: ARTIKEL_DESCRIPTION,
  ...canonical("/artikel"),
  openGraph: {
    title: `Artikel & Tips Memasak | ${SITE_NAME}`,
    description: ARTIKEL_DESCRIPTION,
    type: "website",
    url: absoluteUrl("/artikel"),
    siteName: SITE_NAME,
    locale: "id_ID",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `Artikel & Tips Memasak | ${SITE_NAME}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Artikel & Tips Memasak | ${SITE_NAME}`,
    description: ARTIKEL_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

async function getArticles() {
  return await db.query.articles.findMany({
    where: eq(articles.isPublished, true),
    orderBy: [desc(articles.publishedAt)],
  });
}

function ArticlesJsonLd({ items }: { items: { title: string; slug: string; excerpt: string }[] }) {
  const listUrl = absoluteUrl("/artikel");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbJsonLd([
        { name: "Beranda", path: "/" },
        { name: "Artikel", path: "/artikel" },
      ]),
      {
        "@type": "CollectionPage",
        name: `Artikel & Tips Memasak | ${SITE_NAME}`,
        description: ARTIKEL_DESCRIPTION,
        url: listUrl,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: items.map((article, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(`/artikel/${article.slug}`),
            name: article.title,
            description: article.excerpt,
          })),
        },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
    />
  );
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
            <>
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

            <div className="mt-12">
              <AdUnit slot={process.env.NEXT_PUBLIC_AD_SLOT_ARTICLE ?? ""} />
            </div>
            </>
          ) : (
            <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center">
              <p className="text-stone-500">Belum ada artikel yang diterbitkan saat ini. Nantikan segera!</p>
            </div>
          )}
        </Container>
      </main>

      <StoreFooter />
      <ArticlesJsonLd
        items={items.map((article) => ({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt || "",
        }))}
      />
    </div>
  );
}
