import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import { connectDB } from "@/lib/db";
import { getTrendingProducts } from "@/lib/services/product-service";

export default async function NotFound() {
  await connectDB();
  const trending = await getTrendingProducts();

  return (
    <section className="space-y-10 pb-12 pt-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-playfair text-8xl text-charcoal">404</p>
        <h1 className="mt-3 font-playfair text-4xl text-charcoal">Page Not Found</h1>
        <p className="mt-3 text-charcoal/70">The jewel you&apos;re looking for seems to have wandered off...</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="inline-flex h-10 items-center rounded-full bg-charcoal px-5 text-sm text-cream hover:bg-gold hover:text-charcoal">
            Go Home
          </Link>
          <Link href="/shop" className="inline-flex h-10 items-center rounded-full border border-stone-300 px-5 text-sm text-charcoal hover:bg-stone-100">
            Browse Shop
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-playfair text-3xl text-charcoal">Trending Pieces</h2>
        {trending.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {trending.slice(0, 4).map((product) => (
              <ProductCard key={product._id ?? product.slug} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-charcoal/70">Trending products are currently unavailable.</p>
        )}
      </div>
    </section>
  );
}
