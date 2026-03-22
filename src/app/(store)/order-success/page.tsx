"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import type { ApiResponse, IOrder } from "@/types";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const openModal = useAuthStore((state) => state.openModal);
  const orderNumber = searchParams.get("order") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Partial<IOrder> | null>(null);

  useEffect(() => {
    if (!orderNumber) {
      setError("Missing order number in URL.");
      return;
    }

    const controller = new AbortController();

    const loadOrder = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`, {
          signal: controller.signal,
        });

        const result = (await response.json()) as ApiResponse<Partial<IOrder>>;
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Unable to load order details.");
        }

        setOrder(result.data);
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unable to load order details.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadOrder();

    return () => controller.abort();
  }, [orderNumber]);

  const whatsappHref = useMemo(() => {
    const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000").replace(/[^\d]/g, "");
    const message = `Order ${orderNumber} mein inquiry hai`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }, [orderNumber]);

  return (
    <section className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-stone-200 bg-white p-6 md:p-10">
      <div className="text-center">
        <motion.svg
          viewBox="0 0 52 52"
          className="mx-auto h-14 w-14 text-green-600"
          initial="hidden"
          animate="visible"
        >
          <motion.circle
            cx="26"
            cy="26"
            r="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: { pathLength: 1, opacity: 1 },
            }}
            transition={{ duration: 0.5 }}
          />
          <motion.path
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            d="M14 27l7 7 17-17"
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: { pathLength: 1, opacity: 1 },
            }}
            transition={{ duration: 0.45, delay: 0.2 }}
          />
        </motion.svg>

        <h1 className="mt-4 font-playfair text-4xl text-charcoal">Order Placed Successfully!</h1>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-4 py-2">
          <span className="text-sm font-semibold tracking-[0.06em] text-charcoal">{orderNumber || "-"}</span>
          {orderNumber ? (
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(orderNumber);
                toast.success("Order number copied.");
              }}
              className="text-xs text-charcoal/70 underline-offset-4 hover:underline"
            >
              Copy
            </button>
          ) : null}
        </div>

        <p className="mt-3 text-sm text-charcoal/75">
          Thank you{order?.customer?.name ? `, ${order.customer.name}` : ""}! We&apos;ll confirm your order via
          WhatsApp shortly.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-stone-200 p-8 text-charcoal/70">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading order details...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {!loading && !error && order ? (
        <article className="space-y-4 rounded-2xl border border-stone-200 bg-cream-dark/35 p-4">
          <h2 className="font-playfair text-2xl text-charcoal">Order Summary</h2>

          <div className="space-y-2">
            {(order.items ?? []).map((item) => (
              <div key={`${item.product}-${item.productName}`} className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">
                <p className="line-clamp-1 text-charcoal">{item.productName} x {item.quantity}</p>
                <p className="font-semibold text-charcoal">{formatPrice((item.discountPrice ?? item.price) * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-2 text-sm text-charcoal/75 md:grid-cols-2">
            <p><span className="text-charcoal/55">Total:</span> {formatPrice(order.total ?? 0)}</p>
            <p><span className="text-charcoal/55">Payment:</span> {order.paymentMethod}</p>
            <p className="md:col-span-2">
              <span className="text-charcoal/55">Delivery Address:</span>{" "}
              {[order.shippingAddress?.street, order.shippingAddress?.area, order.shippingAddress?.city, order.shippingAddress?.province]
                .filter(Boolean)
                .join(", ") || "-"}
            </p>
          </div>
        </article>
      ) : null}

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href={orderNumber ? `/track-order?order=${encodeURIComponent(orderNumber)}` : "/track-order"}
          className="inline-flex h-11 items-center rounded-full border border-stone-300 px-5 text-sm text-charcoal transition hover:bg-stone-100"
        >
          Track Your Order
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center rounded-full bg-charcoal px-5 text-sm text-cream transition hover:bg-gold hover:text-charcoal"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center">
        <p className="text-sm text-green-800">Questions? Chat with us on WhatsApp</p>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex h-10 items-center rounded-full bg-[#25D366] px-5 text-sm text-white"
        >
          Chat on WhatsApp
        </a>
      </div>

      {!session?.user?.id ? (
        <div className="rounded-2xl border border-gold/40 bg-cream-dark p-4 text-center">
          <p className="font-playfair text-2xl text-charcoal">Track your order anytime</p>
          <p className="mt-1 text-sm text-charcoal/75">
            Create a free account to easily track {orderNumber} and all future orders.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => openModal("register", "/", order?.customer?.email ?? "")}
              className="inline-flex h-10 items-center rounded-full bg-charcoal px-5 text-sm text-cream"
            >
              {order?.customer?.email ? `Create account for ${order.customer.email}` : "Create Account"}
            </button>
            <button type="button" className="text-xs text-charcoal/60">No thanks</button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function OrderSuccessFallback() {
  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-6 md:p-10">
      <div className="flex items-center justify-center gap-2 text-charcoal/70">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading order details...
      </div>
    </section>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<OrderSuccessFallback />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
