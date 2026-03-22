"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { OrderStatus } from "@/types";
import type { ApiResponse, IOrder } from "@/types";

type OrdersPayload = {
  orders: IOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    revenue: number;
    totalOrders: number;
    pending: number;
    delivered: number;
  };
};

const statuses: OrderStatus[] = [
  OrderStatus.PLACED,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.PACKED,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
];

function badge(status: string): string {
  if (status === "placed") return "bg-blue-100 text-blue-700";
  if (status === "confirmed") return "bg-amber-100 text-amber-700";
  if (status === "shipped") return "bg-violet-100 text-violet-700";
  if (status === "delivered") return "bg-green-100 text-green-700";
  if (status === "cancelled") return "bg-red-100 text-red-700";
  return "bg-stone-100 text-stone-700";
}

export default function OrdersManager() {
  const [data, setData] = useState<OrdersPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentMethod: "",
    city: "",
    dateFrom: "",
    dateTo: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: "20",
        search: filters.search,
        status: filters.status,
        paymentMethod: filters.paymentMethod,
        city: filters.city,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });

      const response = await fetch(`/api/orders?${query.toString()}`);
      const result = (await response.json()) as ApiResponse<OrdersPayload>;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Unable to load orders.");
      }

      setData(result.data);
      setSelected([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, [
    filters.city,
    filters.dateFrom,
    filters.dateTo,
    filters.paymentMethod,
    filters.search,
    filters.status,
    page,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const avgOrder = useMemo(() => {
    if (!data || data.stats.totalOrders === 0) return 0;
    return Math.round(data.stats.revenue / data.stats.totalOrders);
  }, [data]);

  const updateStatus = async (orderNumber: string, status: OrderStatus) => {
    const response = await fetch(`/api/orders/${orderNumber}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const result = (await response.json()) as ApiResponse<IOrder>;
    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || "Status update failed.");
    }

    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        orders: prev.orders.map((item) => (item.orderNumber === orderNumber ? result.data! : item)),
      };
    });
  };

  const bulkStatus = async (status: OrderStatus) => {
    if (selected.length === 0) {
      toast.error("No orders selected.");
      return;
    }

    await Promise.all(selected.map((orderNumber) => updateStatus(orderNumber, status)));
    toast.success("Bulk status update complete.");
    await load();
  };

  const exportCsv = () => {
    if (!data) return;

    const rows = [
      ["Order #", "Customer", "Phone", "Items", "Total", "Payment", "Status", "City", "Date"],
      ...data.orders.map((order) => [
        order.orderNumber,
        order.customer.name,
        order.customer.phone,
        String(order.items.length),
        String(order.total),
        order.paymentMethod,
        order.orderStatus,
        order.shippingAddress.city,
        order.createdAt,
      ]),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "orders-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard label="Revenue" value={`PKR ${(data?.stats.revenue ?? 0).toLocaleString("en-PK")}`} />
        <StatCard label="Orders" value={String(data?.stats.totalOrders ?? 0)} />
        <StatCard label="Pending" value={String(data?.stats.pending ?? 0)} />
        <StatCard label="Avg Order" value={`PKR ${avgOrder.toLocaleString("en-PK")}`} />
      </div>

      <div className="flex flex-wrap gap-2">
        <InputLike value={filters.search} onChange={(value) => setFilters((prev) => ({ ...prev, search: value }))} placeholder="Search order, customer, phone" />
        <select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))} className="h-10 rounded-lg border border-stone-300 px-3 text-sm">
          <option value="">all status</option>
          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select value={filters.paymentMethod} onChange={(event) => setFilters((prev) => ({ ...prev, paymentMethod: event.target.value }))} className="h-10 rounded-lg border border-stone-300 px-3 text-sm">
          <option value="">all payments</option>
          <option value="cod">cod</option>
          <option value="easypaisa">easypaisa</option>
          <option value="jazzcash">jazzcash</option>
          <option value="bank-transfer">bank-transfer</option>
        </select>
        <InputLike value={filters.city} onChange={(value) => setFilters((prev) => ({ ...prev, city: value }))} placeholder="City" />
        <input type="date" value={filters.dateFrom} onChange={(event) => setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))} className="h-10 rounded-lg border border-stone-300 px-3 text-sm" />
        <input type="date" value={filters.dateTo} onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value }))} className="h-10 rounded-lg border border-stone-300 px-3 text-sm" />
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <button type="button" onClick={() => void bulkStatus(OrderStatus.CONFIRMED)} className="rounded-full border border-stone-300 px-3 py-1">Mark as Confirmed</button>
        <button type="button" onClick={() => void bulkStatus(OrderStatus.SHIPPED)} className="rounded-full border border-stone-300 px-3 py-1">Mark as Shipped</button>
        <button type="button" onClick={exportCsv} className="rounded-full border border-stone-300 px-3 py-1">Export CSV</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-[0.08em] text-charcoal/60">
              <th className="py-2"><input type="checkbox" checked={Boolean(data?.orders.length && selected.length === data?.orders.length)} onChange={(event) => setSelected(event.target.checked ? (data?.orders.map((order) => order.orderNumber) ?? []) : [])} /></th>
              <th className="py-2">Order #</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Items</th>
              <th className="py-2">Total</th>
              <th className="py-2">Payment</th>
              <th className="py-2">Status</th>
              <th className="py-2">City</th>
              <th className="py-2">Date</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="py-8 text-center text-charcoal/60">Loading orders...</td></tr>
            ) : (data?.orders ?? []).length === 0 ? (
              <tr><td colSpan={10} className="py-8 text-center text-charcoal/60">No orders found.</td></tr>
            ) : (
              data?.orders.map((order) => {
                const isOpen = expanded.includes(order.orderNumber);

                return (
                  <Fragment key={order.orderNumber}>
                    <tr className="border-b border-stone-100">
                      <td className="py-3"><input type="checkbox" checked={selected.includes(order.orderNumber)} onChange={(event) => setSelected((prev) => event.target.checked ? [...prev, order.orderNumber] : prev.filter((id) => id !== order.orderNumber))} /></td>
                      <td className="py-3 font-medium text-charcoal">{order.orderNumber}</td>
                      <td className="py-3">{order.customer.name}<p className="text-xs text-charcoal/60">{order.customer.phone}</p></td>
                      <td className="py-3">{order.items.length} item(s)</td>
                      <td className="py-3">PKR {order.total.toLocaleString("en-PK")}</td>
                      <td className="py-3"><p className="capitalize">{order.paymentMethod}</p><p className="text-xs text-charcoal/60">{order.paymentStatus}</p></td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-1 text-xs ${badge(order.orderStatus)}`}>{order.orderStatus}</span>
                      </td>
                      <td className="py-3">{order.shippingAddress.city}</td>
                      <td className="py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setExpanded((prev) => isOpen ? prev.filter((id) => id !== order.orderNumber) : [...prev, order.orderNumber])} className="text-xs text-gold-dark hover:underline">View</button>
                          <select
                            value={order.orderStatus}
                            onChange={async (event) => {
                              const next = event.target.value as OrderStatus;
                              setData((prev) => prev ? ({ ...prev, orders: prev.orders.map((item) => item.orderNumber === order.orderNumber ? ({ ...item, orderStatus: next }) : item) }) : prev);
                              try {
                                await updateStatus(order.orderNumber, next);
                                toast.success("Status updated.");
                              } catch (error) {
                                toast.error(error instanceof Error ? error.message : "Status update failed.");
                                await load();
                              }
                            }}
                            className="h-8 rounded border border-stone-300 px-2 text-xs"
                          >
                            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                          </select>
                        </div>
                      </td>
                    </tr>
                    {isOpen ? (
                      <tr className="border-b border-stone-100 bg-stone-50/60">
                        <td colSpan={10} className="px-4 py-3">
                          <div className="grid gap-2 text-xs text-charcoal/78 md:grid-cols-2">
                            <div>
                              <p className="font-semibold text-charcoal">Shipping</p>
                              <p>{[order.shippingAddress.street, order.shippingAddress.area, order.shippingAddress.city, order.shippingAddress.province].filter(Boolean).join(", ")}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-charcoal">Items</p>
                              <ul className="space-y-1">
                                {order.items.map((item) => (
                                  <li key={`${item.product}-${item.productName}`} className="flex items-center justify-between">
                                    <span>{item.productName} x {item.quantity}</span>
                                    <span>PKR {((item.discountPrice ?? item.price) * item.quantity).toLocaleString("en-PK")}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-xs">
        <button type="button" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="rounded-full border border-stone-300 px-3 py-1 disabled:opacity-40">Prev</button>
        <p>Page {data?.pagination.page ?? page} of {data?.pagination.pages ?? 1}</p>
        <button type="button" disabled={page >= (data?.pagination.pages ?? 1)} onClick={() => setPage((prev) => Math.min(data?.pagination.pages ?? 1, prev + 1))} className="rounded-full border border-stone-300 px-3 py-1 disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}

function InputLike({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 rounded-lg border border-stone-300 px-3 text-sm" />;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-stone-200 bg-stone-50 p-3">
      <p className="text-[11px] uppercase tracking-[0.08em] text-charcoal/60">{label}</p>
      <p className="mt-1 font-playfair text-2xl text-charcoal">{value}</p>
    </article>
  );
}
