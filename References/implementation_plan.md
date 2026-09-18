# Retro Landing Page, Demo Mode & Split Dependencies

Build a public B&W retro landing page at `/`, implement an auto-login demo flow via `/auth?demo=true`, guard the upload flow in production behind `NEXT_PUBLIC_DEMO_MODE`, and split backend dependencies so `rembg`/`onnxruntime` don't crash low-RAM deployments.

## User Review Required

> [!IMPORTANT]
> **Auth convention**: We'll keep username-based auth. Demo credentials will be **`demo` / `Demo@123`**. The demo CTA routes to `/auth?demo=true` (not `/login`).

> [!WARNING]
> **No Next.js middleware file exists currently.** The app relies on client-side auth guards in each page's `useEffect`. The plan creates a new `middleware.ts` at the project root to handle route-level protection, which is the proper Next.js approach. Existing client-side guards will remain as a fallback.

## Proposed Changes

### Component 1 — Middleware & Public Routes

#### [NEW] [middleware.ts](file:///d:/Personal/Study/Projects/AI-Inventory/frontend/middleware.ts)

Create a Next.js Edge middleware that:
- Defines public routes: `/`, `/auth`
- Checks for a `token` in cookies (or just allows pass-through since auth is in `localStorage`)
- Since the app uses `localStorage` for JWT (not cookies), the middleware's primary role is to **exclude public routes from any future server-side auth** and serve as a documented route config. The real protection remains client-side via `useAuth` hooks.
- Uses Next.js `matcher` config to only run on app routes (exclude `_next`, static files, API).

---

### Component 2 — B&W Retro Landing Page

#### [MODIFY] [page.tsx](file:///d:/Personal/Study/Projects/AI-Inventory/frontend/src/app/page.tsx)

Complete rewrite of the root page. Key design decisions:

- **No auth redirect** — remove the `useAuth` + redirect-to-wardrobe logic. The page is fully public.
- **Strict B&W retro aesthetic**: `#000` background, `#fff` text, monospace font (`JetBrains Mono` or `IBM Plex Mono` from Google Fonts), sharp 1px white borders, no rounded corners, brutalist layout.
- **Sections:**
  1. **Hero** — Large monospace headline "THE CONTEXT-AWARE DIGITAL WARDROBE & AI STYLIST" with a blinking cursor animation.
  2. **Problem → Solution** — Two-column (stacked on mobile) card layout. Problem (decision fatigue, closet clutter) vs Solution (digital inventory, AI curation).
  3. **System Architecture** — ASCII-art style flow diagram of the FastAPI → Gemini → Next.js pipeline, built with styled `<pre>` blocks and box-drawing characters.
  4. **Engineering Notice** — A styled terminal card (green-on-black) explaining why direct upload is paused: "rembg requires ~1.2GB RAM; serverless free tiers cap at 512MB. AI Style Check and Shop Check work fully on pre-loaded items."
  5. **Demo CTA** — Display credentials in a bordered box (`demo` / `Demo@123`), with a primary "SEE DEMO →" button linking to `/auth?demo=true`.
- **Animations**: Scanline overlay effect, typing animations, subtle glitch effects on hover.

#### [MODIFY] [layout.tsx](file:///d:/Personal/Study/Projects/AI-Inventory/frontend/src/app/layout.tsx)

- Add `JetBrains Mono` (or `IBM Plex Mono`) from `next/font/google` alongside `Inter`.
- The retro font is applied only on the landing page via CSS class scoping, not globally.

#### [MODIFY] [globals.css](file:///d:/Personal/Study/Projects/AI-Inventory/frontend/src/app/globals.css)

Add new CSS classes/variables for the retro landing page:
- `.retro-*` utility classes (retro-card, retro-btn, retro-terminal, retro-heading)
- Keyframe animations: `scanline`, `blink-cursor`, `typewriter`, `glitch`
- All retro styles scoped under a `.retro-theme` parent class so they don't bleed into the existing dark/purple app theme.

#### [MODIFY] [Navbar.tsx](file:///d:/Personal/Study/Projects/AI-Inventory/frontend/src/components/Navbar.tsx)

- When not logged in (on landing page), show a minimal navbar with just the logo + "Sign In" link.
- Adjust the logo link to always go to `/` when not authenticated (already does this).

---

### Component 3 — Demo Auto-Login

#### [MODIFY] [page.tsx (auth)](file:///d:/Personal/Study/Projects/AI-Inventory/frontend/src/app/auth/page.tsx)

