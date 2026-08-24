# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

This is a two-project repo, each with its own `CLAUDE.md` — read the relevant one when working
inside it:

| Path | What | Docs |
|---|---|---|
| `functions/` | Backend — Express + TypeScript, deployed as a Vercel Node.js backend (own Vercel project, `zapateria-genaro-api`) | `functions/CLAUDE.md` |
| `frontend/` | Frontend — Next.js 16 (React 19, Tailwind v4), deployed on Vercel (`genio26` project → genarozapateria.vercel.app) | `frontend/CLAUDE.md` |

Root-level `package.json` only has passthrough scripts (`npm run dev`, `npm run test`, etc.)
that delegate to `functions/` via `npm --prefix functions run ...`, so the usual commands still
work from the repo root.

## Deployment

- **Backend**: `vercel deploy --prod` from `functions/`. Separate Vercel project
  (`zapateria-genaro-api`), same account as the frontend, own domain
  (`zapateria-genaro-api.vercel.app`).
- **Frontend**: Vercel (`genio26` project), auto-deploys from git.

Backend used to run on Render (free tier); migrated to Vercel in 2026-08 to eliminate the
free-tier cold start (30-50s spin-down → ~1s), which was surfacing to users as "Failed to
fetch" errors on first interaction (e.g. add-to-cart) after idle periods. A Firebase Cloud
Functions migration was attempted first but abandoned — Firebase requires the paid Blaze plan
for any Cloud Function at all, which wasn't acceptable, so the backend moved to Vercel's
Hobby plan instead (no billing method required). Firestore is still the database — only the
compute/hosting layer changed.

## graphify

This project has a knowledge graph at `graphify-out/` with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when `graphify-out/graph.json` exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If `graphify-out/wiki/index.md` exists, use it for broad navigation instead of raw source browsing.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
