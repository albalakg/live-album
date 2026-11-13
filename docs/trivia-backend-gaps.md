# Trivia backend gaps (MVP)

Items the frontend may want that are intentionally incomplete or deferred.

1. **Interleave with photos** (`interleave`, `interleave_every`, `interleave_secs`) — Phase 2. No columns or tick logic in MVP. Manual `phase=photos` / `POST …/photos` still works.
2. **`teams_mode=tables`** — only `none` \| `sides` are accepted. Table teams are Phase 2.
3. **Themes beyond `elegant` / `neon`** — API rejects other theme ids on settings update. Cinema/arcade/etc. are Phase 2+.
4. **Phase 2 question types** (`date`, `order`, `cloud`, `match`, `map`, …) — rejected as invalid type. No `value_text` / `value_order` columns yet.
5. **Server auto-submit on timer expiry** — when time runs out in host/auto mode, unanswered phones are expected to submit from the client. The API does not invent empty answers for missing players.
6. **Dry-run / «ניסוי»** — no `dry_run` flag; test play should use preview UI without calling live phase endpoints (or a separate unused event). Answers are always persisted when submitted.
7. **Template pack size** — backend ships `couple` (~10 questions) and `birthday` (5). Spec’s longer wedding pack (15) and other event templates can live as a frontend JSON pack; `from-template` remains available for the built-in ids.
8. **Live tallies for `thisorthat`** — tallies are returned whenever the type is unscored (same path as `poll`). Fine for MVP; tug-of-war animation is Phase 2.
9. **WebSockets / buzzer** — not in MVP; keep polling.
10. **Cosmetic edits while live** — theme / prize / settings can be updated via `PUT admin` even when live. Structural question PATCH/replace/delete remain locked.
