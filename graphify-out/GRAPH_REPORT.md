# Graph Report - Code  (2026-09-24)

## Corpus Check
- 114 files · ~10,360,406 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 638 nodes · 1070 edges · 49 communities (36 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d57685d1`
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
- page.tsx
- page.tsx
- check-mercadopago-payment.ts
- page.tsx
- Migración del backend: Render → Vercel
- order.paypal.test.ts
- package.json
- eslint-config-next
- jsdom
- @testing-library/jest-dom
- @types/react
- @types/react-dom
- typescript
- vitest

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 23 edges
2. `express` - 18 edges
3. `env` - 17 edges
4. `👞 Zapatería Genaro — la tienda online` - 17 edges
5. `compilerOptions` - 16 edges
6. `Order` - 16 edges
7. `formatMoney()` - 15 edges
8. `compilerOptions` - 15 edges
9. `scripts` - 14 edges
10. `scripts` - 13 edges

## Surprising Connections (you probably didn't know these)
- `AdminArchivePage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/admin/archive/page.tsx → frontend/src/context/AuthContext.tsx
- `AdminOrdersPage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/admin/orders/page.tsx → frontend/src/context/AuthContext.tsx
- `AdminPage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/admin/page.tsx → frontend/src/context/AuthContext.tsx
- `ProfilePage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/profile/page.tsx → frontend/src/context/AuthContext.tsx
- `ArchiveDashboard()` --calls--> `formatMoney()`  [EXTRACTED]
  frontend/src/app/admin/archive/page.tsx → frontend/src/lib/format.ts

## Import Cycles
- None detected.

## Communities (49 total, 13 thin omitted)

### Community 0 - "order.service.ts"
Cohesion: 0.07
Nodes (46): isMercadoPagoConfigured(), getMercadoPago(), MercadoPagoClients, AddCartItemInput, Cart, CartItem, Order, OrderStatus (+38 more)

### Community 1 - "types.ts"
Cohesion: 0.06
Nodes (42): CartPage(), metadata, metadata, generateMetadata(), getShoe, ProductPage(), CartSidebar(), CatalogClient() (+34 more)

### Community 2 - "useAuth"
Cohesion: 0.33
Nodes (5): getErrorMessage(), LoginPage(), getErrorMessage(), RegisterPage(), useAuth()

### Community 3 - "scripts"
Cohesion: 0.11
Nodes (17): description, name, private, scripts, build, check:mercadopago, check:mercadopago:payment, check:paypal (+9 more)

### Community 4 - "devDependencies"
Cohesion: 0.15
Nodes (13): firebase, dependencies, firebase, lucide-react, next, react, react-dom, @sentry/nextjs (+5 more)

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
Cohesion: 0.18
Nodes (9): env, frontendUrl, paypalClient, main(), maskTail(), buildCurrencyConverter(), PAYPAL_SUPPORTED_CURRENCIES, PaypalOrderResult (+1 more)

### Community 10 - "Architecture"
Cohesion: 0.06
Nodes (29): API client, Architecture, Commands, Environment variables, Important: Next.js version, Key directories, Pages, Security headers (+21 more)

### Community 11 - "Architecture"
Cohesion: 0.40
Nodes (3): Deployment, graphify, Repo layout

### Community 12 - "email.service.ts"
Cohesion: 0.13
Nodes (15): eslint, devDependencies, eslint, tailwindcss, @tailwindcss/postcss, @testing-library/react, @testing-library/user-event, @types/node (+7 more)

### Community 13 - "README.md"
Cohesion: 0.16
Nodes (6): { createFromCart, captureOrder, updateStatusByPaypalId }, { verifyWebhookSignature }, { webhookSecret }, verifyMercadoPagoSignature(), webhookController, orderService

### Community 14 - "ProfileRequiredModal.tsx"
Cohesion: 0.05
Nodes (14): { verifyIdToken }, cartService, { findShoeById }, shoe, collections, DocData, FakeCollection, FakeDocRef (+6 more)

### Community 20 - "order.mercadopago.ts"
Cohesion: 0.14
Nodes (10): { createMercadoPagoFromCart, findById }, fullOrder, { verifyIdToken }, {
  createMercadoPagoFromCart,
  processMercadoPagoPayment,
  handleMercadoPagoWebhook,
  findById,
}, CHECKOUT_CLOSED, checkoutController, PAYPAL_DISABLED, toPublicOrder() (+2 more)

### Community 21 - "shoe.service.ts"
Cohesion: 0.13
Nodes (15): collections, firebaseAdmin, firestore, shoeController, requireAdmin(), Shoe, ShoeCreateInput, ShoeGender (+7 more)

### Community 27 - "vitest.config.ts"
Cohesion: 0.18
Nodes (10): Architecture, CLAUDE.md (functions/), Commands, Environment variables (Vercel Project → Settings → Environment Variables), Firestore collections, graphify, Layers, Payment flows (+2 more)

### Community 28 - "fakeFirestore.ts"
Cohesion: 0.39
Nodes (5): cartController, router, router, router, express

### Community 29 - ".runTransaction"
Cohesion: 0.36
Nodes (9): adminNotificationHtml(), confirmationHtml(), emailService, esc(), itemRows(), money(), orderText(), order (+1 more)

### Community 30 - "shoeImage"
Cohesion: 0.31
Nodes (8): AdminDashboard(), AdminPage(), blankForm(), CATEGORIES, ProductForm, RESOURCE_IMAGES, shoeToForm(), ShoeStockVariant

### Community 31 - "AuthProvider"
Cohesion: 0.20
Nodes (7): inter, metadata, playfair, Footer(), NAV_LINKS, Navbar(), SearchBar()

### Community 32 - "webhook.controller.ts"
Cohesion: 0.21
Nodes (7): apiRateLimit, app, errorHandler(), HttpError, notFoundHandler(), { nodeEnv }, router

### Community 33 - "FakeDocSnapshot"
Cohesion: 0.27
Nodes (8): AuthContext, AuthContextValue, ProfileUpdate, authHeaders(), auth, db, firebaseConfig, googleProvider

### Community 34 - "page.tsx"
Cohesion: 0.24
Nodes (8): AdminArchivePage(), ARCHIVE_STATUSES, ArchiveDashboard(), fmtDate(), STATUS_LABEL, STATUS_STYLE, AdminNav(), TABS

### Community 35 - "page.tsx"
Cohesion: 0.23
Nodes (11): AdminOrdersPage(), EDITABLE_STATUSES, fmtCurrency(), fmtDate(), OrderEditForm, OrdersDashboard(), orderToForm(), STATUS_COLORS (+3 more)

### Community 36 - "check-mercadopago-payment.ts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, start, test, test:watch

### Community 37 - "page.tsx"
Cohesion: 0.32
Nodes (7): fmtDate(), ProfileContent(), ProfilePage(), StatusBadge(), statusLabel(), UserProfile, Order

### Community 38 - "Migración del backend: Render → Vercel"
Cohesion: 0.33
Nodes (5): Migración del backend: Render → Vercel, Nota de seguridad, Qué se hizo, Sobre Render, Webhooks — hecho

### Community 39 - "order.paypal.test.ts"
Cohesion: 0.40
Nodes (3): AuthProvider(), fakeUser, {
  onAuthStateChangedMock,
  signInMock,
  signUpMock,
  signInWithPopupMock,
  signOutMock,
  updateProfileMock,
  docMock,
  getDocMock,
  setDocMock,
  updateDocMock,
}

### Community 41 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

## Knowledge Gaps
- **245 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+240 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthProvider()` connect `order.paypal.test.ts` to `FakeDocSnapshot`, `AuthProvider`?**
  _High betweenness centrality (0.215) - this node is a cross-community bridge._
- **Why does `FakeDocSnapshot` connect `ProfileRequiredModal.tsx` to `order.paypal.test.ts`?**
  _High betweenness centrality (0.211) - this node is a cross-community bridge._
- **Why does `express` connect `fakeFirestore.ts` to `webhook.controller.ts`, `express`, `README.md`, `ProfileRequiredModal.tsx`, `order.mercadopago.ts`, `shoe.service.ts`?**
  _High betweenness centrality (0.157) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _245 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `order.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06648575305291723 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05741626794258373 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._