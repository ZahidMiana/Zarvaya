import BlogPost, { type IBlogPostModelShape } from "@/models/BlogPost";
import { connectDB } from "@/lib/db";

export type BlogCategory = "styling-tips" | "care-guide" | "trends" | "bridal";

export type BlogPostListItem = {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: { url: string; publicId: string };
  author: string;
  category: BlogCategory;
  tags: string[];
  readTime: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type BlogPostDetail = BlogPostListItem & {
  content: string;
  metaTitle?: string;
  metaDescription?: string;
};

function toListItem(post: IBlogPostModelShape & { _id: unknown }): BlogPostListItem {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    author: post.author,
    category: post.category,
    tags: post.tags,
    readTime: post.readTime,
    publishedAt: new Date(post.publishedAt ?? post.createdAt).toISOString(),
    createdAt: new Date(post.createdAt).toISOString(),
    updatedAt: new Date(post.updatedAt).toISOString(),
  };
}

function toDetail(post: IBlogPostModelShape & { _id: unknown }): BlogPostDetail {
  const base = toListItem(post);

  return {
    ...base,
    content: post.content,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
  };
}

export async function listPublishedBlogPosts(input: { category?: BlogCategory; limit?: number } = {}): Promise<BlogPostListItem[]> {
  await connectDB();

  const query: Record<string, unknown> = { isPublished: true };
  if (input.category) {
    query.$or = [{ category: input.category }, { tags: input.category }];
  }

  const limit = Math.min(50, Math.max(1, input.limit ?? 50));

  const posts = await BlogPost.find(query)
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  return posts.map((post) => toListItem(post as IBlogPostModelShape & { _id: unknown }));
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  await connectDB();

  const post = await BlogPost.findOne({ slug, isPublished: true }).lean();
  if (!post) {
    return null;
  }

  return toDetail(post as IBlogPostModelShape & { _id: unknown });
}

export async function getRelatedPublishedPosts(input: {
  category: BlogCategory;
  slug: string;
  limit?: number;
}): Promise<BlogPostListItem[]> {
  await connectDB();

  const limit = Math.min(12, Math.max(1, input.limit ?? 3));
  const posts = await BlogPost.find({
    isPublished: true,
    category: input.category,
    slug: { $ne: input.slug },
  })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  return posts.map((post) => toListItem(post as IBlogPostModelShape & { _id: unknown }));
}
