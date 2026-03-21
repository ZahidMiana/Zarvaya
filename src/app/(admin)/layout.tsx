import type { ReactNode } from "react";
import Link from "next/link";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-100">
      <header className="border-b border-stone-300 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="font-playfair text-2xl text-charcoal">
            ZARVAYA Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/products" className="text-charcoal/75 hover:text-gold-dark">
              Products
            </Link>
            <Link href="/admin/orders" className="text-charcoal/75 hover:text-gold-dark">
              Orders
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
