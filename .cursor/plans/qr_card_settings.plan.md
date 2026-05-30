# QR Card Settings — Frontend + Backend Contract

## Frontend (this repo) — done

**View:** [`frontend/src/views/EventQRCardView.vue`](frontend/src/views/EventQRCardView.vue)

- User picks card design (`MainSelect`) and card text (`MainInput`)
- **Save** button dispatches `event/updateQrCardSettings`
- On page load, saved values are read from `event.config.qr_card_design` and `event.config.qr_card_text`
- Falls back to defaults when no saved settings exist

**Store:** [`frontend/src/store/modules/EventModule.ts`](frontend/src/store/modules/EventModule.ts)

- Action: `updateQrCardSettings` → `POST events/{eventId}/qr-card/settings`
- Mutation: `UPDATE_QR_CARD_SETTINGS` updates local `event.config`

**Shared options:** [`frontend/src/helpers/qrCardOptions.ts`](frontend/src/helpers/qrCardOptions.ts)

---

## Backend prompt (copy/paste to backend repo)

Implement persistence for the event owner's QR card design and card text. The Vue frontend is already wired to call the endpoint below.

### Scope

- Authenticated event owner only (same auth as `POST events/{id}/gallery/settings`)
- One saved design + text per event
- Return saved values on all existing event payloads that include `config` (e.g. `GET user/profile`, `GET events/{path}/base-info`)

### Database

Add nullable columns to `event_configs` (or equivalent table tied 1:1 to events):

| Column | Type | Notes |
|--------|------|-------|
| `qr_card_design` | `string(100)` nullable | Filename only, not a full URL |
| `qr_card_text` | `text` nullable | Card sentence shown under the QR |

Defaults when null: FE uses `qr-card-flowers.webp` and `סרקו, צלמו ותעלו בואו נחגוג ביחד`.

### Allowed design values (whitelist)

Reject any value not in this list:

```
qr-card-flowers.webp
qr-card-flowers-2.webp
qr-card-flowers-3.webp
qr-card-flowers-4.webp
qr-card-flowers-5.png
qr-card-nature.png
qr-card-gold.png
qr-card-gold-2.png
qr-card-gold-3.png
qr-card-marble.png
qr-card-marble-2.png
```

### REST API

#### `POST /api/events/{eventId}/qr-card/settings`

**Auth:** `Authorization: Bearer {token}` — must own the event.

**Request body (JSON):**

```json
{
  "design": "qr-card-flowers.webp",
  "text": "סרקו, צלמו ותעלו בואו נחגוג ביחד"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `design` | string | yes | Must be one of the allowed filenames above |
| `text` | string | yes | Non-empty after trim, max 200 characters |

**Success response (200):** same envelope as other event endpoints, e.g.

```json
{
  "data": {
    "qr_card_design": "qr-card-flowers.webp",
    "qr_card_text": "סרקו, צלמו ותעלו בואו נחגוג ביחד"
  }
}
```

**Error responses:** same error envelope as existing asset/gallery endpoints.

| Status | When |
|--------|------|
| 401 | Missing/invalid token |
| 403 | User does not own event |
| 404 | Event not found |
| 422 | Validation failed (invalid design, empty text, text too long) |

### Include in event `config` responses

Extend the serialized `config` object returned with events:

```json
{
  "config": {
    "id": 1,
    "event_id": 42,
    "displayed_gallery": "EventGallerySingle",
    "preview_site_display_image": true,
    "qr_card_design": "qr-card-gold.png",
    "qr_card_text": "סרקו, צלמו ותעלו בואו נחגוג ביחד"
  }
}
```

Ensure these fields are present (nullable) on:

- `GET user/profile` → `data.event.config`
- `GET events/{path}/base-info` → `data.config`
- Any other endpoint that already returns `event.config`

No separate GET endpoint is required if config is always included on event load.

### Business rules

- Saving overwrites previous design/text for the event
- Trim whitespace from `text` before save
- Do not store full asset URLs — filename only
- No guest/public write access

### Acceptance criteria

1. Owner saves design + text → reload page → same design and text are pre-selected
2. Invalid `design` returns 422
3. Empty or >200 char `text` returns 422
4. Non-owner cannot update another user's event
5. `user/profile` and `events/{path}/base-info` return `qr_card_design` and `qr_card_text` in `config`
