# Adopta

A pet-adoption listing platform: people publish pets that need a home, others send an adoption
request to the person caring for that pet.

## Why this repo exists

**Every line of code here was written by Claude, autonomously, from a written spec — nobody typed
the application.** Five docs (user stories, architecture decisions, a full REST contract, a
page-by-page design system, and a nine-phase build plan) went in; Claude reads them, plans the
work, and executes phase by phase, committing as it goes. No human wrote `src/`.

That makes this repo a live stress test for **[Revix](https://userevix.com)** — AI code review
that reads your whole codebase, not just the diff in front of it, and reviews pull requests the
way a senior engineer on the team would. Revix's whole premise is that AI-authored code still
needs a second pair of eyes that actually understands the surrounding system: does this PR match
the codebase's own conventions, does it respect the architecture the team already agreed on, does
it quietly reintroduce a bug the codebase has seen before. An AI-built repo — spec-driven,
phase-by-phase, produced without a human in the implementation loop — is close to a worst case for
that kind of review: fast-moving, high-volume, and exactly the situation where a shallow "does the
diff look reasonable" reviewer misses the most. Adopta exists to give Revix real pull requests,
against a real layered architecture with real rules to violate, and see what it catches.

## Stack

TanStack Start (React 19, Vite) · TanStack Router/Query/Form · Zod 4 · Tailwind CSS 4 + Radix
primitives · a real HTTP mock backend (in-memory, same contract a production API would implement)
so the frontend has nothing to fake.

## Status

Built in phases, each with its own definition of done — see `docs/spec/05-build-plan.md`:

- [x] Phase 0 — Foundation (strict TypeScript, ESLint layer boundaries, CI, tooling)
- [x] Phase 1 — Design system and app shell
- [x] Phase 2 — Contracts, fetch layer, mock backend
- [x] Phase 3 — Auth
- [x] Phase 4 — Browse and detail (read paths)
- [x] Phase 5 — Listing management (write paths)
- [x] Phase 6 — Adoption requests
- [x] Phase 7 — Favourites and profile
- [x] Phase 8 — Hardening and handover

All eight phases are complete. `pnpm validate` (typecheck + lint + unit tests) and `pnpm build`
are green. See "Known issues" below for the honest list of what a Phase 8 hardening pass did and
did not fully verify.

## Features by phase

- **Phase 0 — Foundation:** strict TypeScript, ESLint boundary rules between `features` /
  `shared` / `server` / `contracts` layers, Vitest + Playwright wired, GitHub Actions CI.
- **Phase 1 — Design system:** Tailwind 4 token system, Radix-based primitive components
  (`src/shared/ui`), app shell/header/footer, dev-only `/kitchen-sink` review page.
- **Phase 2 — Contracts & mock backend:** Zod schemas for every resource (`src/contracts`), a
  typed HTTP client, and a real in-memory mock backend (`src/mocks`, `src/routes/api/v1/**`) that
  responds with real status codes, latency and error envelopes.
- **Phase 3 — Auth:** register/login/logout, session cookie, route guards for authenticated
  areas, session-aware header state.
- **Phase 4 — Browse & detail:** paginated pet browse with filters, pet detail page, user profile
  (public) page, loading skeletons and empty/error states.
- **Phase 5 — Listing management:** publish/edit/delete a pet listing, photo upload, status
  changes (available/reserved/adopted/withdrawn), "My listings" dashboard.
- **Phase 6 — Adoption requests:** send a request, accept/decline as the guardian, "Requests
  received" and "Requests sent" dashboards, contact-info reveal on acceptance.
- **Phase 7 — Favourites & profile:** heart-to-save favourites, favourites dashboard, editable
  profile.
- **Phase 8 — Hardening & handover:** a11y/error-path/empty-state audit and fixes, dead-code
  sweep, this README, `docs/openapi.yaml` backend handover doc.

## The spec

The full spec this build follows lives in `docs/spec/`:

| Doc                         | Contents                                                                  |
| --------------------------- | ------------------------------------------------------------------------- |
| `01-user-stories.md`        | Personas, epics, numbered user stories, explicit out-of-scope list        |
| `02-architecture.md`        | Stack, layer rules, fetch layer, state, forms, auth, conventions, testing |
| `03-api-contract.md`        | Full REST contract, error model, pagination, mock server behaviour        |
| `04-features-and-design.md` | Route map, per-page spec, design tokens, component inventory              |
| `05-build-plan.md`          | Nine phases, task checklists, definition of done per phase                |

## Development

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Demo account (seeded, fixed faker seed): `marta@example.com` / `password123`.

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint, zero warnings
pnpm test        # vitest
pnpm test:e2e    # playwright
pnpm validate    # typecheck + lint + test
pnpm build
pnpm start       # runs the production build (node dist/server/server.js)
```

### Environment variables

All variables live in `.env` (see `.env.example`). None are secret — this is a demo app with a
mock backend, so there's nothing to leak.

| Variable          | Default                        | Meaning                                                                                                                                                            |
| ----------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `API_BASE_URL`    | `http://localhost:3000/api/v1` | Base URL the typed HTTP client (`src/server/api-client`) targets.                                                                                                  |
| `API_TIMEOUT_MS`  | `10000`                        | Per-request timeout for the HTTP client.                                                                                                                           |
| `MOCK_API`        | `true`                         | When `true`, `API_BASE_URL` resolves to the in-repo mock backend under `src/routes/api/v1/**`; when `false`, requests go to a real external API at `API_BASE_URL`. |
| `MOCK_LATENCY_MS` | `180`                          | Artificial per-request latency the mock backend adds, to keep loading states honest.                                                                               |
| `MOCK_ERROR_RATE` | `0`                            | Fraction (0–1) of mock requests that randomly fail with a 500, for exercising error states.                                                                        |
| `MOCK_PERSIST`    | `false`                        | If `true`, the mock backend persists its in-memory DB to disk between restarts.                                                                                    |
| `VITE_APP_NAME`   | `Adopta`                       | Display name used in page titles / branding.                                                                                                                       |

Do **not** set `NODE_ENV` in `.env` — Vite derives it from the command (`vite dev` vs
`vite build`) and setting it explicitly breaks `import.meta.env.DEV`/`PROD` checks (this bit us
during the Phase 8 hardening pass — see "Known issues").

### Switching off the mock backend

The mock backend is a drop-in stand-in for a real API that speaks the same contract
(`docs/spec/03-api-contract.md`, mirrored in `docs/openapi.yaml`). To point this frontend at a
real backend instead:

1. Set `MOCK_API=false` in `.env`.
2. Set `API_BASE_URL` to the real API's base URL.
3. Delete `src/routes/api/` (the mock route handlers) and `src/mocks/` (the in-memory repository,
   seed data, and mock-only endpoints like `/api/v1/mock/*`).
4. Nothing else in the app changes — `src/server/api-client` and every feature's `*.serverfns.ts`
   file already talk to `API_BASE_URL` through the same typed client regardless of what's behind
   it, as long as the real API matches the Zod contracts in `src/contracts/**`.

## Architecture in one paragraph

The browser never talks to a domain API directly — everything goes through TanStack Start server
functions, which call a single typed HTTP client, which validates every response with Zod before
it enters the app. Right now that HTTP client is talking to a mock backend implemented as real
TanStack Start server routes (`src/routes/api/v1/**`) backed by an in-memory, seeded repository —
real status codes, real latency, real error envelopes, so nothing in the frontend is built against
an imagined response. Swapping in a real backend later is a one-line env var change plus deleting
`src/routes/api/` and `src/mocks/` — see "Switching off the mock backend" above. Full detail in
`docs/spec/02-architecture.md`.

Each feature's server-only boundary lives in `src/features/<slice>/api/<slice>.serverfns.ts` —
`createServerFn` wrappers that are the only place a feature is allowed to import `~/server/**`
(enforced by an ESLint `no-restricted-imports` rule). Note: `docs/spec/02-architecture.md` names
this file `<slice>.server.ts`; it was renamed to `<slice>.serverfns.ts` during Phase 8 because
the TanStack Start Vite plugin's import-protection rule denies **any** client-reachable import
matching the glob `**/*.server.*`, even a `createServerFn`-wrapped export — the original
convention made `pnpm build` fail outright. The two remaining `*.server.ts` files
(`src/server/env.server.ts`, `src/server/session/session.server.ts`) keep the old suffix because
they're only ever imported from other server-only files, never from client-reachable code, so the
glob never triggers for them.

## Known issues / what Phase 8 could not fully verify

Honest handover notes from the hardening pass:

- **Lighthouse / visual / responsive checks** were not run — this environment has no real browser
  available to the agent, only `curl` and static analysis. Responsive layout was checked by
  reading Tailwind class usage for mobile-first patterns (`sm:`/`lg:` prefixes), not by rendering
  at actual breakpoints.
- **`dist/server/server.js` does not self-bind to a port.** Running `node dist/server/server.js`
  exits immediately without listening, so a preview/production deploy of the built server needs a
  deployment adapter (Vercel/Netlify/Node preset) that isn't configured in this repo. `pnpm start`
  now at least points at the right file (it previously referenced a stale
  `.output/server/index.mjs` path from an older Vinxi/Nitro output layout), but starting a real
  server from the build output is unverified beyond that.
- **No deployment target is configured**, so no preview deploy was produced.
- **Playwright a11y coverage** — see `tests/e2e/a11y.spec.ts` for what's covered and any noted
  non-critical violations left as known issues rather than fixed.
