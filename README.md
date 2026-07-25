# Adopta

A pet-adoption listing platform: people publish pets that need a home, others send an adoption
request to the person caring for that pet.

**This entire repository is being built end-to-end by Claude, autonomously, from a written spec —
no hand-written application code.** The project exists to test [Revix AI](https://revix.ai)'s
ability to work from a real, detailed engineering spec (user stories, architecture decisions, a
full API contract, page-by-page design direction, and a phased build plan) and produce a
production-shaped codebase without a human writing the implementation. Every commit on `main` is
Claude executing one phase of that build plan; nothing here was typed by a person.

## Stack

TanStack Start (React 19, Vite) · TanStack Router/Query/Form · Zod 4 · Tailwind CSS 4 + Radix
primitives · a real HTTP mock backend (in-memory, same contract a production API would implement)
so the frontend has nothing to fake.

## Status

Built in phases, each with its own definition of done — see `docs/spec/05-build-plan.md`:

- [x] Phase 0 — Foundation (strict TypeScript, ESLint layer boundaries, CI, tooling)
- [x] Phase 1 — Design system and app shell
- [x] Phase 2 — Contracts, fetch layer, mock backend
- [ ] Phase 3 — Auth
- [ ] Phase 4 — Browse and detail (read paths)
- [ ] Phase 5 — Listing management (write paths)
- [ ] Phase 6 — Adoption requests
- [ ] Phase 7 — Favourites and profile
- [ ] Phase 8 — Hardening and handover

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
```

## Architecture in one paragraph

The browser never talks to a domain API directly — everything goes through TanStack Start server
functions, which call a single typed HTTP client, which validates every response with Zod before
it enters the app. Right now that HTTP client is talking to a mock backend implemented as real
TanStack Start server routes (`src/routes/api/v1/**`) backed by an in-memory, seeded repository —
real status codes, real latency, real error envelopes, so nothing in the frontend is built against
an imagined response. Swapping in a real backend later is a one-line env var change plus deleting
`src/routes/api/` and `src/mocks/`. Full detail in `docs/spec/02-architecture.md`.
