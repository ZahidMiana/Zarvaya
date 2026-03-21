"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setSuccess("Please enter your email address.");
      return;
    }

    console.log("Newsletter subscription:", email);
    setSuccess("Thank you. You are now on the insider list.");
    setEmail("");
  };

  return (
    <section className="rounded-[28px] border border-gold/20 bg-cream p-7 md:p-10">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Insider Access</p>
        <h2 className="mt-2 font-playfair text-3xl text-charcoal md:text-4xl">Stay in the Loop</h2>
        <p className="mt-3 text-sm text-charcoal/68">
          Get early access to new collections, styling tips, and exclusive offers.
        </p>

        <form className="mx-auto mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className="h-12 w-full rounded-full border border-stone-300 bg-white px-5 text-sm outline-none transition focus:border-gold"
          />
          <button
            type="submit"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-charcoal px-7 text-sm tracking-[0.08em] text-cream transition-colors duration-500 hover:bg-gold hover:text-charcoal"
          >
            Subscribe
          </button>
        </form>

        {success ? <p className="mt-3 text-sm text-charcoal/72">{success}</p> : null}
      </div>
    </section>
  );
}
