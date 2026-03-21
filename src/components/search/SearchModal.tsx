"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { ApiResponse, IProduct } from "@/types";
import { CATEGORY_OPTIONS } from "@/lib/shop";
import { formatPrice, getPrimaryImageUrl } from "@/lib/utils";
import FallbackImage from "@/components/ui/FallbackImage";

type SearchPayload = {
  products: IProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type SearchModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ResultItem = {
  id: string;
  type: "product" | "category";
  label: string;
  href: string;
  subtitle?: string;
  image?: string;
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const RECENT_STORAGE_KEY = "zarvaya-recent-searches";

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as string[];
      setRecentSearches(Array.isArray(parsed) ? parsed.slice(0, 6) : []);
    } catch {
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setProducts([]);
      setLoading(false);
      setActiveIndex(0);
      return;
    }

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 40);

    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const term = query.trim();
    if (term.length < 2) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(term)}&limit=8`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const payload = (await response.json()) as ApiResponse<SearchPayload>;
        setProducts(payload.data?.products ?? []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query, open]);

  const categoryMatches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return CATEGORY_OPTIONS;
    }

    return CATEGORY_OPTIONS.filter((item) => item.label.toLowerCase().includes(term));
  }, [query]);

  const productItems = useMemo<ResultItem[]>(
    () =>
      products.map((product) => ({
        id: `product-${product.slug}`,
        type: "product",
        label: product.name,
        href: `/shop/${product.slug}`,
        subtitle: formatPrice(product.discountPrice ?? product.price),
        image: getPrimaryImageUrl(product),
      })),
    [products],
  );

  const categoryItems = useMemo<ResultItem[]>(
    () =>
      categoryMatches.map((category) => ({
        id: `category-${category.value}`,
        type: "category",
        label: category.label,
        href: `/categories/${category.value}`,
      })),
    [categoryMatches],
  );

  const allItems = useMemo(() => [...productItems, ...categoryItems], [productItems, categoryItems]);

  useEffect(() => {
    if (activeIndex >= allItems.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, allItems.length]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const saveRecent = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    const next = [trimmed, ...recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
    setRecentSearches(next);
    window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
  };

  const navigate = (href: string) => {
    saveRecent(query);
    onOpenChange(false);
    router.push(href);
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[79] bg-charcoal/40 backdrop-blur-[2px]"
            onClick={() => onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: EASE }}
            aria-label="Close search modal"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="fixed left-1/2 top-20 z-[80] w-[min(94vw,760px)] -translate-x-1/2 rounded-3xl border border-gold/30 bg-cream p-4 shadow-2xl"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-stone-300 bg-white px-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4.5 w-4.5 text-charcoal/55" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20L16.5 16.5" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    if (allItems.length > 0) {
                      setActiveIndex((prev) => (prev + 1) % allItems.length);
                    }
                  }

                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    if (allItems.length > 0) {
                      setActiveIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
                    }
                  }

                  if (event.key === "Enter" && allItems[activeIndex]) {
                    event.preventDefault();
                    navigate(allItems[activeIndex].href);
                  }
                }}
                placeholder="Search products, categories..."
                className="h-12 w-full bg-transparent text-sm text-charcoal outline-none placeholder:text-charcoal/45"
              />
              <span className="text-[11px] uppercase tracking-[0.12em] text-charcoal/45">Esc</span>
            </div>

            <div className="mt-4 max-h-[62vh] space-y-4 overflow-y-auto pr-1">
              {query.trim().length < 2 ? (
                <section className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-charcoal/55">Recent Searches</p>
                  {recentSearches.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setQuery(item)}
                          className="rounded-full border border-stone-300 px-3 py-1.5 text-xs text-charcoal/80 transition hover:border-charcoal"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-charcoal/60">Start typing to search products and categories.</p>
                  )}
                </section>
              ) : null}

              {loading ? <p className="text-sm text-charcoal/60">Searching...</p> : null}

              {productItems.length > 0 ? (
                <section className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-charcoal/55">Products</p>
                  <div className="space-y-1">
                    {productItems.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigate(item.href)}
                        className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${
                          activeIndex === index ? "bg-gold/15" : "hover:bg-stone-100"
                        }`}
                      >
                        <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-stone-200">
                          <FallbackImage src={item.image ?? "/placeholders/jewelry-fallback.svg"} alt={item.label} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="line-clamp-1 text-sm text-charcoal">{item.label}</p>
                          <p className="text-xs text-gold-dark">{item.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {categoryItems.length > 0 ? (
                <section className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-charcoal/55">Categories</p>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {categoryItems.map((item, index) => {
                      const absoluteIndex = productItems.length + index;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigate(item.href)}
                          className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                            activeIndex === absoluteIndex ? "bg-gold/15" : "hover:bg-stone-100"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {!loading && query.trim().length >= 2 && productItems.length === 0 && categoryItems.length === 0 ? (
                <section className="rounded-2xl border border-dashed border-stone-300 p-6 text-center">
                  <p className="font-playfair text-xl text-charcoal">No results found</p>
                  <p className="mt-2 text-sm text-charcoal/65">Try a different term or browse popular categories.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {CATEGORY_OPTIONS.slice(0, 4).map((item) => (
                      <Link
                        key={item.value}
                        href={`/categories/${item.value}`}
                        onClick={() => onOpenChange(false)}
                        className="rounded-full border border-stone-300 px-3 py-1.5 text-xs text-charcoal/80"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
