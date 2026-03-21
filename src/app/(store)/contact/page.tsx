"use client";

import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Contact Us"
        subtitle="Share your query and our team will assist you with product details and order guidance."
      />
      <form
        className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <textarea
            id="message"
            className="min-h-32 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-gold focus:ring-2"
            placeholder="How can we help you?"
          />
        </div>
        <Button className="rounded-full bg-charcoal text-cream hover:bg-gold-dark">Send Message</Button>
      </form>
      {submitted ? (
        <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Message received. We will reach out shortly.
        </p>
      ) : null}
    </div>
  );
}
