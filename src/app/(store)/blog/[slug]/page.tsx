import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getPublishedBlogPostBySlug,
  getRelatedPublishedPosts,
  listPublishedBlogPosts,
} from "@/lib/services/blog-service";

type BlogDetailPageProps = {
  params: {
    slug: string;
  };
};

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function enrichHtmlWithToc(content: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];

  const html = content.replace(/<(h2|h3)>(.*?)<\/\1>/gi, (_match, tag: "h2" | "h3", rawText: string) => {
    const text = rawText.replace(/<[^>]*>/g, "").trim();
    const id = slugifyHeading(text);

    toc.push({
      id,
      text,
      level: tag === "h2" ? 2 : 3,
    });

    return `<${tag} id="${id}">${rawText}</${tag}>`;
  });

  return { html, toc };
}

export async function generateStaticParams() {
  const posts = await listPublishedBlogPosts({ limit: 50 });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const post = await getPublishedBlogPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Blog Post Not Found",
      description: "The requested article does not exist.",
    };
  }

  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt,
    openGraph: {
      type: "article",
      title: post.metaTitle ?? post.title,
      description: post.metaDescription ?? post.excerpt,
      images: [{ url: post.coverImage.url, alt: post.title }],
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const post = await getPublishedBlogPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  const { html, toc } = enrichHtmlWithToc(post.content);
  const related = await getRelatedPublishedPosts({ category: post.category, slug: post.slug, limit: 3 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription ?? post.excerpt,
    image: [post.coverImage.url],
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "ZARVAYA JEWELS",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/placeholders/jewelry-fallback.svg`,
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: postUrl,
  };

  return (
    <article className="space-y-8 pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.24em] text-gold">{post.category.replace(/-/g, " ")}</p>
        <h1 className="max-w-4xl font-playfair text-5xl text-charcoal">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-charcoal/65">
          <span>By {post.author}</span>
          <span>•</span>
          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>{post.readTime} min read</span>
        </div>
      </header>

      <section className="relative overflow-hidden rounded-3xl border border-stone-200">
        <div className="relative aspect-[16/7]">
          <Image
            src={post.coverImage.url}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr_240px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-charcoal/55">Contents</p>
            <ul className="mt-3 space-y-2 text-sm text-charcoal/75">
              {toc.map((item) => (
                <li key={item.id} className={item.level === 3 ? "pl-3" : ""}>
                  <a href={`#${item.id}`} className="hover:text-charcoal hover:underline">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section
          className="prose prose-stone max-w-none prose-headings:font-playfair prose-headings:text-charcoal prose-p:text-charcoal/80"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-2 rounded-2xl border border-stone-200 bg-white p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.16em] text-charcoal/55">Share</p>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="block text-charcoal/75 hover:text-charcoal"
            >
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noreferrer"
              className="block text-charcoal/75 hover:text-charcoal"
            >
              X / Twitter
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${postUrl}`)}`}
              target="_blank"
              rel="noreferrer"
              className="block text-charcoal/75 hover:text-charcoal"
            >
              WhatsApp
            </a>
          </div>
        </aside>
      </div>

      <section className="space-y-4 border-t border-stone-200 pt-6">
        <h2 className="font-playfair text-3xl text-charcoal">Related Posts</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {related.map((item) => (
            <article key={item.slug} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <div className="relative aspect-[4/3]">
                <Image src={item.coverImage.url} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="space-y-2 p-4">
                <h3 className="line-clamp-2 font-playfair text-2xl text-charcoal">{item.title}</h3>
                <p className="line-clamp-2 text-sm text-charcoal/72">{item.excerpt}</p>
                <Link href={`/blog/${item.slug}`} className="text-xs tracking-[0.08em] text-gold-dark hover:underline">
                  Read More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}
