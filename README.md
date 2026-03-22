# ZARVAYA JEWELS

Production-ready ecommerce storefront and admin suite for premium Pakistani jewellery.

## Project Overview

ZARVAYA JEWELS is a full-stack Next.js App Router application with:

- Public storefront (home, shop, categories, product, cart, checkout, order tracking)
- Admin dashboard (login, products, orders)
- SEO stack (metadata, sitemap, robots, JSON-LD)
- Content pages (about, blog, contact)
- Performance optimizations (image optimization, dynamic imports, loading and error boundaries)

## Tech Stack

- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Database: MongoDB + Mongoose
- Cache: Redis (optional, graceful fallback)
- Auth: NextAuth + JWT cookie admin auth
- Forms: React Hook Form + Zod
- State: Zustand
- Motion/UI: Framer Motion + shadcn/ui

## Architecture (ASCII)

```text
┌───────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
└───────────────┬───────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────┐
│                    Next.js App Router                         │
│                                                               │
│  Public Routes         Admin Routes          API Routes       │
│  /, /shop, /blog       /admin/*              /api/*           │
│                                                               │
│  Components + Server Actions + Route Handlers                │
└───────────────┬───────────────────────────────┬───────────────┘
                │                               │
                ▼                               ▼
       ┌──────────────────┐             ┌──────────────────┐
       │     MongoDB      │             │      Redis       │
       │  Products/Orders │             │   Cache Layer    │
       │   Users/Blog     │             │   (optional)     │
       └──────────────────┘             └──────────────────┘
```

## Folder Structure

```text
src/
  app/
    (store)/                # Public storefront routes
    (admin)/                # Admin routes
    (public)/admin/login    # Admin login page
    api/                    # Route handlers
    sitemap.ts              # Dynamic sitemap
    robots.ts               # Robots rules
    not-found.tsx           # Custom 404
    error.tsx               # Root error boundary
  components/
    home/
    store/
    admin/
    layout/
    common/
  lib/
    db.ts
    redis.ts
    services/
    validations.ts
    seed.ts
  models/
    Product.ts
    Order.ts
    User.ts
    BlogPost.ts
middleware.ts               # Admin route protection
vercel.json                 # Rewrites + security headers
Procfile                    # Railway backend process definition
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env.local
```

3. Fill required variables (see Environment Variables section).

4. Start development server:

```bash
npm run dev
```

5. Open:

```text
http://localhost:3000
```

## Environment Variables

Required for core app:

- `MONGODB_URI`: MongoDB connection string
- `NEXT_PUBLIC_SITE_URL`: Public app URL (e.g. `http://localhost:3000`)
- `JWT_SECRET`: JWT signing secret
- `NEXTAUTH_SECRET`: NextAuth secret
- `NEXTAUTH_URL`: NextAuth callback URL

Admin auth fallback:

- `ADMIN_EMAIL`: Fallback admin email
- `ADMIN_PASSWORD_HASH`: Bcrypt hash (recommended). In non-production, plain text is also accepted for local dev.
- `COD_MAX_ORDER_AMOUNT`: Server-side COD cap (default: `50000`)

Optional integrations:

- `REDIS_URL`: Redis URL for caching
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `WHATSAPP_NUMBER`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `ADMIN_CONTACT_EMAIL`
- `GOOGLE_SITE_VERIFICATION`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_COD_MAX_ORDER_AMOUNT`
- `NEXT_PUBLIC_INSTAGRAM_URL`
- `NEXT_PUBLIC_FACEBOOK_URL`
- `NEXT_PUBLIC_TIKTOK_URL`

Observability and ops:

- `LOG_LEVEL` (default: `info` in production, `debug` in development)
- `SENTRY_DSN` (optional, reserved for external error tracking)
- `MONGODB_BACKUP_VERIFIED_AT` (ISO date; required by data readiness check)

## Available Scripts

- `npm run dev` — start development server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — run lint checks
- `npm run seed` — seed products and blog posts
- `npm run data:readiness` — verify DB index readiness and backup verification freshness
- `npm run qa:release` — run lint, build, and readiness checks as release gate

## API Documentation

### Auth

- `POST /api/auth/admin/login`
  - Request: `{ email, password }`
  - Response: `{ success, message, data: { email } }`
  - Sets `admin_token` httpOnly cookie

- `POST /api/auth/admin/logout`
  - Clears admin cookie and redirects to `/admin/login`

### Products (Public)

- `GET /api/products`
  - Query: category/material/occasion/minPrice/maxPrice/sort/page/limit
- `GET /api/products/[slug]`
- `GET /api/products/search?q=&page=&limit=`
- `GET /api/products/trending`
- `GET /api/products/featured`
- `GET /api/products/new-arrivals`

### Products (Admin)

- `GET /api/admin/products`
- `POST /api/admin/products`
- `GET /api/admin/products/[id]`
- `PUT /api/admin/products/[id]`
- `PATCH /api/admin/products/[id]`
- `DELETE /api/admin/products/[id]`
- `PATCH /api/admin/products/bulk`

### Orders

- `POST /api/orders` (create order)
- `GET /api/orders` (admin listing with filters)
- `GET /api/orders/[orderNumber]` (track order)
- `PATCH /api/orders/[orderNumber]/status` (admin status updates)

### Other

- `POST /api/upload` (image upload)
- `POST /api/contact` (contact form)
- `GET /health` (health check)

## SEO Implementation

- Global metadata in `src/app/layout.tsx`
- Dynamic sitemap in `src/app/sitemap.ts`
- Robots config in `src/app/robots.ts`
- JSON-LD:
  - Organization schema on home page
  - Product schema on product pages
  - Article schema on blog detail pages

## Deployment Guide

### Vercel (Frontend)

1. Import repository into Vercel.
2. Add all environment variables from `.env.local` (without committing secrets).
3. `vercel.json` includes:
   - API rewrite to Railway backend URL
   - Security headers (CSP, HSTS, X-Frame-Options, etc.)

### Railway (Backend if split architecture)

- `Procfile` included: `web: node dist/index.js`
- Build command: `npm run build`
- Health endpoint: `GET /health`

## Performance Notes

- Optimized image formats: AVIF/WebP
- Device size tuning in `next.config.mjs`
- Dynamic imports (`ssr: false`) for client-only heavy components:
  - Cart drawer
  - Search modal
  - Instagram feed
  - Admin chart widget
- Route-level loading skeletons and error boundaries
- Public product APIs now return explicit CDN cache headers

## Customer Policy Pages

- `/shipping`
- `/returns`
- `/faqs`

## Contributing

1. Create a feature branch.
2. Keep changes scoped and lint-clean.
3. Run checks before PR:

```bash
npm run lint
npm run build
```

4. Use descriptive commit messages.
5. Include screenshots for UI changes.

## Security Checklist

- Do not commit `.env.local`
- Keep admin JWT secrets strong
- Use bcrypt hash for `ADMIN_PASSWORD_HASH` in production
- Validate all API payloads with Zod
- Protect admin pages and admin APIs (middleware + server verification)
- Admin login and contact endpoints now include IP-based rate limiting
- Admin order status updates emit audit logs in structured JSON output

## Operations Checklist

Before deployment run:

```bash
npm run lint
npm run build
npm run data:readiness
```

For full manual test coverage, use [docs/qa-matrix.md](docs/qa-matrix.md).

## License

Private project for ZARVAYA JEWELS.
