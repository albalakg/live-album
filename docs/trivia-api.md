# Trivia MVP API

Base prefix: `/api/events`. All admin routes require `Authorization: Bearer {passport_token}`. Guest play routes that need a session require header `X-Trivia-Session: {session_token}`.

Envelope for every response:

```json
{ "message": "string", "status": true, "data": {} }
```

Errors use the same shape with `status: false` (and `debug_info` outside production).

MVP question types: `choice`, `multi`, `truefalse`, `who`, `whosaid`, `poll`, `thisorthat`, `twothruths`, `number`, `photo`.

Pace: `host` (default) | `auto` | `free`.  
`current_phase`: `lobby` | `question` | `reveal` | `leaderboard` | `photos` | `podium`.  
Legacy `phase` (status-based): `photos` | `live` | `results`.

Question cap: **40**. Single-question `PATCH` does **not** reset scores.

---

## Guest (public)

### `GET /{event_path}/trivia/screen`

Live venue payload. Poll ~2s.

**Response `data`:**

| field | notes |
|---|---|
| `phase` | `photos` \| `live` \| `results` |
| `current_phase` | granular host phase |
| `theme` | `elegant` \| `neon` |
| `pace` | `host` \| `auto` \| `free` |
| `title` | string \| null |
| `player_count` | number |
| `join_path` | e.g. `/event/trivia/{path}` |
| `top` | top 3 (or 8 on leaderboard): `{ rank, nickname, avatar_url, team, score }` |
| `joining` | recent joiners for lobby |
| `teams` | `null` or `{ mode:"sides", labels:{a,b}, scores:{a,b} }` |
| `prize_text` | string \| null (podium) |
| `question` | public question object or `null` |
| `tallies` | on reveal, or live for `poll` / `thisorthat` |
| `fun_fact` | reveal only |
| `correct` | reveal only (`option_ids` or `{ number, closest }`) |
| `server_now` | ISO-8601 |

**`question` (no `is_correct` until reveal):**

```json
{
  "id": 1,
  "type": "choice",
  "prompt": "…",
  "index": 1,
  "total": 12,
  "time_limit_seconds": 20,
  "max_points": 1000,
  "started_at": "ISO-8601",
  "selection_mode": "single|multiple",
  "config": {},
  "media": { "id": 9, "url": "https://…" },
  "options": [{ "id": 1, "label": "…" }]
}
```

On reveal, each option may include `is_correct`, and `config.correct` is included for `number`.

**`tallies`:**

- Options: `{ mode:"options", total_answers, options:[{ option_id, count, percent }] }`
- Number: `{ mode:"number", guesses:[{ player_id, value }] }`

---

### `POST /{event_path}/trivia/join` (throttle 30/min)

Multipart or JSON.

**Request:**

| field | rules |
|---|---|
| `nickname` | required, 2–40 |
| `image` | optional JPEG/PNG/WebP ≤ 2 MB |
| `team` | optional `a` \| `b` (required when `teams_mode=sides`) |

**Response `data`:**

```json
{
  "session_token": "…",
  "player": { "nickname", "avatar_url", "team", "score", "finished" },
  "phase": "live",
  "current_phase": "lobby",
  "pace": "host",
  "teams_mode": "none|sides",
  "team_labels": { "a": "צד עמית", "b": "צד גל" }
}
```

Join is only allowed while status phase is `live`.

---

### `GET /{event_path}/trivia/me`

**Headers:** `X-Trivia-Session`

**Response `data`:**

```json
{
  "phase": "live",
  "current_phase": "question",
  "pace": "host",
  "player": { "nickname", "avatar_url", "team", "score", "finished" },
  "rank": 2,
  "correct_count": 3,
  "total_questions": 12
}
```

---

### `GET /{event_path}/trivia/question`

**Headers:** `X-Trivia-Session`

#### Host / auto pace

If there is a shared current question and the player has not answered:

```json
{
  "finished": false,
  "waiting": false,
  "server_now": "ISO-8601",
  "question": { /* same public shape; served_at == game.question_started_at */ }
}
```

Otherwise waiting:

```json
{
  "waiting": true,
  "phase": "lobby|reveal|…",
  "current_phase": "lobby|reveal|…",
  "answered": true,
  "finished": false,
  "server_now": "ISO-8601"
}
```

(`answered` is present when the guest already submitted for the current question.)

#### Free pace

Same as today: next unanswered question for this player, personal `served_at`. When done:

```json
{
  "finished": true,
  "score": 1200,
  "rank": 1,
  "correct_count": 4,
  "total_questions": 10
}
```

---

### `POST /{event_path}/trivia/answer`

**Headers:** `X-Trivia-Session`

**Request:**

```json
{
  "question_id": 12,
  "option_ids": [3],
  "value_number": 180
}
```

- Discrete types: `option_ids` (array, may be empty only if invalid — normally 1+).
- `number`: `value_number` required.
- Host/auto: only accepted while `current_phase=question` and `question_id` matches `current_question_id`.

**Response `data` (host/auto before reveal):**

```json
{
  "is_correct": null,
  "correct_option_ids": null,
  "points_awarded": null,
  "score": 0,
  "elapsed_ms": 4200,
  "finished": false,
  "rank": 3,
  "correct_count": null,
  "total_questions": 12,
  "waiting_for_reveal": true,
  "current_phase": "question"
}
```

**After reveal (or free pace):** `is_correct`, `correct_option_ids`, `points_awarded`, `correct_count` are populated. For `number`, `correct_number` may be included.

`poll` / `thisorthat` always award `0` points.

---

## Admin (auth)

### `GET /{event_id}/trivia/admin`

