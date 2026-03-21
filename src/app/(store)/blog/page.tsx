import Link from "next/link";
import PageHeader from "@/components/common/PageHeader";
import { sampleBlogPosts } from "@/lib/sample-data";

export default function BlogPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Style Journal" subtitle="Jewellery styling tips, care guides, and trend insights." />
      <div className="grid gap-4 md:grid-cols-2">
        {sampleBlogPosts.map((post) => (
          <article key={post.slug} className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="font-playfair text-2xl text-charcoal">{post.title}</h2>
            <p className="mt-3 text-sm text-charcoal/70">{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className="mt-4 inline-block text-sm font-semibold text-gold-dark">
              Read More
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
