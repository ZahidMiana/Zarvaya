import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { listPublishedBlogPosts, type BlogCategory } from "@/lib/services/blog-service";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read styling guides, care tips, bridal trends, and jewellery inspiration from ZARVAYA JEWELS.",
};

const categories: Array<{ label: string; value: "all" | BlogCategory }> = [
  { label: "All", value: "all" },
  { label: "Styling Tips", value: "styling-tips" },
  { label: "Care Guide", value: "care-guide" },
  { label: "Trends", value: "trends" },
  { label: "Bridal", value: "bridal" },
];

type BlogPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function categoryLabel(value: BlogCategory): string {
  const item = categories.find((entry) => entry.value === value);
  return item?.label ?? "Article";
}

export default async function BlogPage({ searchParams = {} }: BlogPageProps) {
  const selected = typeof searchParams.category === "string" ? searchParams.category : "all";
  const selectedCategory = categories.some((item) => item.value === selected) ? selected : "all";
  const posts = await listPublishedBlogPosts({
    category: selectedCategory === "all" ? undefined : (selectedCategory as BlogCategory),
    limit: 50,
  });

  return (
    <div className="space-y-8 pb-10">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Style Journal</p>
        <h1 className="font-playfair text-5xl text-charcoal">Stories, Styling & Care</h1>
        <p className="max-w-2xl text-sm text-charcoal/72">
          Discover practical jewellery care, bridal inspirations, and styling ideas for every occasion.
        </p>
      </section>

      <section className="flex flex-wrap gap-2">
        {categories.map((item) => {
          const isActive = item.value === selectedCategory;
          return (
            <Link
              key={item.value}
              href={item.value === "all" ? "/blog" : `/blog?category=${item.value}`}
              className={`rounded-full border px-4 py-2 text-xs tracking-[0.08em] transition ${
                isActive
                  ? "border-charcoal bg-charcoal text-cream"
                  : "border-stone-300 bg-white text-charcoal hover:border-charcoal"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </section>

      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.slug} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={post.coverImage.url}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-3 p-4">
              <span className="inline-flex rounded-full bg-gold/18 px-2.5 py-1 text-[10px] tracking-[0.08em] text-gold-dark">
                {categoryLabel(post.category)}
              </span>
              <h2 className="line-clamp-2 font-playfair text-2xl text-charcoal">{post.title}</h2>
              <p className="line-clamp-3 text-sm text-charcoal/72">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-charcoal/60">
                <span>{post.readTime} min read</span>
                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
              </div>
              <Link href={`/blog/${post.slug}`} className="inline-block text-xs tracking-[0.08em] text-gold-dark hover:underline">
                Read Article
              </Link>
            </div>
          </article>
        ))}
      </section>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-charcoal/70">
          No posts found in this category yet.
        </div>
      ) : null}
    </div>
  );
}
