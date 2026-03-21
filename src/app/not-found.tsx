import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-gold-dark">404</p>
      <h1 className="mt-4 font-playfair text-4xl text-charcoal">Page Not Found</h1>
      <p className="mt-3 text-charcoal/70">The page you are looking for does not exist or has been moved.</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-9 items-center rounded-full bg-charcoal px-4 text-sm font-medium text-cream transition-colors hover:bg-gold-dark"
      >
        Back to Home
      </Link>
    </section>
  );
}
