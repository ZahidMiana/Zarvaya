import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Frequently asked questions about orders, payments, delivery, and returns at ZARVAYA JEWELS.",
};

const faqItems: Array<{ q: string; a: string }> = [
  {
    q: "Which payment methods are available?",
    a: "You can pay via COD, EasyPaisa, JazzCash, or Bank Transfer.",
  },
  {
    q: "Is there any COD limit?",
    a: "Yes. COD is supported up to PKR 50,000. Higher-value orders require digital payment.",
  },
  {
    q: "How can I track my order?",
    a: "Use the Track Order page and enter your order number and phone number.",
  },
  {
    q: "How long does delivery take?",
    a: "Major cities: 2-4 business days. Other areas: 3-6 business days.",
  },
  {
    q: "How do I request a return?",
    a: "Contact support within 7 days of delivery with order details and issue proof.",
  },
];

export default function FAQsPage() {
  return (
    <section className="space-y-6 pb-10 pt-4">
      <header>
        <p className="text-xs uppercase tracking-[0.24em] text-gold">Customer Care</p>
        <h1 className="mt-2 font-playfair text-5xl text-charcoal">Frequently Asked Questions</h1>
      </header>

      <div className="space-y-3">
        {faqItems.map((item) => (
          <article key={item.q} className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="font-playfair text-2xl text-charcoal">{item.q}</h2>
            <p className="mt-2 text-sm text-charcoal/75">{item.a}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
