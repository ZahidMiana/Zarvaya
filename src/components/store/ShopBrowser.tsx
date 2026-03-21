"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ProductCard from "@/components/store/ProductCard";
import FilterSidebar from "@/components/store/FilterSidebar";
import {
  type ShopFilters,
  type ShopSort,
  categoryLabel,
  filtersActive,
  serializeShopFilters,
  SHOP_SORT_OPTIONS,
} from "@/lib/shop";
import { ProductCategory, type IProduct } from "@/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

type ShopBrowserProps = {
  products: IProduct[];
  pagination: Pagination;
  filters: ShopFilters;
  categoryCounts: Record<ProductCategory, number>;
  lockedCategory?: ProductCategory;
};

type FilterChip = {
  key: string;
  label: string;
  remove: () => void;
};

function clampPage(page: number, max: number) {
  if (page < 1) {
    return 1;
  }

  if (page > max) {
    return max;
  }

  return page;
}

function PaginationControls({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (next: number) => void;
}) {
  if (pages <= 1) {
    return null;
  }

  const start = Math.max(1, page - 2);
  const end = Math.min(pages, start + 4);
  const range = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="rounded-full border border-stone-300 px-3 py-1.5 text-sm text-charcoal transition hover:border-charcoal disabled:cursor-not-allowed disabled:opacity-40"
      >
        Prev
      </button>

      {range.map((item) => (
        <button
          key={`page-${item}`}
          type="button"
          onClick={() => onPage(item)}
          className={`h-9 min-w-9 rounded-full px-3 text-sm transition ${
            item === page
              ? "bg-charcoal text-cream"
              : "border border-stone-300 text-charcoal hover:border-charcoal"
          }`}
        >
          {item}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page === pages}
        className="rounded-full border border-stone-300 px-3 py-1.5 text-sm text-charcoal transition hover:border-charcoal disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}

export default function ShopBrowser({
  products,
  pagination,
  filters,
  categoryCounts,
  lockedCategory,
}: ShopBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const hasActive = filtersActive(filters, lockedCategory);

  const commit = useCallback((patch: Partial<ShopFilters>) => {
    const next: ShopFilters = {
      ...filters,
      ...patch,
      page: patch.page ?? 1,
    };

    const params = serializeShopFilters(next, lockedCategory);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }, [filters, lockedCategory, pathname, router]);

  const clearAll = () => {
    const next: ShopFilters = {
      categories: lockedCategory ? [lockedCategory] : [],
      materials: [],
      occasions: [],
      minPrice: undefined,
      maxPrice: undefined,
      sort: "newest",
      page: 1,
    };

    const params = serializeShopFilters(next, lockedCategory);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const chips = useMemo<FilterChip[]>(() => {
    const nextChips: FilterChip[] = [];

    if (!lockedCategory) {
      for (const category of filters.categories) {
        nextChips.push({
          key: `category-${category}`,
          label: categoryLabel(category),
          remove: () =>
            commit({
              categories: filters.categories.filter((item) => item !== category),
            }),
        });
      }
    }

    for (const material of filters.materials) {
      nextChips.push({
        key: `material-${material}`,
        label: material.replace(/-/g, " "),
        remove: () =>
          commit({
            materials: filters.materials.filter((item) => item !== material),
          }),
      });
    }

    for (const occasion of filters.occasions) {
      nextChips.push({
        key: `occasion-${occasion}`,
        label: occasion,
        remove: () =>
          commit({
            occasions: filters.occasions.filter((item) => item !== occasion),
          }),
      });
    }

    if (typeof filters.minPrice === "number" || typeof filters.maxPrice === "number") {
      const min = filters.minPrice ?? 0;
      const max = filters.maxPrice ?? 10000;
      nextChips.push({
        key: "price",
        label: `PKR ${min.toLocaleString("en-PK")} - ${max.toLocaleString("en-PK")}`,
        remove: () => commit({ minPrice: undefined, maxPrice: undefined }),
      });
    }

    if (filters.sort !== "newest") {
      const sortLabel = SHOP_SORT_OPTIONS.find((item) => item.value === filters.sort)?.label ?? filters.sort;
      nextChips.push({
        key: "sort",
        label: sortLabel,
        remove: () => commit({ sort: "newest" }),
      });
    }

    return nextChips;
  }, [commit, filters, lockedCategory]);

  const heading = lockedCategory
    ? `${categoryLabel(lockedCategory)} (${pagination.total} items)`
    : filters.categories.length === 1
      ? `${categoryLabel(filters.categories[0])} (${pagination.total} items)`
      : "All Products";

  const start = pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const end = pagination.total > 0 ? Math.min(pagination.total, pagination.page * pagination.limit) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block">
        <FilterSidebar
          filters={filters}
          categoryCounts={categoryCounts}
          lockedCategory={lockedCategory}
          hasActiveFilters={hasActive}
          onChange={commit}
          onClearAll={clearAll}
        />
      </aside>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-playfair text-2xl text-charcoal md:text-3xl">{heading}</h2>
            <p className="text-sm text-charcoal/65">
              Showing {start}-{end} of {pagination.total} products
            </p>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="inline-flex h-10 items-center rounded-full border border-charcoal px-4 text-sm text-charcoal"
            >
              Filters
            </button>

            <label className="sr-only" htmlFor="mobile-sort">
              Sort products
            </label>
            <select
              id="mobile-sort"
              value={filters.sort}
              onChange={(event) => commit({ sort: event.target.value as ShopSort })}
              className="h-10 rounded-full border border-stone-300 bg-white px-4 text-sm text-charcoal"
            >
              {SHOP_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {chips.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.remove}
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-charcoal"
              >
                <span>{chip.label}</span>
                <span aria-hidden="true">x</span>
              </button>
            ))}
          </div>
        ) : null}

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gold/35 bg-white p-10 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gold/20" />
            <h3 className="font-playfair text-2xl text-charcoal">No products found</h3>
            <p className="mt-2 text-sm text-charcoal/68">
              Try changing filters or browse a broader collection.
            </p>
            {hasActive ? (
              <button
                type="button"
                onClick={clearAll}
                className="mt-6 inline-flex h-10 items-center rounded-full bg-charcoal px-5 text-sm text-cream transition hover:bg-gold hover:text-charcoal"
              >
                Clear Filters
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product._id ?? product.slug} product={product} />
              ))}
            </div>

            <PaginationControls
              page={pagination.page}
              pages={pagination.pages}
              onPage={(next) => commit({ page: clampPage(next, pagination.pages) })}
            />
          </>
        )}
      </div>

      <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto bg-cream">
          <SheetHeader>
            <SheetTitle className="font-playfair text-2xl text-charcoal">Filters</SheetTitle>
          </SheetHeader>
          <FilterSidebar
            filters={filters}
            categoryCounts={categoryCounts}
            lockedCategory={lockedCategory}
            hasActiveFilters={hasActive}
            onChange={(patch) => {
              setIsMobileFilterOpen(false);
              commit(patch);
            }}
            onClearAll={() => {
              setIsMobileFilterOpen(false);
              clearAll();
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
