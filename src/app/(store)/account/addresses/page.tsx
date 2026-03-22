"use client";

import { useEffect, useState } from "react";
import type { IUserAddress } from "@/types";

type AddressForm = {
  label: string;
  street: string;
  area: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
};

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<IUserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<AddressForm>({
    label: "Home",
    street: "",
    area: "",
    city: "",
    province: "",
    postalCode: "",
    isDefault: false,
  });

  const load = async () => {
    try {
      const response = await fetch("/api/user/profile");
      const result = await response.json();
      if (response.ok && result?.data?.savedAddresses) {
        setAddresses(result.data.savedAddresses);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addAddress = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not add address");
      }

      setForm({
        label: "Home",
        street: "",
        area: "",
        city: "",
        province: "",
        postalCode: "",
        isDefault: false,
      });
      setMessage("Address saved successfully.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add address");
    } finally {
      setSaving(false);
    }
  };

  const removeAddress = async (addressId: string) => {
    setMessage("");
    const response = await fetch(`/api/user/addresses/${addressId}`, { method: "DELETE" });
    if (response.ok) {
      setAddresses((current) => current.filter((address) => address._id !== addressId));
      setMessage("Address removed.");
      return;
    }

    const result = await response.json();
    setMessage(result?.message || "Could not remove address.");
  };

  const setDefault = async (addressId: string) => {
    setMessage("");
    const response = await fetch(`/api/user/addresses/${addressId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });

    if (response.ok) {
      await load();
      setMessage("Default address updated.");
      return;
    }

    const result = await response.json();
    setMessage(result?.message || "Could not update default address.");
  };

  if (loading) {
    return <section className="rounded-3xl border border-stone-200 bg-white p-6 text-sm shadow-[0_10px_24px_rgba(26,26,26,0.05)]">Loading addresses...</section>;
  }

  return (
    <section className="space-y-4 sm:space-y-5">
      <h1 className="font-playfair text-4xl text-charcoal">Saved Addresses</h1>

      {message ? <p className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-charcoal/75">{message}</p> : null}

      <form onSubmit={addAddress} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-[0_10px_24px_rgba(26,26,26,0.05)] sm:p-5">
        <p className="font-medium text-charcoal">Add New Address</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} className="h-11 rounded-xl border border-stone-300 px-3 text-sm" placeholder="Label (Home/Office)" />
          <input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} className="h-11 rounded-xl border border-stone-300 px-3 text-sm" placeholder="City" required />
          <input value={form.street} onChange={(event) => setForm((current) => ({ ...current, street: event.target.value }))} className="h-11 rounded-xl border border-stone-300 px-3 text-sm sm:col-span-2" placeholder="Street" />
          <input value={form.area} onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))} className="h-11 rounded-xl border border-stone-300 px-3 text-sm" placeholder="Area" />
          <input value={form.province} onChange={(event) => setForm((current) => ({ ...current, province: event.target.value }))} className="h-11 rounded-xl border border-stone-300 px-3 text-sm" placeholder="Province" />
          <input value={form.postalCode} onChange={(event) => setForm((current) => ({ ...current, postalCode: event.target.value }))} className="h-11 rounded-xl border border-stone-300 px-3 text-sm" placeholder="Postal code" />
          <label className="inline-flex items-center gap-2 text-xs text-charcoal/75">
            <input type="checkbox" checked={form.isDefault} onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))} />
            Set as default address
          </label>
        </div>
        <button disabled={saving} type="submit" className="mt-4 h-11 rounded-full bg-charcoal px-5 text-sm text-cream disabled:opacity-60">
          {saving ? "Saving..." : "Save Address"}
        </button>
      </form>

      <div className="space-y-3">
        {addresses.length === 0 ? (
          <article className="rounded-3xl border border-stone-200 bg-white p-6 text-sm text-charcoal/75 shadow-[0_10px_24px_rgba(26,26,26,0.05)]">
            No saved addresses yet. Add your first address above.
          </article>
        ) : null}

        {addresses.map((address, index) => {
          const addressId = address._id;

          return (
            <article key={addressId ?? `${address.label}-${index}`} className="rounded-3xl border border-stone-200 bg-white p-4 text-sm shadow-[0_10px_24px_rgba(26,26,26,0.05)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-charcoal">{address.label}</p>
                {address.isDefault ? <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold-dark">Default</span> : null}
              </div>
              <p className="mt-2 text-charcoal/75">{[address.street, address.area, address.city, address.province, address.postalCode].filter(Boolean).join(", ")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {!address.isDefault && addressId ? (
                  <button type="button" onClick={() => void setDefault(addressId)} className="rounded-full border border-stone-300 px-3 py-1.5 text-xs transition hover:border-gold hover:text-gold-dark">
                    Set Default
                  </button>
                ) : null}
                {addressId ? (
                  <button type="button" onClick={() => void removeAddress(addressId)} className="rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-50">
                    Remove
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
