"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { OrderStatus, type ApiResponse, type IOrder } from "@/types";

const TIMELINE_STEPS: Array<{ key: OrderStatus; label: string }> = [
  { key: OrderStatus.PLACED, label: "Placed" },
  { key: OrderStatus.CONFIRMED, label: "Confirmed" },
  { key: OrderStatus.PROCESSING, label: "Processing" },
  { key: OrderStatus.PACKED, label: "Packed" },
  { key: OrderStatus.SHIPPED, label: "Shipped" },
  { key: OrderStatus.DELIVERED, label: "Delivered" },
];

function trackingUrl(courier?: string, trackingNumber?: string): string | null {
  if (!courier || !trackingNumber) {
    return null;
  }

  const id = encodeURIComponent(trackingNumber);
  if (courier === "tcs") {
    return `https://www.tcsexpress.com/track/${id}`;
  }

  if (courier === "leopards") {
    return `https://leopardscourier.com/leopards-tracking/?track=${id}`;
  }

  if (courier === "trax") {
    return `https://trax.pk/tracking/?tracking_number=${id}`;
  }

  return null;
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Partial<IOrder> | null>(null);

  const currentStepIndex = useMemo(() => {
    if (!order?.orderStatus) {
      return -1;
    }

    return TIMELINE_STEPS.findIndex((step) => step.key === order.orderStatus);
  }, [order?.orderStatus]);

  const fetchOrder = useCallback(async (target: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(target)}`);
      const result = (await response.json()) as ApiResponse<Partial<IOrder>>;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Order not found.");
      }

      setOrder(result.data);
    } catch (trackError) {
      setOrder(null);
      setError(
        trackError instanceof Error
          ? trackError.message
          : "We could not find an order with this number.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const queryOrder = searchParams.get("order");
    if (queryOrder) {
      setOrderNumber(queryOrder);
      void fetchOrder(queryOrder);
    }
  }, [fetchOrder, searchParams]);

  async function handleTrack(nextOrderNumber?: string) {
    const target = (nextOrderNumber ?? orderNumber).trim();
    if (!target) {
      setError("Please enter your order number.");
      setOrder(null);
      return;
    }

    await fetchOrder(target);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title="Track Your Order" subtitle="Enter your order number to check live order progress." />

      <form
        className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void handleTrack();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="orderNumber">Order Number</Label>
          <Input
            id="orderNumber"
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            placeholder="ZJ-2026-00001"
          />
        </div>
        <Button disabled={loading} className="rounded-full bg-charcoal text-cream hover:bg-gold-dark">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Tracking...
            </span>
          ) : (
            "Track"
          )}
        </Button>
      </form>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error} Please re-check your order number or contact support on WhatsApp.
        </div>
      ) : null}

      {order ? (
        <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-gold-dark">Order</p>
              <h2 className="font-playfair text-2xl text-charcoal">{order.orderNumber}</h2>
            </div>
            <span className="rounded-full bg-gold/15 px-3 py-1 text-xs uppercase tracking-[0.1em] text-charcoal">
              {order.orderStatus}
            </span>
          </div>

          <div className="space-y-5">
            {TIMELINE_STEPS.map((step, index) => {
              const done = index < currentStepIndex;
              const current = index === currentStepIndex;
              const history = (order.statusHistory ?? []).find((entry) => entry.status === step.key);

              return (
                <div key={step.key} className="relative flex gap-3">
                  <div className="relative pt-1">
                    <span
                      className={`inline-flex h-4 w-4 rounded-full border ${
                        done
                          ? "border-gold bg-gold"
                          : current
                            ? "border-gold bg-gold/25"
                            : "border-stone-300 bg-white"
                      }`}
                    />
                    {current ? (
                      <span className="absolute inset-0 animate-ping rounded-full border border-gold" />
                    ) : null}
                    {index < TIMELINE_STEPS.length - 1 ? (
                      <span className={`absolute left-[7px] top-5 h-[44px] w-px ${done ? "bg-gold" : "bg-stone-300"}`} />
                    ) : null}
                  </div>

                  <div className="pb-5">
                    <p className="text-sm font-semibold text-charcoal">{step.label}</p>
                    <p className="text-xs text-charcoal/58">
                      {history?.timestamp ? new Date(history.timestamp).toLocaleString() : "Pending"}
                    </p>
                    {history?.note ? <p className="mt-1 text-xs text-charcoal/68">{history.note}</p> : null}
                  </div>
                </div>
              );
            })}
          </div>

          {order.trackingNumber ? (
            <div className="rounded-xl border border-stone-200 bg-cream-dark/40 p-3 text-sm text-charcoal/78">
              <p>
                <span className="text-charcoal/55">Tracking Number:</span> {order.trackingNumber}
              </p>
              <p>
                <span className="text-charcoal/55">Courier:</span> {order.courier ?? "-"}
              </p>
              {trackingUrl(order.courier, order.trackingNumber) ? (
                <a
                  href={trackingUrl(order.courier, order.trackingNumber) as string}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-xs text-gold-dark underline-offset-4 hover:underline"
                >
                  Open courier tracking
                </a>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2 rounded-xl border border-stone-200 p-3 text-sm text-charcoal/78">
            <p><span className="text-charcoal/55">Customer:</span> {order.customer?.name}</p>
            <p><span className="text-charcoal/55">Phone:</span> {order.customer?.phone}</p>
            <p><span className="text-charcoal/55">Total:</span> {formatPrice(order.total ?? 0)}</p>
            <p>
              <span className="text-charcoal/55">Address:</span>{" "}
              {[order.shippingAddress?.street, order.shippingAddress?.area, order.shippingAddress?.city, order.shippingAddress?.province]
                .filter(Boolean)
                .join(", ") || "-"}
            </p>
          </div>

          <a
            href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000").replace(/[^\d]/g, "")}?text=${encodeURIComponent(`Need help with order ${order.orderNumber}`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center rounded-full bg-[#25D366] px-5 text-sm text-white"
          >
            Need help? WhatsApp us
          </a>
        </section>
      ) : null}
    </div>
  );
}

function TrackOrderFallback() {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-stone-200 bg-white p-6">
      <div className="flex items-center justify-center gap-2 text-charcoal/70">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading tracker...
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<TrackOrderFallback />}>
      <TrackOrderContent />
    </Suspense>
  );
}
