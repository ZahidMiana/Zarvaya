"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import MobileMenu from "@/components/layout/MobileMenu";
import { selectCartItemCount, useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";

const SearchModal = dynamic(() => import("@/components/search/SearchModal"), {
  ssr: false,
});

const links = [
  { href: "/shop", label: "Collections" },
  { href: "/shop?sort=newest", label: "New Arrivals" },
  { href: "/shop?sort=trending", label: "Trending" },
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L16.5 16.5" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M12 20.2C11.8 20.2 11.6 20.1 11.4 20C7.1 16.4 4 13.5 4 9.7C4 7.3 5.9 5.4 8.3 5.4C9.8 5.4 11.2 6.2 12 7.4C12.8 6.2 14.2 5.4 15.7 5.4C18.1 5.4 20 7.3 20 9.7C20 13.5 16.9 16.4 12.6 20C12.4 20.1 12.2 20.2 12 20.2Z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M6.5 8.5H17.5L16.4 20H7.6L6.5 8.5Z" />
      <path d="M9 8.5V7.5C9 5.8 10.3 4.5 12 4.5C13.7 4.5 15 5.8 15 7.5V8.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.5C6.4 15.8 9 14.2 12 14.2C15 14.2 17.6 15.8 18.5 19.5" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isAtTop, setIsAtTop] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [wishlistCountRemote, setWishlistCountRemote] = useState<number | null>(null);
  const itemCount = useCartStore(selectCartItemCount);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const wishlistCount = useWishlistStore((state) => state.ids.length);
  const openAuthModal = useAuthStore((state) => state.openModal);

  useEffect(() => {
    const loadWishlistCount = async () => {
      if (!session?.user?.id) {
        setWishlistCountRemote(null);
        return;
      }

      const response = await fetch("/api/user/wishlist");
      const result = await response.json();
      if (response.ok && result?.data?.items) {
        setWishlistCountRemote(result.data.items.length);
      }
    };

    void loadWishlistCount();
  }, [session?.user?.id]);

  useEffect(() => {
    const onScroll = () => {
      setIsAtTop(window.scrollY < 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsPaletteOpen(true);
      }

      if (event.key === "Escape") {
        setIsPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const transparentHome = pathname === "/" && isAtTop;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          transparentHome
            ? "border-transparent bg-transparent"
            : "border-b border-gold/20 bg-cream/90 shadow-[0_4px_20px_rgba(26,26,26,0.06)] backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-[76px] w-full max-w-[1800px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <MobileMenu />
            <Link href="/" className="group inline-flex flex-col leading-none">
              <span className="font-playfair text-2xl tracking-[0.15em] text-gold transition-transform duration-500 group-hover:scale-[1.015]">
                ZARVAYA
              </span>
              <span className="mt-1 text-[11px] tracking-[0.4em] text-charcoal/85">JEWELS</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="group relative py-2 text-[13px] tracking-[0.08em] text-charcoal/86">
                {link.label}
                <span className="absolute bottom-0 left-0 h-px w-0 bg-gold transition-all duration-500 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPaletteOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/15 bg-white/70 text-charcoal transition hover:border-gold hover:text-gold"
              aria-label="Open search"
            >
              <SearchIcon />
            </button>

            <button
              type="button"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/15 bg-white/70 text-charcoal transition hover:border-gold hover:text-gold"
              aria-label="Wishlist"
              onClick={() => {
                if (!session?.user?.id) {
                  openAuthModal("login", "/account/wishlist");
                  return;
                }

                window.location.href = "/account/wishlist";
              }}
            >
              <HeartIcon filled={(wishlistCountRemote ?? wishlistCount) > 0} />
              {(wishlistCountRemote ?? wishlistCount) > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-charcoal">
                  {wishlistCountRemote ?? wishlistCount}
                </span>
              ) : null}
            </button>

            {session?.user?.id ? (
              <details className="relative">
                <summary className="list-none">
                  <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold text-xs">
                    {(session.user.name?.[0] ?? "U").toUpperCase()}
                  </button>
                </summary>
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
                  <div className="border-b border-stone-200 p-2">
                    <p className="text-sm font-medium text-charcoal">{session.user.name}</p>
                    <p className="text-xs text-charcoal/65">{session.user.email ?? session.user.phone ?? ""}</p>
                  </div>
                  <Link href="/account/orders" className="block rounded-lg px-2 py-2 text-sm hover:bg-stone-100">My Orders</Link>
                  <Link href="/account/wishlist" className="block rounded-lg px-2 py-2 text-sm hover:bg-stone-100">Wishlist</Link>
                  <Link href="/account/addresses" className="block rounded-lg px-2 py-2 text-sm hover:bg-stone-100">Saved Addresses</Link>
                  <Link href="/account/profile" className="block rounded-lg px-2 py-2 text-sm hover:bg-stone-100">Edit Profile</Link>
                  <button
                    type="button"
                    onClick={() => void signOut({ callbackUrl: "/" })}
                    className="mt-1 block w-full rounded-lg px-2 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              </details>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/15 bg-white/70 text-charcoal transition hover:border-gold hover:text-gold md:hidden"
                  aria-label="Sign in"
                >
                  <UserIcon />
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="hidden px-2 text-sm text-charcoal transition hover:text-gold md:inline-flex"
                >
                  Sign In
                </button>
              </>
            )}

            <button
              type="button"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/15 bg-white/70 text-charcoal transition hover:border-gold hover:text-gold"
              onClick={openDrawer}
              aria-label="Open cart"
            >
              <BagIcon />
              {itemCount > 0 ? (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.8, 1.2, 1], opacity: 1 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-charcoal px-1 text-[10px] font-semibold text-cream"
                >
                  {itemCount}
                </motion.span>
              ) : null}
            </button>
          </div>
        </div>
      </header>
      <SearchModal open={isPaletteOpen} onOpenChange={setIsPaletteOpen} />
    </>
  );
}
