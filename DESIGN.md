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

Scope: `/dashboard/listings`, `/dashboard/listings/new`, `/dashboard/listings/join`, `/dashboard/listings/manage` (Host), `/dashboard/browse`, `/dashboard/requests/requested`, `/dashboard/requests/accepted` (Nomad), and `/admin` (Members/Listings/Booking requests/Referrals all use the same tile grid now, reusing `TilePhoto`/`Badge` from `src/app/dashboard/_components/`).

Direction: **subtle, structural Y2K layered onto the same quiet palette** — not a literal retro/chrome/glossy Y2K look. The homepage's moodiness carries through; Y2K shows up only in small interface details.

- **Background**: the same `hero-bg.jpg` texture, full-bleed and fixed, but behind a heavy dark scrim (`bg-black/80`) so it reads as ambience behind dense UI rather than a hero moment. See `src/app/dashboard/layout.tsx`.
- **Layout**: data is shown as a responsive tile grid (1 column mobile → 3 columns desktop), Airbnb-card-style — never as a table or a single stacked list of rows. One intentional exception: the Nomad landing page (`/dashboard/browse`) uses a horizontal scroll-snap carousel (`ListingCarousel`) instead of a grid, so a Nomad's first joinable-rounds view reads as a single scrollable row rather than a page-filling grid. Every other list still uses the grid.
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
| Joinable-listings query (shared Host/Nomad) | `src/app/dashboard/_lib/joinableListings.ts` |
| Joinable-listings tile grid (Host landing) | `src/app/dashboard/_components/ListingGrid.tsx` |
| Joinable-listings horizontal carousel (Nomad landing) | `src/app/dashboard/_components/ListingCarousel.tsx` |
| Host landing (Post a Round / Join a Round buttons + referral) | `src/app/dashboard/listings/page.tsx` |
| Host post-a-round form | `src/app/dashboard/listings/new/page.tsx` |
| Host join-a-round grid (other Hosts' open rounds) | `src/app/dashboard/listings/join/page.tsx` |
| Host manage/accept-decline grid | `src/app/dashboard/listings/manage/page.tsx` |
| Nomad browse carousel + referral | `src/app/dashboard/browse/page.tsx` |
| Nomad requested-status tile grid | `src/app/dashboard/requests/requested/page.tsx` |
| Nomad accepted-status tile grid | `src/app/dashboard/requests/accepted/page.tsx` |
| Admin Members/Listings/Booking requests/Referrals tile grids | `src/app/admin/page.tsx` |
| Shared member intake form fields (role/email/name/phone/club or handicap) | `src/app/dashboard/_components/MemberIntakeForm.tsx` |
| "Introduce New Member" collapsible trigger (wraps a form) | `src/app/dashboard/_components/IntroduceMemberButton.tsx` |
| Host/Nomad referral submission (Introduce New Member) | `src/app/dashboard/_components/ReferralSection.tsx`, `src/app/dashboard/_lib/referralActions.ts` |
| Admin real invite (now behind Introduce New Member too) | `src/app/admin/InviteForm.tsx`, `src/app/admin/actions.ts` |
| Admin referral review (Invite / Dismiss) | `src/app/admin/ReferralActions.tsx` |
| Fonts | `src/app/fonts.ts` (split into its own file — loading two `next/font/google` fonts in one file broke Turbopack production builds) |

## Things to watch

- Don't let the Y2K layer bleed into the public homepage, or the quiet-luxury tone into something louder — the two pages intentionally read differently.
- If new record types get tile treatment later, reuse `TilePhoto`/`Badge` rather than inventing a new visual pattern.
