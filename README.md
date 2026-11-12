# SnapShare

## How to run locally

```bash
pnpm install
pnpm dev
```

`pnpm dev` prints the two URLs:

- Marketing site (homepage and public pages): http://localhost:4321
- App (login, order, events, albums): http://localhost:8080

http://localhost:8080/ redirects to the marketing site. In production, `/` is the Astro build and the Vue app is only the app paths. See `docs/routing-and-deploy.md`.

The Laravel API is not in this repo (`apps/api` is empty).
