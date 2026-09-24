# Graph Report - Code  (2026-09-24)

## Corpus Check
- 110 files · ~10,355,700 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 606 nodes · 1015 edges · 36 communities (29 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1f74eb0b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- order.service.ts
- types.ts
- useAuth
- scripts
- devDependencies
- compilerOptions
- compilerOptions
- express
- dependencies
- layout.tsx
- Architecture
- Architecture
- email.service.ts
- README.md
- ProfileRequiredModal.tsx
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- vercel.json
- order.mercadopago.ts
- shoe.service.ts
- register
- vitest.config.ts
- fakeFirestore.ts
- .runTransaction
- shoeImage
- AuthProvider
- webhook.controller.ts
- AuthContext.tsx
- Migración del backend: Render → Vercel

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 23 edges
2. `express` - 17 edges
3. `env` - 17 edges
4. `compilerOptions` - 16 edges
5. `formatMoney()` - 15 edges
6. `compilerOptions` - 15 edges
7. `scripts` - 15 edges
8. `Order` - 14 edges
9. `scripts` - 13 edges
10. `useCart()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `AdminArchivePage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/admin/archive/page.tsx → frontend/src/context/AuthContext.tsx
- `ArchiveDashboard()` --calls--> `formatMoney()`  [EXTRACTED]
  frontend/src/app/admin/archive/page.tsx → frontend/src/lib/format.ts
- `OrderEditForm` --references--> `OrderStatus`  [EXTRACTED]
  frontend/src/app/admin/orders/page.tsx → frontend/src/lib/types.ts
- `AdminOrdersPage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/admin/orders/page.tsx → frontend/src/context/AuthContext.tsx
- `AdminPage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/admin/page.tsx → frontend/src/context/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (36 total, 7 thin omitted)

### Community 0 - "order.service.ts"
Cohesion: 0.09
Nodes (33): AddCartItemInput, Cart, CartItem, Order, OrderStatus, PaymentProvider, cartService, MercadoPagoBrickFormData (+25 more)

### Community 1 - "types.ts"
Cohesion: 0.13
Nodes (15): metadata, metadata, CollectionView(), CollectionViewProps, matches(), CartContextValue, api, Cart (+7 more)

### Community 2 - "useAuth"
Cohesion: 0.06
Nodes (45): AdminArchivePage(), ARCHIVE_STATUSES, ArchiveDashboard(), fmtDate(), STATUS_LABEL, STATUS_STYLE, AdminOrdersPage(), EDITABLE_STATUSES (+37 more)

### Community 3 - "scripts"
Cohesion: 0.11
Nodes (18): description, name, private, scripts, build, check:mercadopago, check:mercadopago:payment, check:paypal (+10 more)

### Community 4 - "devDependencies"
Cohesion: 0.08
Nodes (23): firebase, dependencies, firebase, lucide-react, next, react, react-dom, @sentry/nextjs (+15 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 6 - "compilerOptions"
Cohesion: 0.09
Nodes (21): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, ignoreDeprecations, lib, module, moduleResolution (+13 more)

### Community 7 - "express"
Cohesion: 0.05
Nodes (41): author, description, devDependencies, ts-node-dev, @types/cors, @types/express, @types/node, @types/paypal__checkout-server-sdk (+33 more)

### Community 8 - "dependencies"
Cohesion: 0.10
Nodes (21): cors, dotenv, express, express-rate-limit, firebase-admin, dependencies, cors, dotenv (+13 more)

### Community 9 - "layout.tsx"
Cohesion: 0.20
Nodes (7): inter, metadata, playfair, Footer(), NAV_LINKS, Navbar(), SearchBar()

### Community 10 - "Architecture"
Cohesion: 0.17
Nodes (10): API client, Architecture, Commands, Environment variables, Important: Next.js version, Key directories, Pages, State management (+2 more)

### Community 11 - "Architecture"
Cohesion: 0.40
Nodes (3): Deployment, graphify, Repo layout

### Community 12 - "email.service.ts"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, jsdom, tailwindcss, @tailwindcss/postcss (+21 more)

### Community 13 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 14 - "ProfileRequiredModal.tsx"
Cohesion: 0.06
Nodes (13): { verifyIdToken }, { findShoeById }, shoe, collections, DocData, FakeCollection, FakeDocRef, FakeDocSnapshot (+5 more)

### Community 20 - "order.mercadopago.ts"
Cohesion: 0.08
Nodes (20): cartController, {
  createMercadoPagoFromCart,
  processMercadoPagoPayment,
  handleMercadoPagoWebhook,
  findById,
}, CHECKOUT_CLOSED, checkoutController, PAYPAL_DISABLED, { createFromCart, captureOrder, updateStatusByPaypalId }, { verifyWebhookSignature }, shoeController (+12 more)

### Community 21 - "shoe.service.ts"
Cohesion: 0.16
Nodes (13): collections, firebaseAdmin, firestore, AuthedRequest, Shoe, ShoeCreateInput, ShoeGender, ShoeStockVariant (+5 more)

### Community 27 - "vitest.config.ts"
Cohesion: 0.18
Nodes (10): Architecture, CLAUDE.md (functions/), Commands, Environment variables (Vercel Project → Settings → Environment Variables), Firestore collections, graphify, Layers, Payment flows (+2 more)

### Community 28 - "fakeFirestore.ts"
Cohesion: 0.24
Nodes (10): CartPage(), CartSidebar(), CheckoutResult(), ProductDetailClient(), CartContext, CartProvider(), { cartCreate, cartGet, cartAddItem, cartRemoveItem, cartClear, checkoutCreateOrder }, useCart() (+2 more)

### Community 29 - ".runTransaction"
Cohesion: 0.33
Nodes (4): OrderEditForm, MercadoPagoBrickProps, Window, OrderStatus

### Community 30 - "shoeImage"
Cohesion: 0.21
Nodes (12): generateMetadata(), getShoe, ProductPage(), CatalogClient(), matches(), ProductCard(), BY_CATEGORY, BY_MODEL (+4 more)

### Community 31 - "AuthProvider"
Cohesion: 0.27
Nodes (3): CheckoutResultFallback(), CheckoutVariant, COPY

### Community 32 - "webhook.controller.ts"
Cohesion: 0.08
Nodes (32): apiRateLimit, app, env, frontendUrl, isMercadoPagoConfigured(), getMercadoPago(), MercadoPagoClients, paypalClient (+24 more)

### Community 38 - "Migración del backend: Render → Vercel"
Cohesion: 0.33
Nodes (5): Migración del backend: Render → Vercel, Nota de seguridad, Qué se hizo, Sobre Render, Webhooks — hecho

## Knowledge Gaps
- **226 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+221 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthProvider()` connect `useAuth` to `layout.tsx`?**
  _High betweenness centrality (0.224) - this node is a cross-community bridge._
- **Why does `FakeDocSnapshot` connect `ProfileRequiredModal.tsx` to `useAuth`?**
  _High betweenness centrality (0.220) - this node is a cross-community bridge._
- **Why does `express` connect `order.mercadopago.ts` to `webhook.controller.ts`, `shoe.service.ts`, `ProfileRequiredModal.tsx`, `express`?**
  _High betweenness centrality (0.171) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _226 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `order.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0861952861952862 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13105413105413105 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.06253652834599649 - nodes in this community are weakly interconnected._