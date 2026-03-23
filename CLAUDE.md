# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ScaleCPG is a B2B marketplace connecting cosmetic/personal care brands with verified private-label manufacturers. Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **Supabase**. It has two portals: a manufacturer dashboard (sidebar layout) and a brand portal (standalone layout).

## Development

```bash
npm run dev    # Start development server (http://localhost:3000)
npm run build  # Production build (TypeScript + Turbopack)
npm run lint   # ESLint
```

### Environment

Requires `.env.local` with:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key

## Architecture

### Tech Stack
- **Next.js 16** — App Router with `src/` directory
- **Tailwind CSS v4** — CSS-based `@theme inline` config (NOT tailwind.config.ts)
- **Supabase** — `@supabase/ssr` for server/client helpers
- **lucide-react** — Icon library
- **clsx + tailwind-merge** — `cn()` utility

### Routes

**Public:**

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/app/page.tsx` | Landing page / marketing site |
| `/login` | `src/app/login/page.tsx` | Manufacturer login/signup |
| `/brand/login` | `src/app/brand/login/page.tsx` | Brand login/signup |
| `/brand/manufacturers` | `src/app/brand/manufacturers/page.tsx` | Browse manufacturer profiles (public marketplace) |

**Manufacturer (sidebar layout, auth required):**

| Route | File | Description |
|-------|------|-------------|
| `/dashboard` | `src/app/dashboard/page.tsx` | Dashboard with 5 section cards |
| `/profile` | `src/app/profile/page.tsx` | Company info + profile SKUs for public listing |
| `/clients` | `src/app/clients/page.tsx` | Active clients grid |
| `/clients/[clientId]` | `src/app/clients/[clientId]/page.tsx` | Client detail with SKUs/Orders |
| `/orders` | `src/app/orders/page.tsx` | Order requests table with filter tabs |
| `/products` | `src/app/products/page.tsx` | Product catalog cards with filter tabs |
| `/inventory` | `src/app/inventory/page.tsx` | Inventory table with stock levels |
| `/formulations` | `src/app/formulations/page.tsx` | Formulation library (placeholder) |
| `/settings` | `src/app/settings/page.tsx` | Profile form + notifications + team |

**Brand portal (no sidebar):**

| Route | File | Description |
|-------|------|-------------|
| `/brand/dashboard` | `src/app/brand/dashboard/page.tsx` | Brand dashboard (placeholder cards) |

### Component Structure

```
src/components/
  layout/
    Sidebar.tsx          # Client component — fixed left nav (usePathname)
    TopBar.tsx           # Server component — page header + search + bell
  ui/
    FilterTabs.tsx       # Client component — URL-based filtering (searchParams)
    Badge.tsx            # Status pill badges (auto-colored by status)
    DataTable.tsx        # Reusable table with header/row/cell exports
    Modal.tsx            # Client component — portal-based modal
  cards/
    DashboardCard.tsx    # Dashboard summary card with hover animation
    ClientCard.tsx       # Active client card (links to /clients/[clientId])
    ProductCard.tsx      # Product catalog card (editable)
  orders/
    OrdersControls.tsx   # Client component — order tabs, respond/delay/shipping modals
```

### Key Files

- `src/app/globals.css` — Tailwind v4 `@theme inline` block with all design tokens
- `src/lib/utils.ts` — `cn()` helper (clsx + twMerge)
- `src/lib/constants.ts` — Nav items, status colors, accent colors
- `src/lib/auth.ts` — Role detection (`getUserRole`), guards (`requireManufacturerAdmin`, `requireBrandUser`)
- `src/lib/supabase/server.ts` — Server-side Supabase client
- `src/lib/supabase/client.ts` — Browser Supabase client
- `src/types/database.ts` — Full Supabase Database type (13 tables)
- `supabase/utils/middleware.ts` — Auth session handling, route protection, `x-pathname` header
- `supabase/migrations/` — Database migrations (001–006)

### Auth & Routing

- **Middleware** (`supabase/utils/middleware.ts`): Refreshes auth session, redirects unauthenticated users, sets `x-pathname` header for layout. Carries cookies through redirects.
- **Layout** (`src/app/layout.tsx`): Reads `x-pathname` header, derives `isAppRoute` from `NAV_ITEMS` + `SETTINGS_NAV` constants, shows sidebar for authenticated manufacturer routes.
- **Public routes**: `/`, `/login`, `/brand/login`, `/brand/manufacturers`
- **Manufacturer routes**: Sidebar shown, auth required. New routes are auto-detected from `NAV_ITEMS` in `src/lib/constants.ts`.
- **Brand routes**: No sidebar, separate layout under `/brand/`.

### Design System

**Fonts:** Cormorant Garamond (serif headings) + Outfit (sans body) via `next/font/google`

**Color tokens (Tailwind v4):** `accent-rose`, `accent-gold`, `accent-sage`, `accent-plum`, `accent-teal` (each with `-light` variant). Backgrounds: `bg-primary`, `bg-secondary`, `bg-card`. Text: `text-primary`, `text-secondary`, `text-muted`.

**Patterns:**
- Server Components by default; Client Components only for interactive bits
- Supabase data fetching in page-level server components
- `fadeInUp` animation with staggered `animationDelay` via inline styles
- URL-based filtering via `searchParams` for products/orders/inventory
- Server Actions for all mutations (in `actions.ts` co-located with pages)

### Legacy Files

Original static HTML prototypes are archived in `legacy-html/` for visual reference.
