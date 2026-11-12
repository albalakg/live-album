# SnapShare management app — build plan

A small internal app to list and lightly edit **users**, **events**, and **orders**. It is a new Vue 3 app in `admin/`. It uses the existing Laravel API in `apps/api/`. Do not change the customer app in `apps/web`.

Work one step at a time. Paste that step’s prompt into a new chat. Finish the “Done when” checks before the next step.

## What already exists

| Piece | Where |
| --- | --- |
| Laravel API | `apps/api/`, base URL `http://localhost:8000` |
| Login | `POST /api/auth/login` with `{ email, password }` |
| Login payload | `{ status, message, data: { user: { id, first_name, last_name, email, role, token, expired_at } } }` |
| Token | Laravel Passport. Send `Authorization: Bearer <token>` |
| Admin gate | `role === "admin"` (`role_id` 10). Middleware alias `admin` is `EnsureAdmin` |
| Admin route example | `apps/api/routes/groups/discount_code.php` uses `auth:api` + `admin` |
| JSON shape | `{ status: true, message, data }` from `Controller::successResponse` |
| CORS | `apps/api/config/cors.php` already allows all origins |

Status integers (`apps/api/app/Services/Enums/StatusEnum.php`):

| Value | Name |
| --- | --- |
| 0 | inactive |
| 1 | active |
| 2 | pending |
| 3 | in progress |
| 4 | ready |
| 5 | closed |
| 6 | blocked |

Roles: admin `10`, user `20`.

Useful columns:

- **users**: `id`, `role_id`, `first_name`, `last_name`, `email`, `status`, `created_at`, soft deletes
- **events**: `id`, `user_id`, `order_id`, `path`, `name`, `status`, `starts_at`, `finished_at`, soft deletes
- **orders**: `id`, `user_id`, `subscription_id`, `order_number`, `status`, `price`, `paid_at`, `payment_page_link`, `discount_code_id`, `created_at`

## Scope

In:

- Login for admins only, logout, session in `localStorage`
- Dashboard with three counts
- Users: search, list, detail, set status
- Events: search, list, detail, set status
- Orders: search, list, detail (read-only; payments stay as they are)

Out:

- Creating users, events, or orders
- Refunds, price edits, PayPlus, discount codes
- Guest galleries, trivia, WhatsApp, icebreaker
- Changes inside `apps/web`

## App shape

```
admin/
  BUILD_PLAN.md
  .env                  VITE_API_BASE_URL=http://localhost:8000
  src/
    main.ts
    App.vue
    api/client.ts
    router/index.ts
    stores/auth.ts
    layouts/AdminLayout.vue
    views/
      LoginView.vue
      DashboardView.vue
      UsersView.vue
      UserDetailView.vue
      EventsView.vue
      EventDetailView.vue
      OrdersView.vue
      OrderDetailView.vue
```

Stack: Vue 3, Vite, TypeScript, Vue Router, Pinia, axios. Plain CSS. Dev server on port `5174` so it does not clash with the customer app on `8080`.

---

## Step 1 — Scaffold the Vue app

**Done when:** `npm run dev` in `admin/` opens a blank page on `http://localhost:5174`, and `apps/web` is untouched.

**Prompt:**

```
Create a new Vue 3 + TypeScript app with Vite in c:\xampp\htdocs\SnapShare\admin.

Constraints:
- Do not modify anything under apps/web or apps/api.
- Keep admin/BUILD_PLAN.md.
- Use Vue 3, Vite, TypeScript, vue-router, pinia, and axios.
- Set the dev server port to 5174 in vite.config.ts.
- Add admin/.env with VITE_API_BASE_URL=http://localhost:8000
- Add admin/.env.example with the same key and no secrets.
- Add admin/.gitignore for node_modules, dist, and .env.
- src/main.ts mounts the app with router and pinia.
- src/App.vue only renders <router-view />.
- One route, path "/", name "home", that shows the text "SnapShare admin".
- npm install, then confirm npm run build succeeds.
```

---

## Step 2 — Login and admin session

**Done when:** An admin can log in and land on a placeholder home page. A normal user is rejected. Refresh keeps the session. Logout clears it.

**Prompt:**

