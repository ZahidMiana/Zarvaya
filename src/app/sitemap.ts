import type { MetadataRoute } from "next";
import { ProductCategory } from "@/types";
import Product from "@/models/Product";
import BlogPost from "@/models/BlogPost";
import { connectDB } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/shipping`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/returns`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/faqs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = Object.values(ProductCategory).map((category) => ({
    url: `${siteUrl}/categories/${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  try {
    await connectDB();

    const [products, blogPosts] = await Promise.all([
      Product.find({ isAvailable: true }).select({ slug: 1, updatedAt: 1 }).lean(),
      BlogPost.find({ isPublished: true }).select({ slug: 1, updatedAt: 1, publishedAt: 1 }).lean(),
    ]);

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${siteUrl}/shop/${product.slug}`,
      lastModified: new Date(product.updatedAt ?? new Date()),
      changeFrequency: "weekly",
      priority: 0.85,
    }));

    const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt ?? post.publishedAt ?? new Date()),
      changeFrequency: "monthly",
      priority: 0.75,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
  } catch {
    return [...staticRoutes, ...categoryRoutes];
  }
}
