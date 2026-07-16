# Graph Report - Code  (2026-07-16)

## Corpus Check
- 100 files · ~10,352,633 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 543 nodes · 923 edges · 28 communities (21 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bfc3448f`
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

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 23 edges
2. `compilerOptions` - 16 edges
3. `formatMoney()` - 15 edges
4. `compilerOptions` - 15 edges
5. `env` - 14 edges
6. `scripts` - 13 edges
7. `Order` - 13 edges
8. `useCart()` - 12 edges
9. `express` - 12 edges
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

## Communities (28 total, 7 thin omitted)

### Community 0 - "order.service.ts"
Cohesion: 0.10
Nodes (29): env, isMercadoPagoConfigured(), getMercadoPago(), MercadoPagoClients, paypalClient, Cart, classifyToken(), main() (+21 more)

### Community 1 - "types.ts"
Cohesion: 0.06
Nodes (44): CartPage(), metadata, metadata, generateMetadata(), getShoe, ProductPage(), CartSidebar(), CatalogClient() (+36 more)

### Community 2 - "useAuth"
Cohesion: 0.06
Nodes (47): AdminArchivePage(), ARCHIVE_STATUSES, ArchiveDashboard(), fmtDate(), STATUS_LABEL, STATUS_STYLE, AdminOrdersPage(), EDITABLE_STATUSES (+39 more)

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
Cohesion: 0.13
Nodes (15): express, cartController, checkoutController, shoeController, webhookController, app, errorHandler(), notFoundHandler() (+7 more)

### Community 8 - "dependencies"
Cohesion: 0.11
Nodes (19): cors, dotenv, express, firebase-admin, mercadopago, dependencies, cors, dotenv (+11 more)

### Community 9 - "layout.tsx"
Cohesion: 0.20
Nodes (7): inter, metadata, playfair, Footer(), NAV_LINKS, Navbar(), SearchBar()

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
Cohesion: 0.06
Nodes (46): collections, firebaseAdmin, firestore, AddCartItemInput, CartItem, Order, PaymentProvider, Shoe (+38 more)

## Knowledge Gaps
- **193 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+188 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthProvider()` connect `useAuth` to `layout.tsx`?**
  _High betweenness centrality (0.245) - this node is a cross-community bridge._
- **Why does `FakeDocSnapshot` connect `useAuth` to `order.mercadopago.ts`?**
  _High betweenness centrality (0.239) - this node is a cross-community bridge._
- **Why does `express` connect `express` to `scripts`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _193 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `order.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.056150600454397924 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.05683563748079877 - nodes in this community are weakly interconnected._