# Graph Report - Code  (2026-07-16)

## Corpus Check
- 103 files · ~10,353,446 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 554 nodes · 948 edges · 32 communities (21 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e2200af4`
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

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 23 edges
2. `compilerOptions` - 16 edges
3. `formatMoney()` - 15 edges
4. `compilerOptions` - 15 edges
5. `express` - 14 edges
6. `env` - 14 edges
7. `scripts` - 13 edges
8. `Order` - 13 edges
9. `useCart()` - 12 edges
10. `shoeImage()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `OrderEditForm` --references--> `OrderStatus`  [EXTRACTED]
  frontend/src/app/admin/orders/page.tsx → frontend/src/lib/types.ts
- `AdminArchivePage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/admin/archive/page.tsx → frontend/src/context/AuthContext.tsx
- `ArchiveDashboard()` --calls--> `formatMoney()`  [EXTRACTED]
  frontend/src/app/admin/archive/page.tsx → frontend/src/lib/format.ts
- `AdminOrdersPage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/admin/orders/page.tsx → frontend/src/context/AuthContext.tsx
- `AdminPage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/admin/page.tsx → frontend/src/context/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (32 total, 11 thin omitted)

### Community 0 - "order.service.ts"
Cohesion: 0.09
Nodes (29): env, isMercadoPagoConfigured(), getMercadoPago(), MercadoPagoClients, paypalClient, classifyToken(), main(), maskTail() (+21 more)

### Community 1 - "types.ts"
Cohesion: 0.06
Nodes (44): CartPage(), metadata, metadata, generateMetadata(), getShoe, ProductPage(), CartSidebar(), CatalogClient() (+36 more)

### Community 2 - "useAuth"
Cohesion: 0.06
Nodes (48): AdminArchivePage(), ARCHIVE_STATUSES, ArchiveDashboard(), fmtDate(), STATUS_LABEL, STATUS_STYLE, AdminOrdersPage(), EDITABLE_STATUSES (+40 more)

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
Nodes (27): express, collections, firebaseAdmin, firestore, cartController, checkoutController, shoeController, webhookController (+19 more)

### Community 8 - "dependencies"
Cohesion: 0.11
Nodes (19): cors, dotenv, express, firebase-admin, mercadopago, dependencies, cors, dotenv (+11 more)

### Community 9 - "layout.tsx"
Cohesion: 0.33
Nodes (4): inter, metadata, playfair, Footer()

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

### Community 20 - "order.mercadopago.ts"
Cohesion: 0.08
Nodes (32): { webhookSecret }, verifyMercadoPagoSignature(), AddCartItemInput, Cart, CartItem, Order, OrderStatus, PaymentProvider (+24 more)

### Community 28 - "fakeFirestore.ts"
Cohesion: 0.23
Nodes (7): { verifyIdToken }, { findShoeById }, shoe, collections, DocData, firestore, resetFakeFirestore()

## Knowledge Gaps
- **192 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+187 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthProvider()` connect `AuthProvider` to `layout.tsx`, `useAuth`?**
  _High betweenness centrality (0.246) - this node is a cross-community bridge._
- **Why does `FakeDocSnapshot` connect `AuthProvider` to `fakeFirestore.ts`?**
  _High betweenness centrality (0.241) - this node is a cross-community bridge._
- **Why does `express` connect `express` to `scripts`, `order.mercadopago.ts`, `fakeFirestore.ts`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _192 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `order.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09291521486643438 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.056150600454397924 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.057859703020993344 - nodes in this community are weakly interconnected._