Full builder state.

**Response `data` highlights:**

```json
{
  "event_id": 1,
  "enabled": true,
  "status": "draft|scheduled|live|results",
  "phase": "photos|live|results",
  "current_phase": "lobby",
  "title": "טריוויה",
  "theme": "elegant",
  "pace": "host",
  "teams_mode": "none",
  "team_labels": { "a": "צד עמית", "b": "צד גל" },
  "speed_bonus": true,
  "prize_text": null,
  "reveal_seconds": 6,
  "default_time": 20,
  "default_points": 1000,
  "current_question_id": null,
  "question_started_at": null,
  "starts_at": null,
  "results_at": null,
  "join_path": "/event/trivia/…",
  "question_cap": 40,
  "questions": [
    {
      "id": 1,
      "type": "choice",
      "prompt": "…",
      "fun_fact": null,
      "media_asset_id": null,
      "media": null,
      "config": null,
      "sort_order": 0,
      "time_limit_seconds": 20,
      "max_points": 1000,
      "options": [
        { "id": 1, "label": "…", "is_correct": true, "sort_order": 0 }
      ]
    }
  ]
}
```

Admin payloads **include** `is_correct`.

---

### `PUT /{event_id}/trivia/admin`

**Request:**

```json
{
  "enabled": true,
  "title": "כמה אתם מכירים את עמית וגל",
  "starts_at": null,
  "results_at": null,
  "theme": "elegant",
  "pace": "host",
  "teams_mode": "sides",
  "team_labels": { "a": "צד עמית", "b": "צד גל" },
  "speed_bonus": true,
  "prize_text": "הפרס: בקבוק יין",
  "reveal_seconds": 6,
  "default_time": 20,
  "default_points": 1000
}
```

`enabled` + `title` required (same as before). New settings fields optional. Returns full admin payload.

Theme/prize may change while live; structural question edits stay locked.

---

### `PUT /{event_id}/trivia/admin/questions`

Full replace (max 40). **Resets all player scores** (legacy behaviour). Locked while `live` / `results`.

**Request:**

```json
{
  "questions": [
    {
      "type": "choice",
      "prompt": "…",
      "time_limit_seconds": 20,
      "max_points": 1000,
      "fun_fact": "…",
      "media_asset_id": null,
      "config": {},
      "options": [{ "label": "…", "is_correct": true }]
    }
  ]
}
```

Type rules:

| type | options | correct required | config |
|---|---|---|---|
| `choice` `multi` `truefalse` `who` `whosaid` `twothruths` `photo` | 2–6 | yes | optional sides / truths |
| `poll` `thisorthat` | 2–6 | no (points forced 0) | optional sides |
| `number` | none | n/a | `{ min, max, correct, unit? }` required |

---

### `PATCH /{event_id}/trivia/admin/questions/{question_id}`

Autosave one question. **Does not reset scores.** Locked while live/results.

Body: any subset of question fields (`type`, `prompt`, `time_limit_seconds`, `max_points`, `fun_fact`, `media_asset_id`, `config`, `options`). Returns full admin payload.

---

### `POST /{event_id}/trivia/admin/questions`

Append one question (blocked at 40). Same body as a single question object. Returns full admin payload.

---

### `DELETE /{event_id}/trivia/admin/questions/{question_id}`

Delete one question and reindex `sort_order`. Returns full admin payload.

---

### `PUT /{event_id}/trivia/admin/questions/reorder`

```json
{ "ids": [3, 1, 2] }
```

`ids` must be a permutation of all current question ids. Returns full admin payload.

---

### `POST /{event_id}/trivia/admin/phase`

Host remote.

```json
{ "phase": "question", "question_id": 12 }
```

| phase | effect |
|---|---|
| `lobby` | status live, clear current question |
| `question` | set `current_question_id`, `question_started_at=now()` |
| `reveal` | reveal current (or given) question; finalize `number` scores |
| `leaderboard` | mid-game board |
| `photos` | same as `POST …/photos` (leave live screen) |
| `podium` | status results + podium |

Returns full admin payload.

Shortcuts still work:

- `POST …/show` → live + `lobby`
- `POST …/results` → podium (requires already live/results)
- `POST …/photos` → back to photos / draft|scheduled

---

### `POST /{event_id}/trivia/admin/from-template`

```json
{ "template_id": "couple", "replace": false }
```

Built-in packs: `couple`, `birthday`. If the game already has questions and `replace` is not true → `422` with message to confirm replace. Applying a template replaces questions and **resets scores** (same as full replace).

---

### `GET /{event_id}/trivia/admin/templates`

```json
{
  "templates": [
    {
      "id": "couple",
      "title": "כמה אתם מכירים את הזוג",
      "description": "…",
      "event": "wedding",
      "question_count": 10
    }
  ]
}
```

---

### `GET /{event_id}/trivia/admin/report`

Unchanged shape, plus `type` on questions and `team` on players.

---

## Scoring notes

- Exact-match types use `pointsFor`: on-time correct → `round(max_points * (0.5 + 0.5 * remaining_ratio))` when `speed_bonus` is on; full `max_points` when off.
- `poll` / `thisorthat`: always 0.
- `number` (SPEC §3): on reveal (host/auto) or immediately after submit (free), closest on-time guess(es) get full points (ties share); others `max_points * max(0, 1 - d/span)`; with speed bonus that base is mixed with the 50% speed term.

---

## `trivia:tick`

Artisan command still promotes `scheduled → live` and `live → results` by datetime. For `pace=auto` it also advances `question → reveal` after `time_limit_seconds`, then to the next question (or podium) after `reveal_seconds`.
