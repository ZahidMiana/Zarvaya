import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/?auth=required");
  }

  return (
    <div className="space-y-4 py-5 sm:space-y-6 sm:py-7">
      <section className="rounded-3xl border border-gold/20 bg-gradient-to-br from-white via-cream to-[#f2e7cf] p-5 shadow-[0_12px_30px_rgba(26,26,26,0.08)] sm:p-6">
        <p className="text-[11px] tracking-[0.32em] text-gold-dark">ACCOUNT</p>
        <h1 className="mt-2 font-playfair text-3xl text-charcoal sm:text-4xl">Welcome back, {session.user.name?.split(" ")[0] ?? "there"}</h1>
        <p className="mt-1 text-sm text-charcoal/70">Manage your profile, orders, wishlist, and saved addresses from one place.</p>
      </section>

      <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-stone-200 bg-white/90 p-2 md:hidden">
        <Link href="/account/orders" className="shrink-0 rounded-full border border-stone-300 px-4 py-2 text-xs text-charcoal">Orders</Link>
        <Link href="/account/wishlist" className="shrink-0 rounded-full border border-stone-300 px-4 py-2 text-xs text-charcoal">Wishlist</Link>
        <Link href="/account/addresses" className="shrink-0 rounded-full border border-stone-300 px-4 py-2 text-xs text-charcoal">Addresses</Link>
        <Link href="/account/profile" className="shrink-0 rounded-full border border-stone-300 px-4 py-2 text-xs text-charcoal">Profile</Link>
      </nav>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <aside className="hidden h-fit space-y-3 rounded-3xl border border-stone-200 bg-white p-4 shadow-[0_8px_20px_rgba(26,26,26,0.05)] md:sticky md:top-24 md:block">
          <div className="space-y-1 border-b border-stone-200 pb-3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold text-xl">
              {(session.user.name?.[0] ?? "U").toUpperCase()}
            </div>
            <p className="font-playfair text-xl text-charcoal">{session.user.name}</p>
            <p className="text-xs text-charcoal/65">Member account</p>
          </div>

          <nav className="space-y-1 text-sm">
            <Link href="/account/orders" className="block rounded-xl px-3 py-2 transition hover:bg-stone-100">My Orders</Link>
            <Link href="/account/wishlist" className="block rounded-xl px-3 py-2 transition hover:bg-stone-100">Wishlist</Link>
            <Link href="/account/addresses" className="block rounded-xl px-3 py-2 transition hover:bg-stone-100">Saved Addresses</Link>
            <Link href="/account/profile" className="block rounded-xl px-3 py-2 transition hover:bg-stone-100">My Profile</Link>
            <form action="/api/auth/signout" method="post">
              <button type="submit" className="mt-2 w-full rounded-xl px-3 py-2 text-left text-red-600 transition hover:bg-red-50">Sign Out</button>
            </form>
          </nav>
        </aside>

        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
