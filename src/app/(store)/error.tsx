"use client";

import { useEffect } from "react";

type StoreErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function StoreErrorPage({ error, reset }: StoreErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-gold-dark">Storefront Error</p>
      <h1 className="mt-4 font-playfair text-4xl text-charcoal">We hit a snag</h1>
      <p className="mt-3 text-charcoal/70">Please try again. If this continues, contact us on WhatsApp.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-10 items-center rounded-full bg-charcoal px-5 text-sm text-cream hover:bg-gold hover:text-charcoal"
      >
        Try Again
      </button>
    </section>
  );
}
