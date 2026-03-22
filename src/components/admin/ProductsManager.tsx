"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ProductCategory } from "@/types";
import type { ApiResponse, IProduct } from "@/types";

type ProductsPayload = {
  items: IProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

const categories: Array<"all" | ProductCategory> = [
  "all",
  ProductCategory.NECKLACE,
  ProductCategory.JHUMKY,
  ProductCategory.RING,
  ProductCategory.BANGLES,
  ProductCategory.SET,
  ProductCategory.ANKLET,
];

export default function ProductsManager() {
  const [items, setItems] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | ProductCategory>("all");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [stock, setStock] = useState<"all" | "in-stock" | "low" | "out">("all");
  const [selected, setSelected] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: "20",
        search,
        category,
        status,
        stock,
      });

      const response = await fetch(`/api/admin/products?${query.toString()}`);
      const result = (await response.json()) as ApiResponse<ProductsPayload>;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Failed to load products.");
      }

      setItems(result.data.items);
      setPages(result.data.pagination.pages);
      setSelected([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, [category, page, search, status, stock]);

  useEffect(() => {
    void load();
  }, [load]);

  const allSelected = useMemo(() => items.length > 0 && selected.length === items.length, [items.length, selected.length]);

  const toggleFlag = async (id: string, payload: Record<string, boolean>) => {
    const response = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as ApiResponse<IProduct>;
    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || "Update failed.");
    }

    setItems((prev) => prev.map((item) => (item._id === id ? result.data! : item)));
  };

  const removeItem = async (id: string) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) {
      return;
    }

    const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    const result = (await response.json()) as ApiResponse<IProduct>;
    if (!response.ok || !result.success) {
      toast.error(result.message || "Delete failed.");
      return;
    }

    toast.success("Product deleted.");
    await load();
  };

  const runBulk = async (action: "delete" | "toggle-availability", value?: boolean) => {
    if (selected.length === 0) {
      toast.error("No products selected.");
      return;
    }

    const response = await fetch("/api/admin/products/bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, action, value }),
    });

    const result = (await response.json()) as ApiResponse<{ modified: number }>;
    if (!response.ok || !result.success) {
      toast.error(result.message || "Bulk action failed.");
      return;
    }

    toast.success(result.message || "Bulk action complete.");
    await load();
  };

  return (
    <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <InputLike value={search} onChange={setSearch} placeholder="Search name, SKU, tags" />
          <select value={category} onChange={(event) => setCategory(event.target.value as "all" | ProductCategory)} className="h-10 rounded-lg border border-stone-300 px-3 text-sm">
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value as "all" | "active" | "inactive")} className="h-10 rounded-lg border border-stone-300 px-3 text-sm">
            <option value="all">all status</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
          <select value={stock} onChange={(event) => setStock(event.target.value as "all" | "in-stock" | "low" | "out")} className="h-10 rounded-lg border border-stone-300 px-3 text-sm">
            <option value="all">all stock</option>
            <option value="in-stock">in-stock</option>
            <option value="low">low</option>
            <option value="out">out</option>
          </select>
        </div>

        <Link href="/admin/products/new" className="inline-flex h-10 items-center rounded-full bg-charcoal px-4 text-xs tracking-[0.08em] text-cream hover:bg-gold hover:text-charcoal">
          Add New Product
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <button type="button" onClick={() => void runBulk("delete")} className="rounded-full border border-red-300 px-3 py-1 text-red-600">Delete Selected</button>
        <button type="button" onClick={() => void runBulk("toggle-availability", true)} className="rounded-full border border-stone-300 px-3 py-1">Set Active</button>
        <button type="button" onClick={() => void runBulk("toggle-availability", false)} className="rounded-full border border-stone-300 px-3 py-1">Set Inactive</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-[0.08em] text-charcoal/60">
              <th className="py-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => setSelected(event.target.checked ? items.map((item) => item._id!).filter(Boolean) : [])}
                />
              </th>
              <th className="py-2">Image</th>
              <th className="py-2">Name / SKU</th>
              <th className="py-2">Category</th>
              <th className="py-2">Price</th>
              <th className="py-2">Stock</th>
              <th className="py-2">Status</th>
              <th className="py-2">Trending</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="py-8 text-center text-charcoal/60">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={9} className="py-8 text-center text-charcoal/60">No products found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="border-b border-stone-100">
                  <td className="py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(item._id ?? "")}
                      onChange={(event) =>
                        setSelected((prev) =>
                          event.target.checked
                            ? [...prev, item._id ?? ""]
                            : prev.filter((id) => id !== item._id),
                        )
                      }
                    />
                  </td>
                  <td className="py-3">
                    <Image
                      src={item.thumbnail ?? item.images[0]?.url ?? "/placeholders/jewelry-fallback.svg"}
                      alt={item.name}
                      width={40}
                      height={40}
                      sizes="40px"
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  </td>
                  <td className="py-3">
                    <p className="font-medium text-charcoal">{item.name}</p>
                    <p className="text-xs text-charcoal/60">{item.sku ?? "-"}</p>
                  </td>
                  <td className="py-3">
                    <span className="rounded-full bg-stone-100 px-2 py-1 text-xs">{item.category}</span>
                  </td>
                  <td className="py-3">
                    <p>PKR {item.price.toLocaleString("en-PK")}</p>
                    {item.discountPrice ? <p className="text-xs text-charcoal/60">PKR {item.discountPrice.toLocaleString("en-PK")}</p> : null}
                  </td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${item.stock > 10 ? "bg-green-100 text-green-700" : item.stock > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="py-3">
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={item.isAvailable}
                        onChange={async (event) => {
                          try {
                            await toggleFlag(item._id ?? "", { isAvailable: event.target.checked });
                            toast.success("Availability updated.");
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Update failed.");
                          }
                        }}
                      />
                      {item.isAvailable ? "Active" : "Inactive"}
                    </label>
                  </td>
                  <td className="py-3">
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={item.isTrending}
                        onChange={async (event) => {
                          try {
                            await toggleFlag(item._id ?? "", { isTrending: event.target.checked });
                            toast.success("Trending flag updated.");
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Update failed.");
                          }
                        }}
                      />
                      {item.isTrending ? "On" : "Off"}
                    </label>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Link href={`/admin/products/${item._id}/edit`} className="text-gold-dark hover:underline">Edit</Link>
                      <button type="button" onClick={() => void removeItem(item._id ?? "")} className="text-red-600 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-xs">
        <button type="button" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="rounded-full border border-stone-300 px-3 py-1 disabled:opacity-40">Prev</button>
        <p>Page {page} of {pages}</p>
        <button type="button" disabled={page >= pages} onClick={() => setPage((prev) => Math.min(pages, prev + 1))} className="rounded-full border border-stone-300 px-3 py-1 disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}

function InputLike({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 rounded-lg border border-stone-300 px-3 text-sm" />;
}
