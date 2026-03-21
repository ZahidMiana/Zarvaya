"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-gold-dark">Something Went Wrong</p>
      <h1 className="mt-4 font-playfair text-4xl text-charcoal">Unexpected Error</h1>
      <p className="mt-3 text-charcoal/70">Please try again. If the issue persists, contact support.</p>
      <Button className="mt-6 rounded-full bg-charcoal text-cream hover:bg-gold-dark" onClick={reset}>
        Try Again
      </Button>
    </section>
  );
}
