import Link from "next/link";
import FallbackImage from "@/components/ui/FallbackImage";

const cards = [
  {
    id: "ig1",
    image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=800&auto=format&fit=crop",
    hearts: 128,
    comments: 22,
  },
  {
    id: "ig2",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop",
    hearts: 201,
    comments: 35,
  },
  {
    id: "ig3",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=800&auto=format&fit=crop",
    hearts: 154,
    comments: 29,
  },
  {
    id: "ig4",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    hearts: 176,
    comments: 19,
  },
  {
    id: "ig5",
    image: "https://images.unsplash.com/photo-1629224316810-9d8805b95e76?q=80&w=800&auto=format&fit=crop",
    hearts: 118,
    comments: 14,
  },
  {
    id: "ig6",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=800&auto=format&fit=crop",
    hearts: 242,
    comments: 40,
  },
];

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4.5 w-4.5" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M12 20.2C11.8 20.2 11.6 20.1 11.4 20C7.1 16.4 4 13.5 4 9.7C4 7.3 5.9 5.4 8.3 5.4C9.8 5.4 11.2 6.2 12 7.4C12.8 6.2 14.2 5.4 15.7 5.4C18.1 5.4 20 7.3 20 9.7C20 13.5 16.9 16.4 12.6 20C12.4 20.1 12.2 20.2 12 20.2Z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M4 5.5H20V15.5H9L4 19V5.5Z" />
    </svg>
  );
}

export default function InstagramFeed() {
  return (
    <section className="space-y-8">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Social</p>
          <h2 className="font-playfair text-3xl text-charcoal md:text-4xl">Follow @ZarvayaJewels</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map((card, index) => (
          <article
            key={card.id}
            className={`group relative aspect-square overflow-hidden rounded-2xl border border-stone-200 ${index > 3 ? "hidden md:block" : ""}`}
          >
            <FallbackImage
              src={card.image}
              fallbackSrc="/placeholders/jewelry-fallback.svg"
              alt="Instagram showcase"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-charcoal/55 opacity-0 transition duration-500 group-hover:opacity-100" />
            <div className="absolute inset-0 flex items-center justify-center gap-5 text-cream opacity-0 transition duration-500 group-hover:opacity-100">
              <span className="inline-flex items-center gap-1 text-sm">
                <HeartIcon />
                {card.hearts}
              </span>
              <span className="inline-flex items-center gap-1 text-sm">
                <CommentIcon />
                {card.comments}
              </span>
            </div>
          </article>
        ))}
      </div>

      <Link
        href="https://instagram.com"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-3 rounded-full border border-charcoal/70 bg-white px-5 py-2 text-sm tracking-[0.08em] text-charcoal transition-colors duration-500 hover:bg-charcoal hover:text-cream"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-charcoal/35">
          <InstagramIcon />
        </span>
        <span>Follow on Instagram</span>
      </Link>
    </section>
  );
}
