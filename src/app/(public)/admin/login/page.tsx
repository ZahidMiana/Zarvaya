"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiResponse } from "@/types";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = (await response.json()) as ApiResponse<{ email: string }>;
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to login.");
      }

      toast.success("Welcome back, admin.");
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-cream to-white p-4">
      <section className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-7 shadow-[0_20px_50px_rgba(26,26,26,0.08)]">
        <p className="text-center font-playfair text-3xl tracking-[0.16em] text-charcoal">ZARVAYA</p>
        <p className="mt-2 text-center text-sm text-charcoal/65">Admin Portal Login</p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-charcoal text-sm tracking-[0.08em] text-cream transition hover:bg-gold hover:text-charcoal disabled:opacity-70"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
