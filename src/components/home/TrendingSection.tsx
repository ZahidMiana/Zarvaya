import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import type { ApiResponse, IProduct } from "@/types";

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M5 12H19" />
      <path d="M13 6L19 12L13 18" />
    </svg>
  );
}

async function getTrendingProducts(): Promise<IProduct[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/products/trending`, {
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as ApiResponse<IProduct[]>;
    return payload.data ?? [];
  } catch {
    return [];
  }
}

export default async function TrendingSection() {
  const trendingProducts = await getTrendingProducts();

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Spotlight</p>
        <h2 className="font-playfair text-3xl text-charcoal md:text-4xl">Trending This Week</h2>
        <div className="h-[2px] w-20 bg-gold" />
        <p className="text-sm text-charcoal/65">Our most-loved pieces right now</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {trendingProducts.slice(0, 8).map((product) => (
          <ProductCard key={product._id ?? product.slug} product={product} />
        ))}
      </div>

      <div className="flex justify-end">
        <Link
          href="/shop?sort=trending"
          className="inline-flex items-center gap-2 text-sm tracking-[0.08em] text-gold transition-colors hover:text-charcoal"
        >
          View All Trending
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}
