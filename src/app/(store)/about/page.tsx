import PageHeader from "@/components/common/PageHeader";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Our Story"
        subtitle="ZARVAYA JEWELS celebrates Pakistani artistry through modern luxury jewellery collections."
      />
      <section className="grid gap-6 rounded-2xl border border-stone-200 bg-white p-6 md:grid-cols-2">
        <p className="text-charcoal/75">
          We started ZARVAYA to make premium, event-ready jewellery accessible for women who value elegant
          design, quality finishing, and cultural authenticity.
        </p>
        <p className="text-charcoal/75">
          Every piece is carefully curated with attention to comfort, durability, and timeless appeal so it
          can stay part of your wardrobe season after season.
        </p>
      </section>
    </div>
  );
}
