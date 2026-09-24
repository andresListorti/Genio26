# CLAUDE.md (functions/)

Backend for Zapatería Genaro — Express + TypeScript, deployed as a **Vercel Node.js backend**
(zero-config Express detection, project `zapateria-genaro-api`, account `andreslistorti`).
Migrated off Render in 2026-08 to eliminate free-tier cold starts (30-50s → ~1s). A first
attempt targeted Firebase Cloud Functions instead, but Firebase requires the paid Blaze plan
for *any* Cloud Function (not just 2nd gen) — abandoned in favor of Vercel, which needs no
billing method on the Hobby plan.

## Commands

Run from here (`functions/`) or from the repo root via the passthrough scripts in the root
`package.json` (`npm run dev`, `npm run test`, etc. — same names, just delegate here).

```bash
npm run dev          # ts-node-dev on src/server.ts — plain Express, hot reload
npm run build        # Compile TypeScript → dist/ (used by `start`; NOT used by the Vercel deploy itself)
npm run start        # Run compiled dist/server.js (plain Express, for local/non-Vercel hosting)
npm run typecheck    # Type-check without emitting
npm run test         # Vitest unit tests (run once)
npm run test:watch   # Vitest in watch mode

npm run seed         # Populate Firestore with sample shoes
npm run seed:admin   # Create admin user in Firestore

npm run check:paypal
npm run check:mercadopago
npm run check:mercadopago:payment
```

`npm run verify` runs `typecheck` + `test` + all three check scripts.

**Deploy**: `vercel deploy --prod` from this directory (needs `vercel login` or `VERCEL_TOKEN`).
Vercel auto-detects the Express app — no `vercel.json`, no `api/` folder, no rewrites. See
`references/node-backends.md` in the `vercel-cli` plugin skill if this ever needs revisiting.

### Testing

Vitest unit tests live next to the code as `*.test.ts`. Firestore is never hit for real —
`src/test-utils/fakeFirestore.ts` is an in-memory stand-in for the collection/doc/transaction
surface the services use, mocked in place of `src/config/firebase.ts` via `vi.mock`.
Cross-service dependencies (e.g. `order.paypal.ts` calling `paypalService`) are mocked at the
module boundary with `vi.hoisted` + `vi.mock`. Coverage: `order/*`, `cart.service`,
`shoe.service`. Controllers, `paypal.service`/`mercadopago.service`, and `email.service` are not
yet covered.

## Architecture

**Entry points**:

| File | Role |
|---|---|
| `src/app.ts` | The Express app itself — middleware, routes, error handlers. No `listen()`. Has both a named export (`app`, used by `server.ts`) and a `default` export — the default export is what Vercel's zero-config Node backend detection picks up (`src/app` is one of its recognized entrypoint names). |
| `src/server.ts` | Plain Node entrypoint (`app.listen(env.port, ...)`) for local dev (`npm run dev`) or any non-Vercel host. |

The `/webhooks` route and the general `/api` router both go through plain `express.json()` —
there's no special raw-body handling; see the payment-flows note below for why.

### Layers

