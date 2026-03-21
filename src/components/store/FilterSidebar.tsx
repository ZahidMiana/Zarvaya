"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CATEGORY_OPTIONS,
  MATERIAL_OPTIONS,
  OCCASION_OPTIONS,
  PRICE_PRESETS,
  SHOP_SORT_OPTIONS,
  type ShopFilters,
  type ShopSort,
} from "@/lib/shop";
import { ProductCategory } from "@/types";

type FilterSidebarProps = {
  filters: ShopFilters;
  categoryCounts: Record<ProductCategory, number>;
  lockedCategory?: ProductCategory;
  hasActiveFilters: boolean;
  onChange: (next: Partial<ShopFilters>) => void;
  onClearAll: () => void;
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const MIN_BOUND = 0;
const MAX_BOUND = 10000;

function Section({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white/70">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-charcoal">{title}</span>
        <span className="text-xs text-charcoal/60">{isOpen ? "Hide" : "Show"}</span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export default function FilterSidebar({
  filters,
  categoryCounts,
  lockedCategory,
  hasActiveFilters,
  onChange,
  onClearAll,
}: FilterSidebarProps) {
  const [open, setOpen] = useState({
    category: true,
    price: true,
    material: true,
    occasion: true,
    sort: true,
  });

  const minValue = filters.minPrice ?? MIN_BOUND;
  const maxValue = filters.maxPrice ?? MAX_BOUND;

  const priceLabel = useMemo(() => {
    const min = minValue.toLocaleString("en-PK");
    const max = maxValue.toLocaleString("en-PK");
    return `PKR ${min} - PKR ${max}`;
  }, [minValue, maxValue]);

  return (
    <aside className="space-y-4 rounded-2xl border border-stone-200 bg-cream-dark/45 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-playfair text-2xl text-charcoal">Filters</h3>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs tracking-[0.08em] text-gold-dark transition hover:text-charcoal"
          >
            Clear All Filters
          </button>
        ) : null}
      </div>

      <Section
        title="Categories"
        isOpen={open.category}
        onToggle={() => setOpen((state) => ({ ...state, category: !state.category }))}
      >
        <div className="space-y-2">
          {CATEGORY_OPTIONS.map((option) => {
            const checked = lockedCategory
              ? lockedCategory === option.value
              : filters.categories.includes(option.value);
            const disabled = Boolean(lockedCategory && lockedCategory !== option.value);

            return (
              <label
                key={option.value}
                className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-sm ${
                  disabled ? "cursor-not-allowed text-charcoal/35" : "cursor-pointer text-charcoal/80"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => {
                      if (lockedCategory) {
                        return;
                      }

                      const next = checked
                        ? filters.categories.filter((item) => item !== option.value)
                        : [...filters.categories, option.value];

                      onChange({ categories: next });
                    }}
                    className="h-4 w-4 rounded border-stone-300 accent-charcoal"
                  />
                  {option.label}
                </span>
                <span className="text-xs text-charcoal/55">{categoryCounts[option.value] ?? 0}</span>
              </label>
            );
          })}
        </div>
      </Section>

      <Section
        title="Price Range"
        isOpen={open.price}
        onToggle={() => setOpen((state) => ({ ...state, price: !state.price }))}
      >
        <div className="space-y-4">
          <p className="text-xs text-charcoal/70">{priceLabel}</p>

          <div className="relative pt-2">
            <input
              type="range"
              min={MIN_BOUND}
              max={MAX_BOUND}
              step={100}
              value={minValue}
              onChange={(event) => {
                const nextMin = Math.min(Number(event.target.value), maxValue - 100);
                onChange({ minPrice: nextMin <= MIN_BOUND ? undefined : nextMin });
              }}
              className="pointer-events-auto absolute left-0 top-0 h-2 w-full appearance-none bg-transparent accent-charcoal"
            />
            <input
              type="range"
              min={MIN_BOUND}
              max={MAX_BOUND}
              step={100}
              value={maxValue}
              onChange={(event) => {
                const nextMax = Math.max(Number(event.target.value), minValue + 100);
                onChange({ maxPrice: nextMax >= MAX_BOUND ? undefined : nextMax });
              }}
              className="pointer-events-auto h-2 w-full appearance-none bg-transparent accent-gold"
            />
            <div className="mt-2 h-2 rounded-full bg-stone-200" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PRICE_PRESETS.map((preset) => {
              const isActive =
                (filters.minPrice ?? undefined) === preset.minPrice &&
                (filters.maxPrice ?? undefined) === preset.maxPrice;

              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onChange({ minPrice: preset.minPrice, maxPrice: preset.maxPrice })}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    isActive
                      ? "border-charcoal bg-charcoal text-cream"
                      : "border-stone-300 text-charcoal/75 hover:border-charcoal"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      <Section
        title="Material"
        isOpen={open.material}
        onToggle={() => setOpen((state) => ({ ...state, material: !state.material }))}
      >
        <div className="space-y-2">
          {MATERIAL_OPTIONS.map((option) => {
            const checked = filters.materials.includes(option.value);
            return (
              <label key={option.value} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-charcoal/80">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? filters.materials.filter((item) => item !== option.value)
                      : [...filters.materials, option.value];
                    onChange({ materials: next });
                  }}
                  className="h-4 w-4 rounded border-stone-300 accent-charcoal"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </Section>

      <Section
        title="Occasion"
        isOpen={open.occasion}
        onToggle={() => setOpen((state) => ({ ...state, occasion: !state.occasion }))}
      >
        <div className="flex flex-wrap gap-2">
          {OCCASION_OPTIONS.map((option) => {
            const checked = filters.occasions.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const next = checked
                    ? filters.occasions.filter((item) => item !== option.value)
                    : [...filters.occasions, option.value];
                  onChange({ occasions: next });
                }}
                className={`rounded-full px-3 py-1.5 text-xs transition ${
                  checked
                    ? "bg-charcoal text-cream"
                    : "border border-stone-300 text-charcoal/75 hover:border-charcoal"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section
        title="Sort"
        isOpen={open.sort}
        onToggle={() => setOpen((state) => ({ ...state, sort: !state.sort }))}
      >
        <div className="space-y-2">
          {SHOP_SORT_OPTIONS.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-charcoal/80">
              <input
                type="radio"
                name="sort"
                checked={filters.sort === option.value}
                onChange={() => onChange({ sort: option.value as ShopSort })}
                className="h-4 w-4 border-stone-300 accent-charcoal"
              />
              {option.label}
            </label>
          ))}
        </div>
      </Section>
    </aside>
  );
}
