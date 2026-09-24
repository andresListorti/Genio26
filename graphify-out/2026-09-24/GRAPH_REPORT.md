# Graph Report - Code  (2026-09-24)

## Corpus Check
- 113 files · ~10,357,838 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 622 nodes · 1053 edges · 41 communities (35 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `84a3015a`
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

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 23 edges
2. `express` - 18 edges
3. `env` - 17 edges
4. `compilerOptions` - 16 edges
5. `Order` - 16 edges
6. `formatMoney()` - 15 edges
7. `compilerOptions` - 15 edges
8. `scripts` - 15 edges
9. `scripts` - 13 edges
10. `useCart()` - 12 edges

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

## Communities (41 total, 6 thin omitted)

### Community 0 - "order.service.ts"
Cohesion: 0.17
Nodes (16): CartItem, Order, OrderStatus, PaymentProvider, cartService, cleanupPendingOrders(), fulfillOrder(), notifyOrderCompleted() (+8 more)

### Community 1 - "types.ts"
Cohesion: 0.06
Nodes (45): OrderEditForm, CartPage(), metadata, metadata, generateMetadata(), getShoe, ProductPage(), CartSidebar() (+37 more)

### Community 2 - "useAuth"
Cohesion: 0.21
Nodes (8): getErrorMessage(), LoginPage(), getErrorMessage(), RegisterPage(), NAV_LINKS, Navbar(), SearchBar(), useAuth()

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
Cohesion: 0.14
Nodes (11): paypalClient, AddCartItemInput, Cart, cart, { createPreference, createPayment, getPayment }, { findCartById, clearCart }, { reserveStock, decrementStock, releaseReservation }, { sendOrderConfirmation, sendAdminNotification } (+3 more)

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
Cohesion: 0.07
Nodes (26): cartController, { createMercadoPagoFromCart, findById }, fullOrder, { verifyIdToken }, {
  createMercadoPagoFromCart,
  processMercadoPagoPayment,
  handleMercadoPagoWebhook,
  findById,
}, CHECKOUT_CLOSED, checkoutController, PAYPAL_DISABLED (+18 more)

### Community 21 - "shoe.service.ts"
Cohesion: 0.17
Nodes (12): collections, firebaseAdmin, firestore, Shoe, ShoeCreateInput, ShoeGender, ShoeStockVariant, ShoeUpdateInput (+4 more)

### Community 27 - "vitest.config.ts"
Cohesion: 0.18
Nodes (10): Architecture, CLAUDE.md (functions/), Commands, Environment variables (Vercel Project → Settings → Environment Variables), Firestore collections, graphify, Layers, Payment flows (+2 more)

### Community 28 - "fakeFirestore.ts"
Cohesion: 0.22
Nodes (12): isMercadoPagoConfigured(), getMercadoPago(), MercadoPagoClients, classifyToken(), main(), maskTail(), MpUser, MercadoPagoBrickFormData (+4 more)

### Community 29 - ".runTransaction"
Cohesion: 0.36
Nodes (9): adminNotificationHtml(), confirmationHtml(), emailService, esc(), itemRows(), money(), orderText(), order (+1 more)

### Community 30 - "shoeImage"
Cohesion: 0.23
Nodes (10): AdminDashboard(), AdminPage(), blankForm(), CATEGORIES, ProductForm, RESOURCE_IMAGES, shoeToForm(), AdminNav() (+2 more)

### Community 31 - "AuthProvider"
Cohesion: 0.18
Nodes (7): inter, metadata, playfair, Footer(), AuthProvider(), fakeUser, {
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

### Community 32 - "webhook.controller.ts"
Cohesion: 0.17
Nodes (10): apiRateLimit, app, env, frontendUrl, errorHandler(), HttpError, notFoundHandler(), { nodeEnv } (+2 more)

### Community 33 - "FakeDocSnapshot"
Cohesion: 0.27
Nodes (8): AuthContext, AuthContextValue, ProfileUpdate, authHeaders(), auth, db, firebaseConfig, googleProvider

### Community 34 - "page.tsx"
Cohesion: 0.28
Nodes (7): AdminArchivePage(), ARCHIVE_STATUSES, ArchiveDashboard(), fmtDate(), STATUS_LABEL, STATUS_STYLE, Order

### Community 35 - "page.tsx"
Cohesion: 0.31
Nodes (8): AdminOrdersPage(), EDITABLE_STATUSES, fmtCurrency(), fmtDate(), OrdersDashboard(), orderToForm(), STATUS_COLORS, STATUS_LABELS

### Community 36 - "check-mercadopago-payment.ts"
Cohesion: 0.39
Nodes (7): CardTokenResponse, createTestCardToken(), extractMpCode(), extractMpMessage(), main(), resolvePayerEmail(), TEST_CARD

### Community 37 - "page.tsx"
Cohesion: 0.38
Nodes (6): fmtDate(), ProfileContent(), ProfilePage(), StatusBadge(), statusLabel(), UserProfile

### Community 38 - "Migración del backend: Render → Vercel"
Cohesion: 0.33
Nodes (5): Migración del backend: Render → Vercel, Nota de seguridad, Qué se hizo, Sobre Render, Webhooks — hecho

### Community 39 - "order.paypal.test.ts"
Cohesion: 0.29
Nodes (5): cart, { createOrder, captureOrder }, { decrementStock }, { findCartById, clearCart }, { sendOrderConfirmation, sendAdminNotification }

## Knowledge Gaps
- **231 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+226 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthProvider()` connect `AuthProvider` to `FakeDocSnapshot`?**
  _High betweenness centrality (0.226) - this node is a cross-community bridge._
- **Why does `FakeDocSnapshot` connect `ProfileRequiredModal.tsx` to `AuthProvider`?**
  _High betweenness centrality (0.222) - this node is a cross-community bridge._
- **Why does `express` connect `order.mercadopago.ts` to `webhook.controller.ts`, `ProfileRequiredModal.tsx`, `express`?**
  _High betweenness centrality (0.165) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _231 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05506329113924051 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._