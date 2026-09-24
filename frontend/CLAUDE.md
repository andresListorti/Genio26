# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js version

This project uses **Next.js 16**, which has breaking changes vs. prior versions. APIs, conventions, and file structure may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any Next.js-specific code, and heed deprecation notices.

## Commands

```bash
npm run dev         # Start on http://localhost:3001 (Turbopack)
npm run build       # Production build
npm run lint        # ESLint
npm run test        # Vitest unit tests (run once)
npm run test:watch  # Vitest in watch mode
```

### Testing

Vitest + Testing Library, jsdom environment (`vitest.config.ts` + `vitest.setup.ts`). Tests live next to the code as `*.test.tsx`. `firebase/auth` and `firebase/firestore` are mocked at the package boundary (via `vi.hoisted` + `vi.mock`) rather than through `src/lib/firebase.ts` directly, since `AuthContext` imports SDK functions straight from those packages. Coverage today: `CartContext`, `AuthContext`. Components and pages are not yet covered.

## Architecture

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 frontend for Zapatería Genaro. Deployed on Vercel. Talks to the Express backend (default `http://localhost:3000`).

### Key directories

| Path | Purpose |
|---|---|
| `src/app/` | App Router pages — route segments map directly to URLs |
| `src/components/` | Shared UI components |
| `src/context/` | `AuthContext` (Firebase Auth + user profile) and `CartContext` (cart state + API calls) |
| `src/lib/api.ts` | Typed `fetch` wrapper; all backend calls go through here |
| `src/lib/types.ts` | Shared type definitions mirroring backend models |
| `src/lib/firebase.ts` | Firebase Client SDK initialization |

### State management

**`AuthContext`** wraps Firebase Auth. On sign-in it reads/creates a profile document in the Firestore `users` collection. `profile.role` (`"user"` | `"admin"`) gates admin routes. Exposes `user`, `profile`, `loading`, `signIn`, `signUp`, `signInWithGoogle`, `logout`, `updateUserProfile`.

**`CartContext`** persists the cart ID in `localStorage` under the key `genaro.cartId`. On mount it re-fetches the cart from the API using that stored ID. `updateQuantity` has no backend decrement endpoint — quantity increases add the delta, decreases remove the line and re-add the desired amount. `resetCart()` clears local state and localStorage after a completed purchase (the backend already empties the cart server-side).

### API client

`src/lib/api.ts` exports a typed `api` object. All calls use `cache: "no-store"`. The base URL is `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:3000`). Responses follow the backend's `{ data: T }` envelope, unwrapped automatically.

### Pages

| Route | Page |
|---|---|
| `/` | Home (Hero + catalog) |
| `/collections/men` · `/collections/women` | Filtered catalog by gender |
| `/products/[id]` | Product detail + add to cart |
| `/cart` | Cart page — the only place payment happens. Asks the backend `GET /api/checkout/status`; while closed it shows "Estamos preparando la tienda" instead of the pay button, and PayPal is offered only if the backend says so |
| `/checkout` | Checkout (MP Bricks or PayPal) |
| `/checkout/success` · `/pending` · `/failure` | MP redirect landing pages |
| `/login` · `/register` · `/profile` | Auth + profile |
| `/admin` · `/admin/orders` · `/admin/archive` | Admin panel (role-gated) |

### Environment variables

```
NEXT_PUBLIC_API_BASE_URL      # Backend URL (default: http://localhost:3000)
NEXT_PUBLIC_APP_URL           # Public frontend URL for OG metadata
NEXT_PUBLIC_FIREBASE_*        # Firebase client config keys
NEXT_PUBLIC_SENTRY_DSN        # Sentry error tracking — leave empty to disable
```

### Security headers

`vercel.json` sets the security headers. The CSP is split: `frame-ancestors`, `object-src` and
`base-uri` are enforced; the full allowlist (Mercado Pago SDK/Bricks, Firebase Auth / Google
sign-in, Sentry, backend API) is `Content-Security-Policy-Report-Only`. Before launch, open the
site with checkout enabled, go through login + a test payment, check the console for CSP
reports, then rename the header to `Content-Security-Policy`. Payment calls send the Firebase ID
token (`authHeaders()` in `lib/api.ts`).

### Styling

Tailwind CSS v4 via `@tailwindcss/postcss`. Fonts: `--font-inter` (body) and `--font-playfair` (display/headings), both loaded via `next/font/google` in the root layout. Allowed image domains: `images.unsplash.com`, `lh3.googleusercontent.com`.
