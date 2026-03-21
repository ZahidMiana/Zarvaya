import type { Metadata } from "next";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FeaturedCollection from "@/components/home/FeaturedCollection";
import HeroSection from "@/components/home/HeroSection";
import InstagramFeed from "@/components/home/InstagramFeed";
import NewsletterSection from "@/components/home/NewsletterSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import TrendingSection from "@/components/home/TrendingSection";

export const metadata: Metadata = {
  title: "ZARVAYA JEWELS | Premium Pakistani Jewellery Online",
  description:
    "Shop handpicked necklaces, jhumky, rings and bangles crafted for modern Pakistani elegance.",
  openGraph: {
    title: "ZARVAYA JEWELS | Premium Pakistani Jewellery Online",
    description:
      "Shop handpicked necklaces, jhumky, rings and bangles crafted for modern Pakistani elegance.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1600&auto=format&fit=crop",
        width: 1600,
        height: 900,
        alt: "Zarvaya jewels collection",
      },
    ],
  },
};

function TrustBar() {
  const items = [
    {
      title: "Free Delivery",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
          <path d="M2.8 6.5H14.8V16.5H2.8V6.5Z" />
          <path d="M14.8 9.2H18.6L21.2 12V16.5H14.8" />
          <circle cx="7.1" cy="17.5" r="1.7" />
          <circle cx="17.6" cy="17.5" r="1.7" />
        </svg>
      ),
    },
    {
      title: "Cash on Delivery",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M7 12H17" />
          <path d="M8.4 9.4H8.5" />
          <path d="M15.5 14.6H15.6" />
        </svg>
      ),
    },
    {
      title: "Easy Returns",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
          <path d="M8 7H4V11" />
          <path d="M4 11C4.9 7.5 8.2 5 12 5C16.5 5 20.2 8.7 20.2 13.2C20.2 17.7 16.5 21.4 12 21.4C9.1 21.4 6.5 19.9 5.1 17.7" />
        </svg>
      ),
    },
    {
      title: "Authentic Pieces",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
          <path d="M12 3.8L19 6.4V11.8C19 15.8 16.4 19.5 12 20.8C7.6 19.5 5 15.8 5 11.8V6.4L12 3.8Z" />
          <path d="M9.3 12.2L11.2 14.1L14.9 10.4" />
        </svg>
      ),
    },
  ];

  return (
    <section className="rounded-2xl border border-gold/20 bg-white/80 px-4 py-5">
      <div className="grid grid-cols-2 gap-4 md:flex md:items-center md:justify-between md:gap-0">
        {items.map((item, index) => (
          <div key={item.title} className="flex items-center justify-center gap-2.5 md:flex-1 md:justify-center">
            <span className="text-gold">{item.icon}</span>
            <p className="text-[13px] text-charcoal">{item.title}</p>
            {index < items.length - 1 ? <span className="hidden h-6 w-px bg-stone-200 md:block" /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function StoreHomePage() {
  return (
    <div className="space-y-16 pb-14 md:space-y-20">
      <HeroSection />
      <TrustBar />
      <CategoryShowcase />
      <TrendingSection />
      <FeaturedCollection imagePosition="right" />
      <TestimonialsSection />
      <InstagramFeed />
      <NewsletterSection />
    </div>
  );
}
