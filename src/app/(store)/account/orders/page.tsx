import Link from "next/link";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { formatPrice } from "@/lib/utils";

const orderStatusClass: Record<string, string> = {
  delivered: "bg-emerald-100 text-emerald-700",
  shipped: "bg-sky-100 text-sky-700",
  processing: "bg-amber-100 text-amber-700",
  placed: "bg-violet-100 text-violet-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const paymentStatusClass: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-rose-100 text-rose-700",
  refunded: "bg-slate-200 text-slate-700",
};

export default async function AccountOrdersPage() {
  const session = await auth();
  await connectDB();

  const orders = await Order.find({
    $or: [{ "customer.email": session?.user?.email }, { "customer.phone": session?.user?.phone }],
  })
    .sort({ createdAt: -1 })
    .lean();

  if (orders.length === 0) {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-[0_12px_28px_rgba(26,26,26,0.05)]">
        <h1 className="font-playfair text-3xl text-charcoal">No orders yet</h1>
        <p className="mt-2 text-sm text-charcoal/70">Start shopping and your orders will appear here.</p>
        <Link href="/shop" className="mt-4 inline-flex h-10 items-center rounded-full bg-charcoal px-5 text-sm text-cream">Start Shopping</Link>
      </section>
    );
  }

  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-playfair text-4xl text-charcoal">My Orders</h1>
        <p className="text-xs tracking-[0.12em] text-charcoal/60">{orders.length} ORDER{orders.length > 1 ? "S" : ""}</p>
      </div>

      {orders.map((order) => (
        <article key={order.orderNumber} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-[0_10px_24px_rgba(26,26,26,0.05)] sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="font-semibold tracking-[0.06em] text-gold-dark">{order.orderNumber}</p>
            <p className="text-charcoal/70">{new Date(order.createdAt).toLocaleDateString()}</p>
            <div className="flex flex-wrap items-center gap-2">
              <p className={`rounded-full px-2.5 py-1 text-xs capitalize ${orderStatusClass[String(order.orderStatus).toLowerCase()] ?? "bg-stone-100 text-charcoal/75"}`}>
                {String(order.orderStatus).replaceAll("_", " ")}
              </p>
              <p className={`rounded-full px-2.5 py-1 text-xs capitalize ${paymentStatusClass[String(order.paymentStatus).toLowerCase()] ?? "bg-stone-100 text-charcoal/75"}`}>
                {order.paymentStatus}
              </p>
            </div>
          </div>

          <div className="mt-3 grid gap-3 text-sm text-charcoal/75 sm:grid-cols-3">
            <p>{order.items.length} items</p>
            <p>Payment: {String(order.paymentMethod).replaceAll("_", " ")}</p>
            <p className="font-semibold text-charcoal">{formatPrice(order.total)}</p>
          </div>

          <div className="mt-3 rounded-2xl border border-stone-200 bg-stone-50 p-3 text-xs text-charcoal/70">
            {order.items.slice(0, 3).map((item) => item.productName).join(" • ")}
            {order.items.length > 3 ? ` • +${order.items.length - 3} more` : ""}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/track-order?order=${encodeURIComponent(order.orderNumber)}`} className="rounded-full border border-stone-300 px-4 py-1.5 text-xs transition hover:border-gold hover:text-gold-dark">Track Order</Link>
            <Link href="/shop" className="rounded-full border border-stone-300 px-4 py-1.5 text-xs transition hover:border-gold hover:text-gold-dark">Reorder</Link>
          </div>
        </article>
      ))}
    </section>
  );
}
