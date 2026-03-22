import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns Policy",
  description: "Read ZARVAYA JEWELS returns and refund policy for eligibility, timelines, and process.",
};

export default function ReturnsPolicyPage() {
  return (
    <section className="space-y-6 pb-10 pt-4">
      <header>
        <p className="text-xs uppercase tracking-[0.24em] text-gold">Customer Care</p>
        <h1 className="mt-2 font-playfair text-5xl text-charcoal">Returns & Refunds</h1>
      </header>

      <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 text-sm text-charcoal/80">
        <p>
          We accept return requests within 7 days of delivery for items received damaged or materially different
          from what was ordered.
        </p>
        <p>
          For hygiene and product-safety reasons, jewellery that has been used, altered, or damaged after delivery
          is not eligible for return.
        </p>
        <p>
          Approved returns are refunded to the original payment method (or bank transfer for COD orders) within
          5-10 business days after quality inspection.
        </p>
        <p>
          To start a return, contact support with your order number, issue details, and clear photos/video proof.
        </p>
      </div>
    </section>
  );
}
