import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function EmptyState({ title, description, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-gold-light bg-white/70 p-8 text-center">
      <h2 className="font-playfair text-2xl text-charcoal">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-charcoal/70">{description}</p>
      {ctaLabel && ctaHref ? (
        <Link
          href={ctaHref}
          className="mt-6 inline-flex rounded-full bg-charcoal px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