```
In c:\xampp\htdocs\SnapShare\admin only, add admin login against the existing Laravel API. Do not change apps/api/ or apps/web.

API:
- POST {VITE_API_BASE_URL}/api/auth/login
- Body: { email, password }
- Success JSON: { status: true, message, data: { user } }
- user fields we need: id, first_name, last_name, email, role, token, expired_at
- role "admin" is allowed. Any other role must be rejected with a clear message and no stored session.
- Later requests use header Authorization: Bearer <token>

Build:
- src/api/client.ts: axios instance, baseURL = import.meta.env.VITE_API_BASE_URL + "/api", attach the bearer token from the auth store when present.
- src/stores/auth.ts (Pinia): login, logout, restore from localStorage key "snapshare-admin-auth". Store the user object. isAdmin is role === "admin". Clear storage and the axios header on logout. If expired_at is in the past, treat as logged out.
- src/views/LoginView.vue: email, password, submit, error text, loading state. On success go to "/".
- Router: "/login" is public. "/" requires an admin session; otherwise redirect to "/login".
- A logout button on the home page is enough for now.
- Keep the UI plain: one centered card, system font, no component library.

Do not call signup, Google auth, or any customer-app endpoints.
```

---

## Step 3 — Admin shell

**Done when:** After login, a sidebar links to Dashboard, Users, Events, and Orders. Those routes render a title only. Login has no sidebar.

**Prompt:**

```
In c:\xampp\htdocs\SnapShare\admin only, add the logged-in shell. Do not change apps/api/ or apps/web. Do not change login behavior from the previous step.

Build src/layouts/AdminLayout.vue:
- Left sidebar with the app name "SnapShare" and links: Dashboard (/), Users (/users), Events (/events), Orders (/orders).
- Top bar shows the logged-in name and a Logout button that clears the session and goes to /login.
- Main area is <router-view />.
- Highlight the active link.
- Simple CSS: light background, white sidebar, readable type. No component library.

Routes inside the layout, all behind the admin session guard:
- / DashboardView "Dashboard"
- /users UsersView "Users"
- /events EventsView "Events"
- /orders OrdersView "Orders"
Each view is a heading only for now. /login stays outside the layout.
```

---

## Step 4 — Backend admin API

**Done when:** With an admin Bearer token, the eight endpoints below return `{ status: true, message, data }`. A normal user token gets 403. No customer routes change.

**Prompt:**

```
Add a small admin JSON API to the Laravel app in c:\xampp\htdocs\SnapShare\apps\api. Do not change apps/web or the admin Vue app yet. Do not change existing customer routes.

Follow the style of apps/api/routes/groups/discount_code.php and DiscountCodeController:
- New file apps/api/routes/groups/admin.php
- Register it in RouteServiceProvider with prefix api/admin
- Middleware: auth:api and admin (EnsureAdmin already exists)
- Controllers return $this->successResponse($message, $data) and catch exceptions with $this->errorResponse
- Add short message strings on MessagesEnum if that is how other controllers do it

Endpoints, paginated 20 per page (Laravel paginator is fine inside data):

GET /api/admin/stats
data: { users, events, orders } counts. Users and events exclude soft-deleted rows.

GET /api/admin/users?q=&status=
Search q against first_name, last_name, email. Optional status integer filter.
Each row: id, first_name, last_name, email, role_id, status, created_at, events_count.

GET /api/admin/users/{id}
Same fields plus events (id, name, path, status) and orders (id, order_number, status, price, paid_at). 404 if missing.

PATCH /api/admin/users/{id}
Body: { status } integer, one of 0,1,2,6 (inactive, active, pending, blocked). Validate with a Form Request. Do not accept password, email, or role changes.

GET /api/admin/events?q=&status=
Search q against name and path. Optional status filter.
Each row: id, name, path, status, starts_at, finished_at, user (id, first_name, last_name, email).

GET /api/admin/events/{id}
Those fields plus description, order (id, order_number, status, price), and assets_count. 404 if missing.

PATCH /api/admin/events/{id}
Body: { status } integer, one of 0,1,4,5 (inactive, active, ready, closed). Form Request. Do not accept other fields.

GET /api/admin/orders?q=&status=
Search q against order_number and the related user email.
Each row: id, order_number, status, price, paid_at, created_at, user (id, email, first_name, last_name), subscription (id, name).

GET /api/admin/orders/{id}
Those fields plus payment_page_link, discount code (code, percent) when present, and events (id, name, path, status). Read-only. No PATCH for orders.

Use the existing User, Event, Order, Subscription, DiscountCode models. Status integers are App\Services\Enums\StatusEnum. Do not add migrations. Do not delete records.
```

---

## Step 5 — Dashboard

**Done when:** `/` shows three numbers from `GET /api/admin/stats`, and a failed request shows an error message.

**Prompt:**

