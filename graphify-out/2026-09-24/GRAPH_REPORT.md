# Graph Report - Code  (2026-09-24)

## Corpus Check
- 111 files · ~10,356,202 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 611 nodes · 1027 edges · 36 communities (27 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `617bd476`
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
- FakeDocSnapshot
- Migración del backend: Render → Vercel

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 23 edges
2. `express` - 17 edges
3. `env` - 17 edges
4. `compilerOptions` - 16 edges
5. `formatMoney()` - 15 edges
6. `Order` - 15 edges
7. `compilerOptions` - 15 edges
8. `scripts` - 15 edges
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

## Communities (36 total, 9 thin omitted)

### Community 0 - "order.service.ts"
Cohesion: 0.09
Nodes (33): AddCartItemInput, Cart, CartItem, Order, OrderStatus, PaymentProvider, cartService, MercadoPagoBrickFormData (+25 more)

### Community 1 - "types.ts"
Cohesion: 0.06
Nodes (45): OrderEditForm, CartPage(), metadata, metadata, generateMetadata(), getShoe, ProductPage(), CartSidebar() (+37 more)

### Community 2 - "useAuth"
Cohesion: 0.05
Nodes (52): AdminArchivePage(), ARCHIVE_STATUSES, ArchiveDashboard(), fmtDate(), STATUS_LABEL, STATUS_STYLE, AdminOrdersPage(), EDITABLE_STATUSES (+44 more)

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
Cohesion: 0.23
Nodes (7): { verifyIdToken }, { findShoeById }, shoe, collections, DocData, firestore, resetFakeFirestore()

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
Cohesion: 0.15
Nodes (3): FakeCollection, FakeFirestore, FakeTransaction

### Community 20 - "order.mercadopago.ts"
Cohesion: 0.09
Nodes (18): cartController, {
  createMercadoPagoFromCart,
  processMercadoPagoPayment,
  handleMercadoPagoWebhook,
  findById,
}, CHECKOUT_CLOSED, checkoutController, PAYPAL_DISABLED, { createFromCart, captureOrder, updateStatusByPaypalId }, { verifyWebhookSignature }, shoeController (+10 more)

### Community 21 - "shoe.service.ts"
Cohesion: 0.24
Nodes (9): Shoe, ShoeCreateInput, ShoeGender, ShoeStockVariant, ShoeUpdateInput, main(), sampleShoes, wipeShoes() (+1 more)

### Community 27 - "vitest.config.ts"
Cohesion: 0.18
Nodes (10): Architecture, CLAUDE.md (functions/), Commands, Environment variables (Vercel Project → Settings → Environment Variables), Firestore collections, graphify, Layers, Payment flows (+2 more)

### Community 28 - "fakeFirestore.ts"
Cohesion: 0.29
Nodes (5): collections, firebaseAdmin, firestore, AuthedRequest, requireAdmin()

### Community 29 - ".runTransaction"
Cohesion: 0.36
Nodes (9): adminNotificationHtml(), confirmationHtml(), emailService, esc(), itemRows(), money(), orderText(), order (+1 more)

### Community 32 - "webhook.controller.ts"
Cohesion: 0.08
Nodes (28): apiRateLimit, app, env, frontendUrl, isMercadoPagoConfigured(), getMercadoPago(), MercadoPagoClients, paypalClient (+20 more)

### Community 38 - "Migración del backend: Render → Vercel"
Cohesion: 0.33
Nodes (5): Migración del backend: Render → Vercel, Nota de seguridad, Qué se hizo, Sobre Render, Webhooks — hecho

## Knowledge Gaps
- **228 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+223 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `FakeDocSnapshot` connect `FakeDocSnapshot` to `layout.tsx`, `useAuth`?**
  _High betweenness centrality (0.220) - this node is a cross-community bridge._
- **Why does `express` connect `order.mercadopago.ts` to `webhook.controller.ts`, `layout.tsx`, `fakeFirestore.ts`, `express`?**
  _High betweenness centrality (0.170) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _228 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `order.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0861952861952862 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05506329113924051 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.05030181086519115 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._