import { model, models, Schema, type HydratedDocument, type Model } from "mongoose";
import { generateSlug } from "@/lib/utils";

type BlogCategory = "styling-tips" | "care-guide" | "trends" | "bridal";

interface ICoverImage {
  url: string;
  publicId: string;
}

export interface IBlogPostModelShape {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: ICoverImage;
  author: string;
  category: BlogCategory;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
  metaTitle?: string;
  metaDescription?: string;
  readTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export type BlogPostDocument = HydratedDocument<IBlogPostModelShape>;
export type BlogPostModel = Model<IBlogPostModelShape>;

const CoverImageSchema = new Schema<ICoverImage>(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const BlogPostSchema = new Schema<IBlogPostModelShape, BlogPostModel>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, unique: true, index: true, lowercase: true, trim: true },
    excerpt: { type: String, required: true, trim: true, maxlength: 320 },
    content: { type: String, required: true, trim: true },
    coverImage: { type: CoverImageSchema, required: true },
    author: { type: String, required: true, trim: true, maxlength: 120 },
    category: {
      type: String,
      required: true,
      enum: ["styling-tips", "care-guide", "trends", "bridal"],
      index: true,
    },
    tags: { type: [String], default: [] },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
    metaTitle: { type: String, trim: true, maxlength: 180 },
    metaDescription: { type: String, trim: true, maxlength: 320 },
    readTime: { type: Number, min: 1, default: 1 },
  },
  { timestamps: true },
);

BlogPostSchema.index({ createdAt: -1, isPublished: 1 });
BlogPostSchema.index({ tags: 1 });

function calculateReadTime(html: string): number {
  const plainText = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = plainText ? plainText.split(" ").length : 0;

  return Math.max(1, Math.ceil(wordCount / 200));
}

BlogPostSchema.pre("validate", function blogPreValidate(this: BlogPostDocument) {
  if (this.isModified("title") || !this.slug) {
    this.slug = generateSlug(this.title);
  }

  if (this.isModified("content") || this.isNew) {
    this.readTime = calculateReadTime(this.content);
  }

  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  if (!this.isPublished) {
    this.publishedAt = undefined;
  }
});

const BlogPost =
  (models.BlogPost as BlogPostModel) || model<IBlogPostModelShape, BlogPostModel>("BlogPost", BlogPostSchema);

export default BlogPost;
