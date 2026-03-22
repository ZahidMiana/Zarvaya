# QA Matrix

Use this checklist before each production release.

## Storefront Journeys

- Home load on desktop/mobile (LCP visual appears without layout shift)
- Shop listing filters (category, price, sort) and pagination
- Product detail image gallery, add-to-cart, related products
- Checkout with valid input and order success redirect
- Track order lookup with valid and invalid inputs

## Payment and Policy

- COD order under limit succeeds
- COD order above limit is blocked with clear error
- EasyPaisa/JazzCash/Bank Transfer checkout path succeeds
- Shipping info page content and links render correctly
- Returns policy page content and links render correctly
- FAQs page content and links render correctly

## Admin Journeys

- Admin login success and invalid credential flow
- Products list/create/edit/delete and availability toggle
- Orders list filter and status update
- Admin logout and access protection after logout

## API and Security

- Login endpoint rate limit returns 429 after threshold
- Contact endpoint rate limit returns 429 after threshold
- Public products endpoints return Cache-Control headers
- Health endpoint returns status OK

## Release Commands

Run these commands in order:

```bash
npm run qa:release
```

If backup timestamp is not set yet:

```bash
SKIP_DATA_READINESS=1 npm run qa:release
```
