# CloudFront, DNS, and HSTS (manual)

The marketing site is a static Vue build on S3 behind CloudFront. These changes need the AWS account. Nothing here is applied by the app deploy itself.

Canonical URLs (also listed in `frontend/public/sitemap.xml`) have **no trailing slash**, except the homepage:

- `https://snapshare-live.com/`
- `https://snapshare-live.com/contact-us`
- `https://snapshare-live.com/order`
- `https://snapshare-live.com/terms-and-conditions`
- `https://snapshare-live.com/digital-wedding-album`
- `https://snapshare-live.com/qr-photo-sharing`
- `https://snapshare-live.com/live-photo-wall`
- `https://snapshare-live.com/pricing`
- `https://snapshare-live.com/bar-bat-mitzvah-digital-album`
- `https://snapshare-live.com/corporate-event-photo-sharing`
- `https://snapshare-live.com/how-it-works`
- `https://snapshare-live.com/henna-engagement-birthday-album`

The build writes real HTML for those routes (`dist/contact-us/index.html`, and so on) and a client-only shell at `dist/spa.html` for app deep links. Auth shells include `noindex`.

## 1. Viewer-request function (required)

Create a CloudFront Function on runtime **cloudfront-js-2.0** (1.0 also works; the file uses `var`/`function` only). Associate it with the distribution’s default behavior as **Viewer request**.

Source: [`docs/cloudfront/spa-rewrite.js`](cloudfront/spa-rewrite.js).

What it does:

- `www.snapshare-live.com` → **301** to `https://snapshare-live.com` (same path and query string). This only works after the DNS record in section 3 exists and the distribution accepts the www host (alternate domain name + certificate).
- Extensionless URLs are rewritten to an object that exists, so S3 does not 302 to a trailing slash and does not 404:
  - `/` → `/index.html`
  - `/contact-us` and `/contact-us/` → `/contact-us/index.html` (same for `/order`, `/terms-and-conditions`, the eight marketing landing pages, and the auth/app shells)
  - `/event/...` (guest album, uploads, gallery, and so on) → `/spa.html` (**200**, client-side router)
- Any other extensionless path returns **404** with `X-Robots-Tag: noindex` and a short Hebrew page. The Vue app also has a `NotFound` view for in-app navigation.
- Files with an extension (`/assets/...`, `/sitemap.xml`, `/robots.txt`, `/favicon.ico`) are left unchanged.

Publish the function and wait until the distribution finishes deploying before checking curl status codes.

## 2. Custom error responses (safety net only)

With the function above, known HTML routes never reach S3 as a bare key, so they should not 404.

S3 REST origins return **403** for a missing key. If you still want a fallback when a rewritten object is missing:

| HTTP error | Response page | Response code |
| --- | --- | --- |
| 403 | `/spa.html` | 200 |
| 404 | `/spa.html` | 200 |

Do **not** point this fallback at `/index.html`. After prerender, `/index.html` is the homepage, and a blanket mapping would show homepage HTML on missing URLs.

Prefer fixing the function over relying on this fallback. A blanket 403/404 → 200 mapping also turns missing images into HTML.

`/404.html` is a prerendered Not Found document (noindex) if you would rather serve that file from a custom error response with status **404**. Do that only after the function is rewriting valid `/event/...` URLs; otherwise those deep links would 404.

## 3. www DNS and 301

`www.snapshare-live.com` does not resolve today.

1. Add `www.snapshare-live.com` as an alternate domain name (CNAME) on the CloudFront distribution.
2. Attach an ACM certificate in us-east-1 that covers both `snapshare-live.com` and `www.snapshare-live.com`.
3. Create a DNS record for `www` (CNAME or ALIAS) to the distribution domain name.
4. The viewer-request function in section 1 then 301s www to the bare host. Keep the bare domain as the canonical host (`https://snapshare-live.com`).

## 4. HSTS

Add a CloudFront **response headers policy** on the default behavior:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Or a viewer-response function:

```javascript
function handler(event) {
  var response = event.response;
  response.headers["strict-transport-security"] = {
    value: "max-age=31536000; includeSubDomains",
  };
  return response;
}
```

Start with a shorter `max-age` if you are not ready to include subdomains permanently. `server.snapshare-live.com` is a separate host; `includeSubDomains` on the marketing distribution does not set the header there unless that distribution (or the API) sends it too.

## 5. Check after deploy

```bash
curl -sI https://snapshare-live.com/contact-us | head
curl -sI https://snapshare-live.com/order | head
curl -sI https://snapshare-live.com/event/uploads/example | head
curl -sI https://www.snapshare-live.com/ | head
```

Expect **200** (not 302 and not 404) for `/contact-us`, `/order`, and `/event/uploads/example`. Expect **301** from www to the bare host, and `strict-transport-security` on the response.
