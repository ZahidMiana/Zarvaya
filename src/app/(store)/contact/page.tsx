import type { Metadata } from "next";
import ContactForm from "@/components/store/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact ZARVAYA JEWELS for order support, product guidance, and collaboration inquiries.",
};

export default function ContactPage() {
  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923XXXXXXXXX").replace(/[^\d]/g, "");

  return (
    <div className="grid gap-6 pb-10 pt-4 md:grid-cols-2 md:gap-8">
      <section className="space-y-5 rounded-3xl border border-stone-200 bg-white p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-gold">Contact</p>
        <h1 className="font-playfair text-5xl text-charcoal">Let&apos;s Talk</h1>
        <p className="text-sm text-charcoal/72">
          Whether you need order support, styling help, or custom recommendations, our team is here.
        </p>

        <div className="space-y-3 rounded-2xl border border-gold/25 bg-gold/10 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-gold-dark">Primary Support</p>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="text-lg font-medium text-charcoal hover:underline"
          >
            WhatsApp: +{whatsappNumber}
          </a>
        </div>

        <div className="space-y-2 text-sm text-charcoal/80">
          <p>Email: info@zarvayajewels.com</p>
          <p>Working Hours: Mon-Sat, 10am-8pm</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <a href="https://instagram.com/zarvayajewels" target="_blank" rel="noreferrer" className="rounded-full border border-stone-300 px-3 py-1.5 hover:border-charcoal">Instagram</a>
          <a href="https://facebook.com/zarvayajewels" target="_blank" rel="noreferrer" className="rounded-full border border-stone-300 px-3 py-1.5 hover:border-charcoal">Facebook</a>
          <a href="https://tiktok.com/@zarvayajewels" target="_blank" rel="noreferrer" className="rounded-full border border-stone-300 px-3 py-1.5 hover:border-charcoal">TikTok</a>
        </div>
      </section>

      <ContactForm />
    </div>
  );
}
