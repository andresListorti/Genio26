# Graph Report - Code  (2026-07-16)

## Corpus Check
- 82 files · ~10,346,925 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 438 nodes · 767 edges · 21 communities (16 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `52ab3ef4`
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

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 22 edges
2. `compilerOptions` - 16 edges
3. `formatMoney()` - 15 edges
4. `compilerOptions` - 15 edges
5. `env` - 13 edges
6. `express` - 12 edges
7. `useCart()` - 11 edges
8. `shoeImage()` - 11 edges
9. `Shoe` - 11 edges
10. `scripts` - 11 edges

## Surprising Connections (you probably didn't know these)
- `AdminArchivePage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/admin/archive/page.tsx → frontend/src/context/AuthContext.tsx
- `OrderEditForm` --references--> `OrderStatus`  [EXTRACTED]
  frontend/src/app/admin/orders/page.tsx → frontend/src/lib/types.ts
- `AdminOrdersPage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/admin/orders/page.tsx → frontend/src/context/AuthContext.tsx
- `AdminPage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/admin/page.tsx → frontend/src/context/AuthContext.tsx
- `ProfilePage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/profile/page.tsx → frontend/src/context/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (21 total, 5 thin omitted)

### Community 0 - "order.service.ts"
Cohesion: 0.11
Nodes (26): env, isMercadoPagoConfigured(), getMercadoPago(), MercadoPagoClients, paypalClient, AddCartItemInput, Cart, classifyToken() (+18 more)

### Community 1 - "types.ts"
Cohesion: 0.08
Nodes (25): metadata, metadata, CatalogClient(), matches(), CheckoutResultFallback(), CheckoutVariant, COPY, CollectionView() (+17 more)

### Community 2 - "useAuth"
Cohesion: 0.07
Nodes (38): AdminArchivePage(), ARCHIVE_STATUSES, ArchiveDashboard(), fmtDate(), STATUS_LABEL, STATUS_STYLE, AdminOrdersPage(), EDITABLE_STATUSES (+30 more)

### Community 3 - "scripts"
Cohesion: 0.05
Nodes (37): author, description, devDependencies, ts-node-dev, @types/cors, @types/express, @types/node, @types/paypal__checkout-server-sdk (+29 more)

### Community 4 - "devDependencies"
Cohesion: 0.05
Nodes (36): eslint, eslint-config-next, firebase, dependencies, firebase, lucide-react, next, react (+28 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 6 - "compilerOptions"
Cohesion: 0.09
Nodes (21): dist, ES2020, src/**/*, compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, ignoreDeprecations (+13 more)

### Community 7 - "express"
Cohesion: 0.13
Nodes (14): express, cartController, checkoutController, shoeController, webhookController, app, errorHandler(), notFoundHandler() (+6 more)

### Community 8 - "dependencies"
Cohesion: 0.12
Nodes (17): cors, dotenv, express, firebase-admin, mercadopago, dependencies, cors, dotenv (+9 more)

### Community 9 - "layout.tsx"
Cohesion: 0.29
Nodes (5): inter, metadata, playfair, Footer(), AuthProvider()

### Community 10 - "Architecture"
Cohesion: 0.18
Nodes (9): API client, Architecture, Commands, Environment variables, Important: Next.js version, Key directories, Pages, State management (+1 more)

### Community 11 - "Architecture"
Cohesion: 0.20
Nodes (8): Architecture, Commands, Environment variables, Firestore collections, graphify, Layers, Payment flows, Stock reservation model

### Community 12 - "email.service.ts"
Cohesion: 0.67
Nodes (5): adminNotificationHtml(), confirmationHtml(), emailService, itemRows(), money()

### Community 13 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 14 - "ProfileRequiredModal.tsx"
Cohesion: 0.09
Nodes (26): CartPage(), getErrorMessage(), LoginPage(), generateMetadata(), getShoe, ProductPage(), getErrorMessage(), RegisterPage() (+18 more)

### Community 20 - "order.mercadopago.ts"
Cohesion: 0.11
Nodes (25): collections, firebaseAdmin, firestore, CartItem, Order, OrderStatus, PaymentProvider, Shoe (+17 more)

## Knowledge Gaps
- **158 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+153 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `express` connect `express` to `scripts`, `order.mercadopago.ts`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `keywords` connect `scripts` to `express`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _158 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `order.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07673469387755102 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.07246376811594203 - nodes in this community are weakly interconnected._