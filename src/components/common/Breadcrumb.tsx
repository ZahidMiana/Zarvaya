import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-charcoal/60">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-gold-dark">
                {item.label}
              </Link>
            ) : (
              <span className="text-charcoal">{item.label}</span>
            )}
            {index < items.length - 1 ? <ChevronRight size={14} /> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
