"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import type { IProduct } from "@/types";

export default function AccountWishlistPage() {
  const [items, setItems] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/user/wishlist");
        const result = await response.json();
        if (response.ok && result?.data?.items) {
          setItems(result.data.items);
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) {
    return (
      <section className="space-y-4">
        <h1 className="font-playfair text-4xl text-charcoal">Wishlist</h1>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[280px] animate-pulse rounded-2xl border border-stone-200 bg-white" />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-[0_12px_28px_rgba(26,26,26,0.05)]">
        <h1 className="font-playfair text-3xl text-charcoal">Your wishlist is empty</h1>
        <p className="mt-2 text-sm text-charcoal/70">Save products you love and shop later.</p>
        <Link href="/shop" className="mt-4 inline-flex h-10 items-center rounded-full bg-charcoal px-5 text-sm text-cream">Discover Products</Link>
      </section>
    );
  }

  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex items-end justify-between gap-3">
        <h1 className="font-playfair text-4xl text-charcoal">Wishlist</h1>
        <p className="text-xs tracking-[0.12em] text-charcoal/60">{items.length} SAVED</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((item) => (
          <ProductCard key={item._id ?? item.slug} product={item} />
        ))}
      </div>
    </section>
  );
}
