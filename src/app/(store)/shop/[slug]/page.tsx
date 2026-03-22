import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductImageGallery from "@/components/store/ProductImageGallery";
import ProductCard from "@/components/store/ProductCard";
import ProductDetailContent, { ProductTabsSection } from "@/components/store/ProductDetailContent";
import { connectDB } from "@/lib/db";
import { getProductBySlug, listProducts } from "@/lib/services/product-service";
import type { IProduct } from "@/types";

export const revalidate = 3600;

type ProductPageProps = {
  params: {
    slug: string;
  };
};

function categoryCompanion(category: string): string | undefined {
  if (category === "jhumky") {
    return "necklace";
  }

  if (category === "necklace") {
    return "ring";
  }

  return undefined;
}

async function loadProduct(slug: string) {
  await connectDB();
  return getProductBySlug(slug);
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const payload = await loadProduct(params.slug);
  if (!payload) {
    return {
      title: "Product Not Found | ZARVAYA JEWELS",
      description: "The requested product could not be found.",
    };
  }

  const { product } = payload;
  const image = product.images[0]?.url;

  return {
    title: `${product.name} | PKR ${product.price.toLocaleString("en-PK")} | ZARVAYA JEWELS`,
    description: product.metaDescription || product.shortDescription || product.description,
    openGraph: {
      title: product.name,
      description: product.metaDescription || product.shortDescription || product.description,
      images: image ? [{ url: image, alt: product.name }] : [],
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const payload = await loadProduct(params.slug);
  if (!payload) {
    notFound();
  }

  const { product, relatedProducts } = payload;
  const companionCategory = categoryCompanion(product.category);

  let completeLook: IProduct[] = [];
  if (companionCategory) {
    const response = await listProducts({ category: companionCategory, sort: "trending", limit: 6, page: 1 });
    completeLook = response.products;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const productUrl = `${siteUrl}/shop/${product.slug}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((image) => image.url),
    description: product.metaDescription || product.shortDescription || product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "ZARVAYA JEWELS",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "PKR",
      price: String(product.discountPrice ?? product.price),
      availability: product.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <div className="space-y-10 pb-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <section className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <ProductImageGallery images={product.images.map((image) => image.url)} alt={product.name} />
        <ProductDetailContent product={product} siteUrl={siteUrl} />
      </section>

      <ProductTabsSection product={product} />

      <section className="space-y-5">
        <h2 className="font-playfair text-3xl text-charcoal">You Might Also Like</h2>
        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item._id ?? item.slug} product={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-charcoal/62">More recommendations are coming soon.</p>
        )}
      </section>

      {completeLook.length > 0 ? (
        <section className="space-y-5">
          <h2 className="font-playfair text-3xl text-charcoal">Complete the Look</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {completeLook.slice(0, 4).map((item) => (
              <ProductCard key={item._id ?? item.slug} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

