# Event tabs — backend gaps

Local migrations added and applied on `DB_HOST=127.0.0.1` / `DB_DATABASE=live_albums`:

- `events.event_type` (nullable string)
- `event_configs.welcome_text`, `image_display_time`, `video_display_time`, `manual_photo_approval`
- `event_assets.is_favorite`
- `POST /api/events/{id}/assets/favorite`
- `POST /api/events/{id}/assets/unblock` now also approves `PENDING` assets
- Feature tests: `apps/api/tests/Feature/EventTabsConfigTest.php`

## Submodule commit caveat

`apps/api` is a gitlink in the monorepo (pinned to `bf3d834`) without a local `apps/api/.git` checkout. The migration/model/controller/test edits above are present on disk and were migrated/tested locally, but they could not be committed as a submodule SHA bump from this working tree. Re-apply or commit them from a proper snapshare-server checkout before deploy.

## Still not fully productized

1. **Guest-count on overview** — overview uses `event.guests` / `guests_count` when present; there is no dedicated host analytics endpoint for “אורחים שהעלו”.
2. **Slideshow timing on the live stage** — columns exist and can be saved via event update, but the gallery layout components still use hardcoded intervals until they read `image_display_time` / `video_display_time`.
3. **Guest upload page rendering of `welcome_text`** — host can save it; guest-facing `EventUploadsView` still defaults to the fixed Hebrew CTA until wired to the new field.
4. **QR inverted module assets** — inverted cards use light `qrColor`/`foreground` on transparent SVG; there is no separate pre-rendered light QR PNG asset pack in the product (mock used `qr-ink-*.png`).
5. **Sample / demo numbers** — overview no longer invents 186/64/172; real event counts are shown. Shot parity with mock sample numbers requires a seeded local event.
