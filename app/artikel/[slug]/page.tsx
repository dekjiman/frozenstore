import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, User } from "lucide-react";
import { db } from "@/db/client";
import { articles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { ShareButton } from "@/components/storefront/share-button";

export const revalidate = 60;

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getArticle(slug: string) {
  return await db.query.articles.findFirst({
    where: and(eq(articles.slug, slug), eq(articles.isPublished, true)),
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Artikel Tidak Ditemukan" };
  }

  return {
    title: `${article.title} — Jasmine Shop Premium Product`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
      authors: [article.authorName],
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  const publishDate = article.publishedAt 
    ? new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Belum diterbitkan';

  return (
    <div className="min-h-screen bg-[var(--cream-50)] flex flex-col">
      <StoreHeader />

      <main className="flex-1 py-10 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Link 
              href="/artikel" 
              className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-[var(--brand-600)] mb-8 transition-colors"
            >
              <ArrowLeft size={16} /> Kembali ke daftar artikel
            </Link>

            <header className="mb-10 text-center">
              <h1 className="font-serif text-3xl font-bold leading-tight text-[var(--ink-950)] sm:text-5xl mb-6">
                {article.title}
              </h1>
              
              <div className="flex items-center justify-center gap-4 text-sm font-medium text-stone-500">
                <div className="flex items-center gap-2">
                  <User size={16} /> {article.authorName}
                </div>
                <span>•</span>
                <time dateTime={article.publishedAt ? new Date(article.publishedAt).toISOString() : ""}>
                  {publishDate}
                </time>
              </div>

              <div className="mt-6 flex justify-center">
                <ShareButton
                  title={article.title}
                  url={`${BASE}/artikel/${article.slug}`}
                  image={article.coverImage ?? undefined}
                />
              </div>
            </header>

            {article.coverImage && (
              <div className="mb-12 overflow-hidden rounded-3xl border border-stone-200">
                <img 
                  src={article.coverImage} 
                  alt={article.title} 
                  className="w-full h-auto aspect-[16/9] object-cover"
                />
              </div>
            )}

            <div className="prose prose-stone prose-lg max-w-none mx-auto prose-headings:font-serif prose-a:text-[var(--brand-600)] hover:prose-a:text-[var(--brand-700)] prose-img:rounded-2xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {article.content}
              </ReactMarkdown>
            </div>
            
            <div className="mt-16 pt-8 border-t border-stone-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-stone-200">
                <div>
                  <h4 className="font-serif font-bold text-lg text-stone-900">Belanja Kebutuhan Dapur?</h4>
                  <p className="text-sm text-stone-600 mt-1">Dapatkan aneka produk frozen food lezat dan praktis.</p>
                </div>
                <Link href="/produk" className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-600)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)]">
                  Lihat Katalog Produk
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <StoreFooter />
    </div>
  );
}
