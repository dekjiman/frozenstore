import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Container } from "@/components/ui/container";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
};

export function ArticleSection({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="bg-white py-16 sm:py-24">
      <Container>
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-[var(--brand-600)]">
              <BookOpen size={16} />
              <span>TIPS & INSPIRASI</span>
            </div>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[var(--ink-950)] sm:text-4xl">
              Artikel Terbaru
            </h2>
            <p className="mt-2 text-stone-500">
              Temukan inspirasi dan panduan memasak terbaik untuk keluarga.
            </p>
          </div>
          <Link
            href="/artikel"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
          >
            Lihat semua artikel
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
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
      </Container>
    </section>
  );
}
