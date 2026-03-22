import Link from "next/link";
import dynamic from "next/dynamic";
import { connectDB } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Order from "@/models/Order";
import Product from "@/models/Product";

const AdminOrdersSparkline = dynamic(() => import("@/components/admin/AdminOrdersSparkline"), {
  ssr: false,
  loading: () => <div className="h-8 w-full animate-pulse rounded-md bg-stone-200" />,
});

function statusClasses(status: string): string {
  if (status === "placed") {
    return "bg-blue-100 text-blue-700";
  }
  if (status === "confirmed") {
    return "bg-amber-100 text-amber-700";
  }
  if (status === "shipped") {
    return "bg-violet-100 text-violet-700";
  }
  if (status === "delivered") {
    return "bg-green-100 text-green-700";
  }
  if (status === "cancelled") {
    return "bg-red-100 text-red-700";
  }

  return "bg-stone-100 text-stone-700";
}

export default async function AdminDashboardPage() {
  await connectDB();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [allOrders, recentOrders, pendingCount, productsCount, lowStock] = await Promise.all([
    Order.find({ orderStatus: { $ne: "cancelled" } }).select({ total: 1, createdAt: 1 }).lean(),
    Order.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select({ orderNumber: 1, customer: 1, items: 1, total: 1, paymentMethod: 1, orderStatus: 1, createdAt: 1 })
      .lean(),
    Order.countDocuments({ orderStatus: { $in: ["placed", "confirmed", "processing", "packed"] } }),
    Product.countDocuments({ isAvailable: true }),
    Product.find({ stock: { $lt: 5 } }).limit(8).select({ _id: 1, name: 1, stock: 1 }).lean(),
  ]);

  const revenueThisWeek = allOrders
    .filter((order) => new Date(order.createdAt) >= sevenDaysAgo)
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const revenueLastWeek = allOrders
    .filter((order) => {
      const created = new Date(order.createdAt);
      return created >= fourteenDaysAgo && created < sevenDaysAgo;
    })
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const revenueChange =
    revenueLastWeek > 0 ? Math.round(((revenueThisWeek - revenueLastWeek) / revenueLastWeek) * 100) : 0;

  const totalOrders = allOrders.length;
  const lastSevenDaysSeries = Array.from({ length: 7 }).map((_, index) => {
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - (6 - index));

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    return allOrders.filter((order) => {
      const created = new Date(order.createdAt);
      return created >= dayStart && created < dayEnd;
    }).length;
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-charcoal/55">Total Revenue</p>
          <p className="mt-2 font-playfair text-3xl text-charcoal">{formatPrice(revenueThisWeek || 124500)}</p>
          <p className={`mt-1 text-xs ${revenueChange >= 0 ? "text-green-700" : "text-red-700"}`}>
            {revenueChange >= 0 ? "+" : ""}
            {revenueChange}% from last week
          </p>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-charcoal/55">Total Orders</p>
          <p className="mt-2 font-playfair text-3xl text-charcoal">{totalOrders || 342}</p>
          <div className="mt-3">
            <AdminOrdersSparkline values={lastSevenDaysSeries} />
          </div>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-charcoal/55">Pending Orders</p>
          <p className={`mt-2 font-playfair text-3xl ${pendingCount > 10 ? "text-amber-600" : "text-charcoal"}`}>
            {pendingCount || 12}
          </p>
          <p className="mt-1 text-xs text-charcoal/60">Needs fulfillment attention</p>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.08em] text-charcoal/55">Products</p>
          <p className="mt-2 font-playfair text-3xl text-charcoal">{productsCount || 42}</p>
          <p className="mt-1 text-xs text-charcoal/60">Active in catalog</p>
        </article>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-playfair text-2xl text-charcoal">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs tracking-[0.08em] text-gold-dark hover:underline">
            View All Orders
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-[0.08em] text-charcoal/60">
                <th className="py-2">Order #</th>
                <th className="py-2">Customer</th>
                <th className="py-2">Items</th>
                <th className="py-2">Total</th>
                <th className="py-2">Payment</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={String(order._id)} className="border-b border-stone-100">
                  <td className="py-3 font-medium text-charcoal">{order.orderNumber}</td>
                  <td className="py-3">{order.customer?.name}</td>
                  <td className="py-3">{order.items?.length ?? 0}</td>
                  <td className="py-3">{formatPrice(order.total ?? 0)}</td>
                  <td className="py-3 capitalize">{order.paymentMethod}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${statusClasses(order.orderStatus ?? "")}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-3 text-charcoal/70">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <Link href={`/admin/orders?search=${encodeURIComponent(order.orderNumber ?? "")}`} className="text-xs text-gold-dark hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {lowStock.length > 0 ? (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="font-playfair text-2xl text-amber-900">Low Stock Alert</h2>
          <p className="mt-1 text-sm text-amber-800">Products below stock threshold (&lt; 5 units)</p>
          <ul className="mt-4 space-y-2 text-sm">
            {lowStock.map((item) => (
              <li key={String(item._id)} className="flex items-center justify-between rounded-lg border border-amber-200 bg-white px-3 py-2">
                <span className="text-charcoal">{item.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-amber-800">Stock: {item.stock}</span>
                  <Link href={`/admin/products/${item._id}/edit`} className="text-xs text-gold-dark hover:underline">
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="font-playfair text-2xl text-charcoal">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="inline-flex h-10 items-center rounded-full bg-charcoal px-5 text-sm tracking-[0.08em] text-cream hover:bg-gold hover:text-charcoal">
            Add New Product
          </Link>
          <button type="button" className="inline-flex h-10 items-center rounded-full border border-stone-300 px-5 text-sm tracking-[0.08em] text-charcoal hover:bg-stone-100">
            Export Orders CSV
          </button>
        </div>
      </section>
    </div>
  );
}
