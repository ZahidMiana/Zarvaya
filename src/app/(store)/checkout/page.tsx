"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import type { ApiResponse, IOrder } from "@/types";

const CITY_OPTIONS = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Other",
] as const;

const CITY_TO_PROVINCE: Record<(typeof CITY_OPTIONS)[number], string> = {
  Karachi: "Sindh",
  Lahore: "Punjab",
  Islamabad: "Islamabad",
  Rawalpindi: "Punjab",
  Faisalabad: "Punjab",
  Multan: "Punjab",
  Peshawar: "KPK",
  Quetta: "Balochistan",
  Sialkot: "Punjab",
  Gujranwala: "Punjab",
  Other: "Punjab",
};

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phone: z.string().regex(/^03\d{2}-\d{7}$/, "Use format 03XX-XXXXXXX."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .optional()
    .or(z.literal("")),
  whatsapp: z
    .string()
    .trim()
    .regex(/^03\d{2}-\d{7}$/, "Use format 03XX-XXXXXXX.")
    .optional()
    .or(z.literal("")),
  streetAddress: z.string().min(4, "Street address is required."),
  area: z.string().optional(),
  city: z.enum(CITY_OPTIONS, { message: "Please select a city." }),
  province: z.string().min(2, "Province is required."),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Postal code must be 5 digits.")
    .optional()
    .or(z.literal("")),
  deliveryNotes: z.string().optional(),
  paymentMethod: z.enum(["cod", "easypaisa", "jazzcash", "bank-transfer"]),
  orderNotes: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

function formatPakPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 4) {
    return digits;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

function normalizePakPhone(value: string): string {
  return value.replace(/\D/g, "");
}

type PaymentMethodValue = "cod" | "easypaisa" | "jazzcash" | "bank-transfer";

const paymentOptions: Array<{ value: PaymentMethodValue; title: string; description: string }> = [
  { value: "cod", title: "Cash on Delivery", description: "Pay when you receive" },
  { value: "easypaisa", title: "EasyPaisa", description: "Mobile Account: 03XX-XXXXXXX" },
  { value: "jazzcash", title: "JazzCash", description: "Mobile Account: 03XX-XXXXXXX" },
  { value: "bank-transfer", title: "Bank Transfer", description: "Account details via WhatsApp" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { isReady, items, itemCount, subtotal, shippingCost, total, clearCart } = useCart();
  const [orderNotesOpen, setOrderNotesOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      whatsapp: "",
      streetAddress: "",
      area: "",
      city: "Karachi",
      province: "Sindh",
      postalCode: "",
      deliveryNotes: "",
      paymentMethod: "cod",
      orderNotes: "",
    },
  });

  const phoneValue = watch("phone");
  const cityValue = watch("city");
  const whatsappValue = watch("whatsapp");
  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (items.length === 0) {
      router.replace("/shop");
    }
  }, [isReady, items.length, router]);

  useEffect(() => {
    const province = CITY_TO_PROVINCE[cityValue];
    setValue("province", province, { shouldValidate: true });
  }, [cityValue, setValue]);

  useEffect(() => {
    if (!phoneValue) {
      return;
    }

    const formatted = formatPakPhone(phoneValue);
    if (formatted !== phoneValue) {
      setValue("phone", formatted, { shouldValidate: false });
    }
  }, [phoneValue, setValue]);

  useEffect(() => {
    if (!phoneValue) {
      return;
    }

    if (!whatsappValue || whatsappValue === formatPakPhone(whatsappValue)) {
      setValue("whatsapp", formatPakPhone(phoneValue), { shouldValidate: false });
    }
  }, [phoneValue, setValue, whatsappValue]);

  const onSubmit = async (values: CheckoutValues) => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const notesParts = [
      values.deliveryNotes?.trim() ? `Delivery: ${values.deliveryNotes.trim()}` : "",
      values.orderNotes?.trim() ? `Order: ${values.orderNotes.trim()}` : "",
    ].filter(Boolean);

    const payload = {
      customer: {
        name: values.fullName.trim(),
        phone: normalizePakPhone(values.phone),
        email: values.email?.trim() ? values.email.trim() : undefined,
        whatsapp: values.whatsapp?.trim() ? normalizePakPhone(values.whatsapp) : undefined,
      },
      shippingAddress: {
        street: values.streetAddress.trim(),
        area: values.area?.trim() || undefined,
        city: values.city,
        province: values.province,
        postalCode: values.postalCode?.trim() || undefined,
      },
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      paymentMethod: values.paymentMethod,
      notes: notesParts.length > 0 ? notesParts.join(" | ") : undefined,
    };

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as ApiResponse<IOrder>;
    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || "Unable to place order.");
    }

    clearCart();
    toast.success("Order placed successfully.");
    router.push(`/order-success?order=${encodeURIComponent(result.data.orderNumber)}`);
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Checkout" subtitle="Secure your order with delivery details and payment method." />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <form
          className="space-y-8 rounded-2xl border border-stone-200 bg-white p-6"
          onSubmit={handleSubmit(async (values) => {
            try {
              await onSubmit(values);
            } catch (error) {
              const message = error instanceof Error ? error.message : "Failed to place order.";
              toast.error(message);
            }
          })}
        >
          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-charcoal">Contact Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Full Name*</Label>
                <Input id="fullName" placeholder="Enter full name" {...register("fullName")} />
                {errors.fullName ? <p className="text-xs text-red-600">{errors.fullName.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number*</Label>
                <Input
                  id="phone"
                  placeholder="03XX-XXXXXXX"
                  {...register("phone")}
                  onChange={(event) => setValue("phone", formatPakPhone(event.target.value), { shouldValidate: true })}
                />
                {errors.phone ? <p className="text-xs text-red-600">{errors.phone.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                <p className="text-xs text-charcoal/58">For order confirmation</p>
                {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  placeholder="03XX-XXXXXXX"
                  {...register("whatsapp")}
                  onChange={(event) => setValue("whatsapp", formatPakPhone(event.target.value), { shouldValidate: true })}
                />
                <p className="text-xs text-charcoal/58">For order updates</p>
                {errors.whatsapp ? <p className="text-xs text-red-600">{errors.whatsapp.message}</p> : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-charcoal">Delivery Address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="streetAddress">Street Address*</Label>
                <Input id="streetAddress" placeholder="House no, street, town" {...register("streetAddress")} />
                {errors.streetAddress ? <p className="text-xs text-red-600">{errors.streetAddress.message}</p> : null}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="area">Area/Colony</Label>
                <Input id="area" placeholder="Area or locality" {...register("area")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City*</Label>
                <select
                  id="city"
                  {...register("city")}
                  className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-charcoal"
                >
                  {CITY_OPTIONS.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city ? <p className="text-xs text-red-600">{errors.city.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Province*</Label>
                <Input id="province" readOnly {...register("province")} />
                {errors.province ? <p className="text-xs text-red-600">{errors.province.message}</p> : null}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" inputMode="numeric" placeholder="54000" {...register("postalCode")} />
                {errors.postalCode ? <p className="text-xs text-red-600">{errors.postalCode.message}</p> : null}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="deliveryNotes">Delivery Notes</Label>
                <textarea
                  id="deliveryNotes"
                  rows={3}
                  {...register("deliveryNotes")}
                  placeholder="Gate instructions, landmarks etc"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-charcoal"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-charcoal">Payment Method</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentOptions.map((option) => {
                const active = paymentMethod === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue("paymentMethod", option.value, { shouldValidate: true })}
                    className={`rounded-xl border p-4 text-left transition ${
                      active ? "border-charcoal bg-gold/10" : "border-stone-300 bg-white"
                    }`}
                  >
                    <p className="text-sm font-semibold text-charcoal">{option.title}</p>
                    <p className="mt-1 text-xs text-charcoal/65">{option.description}</p>
                  </button>
                );
              })}
            </div>
            {errors.paymentMethod ? <p className="text-xs text-red-600">{errors.paymentMethod.message}</p> : null}
          </section>

          <section className="space-y-3 rounded-xl border border-stone-200 bg-cream-dark/35 p-4">
            <button
              type="button"
              onClick={() => setOrderNotesOpen((state) => !state)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="font-medium text-charcoal">Order Notes</span>
              <span className="text-xs text-charcoal/60">{orderNotesOpen ? "Hide" : "Add"}</span>
            </button>

            {orderNotesOpen ? (
              <textarea
                rows={3}
                {...register("orderNotes")}
                placeholder="Gift message or special request"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-charcoal"
              />
            ) : null}
          </section>

          <button
            type="submit"
            disabled={!isReady || items.length === 0 || !isValid || isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-charcoal text-sm tracking-[0.08em] text-cream transition hover:bg-gold hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing your order...
              </span>
            ) : (
              "Place Order"
            )}
          </button>
        </form>

        <aside className="h-fit space-y-4 rounded-2xl border border-stone-200 bg-white p-5 lg:sticky lg:top-24">
          <p className="font-playfair text-2xl text-charcoal">Order Summary</p>

          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {items.map((item) => (
              <article key={item.productId} className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 p-2.5">
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-medium text-charcoal">{item.name}</p>
                  <p className="text-xs text-charcoal/58">Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-charcoal">{formatPrice(item.price * item.quantity)}</p>
              </article>
            ))}
          </div>

          <div className="space-y-2 border-t border-stone-200 pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-charcoal/65">Subtotal ({itemCount} items)</span>
              <span className="font-medium text-charcoal">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal/65">Shipping</span>
              <span className="font-medium text-charcoal">{shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-stone-300 p-3">
            <Label htmlFor="coupon" className="mb-2 block text-xs text-charcoal/65">Coupon code</Label>
            <div className="flex gap-2">
              <Input
                id="coupon"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="Enter code"
              />
              <button
                type="button"
                onClick={() => toast("Coupons are coming soon.")}
                className="rounded-full border border-stone-300 px-3 text-xs text-charcoal"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="flex justify-between border-t border-stone-200 pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <p className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure checkout
          </p>

          {!isReady || items.length === 0 ? (
            <Link href="/shop" className="inline-flex text-xs text-charcoal/60 underline-offset-4 hover:underline">
              Return to shop
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
