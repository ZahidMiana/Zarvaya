import Link from "next/link";

const quickLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/shop", label: "Collections" },
  { href: "/shop?sort=newest", label: "New Arrivals" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

const careLinks = [
  { href: "/track-order", label: "Track Order" },
  { href: "/returns", label: "Returns Policy" },
  { href: "/faqs", label: "FAQs" },
  { href: "/shipping", label: "Shipping Info" },
];

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M13.6 21V12.9H16.3L16.7 10H13.6V8.2C13.6 7.4 13.8 6.9 15 6.9H16.8V4.3C16 4.2 15.2 4.1 14.4 4.1C12.1 4.1 10.5 5.5 10.5 8V10H8V12.9H10.5V21H13.6Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M14.8 4.2C15.4 5.8 16.6 7 18.2 7.4V10.2C17 10.2 15.8 9.8 14.8 9.1V14.8C14.8 18.1 12.2 20.8 8.9 20.8C5.6 20.8 3 18.1 3 14.8C3 11.5 5.6 8.8 8.9 8.8C9.2 8.8 9.5 8.8 9.8 8.9V11.8C9.5 11.7 9.2 11.6 8.9 11.6C7.1 11.6 5.7 13 5.7 14.8C5.7 16.6 7.1 18 8.9 18C10.7 18 12.1 16.6 12.1 14.8V3.2H14.8V4.2Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M6.5 19.2L7.2 16.4C6.2 15 5.7 13.4 5.7 11.7C5.7 7.3 9.3 3.7 13.7 3.7C18.1 3.7 21.7 7.3 21.7 11.7C21.7 16.1 18.1 19.7 13.7 19.7C12.1 19.7 10.6 19.2 9.3 18.4L6.5 19.2Z" />
      <path d="M10.6 8.8C10.4 8.2 10 8.2 9.7 8.2C9.4 8.2 9.1 8.2 8.9 8.5C8.7 8.8 8 9.4 8 10.6C8 11.8 8.9 13 9 13.2C9.1 13.4 10.7 15.9 13.2 16.7C15.2 17.4 15.6 17.2 16 17.2C16.4 17.2 17.3 16.6 17.5 16C17.7 15.4 17.7 14.9 17.6 14.7C17.5 14.5 17.2 14.4 16.8 14.2C16.4 14 15.8 13.7 15.4 13.6C15 13.4 14.8 13.3 14.5 13.7C14.2 14.1 13.7 14.6 13.4 14.9C13.1 15.2 12.9 15.2 12.5 15C12.1 14.8 10.9 14.4 9.9 13.4C9.1 12.7 8.6 11.8 8.4 11.4C8.2 11 8.4 10.8 8.6 10.6C8.8 10.4 9 10.1 9.2 9.9C9.4 9.7 9.4 9.5 9.5 9.3C9.6 9.1 9.5 8.9 9.4 8.7C9.3 8.5 8.9 7.4 8.8 7.2" />
    </svg>
  );
}

function CodIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 12H17" />
    </svg>
  );
}

function EasypaisaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M9.5 9.2H13.2C14.2 9.2 15 10 15 11C15 12 14.2 12.8 13.2 12.8H9.5V15" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gold bg-charcoal text-cream">
      <div className="mx-auto grid max-w-[1800px] gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10">
        <div className="space-y-4">
          <div>
            <p className="font-playfair text-2xl tracking-[0.12em] text-gold">ZARVAYA</p>
            <p className="mt-1 text-[11px] tracking-[0.36em] text-cream/80">JEWELS</p>
          </div>
          <p className="max-w-sm text-sm text-cream/75">
            Crafted for timeless Pakistani elegance, from bridal signatures to elevated everyday pieces.
          </p>
          <div className="flex items-center gap-2">
            {[InstagramIcon, FacebookIcon, TikTokIcon, WhatsAppIcon].map((Icon, index) => (
              <a
                key={`social-${index}`}
                href="#"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-cream/85 transition hover:border-gold hover:text-gold"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm tracking-[0.12em] text-gold">Quick Links</p>
          <ul className="mt-3 space-y-2 text-sm">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-cream/75 transition-colors hover:text-gold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm tracking-[0.12em] text-gold">Customer Care</p>
          <ul className="mt-3 space-y-2 text-sm">
            {careLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-cream/75 transition-colors hover:text-gold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm tracking-[0.12em] text-gold">Contact Info</p>
          <div className="mt-3 space-y-2 text-sm text-cream/75">
            <p>WhatsApp: +92 3XX XXXXXXX</p>
            <p>Email: care@zarvayajewels.com</p>
            <p>Lahore, Pakistan</p>
            <p>Mon - Sat, 11:00 AM - 9:00 PM</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-3 px-4 text-xs text-cream/62 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <p>Copyright {new Date().getFullYear()} ZARVAYA JEWELS. All rights reserved.</p>
          <p>Made with love in Pakistan</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><CodIcon />COD</span>
            <span className="inline-flex items-center gap-1"><EasypaisaIcon />EasyPaisa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
