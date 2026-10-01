# Reciprocal — Design Reference

This records the visual direction agreed on for the site, so future work stays consistent without re-deriving it from scratch. Two distinct design languages exist in the product, scoped to different audiences.

## 1. Public marketing site (`/`)

The only page a non-member ever sees. Tone: quiet, exclusive, understated confidence — more private members' club than consumer product.

- **Background**: a dark, moody monochrome photo (`public/hero-bg.jpg`) — a tiled 4×2 mosaic of the same textured image, visible seams included. This is a deliberate effect, not an artifact — do not crop it down to a single clean tile.
- **Typography**: [Archivo](https://fonts.google.com/specimen/Archivo) (`src/app/fonts.ts`), extra-light/thin weights (200–300), uppercase, wide letter-spacing (`tracking-[0.12em]` to `tracking-[0.5em]` depending on size). This is the *only* typeface on the public page.
- **Color**: near-black (`#0a0a0a`) background, cream/off-white text (`#f2ede4` / `#f7f3ea`). No accent color.
- **Buttons**: thin bordered pill, transparent background, all-caps label, wide tracking, hover inverts to filled.
- **Logo**: `public/reciprocal-logo.png` — a cropped wordmark image, not live text, sitting inside an `<h1>` for accessibility.
- **Body copy**: normal sentence case (not all-caps) — this was a deliberate correction partway through the build; don't re-apply `uppercase` to the paragraph copy.
- Reference: `src/app/page.tsx`.

## 2. Authenticated product (Host/Nomad dashboard)

Scope: `/dashboard/listings` (Host), `/dashboard/browse` and `/dashboard/requests` (Nomad). **Not** `/admin` — that stays a plain internal tool (tables, no tile treatment, no special styling) since it's for the founder alone, not a branded member experience.

Direction: **subtle, structural Y2K layered onto the same quiet palette** — not a literal retro/chrome/glossy Y2K look. The homepage's moodiness carries through; Y2K shows up only in small interface details.

- **Background**: the same `hero-bg.jpg` texture, full-bleed and fixed, but behind a heavy dark scrim (`bg-black/80`) so it reads as ambience behind dense UI rather than a hero moment. See `src/app/dashboard/layout.tsx`.
- **Layout**: data is shown as a responsive tile grid (1 column mobile → 3 columns desktop), Airbnb-card-style — never as a table or a single stacked list of rows.
- **Tile photo**: each tile's "image" area is a different crop/zoom of the same `hero-bg.jpg`, picked deterministically by hashing the record's id (`src/app/dashboard/_components/TilePhoto.tsx`). No real photography needed — new listings automatically get a visually distinct tile for free.
- **Y2K detail #1 — corner brackets**: thin L-shaped marks at each tile photo's four corners (camera-viewfinder / HUD motif). Built into `TilePhoto`.
- **Y2K detail #2 — bracketed status badges**: status reads as `[ OPEN ]`, `[ ACCEPTED ]` etc., in monospace, not a plain colored pill (`src/app/dashboard/_components/Badge.tsx`).
- **Typography**: two-tier system —
  - **Archivo** (same as homepage) for headings, body copy, and button labels.
  - **JetBrains Mono** (`--font-jetbrains-mono`, added in `src/app/fonts.ts`) for small metadata: field labels, meta lines (date/time/fee), status text. This is what carries the "technical/terminal" Y2K feel.
- **No new accent color** — same near-black/cream palette as the homepage throughout. Resist the urge to add chrome gradients, glossy highlights, or a bright accent; that's the "bolder Y2K" direction that was explicitly *not* chosen.

### Component reference

| Piece | File |
|---|---|
| Tile photo w/ corner brackets | `src/app/dashboard/_components/TilePhoto.tsx` |
| Bracketed status badge | `src/app/dashboard/_components/Badge.tsx` |
| Dashboard chrome (nav, background, logout) | `src/app/dashboard/layout.tsx` |
| Host tile grid | `src/app/dashboard/listings/page.tsx` |
| Nomad browse tile grid | `src/app/dashboard/browse/page.tsx` |
| Nomad request history tile grid | `src/app/dashboard/requests/page.tsx` |
| Fonts | `src/app/fonts.ts` (split into its own file — loading two `next/font/google` fonts in one file broke Turbopack production builds) |

## Things to watch

- Don't let the Y2K layer bleed into the public homepage, or the quiet-luxury tone into something louder — the two pages intentionally read differently.
- If new record types get tile treatment later, reuse `TilePhoto`/`Badge` rather than inventing a new visual pattern.
- Admin (`/admin`) is explicitly out of scope for this treatment unless asked otherwise.
