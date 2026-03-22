import Link from "next/link";
import Image from "next/image";
import { sampleProducts } from "@/lib/sample-data";
import { formatPrice, getPrimaryImageUrl } from "@/lib/utils";

type FeaturedCollectionProps = {
  imagePosition?: "left" | "right";
};

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M5 12H19" />
      <path d="M13 6L19 12L13 18" />
    </svg>
  );
}

export default function FeaturedCollection({ imagePosition = "left" }: FeaturedCollectionProps) {
  const products = sampleProducts.slice(0, 3);
  const reverse = imagePosition === "right";

  return (
    <section className="overflow-hidden rounded-[28px] border border-gold/20 bg-white">
      <div className={`grid items-stretch gap-0 lg:grid-cols-2 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div className="relative min-h-[340px] lg:min-h-[560px]">
          <Image
            src="/placeholders/editorial-fallback.svg"
            alt="Bridal jewellery editorial"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold">The Edit</p>
          <h2 className="mt-3 font-playfair text-3xl text-charcoal md:text-4xl">Featured Collection</h2>
          <p className="mt-4 max-w-[42ch] text-sm text-charcoal/68">
            The Bridal Edit blends timeless kundan craft with contemporary silhouettes, designed for
            mehndi, nikkah, and walima moments that deserve an unforgettable finish.
          </p>

          <div className="mt-7 grid gap-3">
            {products.map((product) => (
              <article key={product.slug} className="flex items-center gap-3 rounded-xl border border-stone-200 bg-cream-dark/55 p-2.5">
                <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-cream-dark">
                  <Image src={getPrimaryImageUrl(product)} alt={product.name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-charcoal">{product.name}</p>
                  <p className="mt-1 text-xs text-gold">{formatPrice(product.discountPrice ?? product.price)}</p>
                </div>
                <Link href={`/shop/${product.slug}`} className="text-xs tracking-[0.08em] text-charcoal/70 transition hover:text-charcoal">
                  View
                </Link>
              </article>
            ))}
          </div>

          <Link
            href="/categories/set"
            className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm tracking-[0.08em] text-cream transition-colors duration-500 hover:bg-gold hover:text-charcoal"
          >
            Shop the Collection
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
