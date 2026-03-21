import crypto from "crypto";
import Product, { type IProductModelShape } from "@/models/Product";
import { deleteCache, deleteCachePattern, getCache, setCache } from "@/lib/redis";
import { getPrimaryImageUrl } from "@/lib/utils";
import { ProductCategory, ProductMaterial, type IProduct } from "@/types";

type ProductSort = "newest" | "price-asc" | "price-desc" | "trending" | "bestseller";

export type ProductListParams = {
  category?: string;
  material?: string;
  occasion?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  limit?: number;
};

export type ProductListResponse = {
  products: IProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

function createParamsHash(params: ProductListParams): string {
  const normalized = JSON.stringify(
    Object.keys(params)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = params[key as keyof ProductListParams] ?? null;
        return acc;
      }, {}),
  );

  return crypto.createHash("sha1").update(normalized).digest("hex");
}

function toProduct(entity: IProductModelShape & { _id: unknown }): IProduct {
  const product = {
    ...(entity as unknown as IProduct),
    _id: String(entity._id),
    relatedProducts: Array.isArray(entity.relatedProducts)
      ? entity.relatedProducts.map((id) => String(id))
      : [],
    createdAt: new Date(entity.createdAt).toISOString(),
    updatedAt: new Date(entity.updatedAt).toISOString(),
  };

  return {
    ...product,
    thumbnail: getPrimaryImageUrl(product),
  };
}

