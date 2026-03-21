"use client";

import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import FallbackImage from "@/components/ui/FallbackImage";

const testimonials = [
  {
    id: "t1",
    name: "Areeba Khan",
    city: "Lahore",
    review:
      "I ordered the bridal set for my nikkah and everyone asked where it was from. The finishing is beyond beautiful.",
    image: "https://images.unsplash.com/photo-1514355315815-2b64b0216b14?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "t2",
    name: "Hania Saeed",
    city: "Karachi",
    review:
      "Exactly the premium quality I was hoping for. Packaging, polish, and delivery timing were all excellent.",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "t3",
    name: "Sana Mehreen",
    city: "Islamabad",
    review:
      "My jhumky look even better in person. Lightweight, elegant, and very comfortable for long events.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "t4",
    name: "Mishal Fatima",
    city: "Faisalabad",
    review:
      "Customer support on WhatsApp was so smooth. They helped me pick a full set for walima and it was perfect.",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "t5",
    name: "Iqra Anwar",
    city: "Rawalpindi",
    review:
      "ZARVAYA now feels like my go-to for gifting. The pieces feel refined and never look overdone.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop",
  },
];

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-gold" aria-hidden="true">
      <path d="M12 3.8L14.7 9.3L20.7 10.2L16.3 14.5L17.4 20.6L12 17.7L6.6 20.6L7.7 14.5L3.3 10.2L9.3 9.3L12 3.8Z" />
    </svg>
  );
}

export default function TestimonialsSection() {
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const loopWidth = useRef(0);

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) {
        return;
      }

      loopWidth.current = trackRef.current.scrollWidth / 2;
    };

    measure();
    window.addEventListener("resize", measure);

    return () => window.removeEventListener("resize", measure);
  }, []);

  useAnimationFrame((_, delta) => {
    if (isPaused || loopWidth.current <= 0) {
      return;
    }

    const distance = (delta / 1000) * 24;
    let next = x.get() - distance;

    if (Math.abs(next) >= loopWidth.current) {
      next = 0;
    }

    x.set(next);
  });

  return (
    <section className="rounded-[28px] bg-cream-dark px-5 py-12 sm:px-8 md:px-10">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Loved by Women Across Pakistan</p>
        <h2 className="font-playfair text-3xl text-charcoal md:text-4xl">What Our Customers Say</h2>
      </div>

      <div className="mt-7 overflow-hidden" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
        <motion.div
          ref={trackRef}
          className="flex gap-4"
          style={{ x }}
        >
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <article
              key={`${testimonial.id}-${index}`}
              className="w-[86vw] shrink-0 rounded-2xl border border-stone-200 bg-white p-5 sm:w-[430px]"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <StarIcon key={`${testimonial.id}-star-${starIndex}`} />
                ))}
              </div>

              <p className="font-playfair text-lg italic leading-relaxed text-charcoal/85">&quot;{testimonial.review}&quot;</p>

              <div className="mt-5 flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-stone-200">
                  <FallbackImage
                    src={testimonial.image}
                    fallbackSrc="/placeholders/avatar-fallback.svg"
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal">{testimonial.name}</p>
                  <p className="text-xs text-charcoal/55">{testimonial.city}</p>
                </div>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