| Layer | Path | Role |
|---|---|---|
| Config | `src/config/` | `env.ts` reads env vars (Vercel injects Project env vars into `process.env` automatically at runtime — no separate secrets mechanism, unlike Firebase); `firebase.ts` initializes Admin SDK — prefers a local service-account JSON file (dev), falls back to explicit `FIREBASE_*` env vars (how it runs in production on Vercel, since there's no ambient GCP credential there), and falls back further to Application Default Credentials (only relevant if this ever runs inside GCP infra again); `paypal.ts` / `mercadopago.ts` expose singleton clients |
| Models | `src/models/` | TypeScript interfaces only — no ORM, documents are written directly to Firestore |
| Routes | `src/routes/` | `index.ts` mounts `/shoes`, `/carts`, `/checkout`; `webhook.routes.ts` handles `/webhooks/paypal` and `/webhooks/mercadopago` |
| Controllers | `src/controllers/` | Thin HTTP layer — validate request shape, delegate to a service, forward errors via `next(err)` |
| Services | `src/services/` | All business logic and external API calls |

### Firestore collections

`shoes` · `carts` · `orders` — collection names are constants in `src/config/firebase.ts`.

### Payment flows

**PayPal** (redirect): `POST /api/checkout/orders` → create PayPal order → return `approveUrl` → buyer redirected back → `POST /api/checkout/orders/:orderId/capture`.

**Mercado Pago** (two paths):
1. *Checkout Bricks (seamless)*: `POST /api/checkout/mercadopago` → create preference → frontend renders Brick → `POST /api/checkout/mercadopago/process` with form data.
2. *Redirect flow*: same preference creation → buyer redirected to MP → returns to `back_url` → frontend calls `POST /api/checkout/mercadopago/confirm` with `paymentId`.

Both paths call the same `orderService.applyMercadoPagoPayment()`, which is idempotent — stock is decremented only once on the `CREATED → COMPLETED` transition.

Webhook signature verification (PayPal's `verify-webhook-signature` API call, MP's HMAC over
`id;request-id;ts`) both operate on the **parsed JSON body**, not raw bytes — there's no
`req.rawBody` dependency, which is why plain `express.json()` is enough for `/webhooks` too.

`PAYPAL_WEBHOOK_ID` is not currently set (wasn't set on Render either) — PayPal webhook
signature verification is effectively a no-op until it's added as an env var in Vercel.

### Stock reservation model

Mercado Pago orders reserve stock (`ShoeStockVariant.reserved`) at order creation to prevent overselling during in-flight payments. Available stock = `stock − reserved`. On COMPLETED, `decrementStock()` reduces `stock` and clears the reservation. On FAILED/REFUNDED, `releaseReservation()` frees the hold.

PayPal does not reserve stock — stock is decremented only on successful capture.

### Environment variables (Vercel Project → Settings → Environment Variables)

All of these are plain Vercel env vars (Production + Preview as needed) — Vercel doesn't have
a separate secrets-manager tier like Firebase did; everything is encrypted at rest uniformly:
```
CHECKOUT_ENABLED   # master payment switch — unset/false = store closed (see below)
PAYPAL_ENABLED     # PayPal switch — also needs CHECKOUT_ENABLED; off while PayPal is sandbox
FRONTEND_URL / CORS_ORIGINS
FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET / PAYPAL_API_URL / PAYPAL_FALLBACK_CURRENCY / PAYPAL_ARS_PER_USD
MERCADOPAGO_ACCESS_TOKEN / MERCADOPAGO_PUBLIC_KEY / MERCADOPAGO_WEBHOOK_SECRET
RESEND_API_KEY / RESEND_FROM_EMAIL / RESEND_ADMIN_EMAIL
SENTRY_DSN
```

**Store closed for payments.** Unless `CHECKOUT_ENABLED=true`, every Mercado Pago checkout
endpoint (`/mercadopago`, `/process`, `/confirm`) answers 503, and PayPal additionally needs
`PAYPAL_ENABLED=true`. `GET /api/checkout/status` → `{ enabled, paypal }` is what the storefront
reads to decide whether to show the pay button — flip the backend env var and redeploy, no
frontend change needed. As of 2026-09 the store is closed and MP runs on **TEST** credentials;
renewed production credentials are kept in the repo-root `.secrets/` folder for launch day.

**Payment amount is always server-side.** `createPayment` charges `order.subtotal` (never the
browser-sent `transaction_amount`), and `applyMercadoPagoPayment` refuses to fulfill an approved
payment that charged less than the order total (`FAILED` / `amount_mismatch`).

**Secrets.** Real values live only in Vercel env vars and in the gitignored repo-root `.secrets/`
folder (Firebase Admin JSON used by local dev via the default `serviceAccountFile` path, plus
`*.env` files). Never inside `functions/` (the folder uploaded on deploy) and never in chat.

`MERCADOPAGO_ACCESS_TOKEN` being empty disables all MP endpoints (returns 503). MP webhook signature verification is skipped when `MERCADOPAGO_WEBHOOK_SECRET` is empty (dev only).

PayPal does not natively support ARS; `PAYPAL_ARS_PER_USD` controls the conversion rate when currency is unsupported.

## graphify

This project has a knowledge graph at `graphify-out/` (repo root) with god nodes, community
structure, and cross-file relationships. See root `CLAUDE.md` for the query rules — after
modifying backend code here, run `graphify update .` from the repo root.
