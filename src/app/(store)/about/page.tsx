import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Discover the story behind ZARVAYA JEWELS and our commitment to Pakistani craftsmanship and accessible luxury.",
};

export default function AboutPage() {
  return (
    <div className="space-y-16 pb-10">
      <section className="relative overflow-hidden rounded-[28px] border border-gold/20">
        <div className="relative h-[360px] w-full md:h-[460px]">
          <Image
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1800&auto=format&fit=crop"
            alt="ZARVAYA JEWELS editorial background"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-charcoal/45 to-charcoal/20" />
        </div>
        <div className="absolute inset-0 flex items-end p-7 md:p-12">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">About ZARVAYA</p>
            <h1 className="mt-3 font-playfair text-5xl text-cream md:text-6xl">Our Story</h1>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 md:items-center">
        <article className="relative h-80 overflow-hidden rounded-3xl border border-stone-200 md:h-[440px]">
          <Image
            src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=1300&auto=format&fit=crop"
            alt="Pakistani artisan-inspired jewellery story"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </article>
        <article className="space-y-4">
          <p className="text-xs uppercase tracking-[0.24em] text-gold">Born in Pakistan</p>
          <h2 className="font-playfair text-4xl text-charcoal">A homegrown jewellery vision</h2>
          <p className="text-charcoal/75">
            ZARVAYA JEWELS began with one belief: Pakistani women deserve premium design without impossible
            markups. We partner with skilled local artisans across Pakistan to curate statement and everyday
            pieces that carry soul, detail, and identity.
          </p>
        </article>
      </section>

      <section className="grid gap-6 md:grid-cols-2 md:items-center">
        <article className="order-2 space-y-4 md:order-1">
          <p className="text-xs uppercase tracking-[0.24em] text-gold">Crafted with Care</p>
          <h2 className="font-playfair text-4xl text-charcoal">Quality over shortcuts</h2>
          <p className="text-charcoal/75">
            From plating quality to final polish, every selection is made for comfort, durability, and visual
            harmony. We continuously work with artisan partners to improve finishing standards and preserve the
            craftsmanship traditions that make Pakistani jewellery iconic.
          </p>
        </article>
        <article className="order-1 relative h-80 overflow-hidden rounded-3xl border border-stone-200 md:order-2 md:h-[440px]">
          <Image
            src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1300&auto=format&fit=crop"
            alt="Jewellery crafted with care"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </article>
      </section>

      <section className="space-y-6">
        <h2 className="font-playfair text-4xl text-charcoal">Our Values</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="font-playfair text-2xl text-charcoal">Authenticity</h3>
            <p className="mt-2 text-sm text-charcoal/72">Every piece is handpicked to reflect true Pakistani artistry and detail.</p>
          </article>
          <article className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="font-playfair text-2xl text-charcoal">Accessibility</h3>
            <p className="mt-2 text-sm text-charcoal/72">Luxury does not have to be unreachable. We price with honesty and intent.</p>
          </article>
          <article className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="font-playfair text-2xl text-charcoal">Local Love</h3>
            <p className="mt-2 text-sm text-charcoal/72">We proudly support Pakistani artisan talent and heritage craft traditions.</p>
          </article>
        </div>
      </section>

      <section className="rounded-3xl border border-gold/30 bg-gradient-to-r from-cream-dark to-white p-7">
        <p className="text-xs uppercase tracking-[0.24em] text-gold">Founder&apos;s Note</p>
        <p className="mt-3 text-lg text-charcoal/80">
          &quot;We built ZARVAYA to celebrate the beauty of Pakistani jewellery in a modern, dependable shopping
          experience. Thank you for making us part of your stories.&quot;
        </p>
        <p className="mt-2 font-playfair text-2xl italic text-charcoal">- Team ZARVAYA</p>
      </section>

      <section className="flex justify-center">
        <Link
          href="/shop"
          className="inline-flex h-12 items-center rounded-full bg-charcoal px-8 text-sm tracking-[0.08em] text-cream hover:bg-gold hover:text-charcoal"
        >
          Shop Our Collection
        </Link>
      </section>
    </div>
  );
}
