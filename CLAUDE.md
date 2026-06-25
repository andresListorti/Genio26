# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start with ts-node-dev (hot reload)
npm run build        # Compile TypeScript → dist/
npm run start        # Run compiled output (production)
npm run typecheck    # Type-check without emitting

npm run seed         # Populate Firestore with sample shoes
npm run seed:admin   # Create admin user in Firestore

# Payment provider diagnostics (hit real sandbox APIs)
npm run check:paypal
npm run check:mercadopago
npm run check:mercadopago:payment
```

No test suite exists — `npm run verify` runs `typecheck` + all three check scripts.

## Architecture

Express 5 + TypeScript backend for Zapatería Genaro (shoe e-commerce). Deployed on Render. The frontend (Next.js/Vercel) is a separate repo.

**Request flow:** `src/index.ts` → routes → controllers → services → Firestore

The `/webhooks` route is mounted **before** `express.json()` so it receives the raw body in `req.rawBody` (needed for PayPal and Mercado Pago signature verification). All other routes go through `/api`.

### Layers

| Layer | Path | Role |
|---|---|---|
| Config | `src/config/` | `env.ts` validates required env vars at startup; `firebase.ts` initializes Admin SDK (prefers local JSON file, falls back to env vars for Render); `paypal.ts` / `mercadopago.ts` expose singleton clients |
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

### Stock reservation model

Mercado Pago orders reserve stock (`ShoeStockVariant.reserved`) at order creation to prevent overselling during in-flight payments. Available stock = `stock − reserved`. On COMPLETED, `decrementStock()` reduces `stock` and clears the reservation. On FAILED/REFUNDED, `releaseReservation()` frees the hold.

PayPal does not reserve stock — stock is decremented only on successful capture.

### Environment variables

```
PORT / NODE_ENV / FRONTEND_URL
FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET / PAYPAL_WEBHOOK_ID / PAYPAL_MODE / PAYPAL_ARS_PER_USD
MERCADOPAGO_ACCESS_TOKEN / MERCADOPAGO_PUBLIC_KEY / MERCADOPAGO_WEBHOOK_SECRET
RESEND_API_KEY / RESEND_FROM_EMAIL / RESEND_ADMIN_EMAIL
```

`FIREBASE_SERVICE_ACCOUNT_FILE` is optional — defaults to the local `sun-66f-firebase-adminsdk-*.json` file when present (dev), otherwise reads the three FIREBASE_* vars (Render).

`MERCADOPAGO_ACCESS_TOKEN` being empty disables all MP endpoints (returns 503). MP webhook signature verification is skipped when `MERCADOPAGO_WEBHOOK_SECRET` is empty (dev only).

PayPal does not natively support ARS; `PAYPAL_ARS_PER_USD` controls the conversion rate when currency is unsupported.
