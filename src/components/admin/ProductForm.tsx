"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X, GripVertical } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductCategory, ProductMaterial, ProductOccasion } from "@/types";
import type { ApiResponse, IProduct, IProductImage } from "@/types";

const categoryOptions: ProductCategory[] = [
  ProductCategory.NECKLACE,
  ProductCategory.JHUMKY,
  ProductCategory.RING,
  ProductCategory.BANGLES,
  ProductCategory.SET,
  ProductCategory.ANKLET,
];

const occasionOptions: ProductOccasion[] = [
  ProductOccasion.BRIDAL,
  ProductOccasion.CASUAL,
  ProductOccasion.PARTY,
  ProductOccasion.DAILY,
  ProductOccasion.FESTIVE,
  ProductOccasion.OFFICE,
];

const materialOptions: ProductMaterial[] = [
  ProductMaterial.GOLD_PLATED,
  ProductMaterial.SILVER,
  ProductMaterial.ROSE_GOLD,
  ProductMaterial.KUNDAN,
  ProductMaterial.PEARL,
  ProductMaterial.OXIDIZED,
  ProductMaterial.BRASS,
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
};

type ProductFormState = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: ProductCategory;
  subcategory: string;
  occasion: ProductOccasion[];
  tags: string[];
  price: number;
  discountPrice?: number;
  stock: number;
  sku: string;
  images: IProductImage[];
  material: ProductMaterial;
  weight: string;
  dimensions: string;
  metaTitle: string;
  metaDescription: string;
  isAvailable: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
};

const initialState: ProductFormState = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: ProductCategory.NECKLACE,
  subcategory: "",
  occasion: [],
  tags: [],
  price: 0,
  discountPrice: undefined,
  stock: 0,
  sku: "",
  images: [],
  material: ProductMaterial.GOLD_PLATED,
  weight: "",
  dimensions: "",
  metaTitle: "",
  metaDescription: "",
  isAvailable: true,
  isTrending: false,
  isFeatured: false,
  isNewArrival: true,
  isBestSeller: false,
};

