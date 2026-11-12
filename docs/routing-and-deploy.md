# Routing and deploy (proposal)

Nothing in this document is applied to production. Do not change the live S3 bucket, CloudFront distribution, or DNS from this branch.

SnapShare’s public site and the logged-in product share `https://snapshare-live.com`. Marketing is a static Astro build (`apps/marketing`). The host dashboard, guest album, upload, order, and login stay the Vue SPA (`apps/web`).

## Path split

### Marketing (Astro, static HTML)

| Path | Page |
| --- | --- |
| `/` | Homepage |
| `/pricing` | Prices (current: trial, ₪200, ₪300) |
| `/faq` | FAQ |
| `/blog` and `/blog/<slug>` | Blog collection |
| `/digital-wedding-album` | SEO landing |
| `/qr-photo-sharing` | SEO landing |
| `/live-photo-wall` | SEO landing |
| `/bar-bat-mitzvah-digital-album` | SEO landing |
| `/corporate-event-photo-sharing` | SEO landing |
| `/how-it-works` | SEO landing |
| `/henna-engagement-birthday-album` | SEO landing |

Canonical URLs have no trailing slash, except the homepage which is `https://snapshare-live.com/`. Astro still emits `pricing/index.html` so S3 can serve it after a rewrite.

The eight landing pages are the copy already written on `origin/cursor/seo-technical-fixes-92f9` (`frontend/src/content/landing-pages.json`). Sentences that branch marked as pending confirmation stay hidden (`ENABLE_PENDING_CLAIMS` is false). `/pricing` is both the designed pricing page and that landing article.

### App (Vue SPA)

These paths come from `apps/web/src/router/index.ts` plus the Phase 1 routes added on this branch. CloudFront should serve `spa.html` for them and leave the browser URL unchanged.

| Prefix or path | What it is |
| --- | --- |
| `/login` `/logout` `/signup` | Auth |
| `/forgot-password` `/reset-password` `/email-confirmation` | Auth |
| `/auth/google/callback` | Google sign-in |
| `/contact-us` | Contact form (still the SPA) |
| `/order` `/order/pay` `/order/success` `/order/failure` | Checkout. Not the public pricing page. |
| `/terms-and-conditions` | Legal (still the SPA) |
| `/event` | Host event shell |
| `/event/gallery` `/event/gallery/full-screen` | Host album and live screen |
| `/event/assets` | Host files |
| `/event/qr` | Host QR card editor |
| `/event/moderation` | Host review queue |
| `/event/trivia` `/event/whatsapp` | Host tools (WhatsApp only if the feature flag is on) |
| `/event/uploads/:event_path` | Guest upload |
| `/event/open-album/:event_path` | Guest live album |
| `/event/open-gallery/:event_path` | Guest gallery |
| `/event/trivia/:event_path` | Guest trivia |
| `/profile` | Account |
| `/admin/discount-codes` | Admin |
| `/design` | Design experiment route already in the SPA |
| `/qr-cards` | Public QR card gallery (Vue) |
| `/preview/host-screen` `/preview/moderation` | Sample screens for the new album UI. `open-album/preview` and `open-gallery/preview` are under `/event`. |

`/contact-us` and `/terms-and-conditions` are public but still rendered by the SPA, so they are not in the marketing sitemap. They are allowed by `robots.txt` (not disallowed). Login, signup, order, event, profile, admin, and the QR gallery are disallowed and omitted from the sitemap.

## Build outputs

```bash
pnpm install
pnpm --filter @snapshare/marketing build   # apps/marketing/dist
pnpm --filter @snapshare/web build         # apps/web/dist
node scripts/assemble-site.mjs             # dist-site/
```

`scripts/assemble-site.mjs` copies the Vue `dist` first, renames its `index.html` to `spa.html`, then copies the Astro `dist` on top. Astro owns `/`, `/_astro`, `/media`, `robots.txt`, `sitemap-index.xml`, and the marketing HTML. Vue keeps `/js`, `/css`, `/assets`, and `spa.html`. Marketing images live in `/media` so they do not replace the SPA’s `/assets`.

The Vue `index.html` is the app shell. It does not load GA4 itself; `main.ts` calls `installAnalytics` once. It is marked `noindex` because it is not the public homepage.

## S3 and CloudFront

Upload `dist-site/` to the existing bucket. Do not point the distribution at a new origin from this branch.

Suggested viewer-request function (source: `docs/cloudfront/viewer-request.js`, runtime cloudfront-js-2.0, default behavior):

1. `www.snapshare-live.com` → 301 to `https://snapshare-live.com` with the same path and query. This only works after `www` is an alternate domain name with a matching certificate and DNS. That DNS record does not exist today.
2. URLs with a file extension (`/js/…`, `/assets/…`, `/media/…`, `/sitemap-index.xml`, `/robots.txt`, `/favicon.svg`) are unchanged.
3. App paths in the table above → `/spa.html` (the browser URL stays `/event/…`).
4. `/` → `/index.html`.
5. Any other extensionless path, including `/pricing` and `/pricing/`, → `/pricing/index.html` (strip the trailing slash, append `/index.html`).

S3 returns 403 for a missing key. Optional custom error responses, only as a safety net:

| HTTP error | Response page | Response code |
| --- | --- | --- |
| 403 | `/404.html` | 404 |
| 404 | `/404.html` | 404 |

Do not map those errors to `/index.html` or `/spa.html`. A missing marketing page would otherwise look like the homepage, and a missing image would become HTML. `/404.html` is the Astro not-found page and is `noindex`.

Add a response-headers policy when you are ready:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

`server.snapshare-live.com` is a different host. `includeSubDomains` on this distribution does not send the header there.

## Checks after a future deploy

```bash
curl -sI https://snapshare-live.com/ | head
curl -sI https://snapshare-live.com/pricing | head
curl -sI https://snapshare-live.com/digital-wedding-album | head
curl -sI https://snapshare-live.com/order | head
curl -sI https://snapshare-live.com/event/open-album/example | head
```

Expect the marketing URLs to be the Astro HTML (Hebrew `lang`, one GA4 bootstrap). Expect `/order` and `/event/…` to be the Vue shell (`spa.html`) without a second GA4 snippet in the HTML.

## Analytics

GA4 id: existing property `G-XW53Y5YC3B`, overridable with `PUBLIC_GA4_ID` (marketing) and `VUE_APP_GA4_ID` (web). Meta Pixel id is empty unless `PUBLIC_META_PIXEL_ID` / `VUE_APP_META_PIXEL_ID` is set. No pixel id is hardcoded.

Both apps call the same installer in `@snapshare/design`. It sets `window.__snapshareAnalytics` and returns immediately on a second run, then loads `gtag/js` once and calls `gtag('config')` once.
