# Contact form and WhatsApp

## WhatsApp

Number: `0528458600`, link `https://wa.me/972528458600`.

Config: `PUBLIC_WHATSAPP_NUMBER` / `VUE_APP_WHATSAPP_NUMBER`, default `972528458600` in `@snapshare/design`.

The floating WhatsApp button is shown only to a logged-in host whose user plan or event plan is Classic or Premium (`קלאסי` / `פרימיום`). Marketing pages never show it. Guests, logged-out visitors, and trial hosts get the contact form instead.

## Business email

`hello@snapshare-live.com` until Gal confirms another address.

`PUBLIC_BUSINESS_EMAIL` / `VUE_APP_BUSINESS_EMAIL`.

## How mail should be sent

**Recommendation: the existing Laravel endpoint.** The Vue app already posts `{ email, full_name, text }` to `POST /api/contact` (`ContactModule`). No new vendor, no access key in the repo, and the same Hebrew success and error handling. Formspree and Web3Forms are easier if the static marketing host cannot reach the API (CORS or no public API URL yet), but each needs an account and a key, and the message then lives outside SnapShare.

The form is wired for all three. Provider is `PUBLIC_CONTACT_PROVIDER` / `VUE_APP_CONTACT_PROVIDER`, default `laravel`.

| Provider | When it is used | Config |
| --- | --- | --- |
| `laravel` | Default. Vue posts through axios to `/api/contact`. Marketing posts to `PUBLIC_CONTACT_ENDPOINT` when that URL is set. | `PUBLIC_CONTACT_ENDPOINT` full URL, for example `https://<api-host>/api/contact`. No secret. |
| `formspree` | Only if an id is set. | `PUBLIC_FORMSPREE_ID` |
| `web3forms` | Only if a key is set. | `PUBLIC_WEB3FORMS_ACCESS_KEY` |

If the provider is `laravel` and the marketing endpoint is empty, the marketing form opens a `mailto:` to the business email with the message filled in. That needs no secret and still reaches the inbox. Set `PUBLIC_CONTACT_ENDPOINT` when the API host is known so the form posts instead. The API must allow that origin in CORS.

Nothing secret is committed. Pixel id stays empty.
