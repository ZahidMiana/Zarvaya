import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Info",
  description: "Delivery timelines, shipping charges, and dispatch process for ZARVAYA JEWELS orders.",
};

export default function ShippingInfoPage() {
  return (
    <section className="space-y-6 pb-10 pt-4">
      <header>
        <p className="text-xs uppercase tracking-[0.24em] text-gold">Customer Care</p>
        <h1 className="mt-2 font-playfair text-5xl text-charcoal">Shipping Information</h1>
      </header>

      <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 text-sm text-charcoal/80">
        <p>Orders are usually processed within 24 hours on working days.</p>
        <p>Major cities: estimated delivery in 2-4 business days.</p>
        <p>Other cities/remote areas: estimated delivery in 3-6 business days.</p>
        <p>Shipping is free above PKR 3,000. Below this threshold, a standard shipping fee is applied.</p>
        <p>
          During sale campaigns and high-volume periods, delivery windows may extend by 1-2 days depending on
          courier load.
        </p>
      </div>
    </section>
  );
}