export default function ProductForm({ mode, productId }: ProductFormProps) {
  const router = useRouter();
  const [state, setState] = useState<ProductFormState>(initialState);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (mode !== "edit" || !productId) {
      return;
    }

    const load = async () => {
      try {
        const response = await fetch(`/api/admin/products/${productId}`);
        const result = (await response.json()) as ApiResponse<IProduct>;

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Unable to load product.");
        }

        const data = result.data;

        setState({
          name: data.name,
          slug: data.slug,
          shortDescription: data.shortDescription ?? "",
          description: data.description,
          category: data.category,
          subcategory: data.subcategory ?? "",
          occasion: data.occasion,
          tags: data.tags ?? [],
          price: data.price,
          discountPrice: data.discountPrice,
          stock: data.stock,
          sku: data.sku ?? "",
          images: data.images,
          material: data.material,
          weight: data.weight ?? "",
          dimensions: data.dimensions ?? "",
          metaTitle: data.metaTitle ?? data.name,
          metaDescription: data.metaDescription ?? (data.shortDescription ?? ""),
          isAvailable: data.isAvailable,
          isTrending: data.isTrending,
          isFeatured: data.isFeatured,
          isNewArrival: data.isNewArrival,
          isBestSeller: data.isBestSeller,
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [mode, productId]);

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      slug: slugify(prev.name),
      metaTitle: prev.metaTitle || prev.name,
      metaDescription: prev.metaDescription || prev.shortDescription,
    }));
  }, [state.name, state.shortDescription]);

  const discountPercent = useMemo(() => {
    if (!state.discountPrice || state.price <= 0 || state.discountPrice >= state.price) {
      return 0;
    }

    return Math.round(((state.price - state.discountPrice) / state.price) * 100);
  }, [state.discountPrice, state.price]);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).slice(0, 5);
    if (list.length === 0) {
      return;
    }

    setUploading(true);
    try {
      for (const file of list) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          toast.error(`${file.name} has unsupported format.`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB limit.`);
          continue;
        }

        const form = new FormData();
        form.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: form,
        });

        const result = (await response.json()) as ApiResponse<Array<{ url: string; publicId: string }>>;
        if (!response.ok || !result.success || !result.data || result.data.length === 0) {
          throw new Error(result.message || "Upload failed.");
        }

        const uploaded = result.data[0];
        const image: IProductImage = {
          url: uploaded.url,
          publicId: uploaded.publicId,
          alt: `${state.name || "Product"} image`,
          isPrimary: false,
        };

        setState((prev) => {
          const next = [...prev.images, image];
          if (next.length > 0) {
            next[0] = { ...next[0], isPrimary: true };
          }
          return { ...prev, images: next };
        });
      }

      toast.success("Images uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (publish: boolean) => {
    setSaving(true);

    try {
      if (state.images.length === 0) {
        throw new Error("At least one image is required.");
      }

      const payload = {
        name: state.name,
        category: state.category,
        subcategory: state.subcategory || undefined,
        description: state.description,
        shortDescription: state.shortDescription || undefined,
        price: Number(state.price),
        discountPrice: state.discountPrice ? Number(state.discountPrice) : undefined,
        images: state.images,
        material: state.material,
        occasion: state.occasion,
        weight: state.weight || undefined,
        dimensions: state.dimensions || undefined,
        stock: Number(state.stock),
        isAvailable: publish ? state.isAvailable : false,
        isTrending: state.isTrending,
        isFeatured: state.isFeatured,
        isNewArrival: state.isNewArrival,
        isBestSeller: state.isBestSeller,
        tags: state.tags,
        metaTitle: state.metaTitle || undefined,
        metaDescription: state.metaDescription || undefined,
      };

      const endpoint = mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as ApiResponse<IProduct>;
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save product.");
      }

      toast.success(mode === "create" ? "Product created." : "Product updated.");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-stone-200 bg-white">
        <Loader2 className="h-5 w-5 animate-spin text-charcoal/70" />
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6">
      <section className="space-y-4">
        <h2 className="font-playfair text-2xl text-charcoal">Basic Info</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" value={state.name} onChange={(event) => setState((prev) => ({ ...prev, name: event.target.value }))} required />
            <p className="text-xs text-charcoal/60">Slug: {state.slug || "-"}</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shortDescription">Short Description ({state.shortDescription.length}/200)</Label>
            <textarea
              id="shortDescription"
              value={state.shortDescription}
              onChange={(event) => setState((prev) => ({ ...prev, shortDescription: event.target.value.slice(0, 200) }))}
              className="min-h-20 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Full Description (Markdown supported)</Label>
            <textarea
              id="description"
              value={state.description}
              onChange={(event) => setState((prev) => ({ ...prev, description: event.target.value }))}
              className="min-h-28 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-playfair text-2xl text-charcoal">Categorization</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select id="category" value={state.category} onChange={(event) => setState((prev) => ({ ...prev, category: event.target.value as ProductCategory }))} className="h-10 w-full rounded-lg border border-stone-300 px-3 text-sm">
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategory</Label>
            <Input id="subcategory" value={state.subcategory} onChange={(event) => setState((prev) => ({ ...prev, subcategory: event.target.value }))} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Occasion</Label>
          <div className="flex flex-wrap gap-2">
            {occasionOptions.map((item) => {
              const active = state.occasion.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      occasion: active ? prev.occasion.filter((entry) => entry !== item) : [...prev.occasion, item],
                    }))
                  }
                  className={`rounded-full px-3 py-1.5 text-xs ${active ? "bg-charcoal text-cream" : "border border-stone-300 text-charcoal"}`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                const next = tagInput.trim();
                if (!next) {
                  return;
                }

                setState((prev) => ({ ...prev, tags: prev.tags.includes(next) ? prev.tags : [...prev.tags, next] }));
                setTagInput("");
              }
            }}
            placeholder="Type tag and press Enter"
          />
          <div className="flex flex-wrap gap-2">
            {state.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-1 text-xs">
                {tag}
                <button type="button" onClick={() => setState((prev) => ({ ...prev, tags: prev.tags.filter((entry) => entry !== tag) }))}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-playfair text-2xl text-charcoal">Pricing & Stock</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price (PKR)</Label>
            <Input id="price" type="number" value={state.price} onChange={(event) => setState((prev) => ({ ...prev, price: Number(event.target.value) }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discountPrice">Discount Price</Label>
            <Input id="discountPrice" type="number" value={state.discountPrice ?? ""} onChange={(event) => setState((prev) => ({ ...prev, discountPrice: event.target.value ? Number(event.target.value) : undefined }))} />
            <p className="text-xs text-charcoal/60">{discountPercent > 0 ? `${discountPercent}% OFF` : "No discount"}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock Quantity</Label>
            <Input id="stock" type="number" value={state.stock} onChange={(event) => setState((prev) => ({ ...prev, stock: Number(event.target.value) }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={state.sku} onChange={(event) => setState((prev) => ({ ...prev, sku: event.target.value }))} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-playfair text-2xl text-charcoal">Images</h2>
        <label
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void uploadFiles(event.dataTransfer.files);
          }}
          className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 text-center"
        >
          <Upload className="mb-2 h-5 w-5 text-charcoal/70" />
          <p className="text-sm text-charcoal/75">Drop images here or click to browse</p>
          <p className="text-xs text-charcoal/55">JPG, PNG, WEBP — max 5 files, 5MB each</p>
          <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={(event) => event.target.files && void uploadFiles(event.target.files)} />
        </label>
        {uploading ? <p className="text-xs text-charcoal/60">Uploading...</p> : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {state.images.map((image, index) => (
            <article key={`${image.publicId}-${index}`} className="rounded-xl border border-stone-200 p-2">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-stone-100">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />
                {index === 0 ? <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[10px]">Primary</span> : null}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setState((prev) => {
                      const next = [...prev.images];
                      const selected = next.splice(index, 1)[0];
                      next.unshift(selected);
                      return { ...prev, images: next.map((item, i) => ({ ...item, isPrimary: i === 0 })) };
                    })
                  }
                  className="inline-flex items-center gap-1 text-charcoal/70"
                >
                  <GripVertical className="h-3 w-3" /> Set Primary
                </button>
                <button
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, images: prev.images.filter((_, itemIndex) => itemIndex !== index).map((item, i) => ({ ...item, isPrimary: i === 0 })) }))}
                  className="text-red-600"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-playfair text-2xl text-charcoal">Details</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="material">Material</Label>
            <select id="material" value={state.material} onChange={(event) => setState((prev) => ({ ...prev, material: event.target.value as ProductMaterial }))} className="h-10 w-full rounded-lg border border-stone-300 px-3 text-sm">
              {materialOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight</Label>
            <Input id="weight" value={state.weight} onChange={(event) => setState((prev) => ({ ...prev, weight: event.target.value }))} placeholder="15g" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dimensions">Dimensions</Label>
            <Input id="dimensions" value={state.dimensions} onChange={(event) => setState((prev) => ({ ...prev, dimensions: event.target.value }))} placeholder="5cm x 3cm" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-playfair text-2xl text-charcoal">SEO</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta Title ({state.metaTitle.length}/60)</Label>
            <Input id="metaTitle" value={state.metaTitle} onChange={(event) => setState((prev) => ({ ...prev, metaTitle: event.target.value.slice(0, 60) }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description ({state.metaDescription.length}/160)</Label>
            <textarea id="metaDescription" value={state.metaDescription} onChange={(event) => setState((prev) => ({ ...prev, metaDescription: event.target.value.slice(0, 160) }))} className="min-h-20 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-playfair text-2xl text-charcoal">Visibility</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {[
            ["isAvailable", "Is Available"],
            ["isTrending", "Is Trending"],
            ["isFeatured", "Is Featured"],
            ["isNewArrival", "Is New Arrival"],
            ["isBestSeller", "Is Best Seller"],
          ].map(([field, label]) => (
            <label key={field} className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(state[field as keyof ProductFormState])}
                onChange={(event) => setState((prev) => ({ ...prev, [field]: event.target.checked }))}
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-stone-200 pt-4">
        <button type="button" onClick={() => void submit(false)} disabled={saving} className="inline-flex h-10 items-center rounded-full border border-stone-300 px-5 text-sm text-charcoal hover:bg-stone-100 disabled:opacity-70">
          Save as Draft
        </button>
        <button type="button" onClick={() => void submit(true)} disabled={saving} className="inline-flex h-10 items-center rounded-full bg-charcoal px-5 text-sm text-cream hover:bg-gold hover:text-charcoal disabled:opacity-70">
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            "Publish Product"
          )}
        </button>
      </div>
    </div>
  );
}
