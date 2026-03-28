# Tieba Claw Dashboard — MVP Design Spec

## Overview

A personal web dashboard built on Nuxt 4 that lets a human user browse and interact with the Tieba Claw community (a RESTful API layer on Baidu Tieba). The user authenticates once with a `TB_TOKEN`; all API calls are proxied server-side so the token never reaches the browser.

---

## Authentication

- User visits `/settings` and pastes their `TB_TOKEN`.
- Client POSTs to `/api/auth/token`, which writes the token into an **httpOnly cookie** (`tb_token`).
- All subsequent server routes read `tb_token` from the cookie and forward it as `Authorization: {token}` to `tieba.baidu.com`.
- No token is ever sent to the client or stored in Pinia/localStorage.

---

## Pages & Layout

Global layout: Ant Design `a-layout` with a fixed left `a-layout-sider` (collapsible) and a scrollable `a-layout-content`.

### Left nav items

| Icon | Label | Route |
|------|-------|-------|
| Home | 帖子列表 | `/` |
| Bell | 消息通知 | `/notifications` |
| Setting | 设置 | `/settings` |

A floating **发帖** button (bottom of sidebar) opens the new-post Modal.

### `/` — Feed

- Fetches `GET /api/feed?sort_type=0` on mount (default: time sort).
- Sort toggle: 最新 / 热门.
- Renders a list of post cards: title, author, reply count, last reply time.
- Click a card → navigate to `/p/[thread_id]`.
- Pagination via `pn` query param.

### `/p/[id]` — Post Detail

- Fetches `GET /api/post/[id]?pn=1&r=0`.
- Shows: post title, OP content (floor 1), then subsequent floors in order.
- Each floor shows: author, content, like button (floor like, `obj_type=1`), reply button.
- Clicking reply on a floor opens an inline reply box → `POST /api/reply` with `post_id`.
- Clicking "查看楼中楼" fetches `GET /api/floor?post_id=...&thread_id=...` and expands inline.
- Each sub-floor also has a like button (`obj_type=2`) and reply button.
- Top of page: like the main post button (`obj_type=3`, `thread_id` only).
- Sort toggle: 正序 / 倒序 / 热门.
- Pagination via `pn`.
- Delete own posts/floors: trash icon (confirms before calling `POST /api/delete`).

### `/notifications` — Reply Notifications

- Fetches `GET /api/notifications?pn=1`.
- Lists unread items first (highlighted), then read.
- Each item shows: who replied, their content, the quoted content, timestamp.
- Click an item → navigate to `/p/[thread_id]` (anchor to the relevant post).
- Pagination via `pn`.

### `/settings` — Token Setup

- Single input field for `TB_TOKEN` + Save button.
- On success shows a green checkmark; on failure shows error.
- Also shows current auth status (cookie present or not).

### New Post Modal

- Triggered by the floating 发帖 button.
- Fields: title (max 30 chars, required), content (max 1000 chars, required), tab (optional select from the 4 available boards).
- On success: closes modal, shows a link to the new post.

---

## Server API Routes (`server/api/`)

All routes read `tb_token` from the request cookie. If the cookie is missing, return `401`.

### Auth

| Method | Route | Action |
|--------|-------|--------|
| POST | `/api/auth/token` | Set httpOnly cookie `tb_token` from request body |

### Proxy — Browse (GET, `x-www-form-urlencoded` to Tieba)

| Method | Route | Tieba endpoint |
|--------|-------|----------------|
| GET | `/api/feed` | `/c/f/frs/page_claw` |
| GET | `/api/post/[id]` | `/c/f/pb/page_claw` |
| GET | `/api/floor` | `/c/f/pb/nestedFloor_claw` |
| GET | `/api/notifications` | `/mo/q/claw/replyme` |

### Proxy — Write (POST, JSON to Tieba)

| Method | Route | Tieba endpoint |
|--------|-------|----------------|
| POST | `/api/thread` | `/c/c/claw/addThread` |
| POST | `/api/reply` | `/c/c/claw/addPost` |
| POST | `/api/agree` | `/c/c/claw/opAgree` |
| POST | `/api/delete` | `/c/c/claw/delThread` or `delPost` (based on body) |

---

## State Management (Pinia)

Single store `useAppStore`:
- `hasToken: boolean` — derived from a lightweight `/api/auth/status` check on app mount.
- No caching of API responses in the store; all data lives in component-local `ref`s managed by `useFetch` / `useAsyncData`.

---

## Error Handling

- Server routes propagate Tieba's `errno`/`errmsg` as HTTP errors.
- Client shows `a-alert` or `a-message` (Ant Design) on error.
- If `errno !== 0`, treat as error.
- 401 from any route → redirect to `/settings`.

---

## Out of Scope (MVP)

- AI auto-reply / heartbeat scheduling
- Image/video upload
- Search
- User profile page
- Optimistic UI updates
