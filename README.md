# Adopta

A pet-adoption listing platform: people publish pets that need a home, others send an adoption
request to the person caring for that pet.

## Why this repo exists

**Every line of code here was written by Claude, autonomously, from a written spec.** This is the
frontend half of a two-repo pair — see [adopta-api](https://github.com/MagonDevs/adopta-api) for
the backend. Five docs (user stories, architecture, a full REST contract, a page-by-page design
system, a nine-phase build plan) went in; Claude read them, planned the work, and executed phase
by phase, committing as it went. No human wrote `src/`.

That makes this pair a live stress test for **[Revix](https://userevix.com)** — AI code review
that reads your whole codebase, not just the diff, and reviews pull requests the way a senior
engineer would. AI-authored, spec-driven, produced without a human in the implementation loop is
close to a worst case for that kind of review: fast-moving, high-volume, exactly where a shallow
"does the diff look reasonable" reviewer misses the most. Adopta exists to give Revix real pull
requests against a real layered architecture, and see what it catches.

## Stack

TanStack Start (React 19, Vite) · TanStack Router/Query/Form · Zod 4 · Tailwind CSS 4 + Radix
primitives · a real HTTP mock backend (in-memory, same contract a production API implements) so
the frontend has nothing to fake.

## Status

All nine phases in `docs/spec/05-build-plan.md` are done. `pnpm validate` and `pnpm build` are
green. See "Known issues" for what a Phase 8 hardening pass could and couldn't verify.

- **Phase 0-1** — foundation, ESLint layer boundaries, design system (`src/shared/ui`), app shell.
- **Phase 2** — Zod contracts, typed HTTP client, in-memory mock backend (`src/mocks`,
  `src/routes/api/v1/**`) with real status codes/latency/error envelopes.
- **Phase 3** — auth: register/login/logout, session cookie, route guards.
- **Phase 4** — browse/filter/search pets, pet detail, public guardian profile.
- **Phase 5** — publish/edit/delete a listing, photo upload, status changes, "My listings".
- **Phase 6** — adoption requests: send, accept/decline, contact-info reveal on acceptance.
- **Phase 7** — favourites, editable profile.
- **Phase 8** — a11y/error-path/empty-state audit, `docs/openapi.yaml` handover doc.

## The spec

Lives in `docs/spec/`: `01-user-stories.md`, `02-architecture.md`, `03-api-contract.md`,
`04-features-and-design.md`, `05-build-plan.md`.

## Development

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Demo account (seeded, fixed faker seed): `marta@example.com` / `password123`.

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm validate    # typecheck + lint + test
pnpm build
pnpm start       # node dist/server/server.js
```

### Environment variables

All live in `.env` (see `.env.example`). Nothing secret — a demo app with a mock backend.

| Variable          | Default                        | Meaning                                                              |
| ----------------- | ------------------------------ | -------------------------------------------------------------------- |
| `API_BASE_URL`    | `http://localhost:3000/api/v1` | Base URL the typed HTTP client targets.                              |
| `API_TIMEOUT_MS`  | `10000`                        | Per-request timeout.                                                 |
| `MOCK_API`        | `true`                         | `true` → in-repo mock backend; `false` → real API at `API_BASE_URL`. |
| `MOCK_LATENCY_MS` | `180`                          | Artificial latency the mock adds, to keep loading states honest.     |
| `MOCK_ERROR_RATE` | `0`                            | Fraction (0-1) of mock requests that randomly 500.                   |
| `MOCK_PERSIST`    | `false`                        | Persist the mock's in-memory DB to disk between restarts.            |
| `VITE_APP_NAME`   | `Adopta`                       | Display name in titles/branding.                                     |

Don't set `NODE_ENV` in `.env` — Vite derives it from the command, and an explicit value breaks
`import.meta.env.DEV`/`PROD` (bit us during Phase 8, see "Known issues").

### Switching off the mock backend

1. Set `MOCK_API=false`, point `API_BASE_URL` at the real API (e.g. `adopta-api`).
2. Delete `src/routes/api/` and `src/mocks/`.
3. Nothing else changes — `src/server/api-client` and every feature's `*.serverfns.ts` already
   talk to `API_BASE_URL` through the same typed client, as long as the real API matches the Zod
   contracts in `src/contracts/**`.

## Architecture in one paragraph

The browser never talks to a domain API directly — everything goes through TanStack Start server
functions, which call a single typed HTTP client, which validates every response with Zod before
it enters the app. That client currently talks to a mock backend (`src/routes/api/v1/**`) backed
by an in-memory, seeded repository — real status codes, latency, error envelopes, so nothing is
built against an imagined response. Full detail in `docs/spec/02-architecture.md`.

Each feature's server-only boundary is `src/features/<slice>/api/<slice>.serverfns.ts` —
`createServerFn` wrappers, the only place a feature may import `~/server/**` (ESLint-enforced).
The spec names this file `<slice>.server.ts`; it's `.serverfns.ts` here because TanStack Start's
Vite plugin denies any client-reachable import matching `**/*.server.*`, even a
`createServerFn`-wrapped export, which broke `pnpm build` under the original name.

## Known issues

- **Lighthouse/visual/responsive checks** weren't run — no real browser available to the
  hardening pass, only `curl` and static analysis (Tailwind class audit for mobile-first patterns).
- **`dist/server/server.js` doesn't self-bind to a port** — running it directly exits without
  listening; a real deploy needs a deployment adapter (Vercel/Netlify/Node preset) not configured
  here.
- **No deployment target configured**, so no preview deploy exists.
- See `tests/e2e/a11y.spec.ts` for a11y coverage and any non-critical violations left as known
  issues rather than fixed.
