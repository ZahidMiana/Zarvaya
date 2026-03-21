import { notFound } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { sampleBlogPosts } from "@/lib/sample-data";

type BlogDetailPageProps = {
  params: {
    slug: string;
  };
};

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const post = sampleBlogPosts.find((item) => item.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />
      <h1 className="font-playfair text-4xl text-charcoal">{post.title}</h1>
      <p className="text-charcoal/75">{post.excerpt}</p>
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-charcoal/80">
        <p>
          This is a production-ready blog detail route scaffold. In upcoming modules, it will render rich
          content from MongoDB-powered blog posts.
        </p>
      </div>
    </article>
  );
}