```
In c:\xampp\htdocs\SnapShare\admin only, fill in the dashboard. Do not change apps/api/ or apps/web.

DashboardView calls GET /api/admin/stats through the existing axios client (Bearer token already attached).
Render three cards: Users, Events, Orders, each with the count.
Loading and error states. Clicking a card goes to /users, /events, or /orders.
Keep the AdminLayout and the plain visual style.
```

---

## Step 6 — Users

**Done when:** `/users` lists users, search works, and opening a user lets you change status and see it update in the list.

**Prompt:**

```
In c:\xampp\htdocs\SnapShare\admin only, build user management against the admin API. Do not change apps/api/ or apps/web.

GET /api/admin/users?q=&status=&page=
GET /api/admin/users/{id}
PATCH /api/admin/users/{id} with { status }

UsersView:
- Search box for q and a status filter (any, inactive 0, active 1, pending 2, blocked 6).
- Table: name, email, role (10 admin, 20 user), status, events count, created date.
- Row click goes to /users/:id.
- Simple pager using the Laravel paginator links or current_page / last_page.

UserDetailView:
- Show name, email, role, status, created date.
- Lists of their events (link to /events/:id) and orders (link to /orders/:id).
- A status select limited to 0, 1, 2, 6 and a Save button that PATCHes and shows success or the API error.
- Back link to /users.

Status labels: 0 inactive, 1 active, 2 pending, 3 in progress, 4 ready, 5 closed, 6 blocked.
Empty list and loading states. No create, delete, or role editing.
```

---

## Step 7 — Events

**Done when:** `/events` lists events, search works, and a detail page can set status to inactive, active, ready, or closed.

**Prompt:**

```
In c:\xampp\htdocs\SnapShare\admin only, build event management against the admin API. Do not change apps/api/ or apps/web.

GET /api/admin/events?q=&status=&page=
GET /api/admin/events/{id}
PATCH /api/admin/events/{id} with { status }

EventsView:
- Search box (name or path) and a status filter (any, 0 inactive, 1 active, 4 ready, 5 closed).
- Table: name, path, owner name and email, status, starts_at.
- Row click goes to /events/:id.
- Pager like the users list.

EventDetailView:
- Show name, path, description, status, starts_at, finished_at, assets count.
- Owner links to /users/:id. Order links to /orders/:id when order_id exists.
- Status select limited to 0, 1, 4, 5 and a Save button.
- Back link to /events.

Same status labels as the users screens. Empty and loading states. No create or delete.
```

---

## Step 8 — Orders

**Done when:** `/orders` lists orders with search and status filter, and `/orders/:id` shows payment and linked records with no edit controls.

**Prompt:**

```
In c:\xampp\htdocs\SnapShare\admin only, build a read-only orders screen. Do not change apps/api/ or apps/web. Do not add a PATCH call.

GET /api/admin/orders?q=&status=&page=
GET /api/admin/orders/{id}

OrdersView:
- Search box (order number or user email) and a status filter using the same integers: 0 inactive, 1 active, 2 pending, 3 in progress, 4 ready, 5 closed, 6 blocked, plus any.
- Table: order number, user email, subscription name, price, status, paid_at.
- Row click goes to /orders/:id.
- Pager like the other lists.

OrderDetailView:
- order number, status, price, paid_at, created_at, payment_page_link (plain text, not a payment action), discount code and percent when present.
- User links to /users/:id.
- Events link to /events/:id.
- Back link to /orders.
- No inputs that change the order.

Empty and loading states.
```

---

## Step 9 — Check the whole app

**Done when:** The checklist below passes in the browser.

**Prompt:**

```
Manually check the SnapShare admin app in c:\xampp\htdocs\SnapShare\admin against the Laravel API at http://localhost:8000. Fix only bugs you find. Do not add features. Do not change apps/web.

Walk through:
1. Logged out, visiting /users redirects to /login.
2. A non-admin login shows an error and does not enter the app.
3. An admin login opens the dashboard and the three counts load.
4. Users search, open a user, change status, go back, and see the new status.
5. Events search, open an event, change status among inactive, active, ready, closed.
6. Orders search and open an order. Confirm there is no way to edit it.
7. Logout, refresh, and confirm you are on the login page.
8. Sidebar links all land on the right page.

If the API is down, say so and stop. Report what you tested and what you fixed.
```

## Run it locally

1. Laravel already used by the customer app: `http://localhost:8000`
2. In `admin/`: `npm install` then `npm run dev`
3. Open `http://localhost:5174` and sign in with an admin user (`role_id` 10, status active)
