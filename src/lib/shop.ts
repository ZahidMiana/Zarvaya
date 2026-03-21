import { ProductCategory, ProductMaterial, ProductOccasion } from "@/types";

export type ShopSort = "newest" | "price-asc" | "price-desc" | "trending" | "bestseller";

export type ShopFilters = {
  categories: ProductCategory[];
  materials: ProductMaterial[];
  occasions: ProductOccasion[];
  minPrice?: number;
  maxPrice?: number;
  sort: ShopSort;
  page: number;
};

export const SHOP_SORT_OPTIONS: Array<{ value: ShopSort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "trending", label: "Trending" },
  { value: "bestseller", label: "Best Seller" },
];

export const CATEGORY_OPTIONS: Array<{ value: ProductCategory; label: string }> = [
  { value: ProductCategory.NECKLACE, label: "Necklaces" },
  { value: ProductCategory.JHUMKY, label: "Jhumky" },
  { value: ProductCategory.RING, label: "Rings" },
  { value: ProductCategory.BANGLES, label: "Bangles" },
  { value: ProductCategory.SET, label: "Sets" },
  { value: ProductCategory.ANKLET, label: "Anklets" },
];

export const MATERIAL_OPTIONS: Array<{ value: ProductMaterial; label: string }> = [
  { value: ProductMaterial.GOLD_PLATED, label: "Gold-Plated" },
  { value: ProductMaterial.SILVER, label: "Silver" },
  { value: ProductMaterial.KUNDAN, label: "Kundan" },
  { value: ProductMaterial.PEARL, label: "Pearl" },
  { value: ProductMaterial.OXIDIZED, label: "Oxidized" },
  { value: ProductMaterial.ROSE_GOLD, label: "Rose Gold" },
];

export const OCCASION_OPTIONS: Array<{ value: ProductOccasion; label: string }> = [
  { value: ProductOccasion.BRIDAL, label: "Bridal" },
  { value: ProductOccasion.CASUAL, label: "Casual" },
  { value: ProductOccasion.PARTY, label: "Party" },
  { value: ProductOccasion.DAILY, label: "Daily" },
  { value: ProductOccasion.FESTIVE, label: "Festive" },
  { value: ProductOccasion.OFFICE, label: "Office" },
];

export const PRICE_PRESETS: Array<{ label: string; minPrice?: number; maxPrice?: number }> = [
  { label: "Under 1,000", maxPrice: 1000 },
  { label: "1,000-2,500", minPrice: 1000, maxPrice: 2500 },
  { label: "2,500-5,000", minPrice: 2500, maxPrice: 5000 },
  { label: "Above 5,000", minPrice: 5000 },
];

export function categoryLabel(value: ProductCategory): string {
  const found = CATEGORY_OPTIONS.find((item) => item.value === value);
  return found?.label ?? value;
}

function toSingleValue(input: string | string[] | undefined): string {
  if (Array.isArray(input)) {
    return input[0] ?? "";
  }

  return input ?? "";
}

function parseCsvEnum<T extends string>(
  input: string,
  allowed: ReadonlyArray<T>,
): T[] {
  if (!input.trim()) {
    return [];
  }

  const allowedSet = new Set(allowed);

  return input
    .split(",")
    .map((item) => item.trim() as T)
    .filter((item) => allowedSet.has(item));
}

function parseNumber(input: string): number | undefined {
  if (!input) {
    return undefined;
  }

  const parsed = Number(input);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return parsed;
}

export function parseShopFilters(
  searchParams: Record<string, string | string[] | undefined>,
  lockedCategory?: ProductCategory,
): ShopFilters {
  const categories = lockedCategory
    ? [lockedCategory]
    : parseCsvEnum(toSingleValue(searchParams.category), Object.values(ProductCategory));

  const materials = parseCsvEnum(
    toSingleValue(searchParams.material),
    Object.values(ProductMaterial),
  );

  const occasions = parseCsvEnum(
    toSingleValue(searchParams.occasion),
    Object.values(ProductOccasion),
  );

  const minPrice = parseNumber(toSingleValue(searchParams.minPrice));
  const maxPrice = parseNumber(toSingleValue(searchParams.maxPrice));

  const rawSort = toSingleValue(searchParams.sort) as ShopSort;
  const allowedSorts = new Set(SHOP_SORT_OPTIONS.map((item) => item.value));
  const sort = allowedSorts.has(rawSort) ? rawSort : "newest";

  const page = Math.max(1, parseNumber(toSingleValue(searchParams.page)) ?? 1);

  return {
    categories,
    materials,
    occasions,
    minPrice,
    maxPrice,
    sort,
    page,
  };
}

export function serializeShopFilters(filters: ShopFilters, lockedCategory?: ProductCategory): URLSearchParams {
  const params = new URLSearchParams();

  if (!lockedCategory && filters.categories.length > 0) {
    params.set("category", filters.categories.join(","));
  }

  if (filters.materials.length > 0) {
    params.set("material", filters.materials.join(","));
  }

  if (filters.occasions.length > 0) {
    params.set("occasion", filters.occasions.join(","));
  }

  if (typeof filters.minPrice === "number") {
    params.set("minPrice", String(filters.minPrice));
  }

  if (typeof filters.maxPrice === "number") {
    params.set("maxPrice", String(filters.maxPrice));
  }

  if (filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }

  return params;
}

export function filtersActive(filters: ShopFilters, lockedCategory?: ProductCategory): boolean {
  if (!lockedCategory && filters.categories.length > 0) {
    return true;
  }

  return Boolean(
    filters.materials.length > 0 ||
      filters.occasions.length > 0 ||
      typeof filters.minPrice === "number" ||
      typeof filters.maxPrice === "number" ||
      filters.sort !== "newest",
  );
}
