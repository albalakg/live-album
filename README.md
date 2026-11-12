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

The Laravel API is not in this repo (`apps/api` is empty). It lives in [snapshare-server](https://github.com/albalakg/snapshare-server). For a local stack, clone that repo beside this one and do not point it at production:

```bash
git clone https://github.com/albalakg/snapshare-server.git ~/snapshare-server
cd ~/snapshare-server
composer install
cp .env.example .env
# SQLite, mail to the log, moderation off, public disk. No production keys.
php artisan key:generate
php artisan migrate
php artisan passport:keys
php artisan passport:client --personal --name="SnapShare Personal" --no-interaction
php artisan storage:link
SNAPSHARE_SERVER=~/snapshare-server bash scripts/seed-local.sh
php artisan serve --host=127.0.0.1 --port=8000
```

`apps/web/.env` should set `VUE_APP_SERVER_BASE_URL=http://localhost:8000`. Seeded accounts (local only): `host@snapshare.test` / `Test1234!` (event `amit-gal`) and `empty@snapshare.test` / `Test1234!` (no event). PayPlus sandbox keys are not in the repo, so the paid checkout iframe cannot load. Rekognition stays off (`MODERATION_ENABLED=false`).

