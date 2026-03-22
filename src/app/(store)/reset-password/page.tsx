"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";

const schema = z
  .object({
    newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
    confirmPassword: z.string().min(8),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const openModal = useAuthStore((state) => state.openModal);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const strengthValue = form.watch("newPassword") ?? "";
  const strength = strengthValue.length < 8 ? 25 : /[A-Z]/.test(strengthValue) && /[0-9]/.test(strengthValue) ? 100 : 60;

  const submit = form.handleSubmit(async (values) => {
    if (!token) {
      setStatus("error");
      setError("This link has expired. Request a new one.");
      return;
    }

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...values }),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      setStatus("error");
      setError(result.message || "This link has expired. Request a new one.");
      return;
    }

    setStatus("success");
  });

  return (
    <section className="mx-auto max-w-md py-12">
      <article className="rounded-2xl border border-stone-200 bg-white p-6">
        <p className="text-center font-playfair text-2xl tracking-[0.16em] text-charcoal">ZARVAYA</p>
        <h1 className="mt-4 text-center font-playfair text-3xl text-charcoal">Create new password</h1>

        {status === "success" ? (
          <div className="mt-6 space-y-3 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 text-2xl leading-[48px] text-green-700">✓</div>
            <p className="text-sm text-charcoal/75">Password updated successfully!</p>
            <button type="button" onClick={() => openModal("login")} className="inline-flex h-11 items-center rounded-full bg-charcoal px-6 text-sm text-cream">
              Go to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input type="password" placeholder="New password" className="h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm" {...form.register("newPassword")} />
            <div className="h-2 rounded-full bg-stone-200">
              <div className="h-2 rounded-full bg-gold transition-all" style={{ width: `${strength}%` }} />
            </div>
            <input type="password" placeholder="Confirm password" className="h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm" {...form.register("confirmPassword")} />
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
            <button type="submit" className="h-12 w-full rounded-xl bg-charcoal text-sm text-cream">
              Reset Password
            </button>
          </form>
        )}
      </article>
    </section>
  );
}
