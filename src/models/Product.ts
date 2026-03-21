import {
  model,
  models,
  Schema,
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";
import Counter from "@/models/Counter";
import { generateSlug } from "@/lib/utils";
import { ProductCategory, ProductMaterial, ProductOccasion } from "@/types";

export interface IProductImageModel {
  url: string;
  publicId: string;
  alt: string;
  isPrimary: boolean;
}

export interface IProductModelShape {
  name: string;
  slug: string;
  sku: string;
  category: ProductCategory;
  subcategory?: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  images: IProductImageModel[];
  material: ProductMaterial;
  occasion: ProductOccasion[];
  weight?: string;
  dimensions?: string;
  stock: number;
  isAvailable: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  views: number;
  soldCount: number;
  rating: number;
  reviewCount: number;
  relatedProducts: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFindOptions {
  page?: number;
  limit?: number;
  onlyAvailable?: boolean;
  sortBy?: "createdAt" | "price" | "soldCount";
  sortOrder?: "asc" | "desc";
}

export interface ProductSearchResult {
  items: ProductDocument[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductModel extends Model<IProductModelShape> {
  findByCategory(category: ProductCategory, options?: ProductFindOptions): Promise<ProductSearchResult>;
  search(query: string, page?: number, limit?: number): Promise<ProductSearchResult>;
}

export type ProductDocument = HydratedDocument<IProductModelShape>;

const ProductImageSchema = new Schema<IProductImageModel>(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, required: true, trim: true },
    alt: { type: String, required: true, trim: true, maxlength: 180 },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false },
);

const ProductSchema = new Schema<IProductModelShape, ProductModel>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, lowercase: true, trim: true },
    sku: { type: String, unique: true, trim: true, index: true },
    category: {
      type: String,
      required: true,
      enum: Object.values(ProductCategory),
      index: true,
    },
    subcategory: { type: String, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    shortDescription: { type: String, trim: true, maxlength: 200 },
    price: { type: Number, required: true, min: 0 },
    discountPrice: {
      type: Number,
      min: 0,
      validate: {
        validator(value: number | undefined) {
          if (value === undefined || value === null) {
            return true;
          }

          return value <= (this as { price: number }).price;
        },
        message: "Discount price cannot exceed product price.",
      },
    },
    images: {
      type: [ProductImageSchema],
      default: [],
      validate: {
        validator(value: IProductImageModel[]) {
          return value.length > 0;
        },
        message: "At least one product image is required.",
      },
    },
    material: {
      type: String,
      required: true,
      enum: Object.values(ProductMaterial),
      index: true,
    },
    occasion: {
      type: [String],
      enum: Object.values(ProductOccasion),
      default: [],
    },
    weight: { type: String, trim: true, maxlength: 40 },
    dimensions: { type: String, trim: true, maxlength: 60 },
    stock: { type: Number, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true, index: true },
    isTrending: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: true, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    tags: { type: [String], default: [] },
    metaTitle: { type: String, trim: true, maxlength: 180 },
    metaDescription: { type: String, trim: true, maxlength: 320 },
    views: { type: Number, default: 0, min: 0 },
    soldCount: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    relatedProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ category: 1, isAvailable: 1 });
ProductSchema.index({ isTrending: 1, isAvailable: 1 });
ProductSchema.index({ isFeatured: 1, isAvailable: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ name: "text", description: "text", tags: "text" });

ProductSchema.virtual("discountPercent").get(function discountPercentGetter(this: ProductDocument) {
  if (!this.discountPrice || this.price <= 0 || this.discountPrice >= this.price) {
    return 0;
  }

  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

async function generateUniqueSlug(doc: ProductDocument): Promise<string> {
  const Product = doc.constructor as ProductModel;
  const baseSlug = generateSlug(doc.name);
  let slug = baseSlug;
  let suffix = 1;

  while (
    await Product.exists({
      slug,
      _id: { $ne: doc._id },
    })
  ) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

async function generateSku(category: ProductCategory): Promise<string> {
  const key = `sku-${category}`;
  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
  ).lean();

  const sequence = String(counter.seq).padStart(3, "0");
  return `ZJ-${category.toUpperCase()}-${sequence}`;
}

ProductSchema.pre("validate", async function productPreValidate(this: ProductDocument) {
  if (this.isModified("name") || !this.slug) {
    this.slug = await generateUniqueSlug(this);
  }

  if (!this.sku && this.category) {
    this.sku = await generateSku(this.category);
  }

  if (!this.images.some((image) => image.isPrimary) && this.images.length > 0) {
    this.images[0].isPrimary = true;
  }

  if (this.isModified("stock")) {
    this.isAvailable = this.stock > 0;
  }

  if (this.isNewArrival && this.createdAt) {
    const ageInDays = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays > 30) {
      this.isNewArrival = false;
    }
  }
});

ProductSchema.static(
  "findByCategory",
  async function findByCategory(this: ProductModel, category: ProductCategory, options: ProductFindOptions = {}) {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 12));
    const skip = (page - 1) * limit;
    const sortBy = options.sortBy ?? "createdAt";
    const sortOrder = options.sortOrder === "asc" ? 1 : -1;

    const filter: Record<string, unknown> = {
      category,
      ...(options.onlyAvailable !== false ? { isAvailable: true } : {}),
    };

    const [items, totalItems] = await Promise.all([
      this.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.countDocuments(filter),
    ]);

    return {
      items,
      totalItems,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    } satisfies ProductSearchResult;
  },
);

ProductSchema.static(
  "search",
  async function search(this: ProductModel, query: string, page = 1, limit = 12) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;
    const trimmedQuery = query.trim();

    const filter: Record<string, unknown> = trimmedQuery
      ? { $text: { $search: trimmedQuery }, isAvailable: true }
      : { isAvailable: true };

    const finder = this.find(filter).skip(skip).limit(safeLimit);

    if (trimmedQuery) {
      finder.sort({ score: { $meta: "textScore" }, createdAt: -1 } as never);
      finder.select({ score: { $meta: "textScore" } } as never);
    } else {
      finder.sort({ createdAt: -1 });
    }

    const [items, totalItems] = await Promise.all([finder.exec(), this.countDocuments(filter)]);

    return {
      items,
      totalItems,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.max(1, Math.ceil(totalItems / safeLimit)),
    } satisfies ProductSearchResult;
  },
);

const Product = (models.Product as ProductModel) || model<IProductModelShape, ProductModel>("Product", ProductSchema);

export default Product;
