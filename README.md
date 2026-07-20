# RenewCred CMS — Frontend Engineering Assignment

A decoupled, headless CMS built for the RenewCred assignment. Administrators manage
page content (headings, paragraphs, nested lists, tables, LaTeX equations, callouts,
images) through a protected Admin Dashboard. The public-facing site renders that
content dynamically — nothing is hardcoded.

```
cms-assignment/
├── docker-compose.yml       # spins up mongo + backend + admin + public
├── .env.example             # root-level env template (used by docker-compose)
├── backend/                 # Express + MongoDB API
├── admin-frontend/          # React + Redux Toolkit admin panel (Vite)
└── public-frontend/         # React public site that consumes the API (Vite)
```

## 1. Technology choices

| Layer | Choice | Why |
|---|---|---|
| Backend | Express.js + MongoDB (Mongoose) | Matches the assignment's preferred stack; Mongo's flexible documents suit a block-based content schema well. |
| Auth | JWT (bcryptjs for hashing) | Stateless, simple to protect admin routes with middleware, no session store needed. |
| Admin frontend | React + Vite + Redux Toolkit | Redux Toolkit holds shared/server state (auth session, page list, current page); per-block editing UI state stays local to components since it's transient and doesn't need to be shared. |
| Public frontend | React + Vite | Lightweight, fast dev server. *(The brief listed Next.js as preferred; see **Assumptions** below for why Vite+React was used instead, and how to swap it in.)* |
| Styling | Tailwind CSS | Fast to build a clean, responsive UI without hand-rolled CSS. |
| Rich content | Custom block-based JSON schema (not raw HTML) | Storing typed blocks (`header`, `paragraph`, `list`, `table`, `equation`, `callout`, `image`) instead of freeform HTML makes content safe to render (no `dangerouslySetInnerHTML`), easy to validate server-side, and simple to extend with new block types later. |
| Math rendering | KaTeX / `react-katex` | Renders raw LaTeX stored in `equation` blocks, both inline and block-mode. |
| Validation | Zod | Schema-validates all write requests before they touch the database. |
| Infra | Docker + docker-compose | One command spins up the database and all three services together. |

## 2. Architecture overview

```
Admin Frontend (React+Redux)  --JWT-protected REST-->  Express API  <--> MongoDB
Public Frontend (React)       --public, read-only  -->  Express API
```

- **Content model**: a `Page` document has a `slug`, `status` (`draft`/`published`),
  and an ordered array of `blocks`. Each block has a `type` and a `data` payload whose
  shape depends on `type` (see `backend/src/models/Page.js` for the full contract).
  This is the same "block-based schema" pattern used by editors like Notion/Editor.js —
  it scales to new content shapes without a schema migration.
- **API surface**:
  - `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
  - Admin (JWT-protected): `GET/POST /api/v1/content/pages`, `GET/PUT/DELETE /api/v1/content/pages/:id`
  - Public (read-only, published-only): `GET /api/v1/content/public`, `GET /api/v1/content/public/:slug`
- **State management split**: Redux Toolkit owns things that are genuinely shared or
  need to persist across route changes — the auth session/token and the list/current
  page from the server. In-progress form state inside the block editor (which field is
  being typed into, unsaved block order, etc.) is local `useState`, because it's
  ephemeral UI state scoped to a single screen, and pushing every keystroke through
  Redux would add indirection without benefit.
- **Rendering**: the public frontend's `BlockRenderer.jsx` switches on `block.type` and
  renders each block type appropriately, including recursively rendering nested list
  items and typesetting LaTeX via KaTeX. This mirrors the admin's `BlockEditor.jsx`,
  which provides a form UI for authoring the same block types (including add/remove
  rows & columns for tables, and add/remove nested items for lists).

## 3. Assumptions

- **Next.js → Vite+React for the public frontend**: the assignment lists Next.js as a
  *preferred*, not required, stack ("You are free to choose technologies where
  appropriate"). Vite+React was used for both frontends to keep the two apps
  consistent and the setup simple for local evaluation. The API is a plain REST
  service, so migrating `public-frontend` to Next.js later is a rendering-layer change
  only — `BlockRenderer.jsx` and the API contract can be reused as-is.
- **MongoDB over PostgreSQL**: chosen because the content schema is inherently
  polymorphic (`data` varies per block `type`), which Mongo's flexible documents model
  more naturally than relational tables/JSON columns.
- **Single admin role model with `admin`/`editor` enum on the schema**: only `login`
  is required by the brief; the `role` field is scaffolded for future permission tiers
  but not currently enforced beyond "authenticated or not."
- **One content type ("Page")**: the Figma covers a single-page marketing/informational
  layout, so one flexible `Page` model with ordered blocks was sufficient to cover
  every section (hero/header, text, lists, tables, formulas). Additional content types
  (e.g. a blog `Post` model) would follow the same block pattern.
- **Inline markup in paragraphs**: paragraph/list text supports light `**bold**`,
  `*italic*`, and `$inline math$` markup (parsed in `BlockRenderer.jsx`) rather than a
  full rich-text/WYSIWYG editor (TipTap/Editor.js), to keep the block JSON simple,
  predictable, and easy to validate server-side within the assignment's scope.
- **Docker networking**: because Vite bakes `VITE_*` env vars in at *build* time, the
  frontend Dockerfiles accept `VITE_API_URL` / `VITE_PUBLIC_API_URL` as build args
  (see `docker-compose.yml`) rather than runtime environment variables.

## 4. Setup instructions

### Option A — Docker (recommended, one command)

```bash
cp .env.example .env        # edit JWT_SECRET / seed admin credentials if you like
docker compose up --build
```

Once containers are healthy, seed the database (creates the admin user + a sample
"home" page with headings, a nested list, a table, and an equation):

```bash
docker compose exec backend npm run seed
```

Then visit:
- Admin panel: **http://localhost:5173** (login below)
- Public site: **http://localhost:5174**
- API health check: **http://localhost:5000/api/v1/health**

### Option B — Run locally without Docker

Requires Node.js 18+/20+ and a local or remote MongoDB instance.

```bash
# 1. Backend
cd backend
cp .env.example .env        # point MONGO_URI at your MongoDB instance
npm install
npm run seed                # creates admin user + sample page
npm run dev                 # http://localhost:5000

# 2. Admin frontend (new terminal)
cd admin-frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173

# 3. Public frontend (new terminal)
cd public-frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5174
```

## 5. Evaluation credentials

Seeded by `npm run seed` (values come from `backend/.env`, defaults below):

```
Email:    admin@renewcred.test
Password: Admin@12345
```

A sample published page (`/home`) is also seeded so the public site isn't empty on
first load — edit or delete it from the admin panel to see the public site update
immediately.

## 6. Trying it out

1. Log into the admin panel and open **Pages → Home**.
2. Edit a block (e.g. change the equation or add a table row), set status to
   **Published**, and save.
3. Reload the public site at `http://localhost:5174` — the change appears immediately,
   confirming content flows CMS → API → public site with no hardcoded data.
4. Create a new page from the dashboard, add a mix of block types, publish it, and
   visit `http://localhost:5174/<your-slug>` to see it render.

## 7. Possible next steps (out of scope for this submission)

- Swap the hand-rolled block editor for TipTap/Editor.js for a true WYSIWYG authoring
  experience while keeping the same JSON block output contract.
- Add image upload (S3/Cloudinary) instead of raw URL entry for `image` blocks.
- Add role-based permissions (`admin` vs `editor`) using the already-scaffolded `role` field.
- Add pagination/search to the admin pages list as content volume grows.
