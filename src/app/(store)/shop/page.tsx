import PageHeader from "@/components/common/PageHeader";
import ShopBrowser from "@/components/store/ShopBrowser";
import { connectDB } from "@/lib/db";
import {
  CATEGORY_OPTIONS,
  parseShopFilters,
  type ShopFilters,
} from "@/lib/shop";
import {
  buildProductFilter,
  listProducts,
} from "@/lib/services/product-service";
import Product from "@/models/Product";
import { ProductCategory } from "@/types";

const PAGE_SIZE = 12;

type ShopPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function toListParams(filters: ShopFilters) {
  return {
    category: filters.categories.length > 0 ? filters.categories.join(",") : undefined,
    material: filters.materials.length > 0 ? filters.materials.join(",") : undefined,
    occasion: filters.occasions.length > 0 ? filters.occasions.join(",") : undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sort: filters.sort,
    page: filters.page,
    limit: PAGE_SIZE,
  };
}

async function getCategoryCounts(filters: ShopFilters): Promise<Record<ProductCategory, number>> {
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

export default async function ShopPage({ searchParams = {} }: ShopPageProps) {
  const filters = parseShopFilters(searchParams);
  await connectDB();

  const [listing, categoryCounts] = await Promise.all([
    listProducts(toListParams(filters)),
    getCategoryCounts(filters),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Shop All Jewellery"
        subtitle="Discover handcrafted necklaces, jhumky, rings, bangles, and sets designed for modern elegance."
      />

      <ShopBrowser
        products={listing.products}
        pagination={listing.pagination}
        filters={filters}
        categoryCounts={categoryCounts}
      />
    </div>
  );
}
