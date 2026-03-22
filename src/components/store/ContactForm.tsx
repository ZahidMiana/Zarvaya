"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { contactSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

type ContactSubject = "order-support" | "product-query" | "collaboration" | "other";

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  subject: ContactSubject;
  message: string;
};

const initialState: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  subject: "order-support",
  message: "",
};

export default function ContactForm() {
  const [state, setState] = useState<ContactFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const parsed = contactSchema.safeParse({
        ...state,
        phone: state.phone || undefined,
      });

      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Please review form fields.");
        return;
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const result = (await response.json()) as ApiResponse<null>;
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send message.");
      }

      setSubmitted(true);
      setState(initialState);
      toast.success("Message sent successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6">
      <h2 className="font-playfair text-3xl text-charcoal">Send a Message</h2>
      <form className="mt-5 space-y-4" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="contact-name" className="text-sm text-charcoal/75">Name</label>
            <input id="contact-name" value={state.name} onChange={(event) => setState((prev) => ({ ...prev, name: event.target.value }))} required className="h-11 w-full rounded-lg border border-stone-300 px-3 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="contact-email" className="text-sm text-charcoal/75">Email</label>
            <input id="contact-email" type="email" value={state.email} onChange={(event) => setState((prev) => ({ ...prev, email: event.target.value }))} required className="h-11 w-full rounded-lg border border-stone-300 px-3 text-sm" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="contact-phone" className="text-sm text-charcoal/75">Phone</label>
            <input id="contact-phone" value={state.phone} onChange={(event) => setState((prev) => ({ ...prev, phone: event.target.value }))} placeholder="03XXXXXXXXX" className="h-11 w-full rounded-lg border border-stone-300 px-3 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="contact-subject" className="text-sm text-charcoal/75">Subject</label>
            <select id="contact-subject" value={state.subject} onChange={(event) => setState((prev) => ({ ...prev, subject: event.target.value as ContactSubject }))} className="h-11 w-full rounded-lg border border-stone-300 px-3 text-sm">
              <option value="order-support">Order Support</option>
              <option value="product-query">Product Query</option>
              <option value="collaboration">Collaboration</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-message" className="text-sm text-charcoal/75">Message</label>
          <textarea id="contact-message" value={state.message} onChange={(event) => setState((prev) => ({ ...prev, message: event.target.value }))} required className="min-h-36 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        </div>

        <button type="submit" disabled={submitting} className="inline-flex h-11 items-center rounded-full bg-charcoal px-6 text-sm tracking-[0.08em] text-cream hover:bg-gold hover:text-charcoal disabled:opacity-70">
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </form>

      {submitted ? (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Thank you. We received your message. For urgent help, contact us on WhatsApp as well.
        </p>
      ) : null}
    </section>
  );
}
