# Manual photo approval — backend spec

Gal approved this contract. It is being implemented in `albalakg/snapshare-server` on its own branch and pull request. This repo does not change that server. The Vue app already speaks the contract below; do not invent a second moderation status or a new approve URL.

## What the app already does

Event settings are saved with the existing call:

`POST /api/events/{event}/update`  
`Content-Type: multipart/form-data` (via `object-to-formdata`)

The body already includes a `config` object (`video_upload_enabled`, `preview_site_display_name`, and the other flags). The new flag is:

`config[manual_photo_approval]` — boolean, default `false`.

The host screen reads it back from `event.config.manual_photo_approval` on `GET /api/events/{path}/base-info` (and any payload that returns `event.config`).

Approve on a pending photo is the existing call, confirmed by Gal:

`POST /api/events/{event}/assets/unblock`  
`{ "assets": [id] }`

That must set `moderation_status` / `status` to active (`1`) and clear `is_blocked`, which is what the client already does after a 200.

Hide stays:

`POST /api/events/{event}/assets/hide`  
`{ "assets": [id] }`

Guest album and the live screen already render only assets whose moderation status is active. Pending photos stay in the host queue at `/event/moderation` and do not appear on the stage or in the guest gallery.

## Data

`events.config` is already a JSON blob the client round-trips. Persist two keys on it:

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `manual_photo_approval` | boolean | `false` | Host toggle "אישור ידני לתמונות" |
| `manual_photo_approval_enabled_at` | ISO-8601 timestamp or null | `null` | Set when the flag turns from false to true. Cleared only if you want a full reset; leaving the timestamp is fine when the flag is turned off. |

No new status value. Keep `pending = 2`, `active = 1`, `blocked = 6`.

If `config` is not JSON and is a column-per-flag table, add those two columns instead and include them in the event resource `config` object. The client does not care which storage it is, as long as the JSON shape above comes back.

## Upload flow

Today: upload creates the asset as pending, Rekognition runs, and a pass sets the asset to active. Videos skip Rekognition and become active immediately.

When `manual_photo_approval` is true **and** the asset was created at or after `manual_photo_approval_enabled_at`:

1. Run Rekognition exactly as today.
2. If Rekognition blocks the image, set `blocked` (unchanged).
3. If Rekognition passes, **leave the image `pending`**. Do not promote it to `active`.
4. Videos are not moderated by Rekognition. Under manual approval they stay `pending` too, until the host approves them. Say so in the host queue (the UI already notes that videos are not auto-checked).

Photos uploaded **before** the timestamp keep the old behavior: Rekognition pass → `active`. Turning the toggle on does not hide the album that already exists.

When the flag is off, behavior is unchanged: Rekognition pass → `active`.

## Approve

`POST .../assets/unblock` is the approve action for both a Rekognition block and a manual-approval pending item.

- Pending + manual approval: set `active`, `is_blocked = 0`. The photo then shows on the album and the live screen.
- Blocked: same endpoint, same result (current unblock).
- Do not require a new route unless unblock currently rejects a pending id. If it does, accept pending ids when `manual_photo_approval` is on, and still move them to `active`. The client will not call a different URL.

## Response shape

`GET /api/events/{id}/assets` must keep returning pending and blocked assets to the host, with `status` or `moderation_status` and `fullPath` (or `path`, which the client prefixes). Guest `base-assets` / `gallery-assets` must omit pending and blocked, which they already should if they only return displayed/active assets.

## Not in this repo

No migration, controller, or job was added here. `apps/api` is empty. The toggle in the host form only works after the server persists `config.manual_photo_approval` and the upload job respects `manual_photo_approval_enabled_at`.