function parseSort(sort: ProductSort | undefined): Record<string, 1 | -1> {
  switch (sort) {
    case "price-asc":
      return { price: 1 };
    case "price-desc":
      return { price: -1 };
    case "trending":
      return { isTrending: -1, createdAt: -1 };
    case "bestseller":
      return { soldCount: -1, createdAt: -1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
}

function parseCsv(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildProductFilter(params: ProductListParams): Record<string, unknown> {
  const filter: Record<string, unknown> = { isAvailable: true };

  if (params.category) {
    const categories = parseCsv(params.category).filter((item): item is ProductCategory =>
      Object.values(ProductCategory).includes(item as ProductCategory),
    );

    if (categories.length === 1) {
      filter.category = categories[0];
    } else if (categories.length > 1) {
      filter.category = { $in: categories };
    }
  }

  if (params.material) {
    const materials = parseCsv(params.material).filter((item): item is ProductMaterial =>
      Object.values(ProductMaterial).includes(item as ProductMaterial),
    );

    if (materials.length === 1) {
      filter.material = materials[0];
    } else if (materials.length > 1) {
      filter.material = { $in: materials };
    }
  }

  if (params.occasion) {
    const occasions = params.occasion
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (occasions.length > 0) {
      filter.occasion = { $in: occasions };
    }
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};

    if (params.minPrice !== undefined) {
      priceFilter.$gte = params.minPrice;
    }

    if (params.maxPrice !== undefined) {
      priceFilter.$lte = params.maxPrice;
    }

    filter.price = priceFilter;
  }

  return filter;
}

export async function listProducts(params: ProductListParams): Promise<ProductListResponse> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, Math.max(1, params.limit ?? 12));
  const skip = (page - 1) * limit;
  const cacheKey = `products:${createParamsHash({ ...params, page, limit })}`;

  const cached = await getCache<ProductListResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const filter = buildProductFilter(params);
  const sort = parseSort(params.sort);

  const [entities, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  const payload: ProductListResponse = {
    products: entities.map(toProduct),
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  };

  await setCache(cacheKey, payload, 300);
  return payload;
}

export async function getTrendingProducts(): Promise<IProduct[]> {
  const cacheKey = "trending_products";
  const cached = await getCache<IProduct[]>(cacheKey);

  if (cached) {
    return cached;
  }

  const entities = await Product.find({ isTrending: true, isAvailable: true })
    .sort({ createdAt: -1 })
    .limit(8)
    .select({ images: { $slice: 1 } })
    .lean();

  const data = entities.map(toProduct);
  await setCache(cacheKey, data, 600);

  return data;
}

export async function getFeaturedProducts(): Promise<IProduct[]> {
  const cacheKey = "featured_products";
  const cached = await getCache<IProduct[]>(cacheKey);

  if (cached) {
    return cached;
  }

  const entities = await Product.find({ isFeatured: true, isAvailable: true })
    .sort({ createdAt: -1 })
    .limit(6)
    .select({ images: { $slice: 1 } })
    .lean();

  const data = entities.map(toProduct);
  await setCache(cacheKey, data, 600);

  return data;
}

export async function getNewArrivalProducts(): Promise<IProduct[]> {
  const cacheKey = "new_arrivals_products";
  const cached = await getCache<IProduct[]>(cacheKey);

  if (cached) {
    return cached;
  }

  const entities = await Product.find({ isNewArrival: true, isAvailable: true })
    .sort({ createdAt: -1 })
    .limit(8)
    .select({ images: { $slice: 1 } })
    .lean();

  const data = entities.map(toProduct);
  await setCache(cacheKey, data, 600);

  return data;
}

export async function searchProducts(query: string, page = 1, limit = 12): Promise<ProductListResponse> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(50, Math.floor(limit)) : 12;
  const skip = (safePage - 1) * safeLimit;

  let entities: Array<IProductModelShape & { _id: unknown }> = [];
  let total = 0;

  try {
    [entities, total] = await Promise.all([
      Product.find({ $text: { $search: query }, isAvailable: true }, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" }, createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Product.countDocuments({ $text: { $search: query }, isAvailable: true }),
    ]);
  } catch {
    const regex = new RegExp(query, "i");

    [entities, total] = await Promise.all([
      Product.find({
        isAvailable: true,
        $or: [{ name: regex }, { description: regex }, { tags: regex }],
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Product.countDocuments({
        isAvailable: true,
        $or: [{ name: regex }, { description: regex }, { tags: regex }],
      }),
    ]);
  }

  return {
    products: entities.map(toProduct),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
}

export async function getProductBySlug(slug: string): Promise<{ product: IProduct; relatedProducts: IProduct[] } | null> {
  const cacheKey = `product:${slug}`;
  const cached = await getCache<{ product: IProduct; relatedProducts: IProduct[] }>(cacheKey);

  if (cached) {
    void Product.updateOne({ slug, isAvailable: true }, { $inc: { views: 1 } }).exec();
    return cached;
  }

  const entity = await Product.findOneAndUpdate(
    { slug, isAvailable: true },
    { $inc: { views: 1 } },
    { returnDocument: "after" },
  ).lean();

  if (!entity) {
    return null;
  }

  const relatedEntities = await Product.find({
    _id: { $ne: entity._id },
    category: entity.category,
    isAvailable: true,
  })
    .sort({ isBestSeller: -1, createdAt: -1 })
    .limit(3)
    .select({ images: { $slice: 1 } })
    .lean();

  const payload = {
    product: toProduct(entity),
    relatedProducts: relatedEntities.map(toProduct),
  };

  await setCache(cacheKey, payload, 1800);
  return payload;
}

export async function clearProductCaches(slugs: string[] = []): Promise<void> {
  await Promise.all([
    deleteCachePattern("products:*"),
    deleteCache("trending_products"),
    deleteCache("featured_products"),
    deleteCache("new_arrivals_products"),
    ...slugs.map((slug) => deleteCache(`product:${slug}`)),
    deleteCachePattern("product:*"),
  ]);
}

export async function softDeleteProduct(slug: string): Promise<IProduct | null> {
  const updated = await Product.findOneAndUpdate(
    { slug },
    { $set: { isAvailable: false } },
    { returnDocument: "after" },
  ).lean();

  if (!updated) {
    return null;
  }

  return toProduct(updated);
}