- Import `useSearchParams` from `next/navigation`.
- On mount, check for `?demo=true` query parameter.
- If present, pre-fill `username` with `"demo"` and `password` with `"Demo@123"`.
- After a 1-second delay, auto-trigger form submission so the user lands directly in the wardrobe.
- Show a brief "Logging you into demo..." indicator during the auto-submit.

---

### Component 4 — Frontend Demo Mode Restrictions

#### [NEW] [.env.production](file:///d:/Personal/Study/Projects/AI-Inventory/frontend/.env.production)

```env
NEXT_PUBLIC_DEMO_MODE=true
```

#### [MODIFY] [wardrobe/page.tsx](file:///d:/Personal/Study/Projects/AI-Inventory/frontend/src/app/wardrobe/page.tsx)

- Read `process.env.NEXT_PUBLIC_DEMO_MODE`.
- When `true`:
  - The "+ Add Item" button becomes disabled.
  - Clicking it opens a retro-themed modal: *"Item Digitization Paused in Demo. Use the pre-loaded wardrobe items below to test the AI Stylist and Shopping Evaluator."*
  - Style the modal in the same monochrome/terminal aesthetic.
- When `false` (local dev), the upload button works normally.

#### [NEW] [DemoModal.tsx](file:///d:/Personal/Study/Projects/AI-Inventory/frontend/src/components/DemoModal.tsx)

A reusable retro-styled modal component for demo-mode notices. Terminal-style appearance with:
- Monospace font
- `border: 1px solid #fff` on `#000` background
- ASCII-art decorations
- "UNDERSTOOD" dismiss button

---

### Component 5 — Backend Dependency Separation

#### [MODIFY] [requirements.txt](file:///d:/Personal/Study/Projects/AI-Inventory/backend/requirements.txt)

Remove `rembg`, `onnxruntime`, and `pillow` from the production requirements. Keep all other dependencies.

New contents:
```
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.35
asyncpg
psycopg2-binary
alembic==1.13.2
pydantic==2.9.0
pydantic-settings==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
cloudinary==1.41.0
httpx==0.27.0
beautifulsoup4==4.12.3
google-genai==1.0.0
python-dotenv==1.0.1
apscheduler==3.10.4
greenlet
```

#### [NEW] [requirements-dev.txt](file:///d:/Personal/Study/Projects/AI-Inventory/backend/requirements-dev.txt)

```
-r requirements.txt
rembg==2.0.84
onnxruntime
pillow
```

#### [MODIFY] [image_processor.py](file:///d:/Personal/Study/Projects/AI-Inventory/backend/app/utils/image_processor.py)

Move `from rembg import remove` and `from PIL import Image` **inside** the `remove_background()` function, wrapped in `try...except ImportError`. If import fails, raise an `ImportError` that bubbles up to the API route.

#### [MODIFY] [items.py](file:///d:/Personal/Study/Projects/AI-Inventory/backend/app/api/items.py)

- Remove the top-level `from app.utils.image_processor import remove_background`.
- Inside the `upload_item` route handler, do a lazy import:
  ```python
  try:
      from app.utils.image_processor import remove_background
  except ImportError:
      raise HTTPException(
          status_code=501,
          detail="Item digitization and background removal is paused on the live demo. Please use pre-loaded items."
      )
  ```
- This ensures the app boots fine without `rembg` — the error only surfaces when someone actually hits the upload endpoint.

---

## Verification Plan

### Automated Tests

```bash
cd frontend && npm run build
```

Build must succeed with all routes compiling, including the new landing page, modified auth page, and updated wardrobe page.

### Manual Verification

1. **Landing page** (`/`): Verify it loads without authentication, displays full B&W retro design with all 5 sections.
2. **Demo flow**: Click "SEE DEMO →", confirm redirect to `/auth?demo=true`, verify auto-fill of credentials, verify auto-login after 1s delay.
3. **Wardrobe demo guard**: In production mode (`NEXT_PUBLIC_DEMO_MODE=true`), confirm "+ Add Item" is disabled and shows the retro modal.
4. **Backend boot**: Install only `requirements.txt` (no rembg), start the FastAPI server, confirm it boots. Hit `POST /api/items/upload` and confirm `501` response.
5. **AI routes intact**: Confirm `/api/ai/recommend` and `/api/ai/evaluate-purchase` work normally.
