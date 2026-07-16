# Graph Report - Code  (2026-07-16)

## Corpus Check
- 104 files · ~10,353,918 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 563 nodes · 962 edges · 36 communities (27 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0b76738f`
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
- FakeDocRef
- register
- fakeFirestore.ts
- .runTransaction
- FakeQuery
- AuthProvider
- webhook.controller.ts
- AuthContext.tsx
- page.tsx
- page.tsx

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 23 edges
2. `compilerOptions` - 16 edges
3. `formatMoney()` - 15 edges
4. `express` - 15 edges
5. `env` - 15 edges
6. `compilerOptions` - 15 edges
7. `scripts` - 13 edges
8. `Order` - 13 edges
9. `useCart()` - 12 edges
10. `shoeImage()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `AdminArchivePage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/admin/archive/page.tsx → frontend/src/context/AuthContext.tsx
- `OrderEditForm` --references--> `OrderStatus`  [EXTRACTED]
  frontend/src/app/admin/orders/page.tsx → frontend/src/lib/types.ts
- `AdminPage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/admin/page.tsx → frontend/src/context/AuthContext.tsx
- `ProfilePage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/profile/page.tsx → frontend/src/context/AuthContext.tsx
- `ArchiveDashboard()` --calls--> `formatMoney()`  [EXTRACTED]
  frontend/src/app/admin/archive/page.tsx → frontend/src/lib/format.ts

## Import Cycles
- None detected.

## Communities (36 total, 9 thin omitted)

### Community 0 - "order.service.ts"
Cohesion: 0.67
Nodes (5): adminNotificationHtml(), confirmationHtml(), emailService, itemRows(), money()

### Community 1 - "types.ts"
Cohesion: 0.06
Nodes (44): CartPage(), metadata, metadata, generateMetadata(), getShoe, ProductPage(), CartSidebar(), CatalogClient() (+36 more)

### Community 2 - "useAuth"
Cohesion: 0.24
Nodes (8): AdminArchivePage(), ARCHIVE_STATUSES, ArchiveDashboard(), fmtDate(), STATUS_LABEL, STATUS_STYLE, AdminNav(), TABS

### Community 3 - "scripts"
Cohesion: 0.05
Nodes (41): author, description, devDependencies, ts-node-dev, @types/cors, @types/express, @types/node, @types/paypal__checkout-server-sdk (+33 more)

### Community 4 - "devDependencies"
Cohesion: 0.08
Nodes (23): firebase, dependencies, firebase, lucide-react, next, react, react-dom, @sentry/nextjs (+15 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 6 - "compilerOptions"
Cohesion: 0.09
Nodes (21): dist, ES2020, src/**/*, compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, ignoreDeprecations (+13 more)

### Community 7 - "express"
Cohesion: 0.08
Nodes (23): collections, firebaseAdmin, firestore, shoeController, AuthedRequest, requireAdmin(), { verifyIdToken }, Shoe (+15 more)

### Community 8 - "dependencies"
Cohesion: 0.09
Nodes (23): cors, dotenv, express, express-rate-limit, firebase-admin, helmet, mercadopago, dependencies (+15 more)

### Community 9 - "layout.tsx"
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

### Community 10 - "Architecture"
Cohesion: 0.17
Nodes (10): API client, Architecture, Commands, Environment variables, Important: Next.js version, Key directories, Pages, State management (+2 more)

### Community 11 - "Architecture"
Cohesion: 0.18
Nodes (9): Architecture, Commands, Environment variables, Firestore collections, graphify, Layers, Payment flows, Stock reservation model (+1 more)

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
Cohesion: 0.07
Nodes (45): isMercadoPagoConfigured(), getMercadoPago(), MercadoPagoClients, AddCartItemInput, Cart, CartItem, Order, OrderStatus (+37 more)

### Community 28 - "fakeFirestore.ts"
Cohesion: 0.25
Nodes (7): AdminOrdersPage(), getErrorMessage(), LoginPage(), NAV_LINKS, Navbar(), SearchBar(), useAuth()

### Community 29 - ".runTransaction"
Cohesion: 0.31
Nodes (8): EDITABLE_STATUSES, fmtCurrency(), fmtDate(), OrderEditForm, OrdersDashboard(), orderToForm(), STATUS_COLORS, STATUS_LABELS

### Community 31 - "AuthProvider"
Cohesion: 0.31
Nodes (8): AdminDashboard(), AdminPage(), blankForm(), CATEGORIES, ProductForm, RESOURCE_IMAGES, shoeToForm(), ShoeStockVariant

### Community 32 - "webhook.controller.ts"
Cohesion: 0.07
Nodes (26): express, env, frontendUrl, paypalClient, cartController, checkoutController, { webhookSecret }, verifyMercadoPagoSignature() (+18 more)

### Community 33 - "AuthContext.tsx"
Cohesion: 0.31
Nodes (7): AuthContext, AuthContextValue, ProfileUpdate, auth, db, firebaseConfig, googleProvider

### Community 34 - "page.tsx"
Cohesion: 0.38
Nodes (6): fmtDate(), ProfileContent(), ProfilePage(), StatusBadge(), statusLabel(), UserProfile

## Knowledge Gaps
- **197 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+192 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthProvider()` connect `layout.tsx` to `AuthContext.tsx`?**
  _High betweenness centrality (0.247) - this node is a cross-community bridge._
- **Why does `FakeDocSnapshot` connect `express` to `layout.tsx`?**
  _High betweenness centrality (0.242) - this node is a cross-community bridge._
- **Why does `express` connect `webhook.controller.ts` to `scripts`, `express`?**
  _High betweenness centrality (0.179) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _197 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.056150600454397924 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._