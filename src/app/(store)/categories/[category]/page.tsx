import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "@/components/common/Breadcrumb";
import ShopBrowser from "@/components/store/ShopBrowser";
import { connectDB } from "@/lib/db";
import {
  CATEGORY_OPTIONS,
  categoryLabel,
  parseShopFilters,
  type ShopFilters,
} from "@/lib/shop";
import { buildProductFilter, listProducts } from "@/lib/services/product-service";
import Product from "@/models/Product";
import { ProductCategory } from "@/types";

const PAGE_SIZE = 12;

const CATEGORY_META: Record<
  ProductCategory,
  { title: string; description: string; heroImage: string }
> = {
  [ProductCategory.NECKLACE]: {
    title: "Gold Necklaces | Designer Jewellery Pakistan | ZARVAYA JEWELS",
    description:
      "Explore handcrafted necklace designs for bridal, festive, and modern occasion wear in Pakistan.",
    heroImage: "/placeholders/editorial-fallback.svg",
  },
  [ProductCategory.JHUMKY]: {
    title: "Gold Jhumky | Designer Earrings Pakistan | ZARVAYA JEWELS",
    description:
      "Shop premium jhumky earrings in timeless desi and contemporary styles for every event.",
    heroImage: "/placeholders/jewelry-fallback.svg",
  },
  [ProductCategory.RING]: {
    title: "Designer Rings Pakistan | Statement & Daily Rings | ZARVAYA JEWELS",
    description:
      "Discover elegant rings crafted for bridal events, gifting, and elevated everyday styling.",
    heroImage: "/placeholders/jewelry-fallback.svg",
  },
  [ProductCategory.BANGLES]: {
    title: "Luxury Bangles Pakistan | Bridal & Party Bangles | ZARVAYA JEWELS",
    description:
      "Find stackable bangles and premium statement bangles for festive and wedding looks.",
    heroImage: "/placeholders/jewelry-fallback.svg",
  },
  [ProductCategory.SET]: {
    title: "Jewellery Sets Pakistan | Bridal & Party Sets | ZARVAYA JEWELS",
    description:
      "Browse complete jewellery sets designed for nikkah, walima, and special occasions.",
    heroImage: "/placeholders/editorial-fallback.svg",
  },
  [ProductCategory.ANKLET]: {
    title: "Anklets Pakistan | Elegant Daily Wear Anklets | ZARVAYA JEWELS",
    description:
      "Shop elegant anklets with refined detailing for festive and everyday looks.",
    heroImage: "/placeholders/jewelry-fallback.svg",
  },
};

type CategoryPageProps = {
  params: {
    category: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

function toListParams(filters: ShopFilters, category: ProductCategory) {
  return {
    category,
    material: filters.materials.length > 0 ? filters.materials.join(",") : undefined,
    occasion: filters.occasions.length > 0 ? filters.occasions.join(",") : undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sort: filters.sort,
    page: filters.page,
    limit: PAGE_SIZE,
  };
}

async function getCategoryCounts(filters: ShopFilters) {
  const countFilter = buildProductFilter({
    material: filters.materials.length > 0 ? filters.materials.join(",") : undefined,
    occasion: filters.occasions.length > 0 ? filters.occasions.join(",") : undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  });

  const rows = await Product.aggregate<{ _id: ProductCategory; count: number }>([
    { $match: countFilter },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const counts = Object.fromEntries(
    CATEGORY_OPTIONS.map((item) => [item.value, 0]),
  ) as Record<ProductCategory, number>;

  for (const row of rows) {
    counts[row._id] = row.count;
  }

  return counts;
}

export function generateStaticParams() {
  return Object.values(ProductCategory).map((category) => ({ category }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = params.category as ProductCategory;
  if (!Object.values(ProductCategory).includes(category)) {
    return {
      title: "Category | ZARVAYA JEWELS",
      description: "Explore premium jewellery categories at ZARVAYA JEWELS.",
    };
  }

  const meta = CATEGORY_META[category];
  return {
    title: meta.title,
    description: meta.description,
  };
}

export default async function CategoryPage({ params, searchParams = {} }: CategoryPageProps) {
  const category = params.category as ProductCategory;
  if (!Object.values(ProductCategory).includes(category)) {
    notFound();
  }

  const filters = parseShopFilters(searchParams, category);
  const meta = CATEGORY_META[category];

  await connectDB();
  const [listing, categoryCounts] = await Promise.all([
    listProducts(toListParams(filters, category)),
    getCategoryCounts(filters),
  ]);

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: categoryLabel(category) },
        ]}
      />

      <section className="relative overflow-hidden rounded-3xl border border-gold/20">
        <div className="relative h-[220px] w-full md:h-[280px]">
          <Image src={meta.heroImage} alt={`${categoryLabel(category)} banner`} fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/65 via-charcoal/30 to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-end p-6 md:p-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.26em] text-gold">Category</p>
            <h1 className="mt-2 font-playfair text-3xl text-cream md:text-4xl">{categoryLabel(category)}</h1>
            <p className="mt-2 text-sm text-cream/85">{listing.pagination.total} items</p>
          </div>
        </div>
      </section>

      <ShopBrowser
        products={listing.products}
        pagination={listing.pagination}
        filters={filters}
        categoryCounts={categoryCounts}
        lockedCategory={category}
      />
    </div>
  );
}
