"use client";

import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartColumn,
  Grid2X2,
  Package,
  Users,
  SquarePen,
  Settings,
  Menu,
  X,
  LogOut,
  Plus,
  Store,
} from "lucide-react";

type AdminShellProps = {
  adminEmail: string;
  children: ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  comingSoon?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: ChartColumn },
  { href: "/admin/products", label: "Products", icon: Grid2X2 },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users, comingSoon: true },
  { href: "/admin/blog", label: "Blog", icon: SquarePen },
  { href: "/admin/settings", label: "Settings", icon: Settings, comingSoon: true },
];

function pageTitle(pathname: string): string {
  if (pathname === "/admin") {
    return "Dashboard";
  }

  if (pathname.includes("/products/new")) {
    return "Add Product";
  }

  if (pathname.includes("/products/") && pathname.includes("/edit")) {
    return "Edit Product";
  }

  if (pathname.includes("/products")) {
    return "Products";
  }

  if (pathname.includes("/orders")) {
    return "Orders";
  }

  if (pathname.includes("/blog")) {
    return "Blog";
  }

  return "Admin";
}

export default function AdminShell({ adminEmail, children }: AdminShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const title = pageTitle(pathname);

  const crumbs = useMemo(() => {
    if (pathname === "/admin") {
      return ["Admin", "Dashboard"];
    }

    return pathname
      .split("/")
      .filter(Boolean)
      .map((part) => part.replace(/-/g, " "))
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1));
  }, [pathname]);

  const sidebarWidth = collapsed ? "w-16" : "w-60";

  return (
    <div className="min-h-screen bg-stone-50 text-charcoal">
      <div className="flex min-h-screen">
        {mobileOpen ? (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-label="Close menu"
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex ${sidebarWidth} flex-col bg-[#1A1A1A] transition-all duration-200 lg:sticky lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
            <Link href="/admin" className="font-playfair text-xl tracking-[0.14em] text-white">
              {collapsed ? "Z" : "ZARVAYA"}
            </Link>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/75 hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-2 py-4">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.comingSoon ? "#" : item.href}
                  onClick={(event) => {
                    if (item.comingSoon) {
                      event.preventDefault();
                    }
                    setMobileOpen(false);
                  }}
                  className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                    active
                      ? "bg-[#C9A84C1A] text-[#C9A84C]"
                      : "text-white/80 hover:bg-white/8 hover:text-white"
                  } ${item.comingSoon ? "cursor-not-allowed" : ""}`}
                >
                  {active ? <span className="absolute inset-y-1 left-0 w-0.5 rounded bg-[#C9A84C]" /> : null}
                  <Icon className="h-4 w-4" />
                  {!collapsed ? <span>{item.label}</span> : null}
                  {item.comingSoon && !collapsed ? (
                    <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-white/75">
                      Soon
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-3">
            {!collapsed ? (
              <p className="mb-2 truncate text-xs text-white/65">{adminEmail}</p>
            ) : null}
            <form action="/api/auth/admin/logout" method="post">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/15 px-3 py-2 text-xs text-white/90 hover:bg-white/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                {!collapsed ? "Logout" : null}
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 lg:hidden"
                  aria-label="Open sidebar"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCollapsed((state) => !state)}
                  className="hidden h-9 w-9 items-center justify-center rounded-md border border-stone-300 lg:inline-flex"
                  aria-label="Collapse sidebar"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <h1 className="truncate font-playfair text-2xl text-charcoal">{title}</h1>
                  <p className="truncate text-xs text-charcoal/60">{crumbs.join(" / ")}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/products/new"
                  className="inline-flex h-9 items-center gap-1 rounded-full bg-charcoal px-4 text-xs tracking-[0.08em] text-cream hover:bg-gold hover:text-charcoal"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Product
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  className="inline-flex h-9 items-center gap-1 rounded-full border border-stone-300 px-4 text-xs tracking-[0.08em] text-charcoal hover:bg-stone-100"
                >
                  <Store className="h-3.5 w-3.5" />
                  View Store
                </Link>
              </div>
            </div>
          </header>

          <main className="h-[calc(100vh-65px)] overflow-y-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
