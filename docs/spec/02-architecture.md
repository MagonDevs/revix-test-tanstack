# 02 — Code Architecture

## 0. Decision summary

Each row is a decision that is expensive to reverse. The "instead of" column exists so nobody re-litigates it in a PR.

| #   | Decision            | Choice                                                                                                                        | Instead of                                                     | Why                                                                                                                                                                                                     |
| --- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Framework           | TanStack Start (React 19, Vite)                                                                                               | Next.js, Remix                                                 | Requirement. Gives type-safe file routing, validated URL state, server functions and streaming SSR without framework magic.                                                                             |
| D2  | Architectural style | Feature-sliced vertical slices, with a hexagonal boundary **only** at the data edge                                           | Full hexagonal/clean architecture across the app               | Frontends are shaped by screens, not by domain services. Full hexagonal on a CRUD frontend produces four files per field with no benefit. One real port — the API — is where the swap actually happens. |
| D3  | Server state        | TanStack Query, hydrated from route loaders                                                                                   | `useEffect` + fetch, or loaders alone                          | Caching, dedupe, invalidation, retry and background refresh are already solved. Loaders alone force refetch-on-navigate and give no mutation story.                                                     |
| D4  | API transport       | All domain calls go through `createServerFn` acting as a thin BFF                                                             | Browser calls the API directly                                 | Session lives in an httpOnly cookie the browser can't read; API base URL and any future secret stay server-side; SSR loaders and client calls share one code path.                                      |
| D5  | Missing backend     | A **real HTTP mock backend** implemented as TanStack Start server routes under `/api/v1/*`, backed by an in-memory repository | MSW in the browser, or hardcoded fixtures in components        | Real status codes, real latency, visible in devtools, and it doubles as an executable spec to hand the backend team. Deleting one folder and changing one env var switches to the real API.             |
| D6  | Validation          | Zod 4, one schema per DTO, reused for forms, search params and env                                                            | Hand-written types + trust                                     | Runtime validation at the boundary is the only thing that stops a backend change from becoming a white screen. Types are derived, never duplicated.                                                     |
| D7  | Forms               | TanStack Form + Zod                                                                                                           | React Hook Form                                                | Cohesion with the stack and better inference with Standard Schema. Tradeoff accepted: smaller ecosystem. If a blocker appears, RHF is a drop-in per-form replacement — forms are local to features.     |
| D8  | Styling             | Tailwind CSS 4 + a hand-owned primitive layer built on Radix, variants via CVA                                                | A component library (MUI, Mantine), or shadcn copied wholesale | The design is bespoke and minimal; owning ~20 primitives is cheaper than fighting a library's opinions. Radix supplies behaviour and a11y; we supply appearance.                                        |
| D9  | Client state        | URL first, Query second, React state third. No global store                                                                   | Zustand/Redux from day one                                     | There is no client state in this product that isn't server data, URL state, or local to one component. Adding a store now guarantees state lives in two places.                                         |
| D10 | Testing             | Vitest + RTL for units and components, Playwright for five critical flows                                                     | Full E2E coverage, or none                                     | Cheap safety on logic and forms; E2E only where a break is invisible to unit tests.                                                                                                                     |
| D11 | Package manager     | pnpm, exact pinned versions                                                                                                   | npm with ranges                                                | Start's 1.x line moves weekly. Floating ranges on a fast-moving framework is a self-inflicted outage.                                                                                                   |
| D12 | Lint/format         | ESLint 9 flat config + Prettier                                                                                               | Biome                                                          | We need `eslint-plugin-boundaries` to enforce D2 mechanically. An unenforced architecture rule is a suggestion.                                                                                         |

---

## 1. Stack

| Concern    | Package                                                                                                                      | Notes                                                                                                                                                                                                                                                                                                                            |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework  | `@tanstack/react-start`                                                                                                      | Pin the exact version. As of July 2026 the `1.168.x` line is current; the public API (`createServerFn`, `server.handlers`, file routes) has been stable since the v1 RC. Verify helper names (`getRequestHeaders`, `setCookie`) against the pinned version's docs in Phase 0 and record the result in `docs/notes/start-api.md`. |
| Router     | `@tanstack/react-router`                                                                                                     | Comes with Start. File-based routes, `validateSearch`, `beforeLoad`.                                                                                                                                                                                                                                                             |
| Query      | `@tanstack/react-query` + `@tanstack/react-router-ssr-query`                                                                 | The `ssr-query` package wires dehydration/hydration between loaders and the client cache.                                                                                                                                                                                                                                        |
| Devtools   | `@tanstack/react-router-devtools`, `@tanstack/react-query-devtools`                                                          | Dev only.                                                                                                                                                                                                                                                                                                                        |
| Forms      | `@tanstack/react-form`                                                                                                       |                                                                                                                                                                                                                                                                                                                                  |
| Validation | `zod` (v4)                                                                                                                   | Standard Schema, so it plugs into router and form validators directly.                                                                                                                                                                                                                                                           |
| Styling    | `tailwindcss` v4, `class-variance-authority`, `tailwind-merge`, `clsx`                                                       | Tailwind 4 = CSS-first config, tokens as `@theme` variables.                                                                                                                                                                                                                                                                     |
| Primitives | `radix-ui` packages, `lucide-react`                                                                                          | Behaviour + icons only.                                                                                                                                                                                                                                                                                                          |
| Dates      | `date-fns`                                                                                                                   | Tree-shakeable; only `formatDistanceToNow` and `format` needed.                                                                                                                                                                                                                                                                  |
| Toasts     | `sonner`                                                                                                                     | One dependency, correct a11y announcements.                                                                                                                                                                                                                                                                                      |
| Test       | `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `@playwright/test`, `msw`                        | MSW is used **only in tests**, not in the app.                                                                                                                                                                                                                                                                                   |
| Mock data  | `@faker-js/faker` (devDependency)                                                                                            | Seeded, deterministic.                                                                                                                                                                                                                                                                                                           |
| Tooling    | `typescript`, `eslint`, `typescript-eslint`, `eslint-plugin-boundaries`, `prettier`, `husky`, `lint-staged`, `@commitlint/*` |                                                                                                                                                                                                                                                                                                                                  |

TypeScript config, non-negotiable flags:

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "paths": { "~/*": ["./src/*"] },
  },
}
```

`~/` is the only alias. No deep relative imports across slices.

---

## 2. Runtime architecture

```
┌───────────────────────────────────────────────────────────┐
│ Browser                                                    │
│  Components ─ useQuery / useMutation ─┐                    │
│  Route loaders ─ ensureQueryData ─────┤                    │
└───────────────────────────────────────┼────────────────────┘
                                        │ RPC (server fn)
┌───────────────────────────────────────┼────────────────────┐
│ Start server                          ▼                    │
│  features/*/api/*.server.ts   ← use-case shaped            │
│        │  reads session cookie, maps errors                │
│        ▼                                                   │
│  server/api-client/*          ← the single HTTP port       │
│        │  fetch + Zod parse + ApiError                     │
└────────┼───────────────────────────────────────────────────┘
         │ HTTP  (API_BASE_URL)
         ▼
┌─────────────────────────┐        ┌──────────────────────────┐
│ NOW: mock API           │  later │ REAL BACKEND             │
│ routes/api/v1/*         │ ─────► │ same contract, other host│
│ + mocks/repository      │        │                          │
└─────────────────────────┘        └──────────────────────────┘
```

Three rules that make the diagram true:

1. **No component, hook or route file ever calls `fetch` against the domain API.** Enforced by an ESLint restricted-import rule: `src/server/**` is importable only from `*.server.ts` files.
2. **Nothing enters the app unvalidated.** `api-client` parses every response with a Zod schema from `src/contracts` and returns a domain model, never a raw DTO.
3. **Swapping the backend is a one-line change.** `API_BASE_URL` points at `http://localhost:3000/api/v1` today (the app calling its own mock routes) and at the real host later. Then `src/routes/api/` and `src/mocks/` are deleted.

### Why the self-call in dev is acceptable

The mock lives inside the same server process, so a request from a server function to `/api/v1/pets` is a loopback HTTP call. It costs a millisecond and buys us the real network path: real headers, real status codes, real serialisation, real error handling. The alternative — an in-process adapter — would let us ship code that only works because there is no network. Document it and move on.

---

## 3. Layers and dependency rules

Four layers. Dependencies point **downward only**.

| Layer           | Location                      | Owns                                                                                                   | May import from                                                                               |
| --------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| **Routing**     | `src/routes`                  | URL shape, search-param contracts, loaders, guards, layouts, page-level meta                           | features (public API), shared                                                                 |
| **Feature**     | `src/features/<slice>`        | Use cases: components, hooks, query options, mutations, server functions, form schemas, domain mappers | own slice, other slices' `index.ts` only, shared, contracts, (from `*.server.ts` only) server |
| **Data access** | `src/server`, `src/contracts` | HTTP client, endpoint functions, DTO schemas, error normalisation, session                             | contracts, shared/lib, shared/config                                                          |
| **Shared**      | `src/shared`                  | Design system primitives, generic hooks, utils, config, app-wide components                            | shared only                                                                                   |

Additional rules:

- **Route files are thin.** A route file may contain: the `createFileRoute` call, its `validateSearch`/`loader`/`beforeLoad`/`errorComponent`/`head`, and a component that is a composition of feature components. No business logic, no data shaping, no more than ~80 lines. If a route file grows, the logic belongs in the slice.
- **Slices do not reach into each other.** `features/pets` may import `features/auth` only through `~/features/auth` (its `index.ts`). Never `~/features/auth/components/login-form`.
- **Shared never imports features.** If a "shared" component needs feature knowledge, it isn't shared.
- **Circular slice dependencies are forbidden.** If A and B need each other, the common part moves to `shared` or to a new slice both depend on.

Enforced in `eslint.config.ts`:

```ts
import boundaries from 'eslint-plugin-boundaries'

export default [
  {
    settings: {
      'boundaries/elements': [
        { type: 'routes', pattern: 'src/routes/**' },
        { type: 'feature', pattern: 'src/features/*', capture: ['slice'] },
        { type: 'server', pattern: 'src/server/**' },
        { type: 'contracts', pattern: 'src/contracts/**' },
        { type: 'shared', pattern: 'src/shared/**' },
        { type: 'mocks', pattern: 'src/mocks/**' },
      ],
    },
    plugins: { boundaries },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'routes', allow: ['feature', 'shared', 'contracts'] },
            {
              from: 'feature',
              allow: [
                ['feature', { slice: '${from.slice}' }],
                'shared',
                'contracts',
              ],
            },
            { from: 'server', allow: ['contracts', 'shared'] },
            { from: 'shared', allow: ['shared'] },
            { from: 'mocks', allow: ['contracts', 'shared'] },
          ],
        },
      ],
      // Cross-slice imports only via the slice barrel.
      'boundaries/entry-point': [
        'error',
        {
          default: 'disallow',
          rules: [{ target: ['feature'], allow: 'index.ts' }],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['~/server/*'],
              message:
                'Server code may only be imported from *.server.ts files.',
            },
          ],
        },
      ],
    },
  },
  // Escape hatch, scoped narrowly:
  {
    files: ['src/features/*/api/*.server.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
]
```

---

## 4. Folder structure

```
adopta/
├─ .github/workflows/ci.yml
├─ docs/                             # these documents
├─ public/
├─ tests/
│  └─ e2e/                           # Playwright specs
├─ src/
│  ├─ routes/                        # ROUTING LAYER — thin files only
│  │  ├─ __root.tsx
│  │  ├─ index.tsx                   # /
│  │  ├─ pets/
│  │  │  ├─ index.tsx                # /pets
│  │  │  └─ $petId.tsx               # /pets/:petId
│  │  ├─ users/
│  │  │  └─ $userId.tsx
│  │  ├─ (auth)/                     # group: no URL segment, shared layout
│  │  │  ├─ route.tsx
│  │  │  ├─ login.tsx
│  │  │  └─ register.tsx
│  │  ├─ _authenticated.tsx          # pathless guard + dashboard shell
│  │  ├─ _authenticated/
│  │  │  └─ dashboard/
│  │  │     ├─ index.tsx             # redirect → pets
│  │  │     ├─ pets/
│  │  │     │  ├─ index.tsx
│  │  │     │  ├─ new.tsx
│  │  │     │  └─ $petId.edit.tsx
│  │  │     ├─ requests/
│  │  │     │  ├─ received.tsx
│  │  │     │  └─ sent.tsx
│  │  │     ├─ favourites.tsx
│  │  │     └─ profile.tsx
│  │  └─ api/                        # MOCK BACKEND — delete when real API lands
│  │     └─ v1/
│  │        ├─ auth.$.ts
│  │        ├─ pets.index.ts
│  │        ├─ pets.$petId.ts
│  │        └─ ...
│  │
│  ├─ features/                      # FEATURE LAYER — vertical slices
│  │  ├─ auth/
│  │  │  ├─ api/
│  │  │  │  ├─ auth.server.ts        # createServerFn wrappers
│  │  │  │  ├─ auth.queries.ts       # queryOptions + keys
│  │  │  │  └─ auth.mutations.ts     # useMutation hooks
│  │  │  ├─ components/
│  │  │  │  ├─ login-form.tsx
│  │  │  │  ├─ register-form.tsx
│  │  │  │  └─ user-menu.tsx
│  │  │  ├─ hooks/use-session.ts
│  │  │  ├─ schemas/auth.schemas.ts  # form schemas
│  │  │  └─ index.ts                 # PUBLIC API of the slice
│  │  ├─ pets/
│  │  │  ├─ api/
│  │  │  │  ├─ pets.server.ts
│  │  │  │  ├─ pets.queries.ts
│  │  │  │  └─ pets.mutations.ts
│  │  │  ├─ components/
│  │  │  │  ├─ pet-card.tsx
│  │  │  │  ├─ pet-grid.tsx
│  │  │  │  ├─ pet-filters.tsx
│  │  │  │  ├─ pet-record-strip.tsx
│  │  │  │  ├─ pet-gallery.tsx
│  │  │  │  ├─ pet-form.tsx
│  │  │  │  ├─ pet-photo-uploader.tsx
│  │  │  │  └─ pet-status-badge.tsx
│  │  │  ├─ hooks/use-pet-search-params.ts
│  │  │  ├─ model/pet.model.ts       # domain types + DTO→model mappers
│  │  │  ├─ schemas/
│  │  │  │  ├─ pet-form.schema.ts
│  │  │  │  └─ pet-search.schema.ts  # URL contract
│  │  │  ├─ utils/pet-age.ts
│  │  │  └─ index.ts
│  │  ├─ adoption-requests/          # same internal shape
│  │  ├─ favourites/
│  │  └─ profile/
│  │
│  ├─ contracts/                     # DATA CONTRACT — source of truth
│  │  ├─ common.contract.ts          # pagination, error, id, timestamps
│  │  ├─ auth.contract.ts
│  │  ├─ user.contract.ts
│  │  ├─ pet.contract.ts
│  │  ├─ adoption-request.contract.ts
│  │  ├─ upload.contract.ts
│  │  ├─ enums.ts
│  │  └─ index.ts
│  │
│  ├─ server/                        # DATA ACCESS — server only
│  │  ├─ api-client/
│  │  │  ├─ http.ts                  # request(), the only fetch in the app
│  │  │  ├─ api-error.ts
│  │  │  ├─ serialize-error.ts       # ApiError ⇄ RPC-safe payload
│  │  │  └─ endpoints/
│  │  │     ├─ auth.endpoints.ts
│  │  │     ├─ users.endpoints.ts
│  │  │     ├─ pets.endpoints.ts
│  │  │     ├─ adoption-requests.endpoints.ts
│  │  │     ├─ favourites.endpoints.ts
│  │  │     └─ uploads.endpoints.ts
│  │  ├─ session/session.server.ts   # cookie read/write
│  │  ├─ middleware/auth.middleware.ts
│  │  └─ env.server.ts
│  │
│  ├─ mocks/                         # delete with routes/api
│  │  ├─ repository.ts               # in-memory store + optional JSON persistence
│  │  ├─ seed.ts                     # faker, fixed seed
│  │  ├─ handlers/                   # pure functions the api routes call
│  │  └─ latency.ts
│  │
│  ├─ shared/
│  │  ├─ ui/                         # design system primitives (see doc 04)
│  │  │  ├─ button.tsx
│  │  │  ├─ input.tsx
│  │  │  └─ ...
│  │  ├─ components/                 # app-level composites
│  │  │  ├─ app-header.tsx
│  │  │  ├─ app-footer.tsx
│  │  │  ├─ page-header.tsx
│  │  │  ├─ empty-state.tsx
│  │  │  ├─ error-state.tsx
│  │  │  ├─ pagination.tsx
│  │  │  └─ confirm-dialog.tsx
│  │  ├─ hooks/
│  │  │  ├─ use-debounced-value.ts
│  │  │  └─ use-media-query.ts
│  │  ├─ lib/
│  │  │  ├─ cn.ts
│  │  │  ├─ logger.ts
│  │  │  ├─ format.ts
│  │  │  └─ result.ts
│  │  ├─ config/
│  │  │  ├─ app.ts                   # name, limits, page sizes
│  │  │  ├─ env.client.ts
│  │  │  └─ query-client.ts
│  │  └─ types/
│  ├─ styles/globals.css             # Tailwind + @theme tokens
│  ├─ router.tsx
│  ├─ client.tsx
│  └─ server.tsx
├─ eslint.config.ts
├─ vite.config.ts
├─ vitest.config.ts
├─ playwright.config.ts
└─ tsconfig.json
```

---

## 5. The fetch layer

This is the part that must be right, because the backend doesn't exist yet.

### 5.1 Contracts

`src/contracts` is the only place that knows the API's shape. Nothing in it imports anything else from the app.

```ts
// src/contracts/common.contract.ts
import { z } from 'zod'

export const idSchema = z.string().uuid()
export const isoDateTimeSchema = z.string().datetime({ offset: true })

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  perPage: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export function paginatedSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({ items: z.array(item), meta: paginationMetaSchema })
}

export const fieldErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
})

export const apiErrorBodySchema = z.object({
  error: z.object({
    code: z.enum([
      'validation_error',
      'unauthenticated',
      'forbidden',
      'not_found',
      'conflict',
      'rate_limited',
      'internal_error',
    ]),
    message: z.string(),
    details: z.array(fieldErrorSchema).optional(),
  }),
})

export type PaginationMeta = z.infer<typeof paginationMetaSchema>
export type FieldError = z.infer<typeof fieldErrorSchema>
export type ApiErrorCode = z.infer<
  typeof apiErrorBodySchema
>['shape']['error']['shape']['code']['_type']
```

Naming inside contracts: `*Dto` for wire shapes, `*Request` for request bodies, `*Query` for query strings.

```ts
// src/contracts/pet.contract.ts (excerpt — full contract in doc 03)
export const petDtoSchema = z.object({
  id: idSchema,
  name: z.string(),
  species: speciesSchema,
  breed: z.string().nullable(),
  sex: sexSchema,
  ageMonths: z.number().int().nonnegative(),
  size: sizeSchema,
  weightKg: z.number().positive().nullable(),
  description: z.string(),
  photos: z.array(petPhotoDtoSchema),
  city: z.string(),
  status: petStatusSchema,
  isVaccinated: z.boolean(),
  isNeutered: z.boolean(),
  isGoodWithKids: z.boolean(),
  isGoodWithPets: z.boolean(),
  isFavourited: z.boolean(),
  guardian: userSummaryDtoSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
})
export type PetDto = z.infer<typeof petDtoSchema>
```

### 5.2 The HTTP client — the only `fetch` in the app

```ts
// src/server/api-client/http.ts
import type { z } from 'zod'
import { serverEnv } from '~/server/env.server'
import { ApiError } from './api-error'
import { apiErrorBodySchema } from '~/contracts'
import { logger } from '~/shared/lib/logger'

type QueryValue =
  string | number | boolean | undefined | null | Array<string | number>

interface RequestConfig<TSchema extends z.ZodTypeAny> {
  path: string
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  query?: Record<string, QueryValue>
  body?: unknown
  /** Omit for 204 responses. */
  schema?: TSchema
  /** Forwarded from the incoming request so the API sees the session. */
  headers?: HeadersInit
  signal?: AbortSignal
}

export async function apiRequest<TSchema extends z.ZodTypeAny>(
  config: RequestConfig<TSchema>,
): Promise<TSchema extends z.ZodTypeAny ? z.infer<TSchema> : void> {
  const { path, method = 'GET', query, body, schema, headers, signal } = config
  const url = new URL(`${serverEnv.API_BASE_URL}${path}`)

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value))
      value.forEach((v) => url.searchParams.append(key, String(v)))
    else url.searchParams.set(key, String(value))
  }

  const startedAt = performance.now()
  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers: {
        accept: 'application/json',
        ...(body ? { 'content-type': 'application/json' } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: signal ?? AbortSignal.timeout(serverEnv.API_TIMEOUT_MS),
    })
  } catch (cause) {
    throw ApiError.network(cause)
  }

  logger.info('api', {
    method,
    path,
    status: response.status,
    ms: Math.round(performance.now() - startedAt),
  })

  if (!response.ok) throw await ApiError.fromResponse(response)
  if (response.status === 204 || !schema) return undefined as never

  const json: unknown = await response.json()
  const parsed = schema.safeParse(json)
  if (!parsed.success) throw ApiError.contract(path, parsed.error)
  return parsed.data
}
```

Notes that matter:

- **A contract mismatch is an error, not a warning.** `ApiError.contract` throws with the Zod issue paths logged. Better a loud failure in dev than `undefined.name` in production.
- **Timeouts are always set.** `AbortSignal.timeout` with `API_TIMEOUT_MS` (default 10 s).
- Arrays serialise as repeated params (`?species=dog&species=cat`). This is written into the contract so the backend can't choose differently.

### 5.3 Endpoint modules

One file per resource. Each function is one endpoint, named after the operation, returning **domain models**, not DTOs. No `if` statements, no business logic, no caching — this layer is a typed description of the API and nothing else.

```ts
// src/server/api-client/endpoints/pets.endpoints.ts
import { apiRequest } from '../http'
import {
  paginatedSchema,
  petDtoSchema,
  type PetListQuery,
  type CreatePetRequest,
} from '~/contracts'

export function fetchPets(query: PetListQuery, headers?: HeadersInit) {
  return apiRequest({
    path: '/pets',
    query,
    schema: paginatedSchema(petDtoSchema),
    headers,
  })
}

export function fetchPetById(petId: string, headers?: HeadersInit) {
  return apiRequest({ path: `/pets/${petId}`, schema: petDtoSchema, headers })
}

export function createPet(body: CreatePetRequest, headers?: HeadersInit) {
  return apiRequest({
    path: '/pets',
    method: 'POST',
    body,
    schema: petDtoSchema,
    headers,
  })
}

export function updatePet(
  petId: string,
  body: Partial<CreatePetRequest>,
  headers?: HeadersInit,
) {
  return apiRequest({
    path: `/pets/${petId}`,
    method: 'PATCH',
    body,
    schema: petDtoSchema,
    headers,
  })
}

export function deletePet(petId: string, headers?: HeadersInit) {
  return apiRequest({ path: `/pets/${petId}`, method: 'DELETE', headers })
}
```

### 5.4 Mapping DTO → domain model

DTOs are the backend's vocabulary; models are ours. Mapping lives in the slice (`features/pets/model/pet.model.ts`) because the shape a screen wants is a feature concern.

Map only when there is a real transformation. Rules:

- Dates become `Date`.
- `null` becomes `undefined` (optional in TS, absent in UI).
- Derived values are computed once here, not in every component: `ageLabel`, `ageGroup`, `coverPhoto`, `isEditable`.

```ts
// src/features/pets/model/pet.model.ts
import type { PetDto } from '~/contracts'
import { toAgeGroup, formatAge } from '../utils/pet-age'

export interface Pet {
  id: string
  name: string
  species: Species
  breed?: string
  sex: Sex
  ageMonths: number
  ageGroup: AgeGroup
  ageLabel: string
  size: Size
  weightKg?: number
  description: string
  photos: PetPhoto[]
  coverPhoto: PetPhoto
  city: string
  status: PetStatus
  traits: {
    vaccinated: boolean
    neutered: boolean
    goodWithKids: boolean
    goodWithPets: boolean
  }
  isFavourited: boolean
  guardian: UserSummary
  createdAt: Date
  updatedAt: Date
}

export function toPet(dto: PetDto): Pet {
  const photos = dto.photos.map(toPetPhoto)
  return {
    ...dto,
    breed: dto.breed ?? undefined,
    weightKg: dto.weightKg ?? undefined,
    ageGroup: toAgeGroup(dto.ageMonths),
    ageLabel: formatAge(dto.ageMonths),
    photos,
    coverPhoto: photos[0] ?? PLACEHOLDER_PHOTO,
    traits: {
      vaccinated: dto.isVaccinated,
      neutered: dto.isNeutered,
      goodWithKids: dto.isGoodWithKids,
      goodWithPets: dto.isGoodWithPets,
    },
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  }
}
```

### 5.5 Server functions — the use-case boundary

One server function per use case. It: forwards the session cookie, calls one or more endpoints, maps to models, and normalises errors. It is the only place allowed to import from `~/server`.

```ts
// src/features/pets/api/pets.server.ts
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import {
  fetchPets,
  fetchPetById,
  createPet,
} from '~/server/api-client/endpoints/pets.endpoints'
import { withApiErrors } from '~/server/api-client/serialize-error'
import { petListQuerySchema, createPetRequestSchema } from '~/contracts'
import { toPet } from '../model/pet.model'

/** Only the headers the API is allowed to see. */
function forwardedHeaders(): HeadersInit {
  const { cookie } = getRequestHeaders()
  return cookie ? { cookie } : {}
}

export const getPetsFn = createServerFn({ method: 'GET' })
  .inputValidator(petListQuerySchema)
  .handler(
    withApiErrors(async ({ data }) => {
      const page = await fetchPets(data, forwardedHeaders())
      return { items: page.items.map(toPet), meta: page.meta }
    }),
  )

export const getPetFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ petId: idSchema }))
  .handler(
    withApiErrors(async ({ data }) =>
      toPet(await fetchPetById(data.petId, forwardedHeaders())),
    ),
  )

export const createPetFn = createServerFn({ method: 'POST' })
  .inputValidator(createPetRequestSchema)
  .handler(
    withApiErrors(async ({ data }) =>
      toPet(await createPet(data, forwardedHeaders())),
    ),
  )
```

**The serialisation trap.** Errors thrown inside a server function cross an RPC boundary, so `instanceof ApiError` is false on the client. `withApiErrors` catches `ApiError` and rethrows a plain JSON payload tagged `{ __apiError: true, ... }`; a client-side `parseApiError(unknown): ApiError` reconstructs it. Every `useQuery`/`useMutation` error handler goes through `parseApiError`, so the rest of the app sees one error type. This is a five-line utility that prevents a whole class of bug — write it in Phase 2, before any feature.

### 5.6 Query options and keys

Every query is defined once as a `queryOptions` factory so loaders and components cannot disagree.

```ts
// src/features/pets/api/pets.queries.ts
import { queryOptions } from '@tanstack/react-query'
import { getPetsFn, getPetFn } from './pets.server'
import type { PetListQuery } from '~/contracts'

export const petKeys = {
  all: ['pets'] as const,
  lists: () => [...petKeys.all, 'list'] as const,
  list: (query: PetListQuery) => [...petKeys.lists(), query] as const,
  mine: (status?: PetStatus) =>
    [...petKeys.all, 'mine', status ?? 'all'] as const,
  details: () => [...petKeys.all, 'detail'] as const,
  detail: (petId: string) => [...petKeys.details(), petId] as const,
} as const

export const petListQuery = (query: PetListQuery) =>
  queryOptions({
    queryKey: petKeys.list(query),
    queryFn: () => getPetsFn({ data: query }),
    staleTime: 30_000,
  })

export const petDetailQuery = (petId: string) =>
  queryOptions({
    queryKey: petKeys.detail(petId),
    queryFn: () => getPetFn({ data: { petId } }),
    staleTime: 60_000,
  })
```

Key rules: hierarchical, `all → lists/details → specific`, filters serialised as the object itself (Query hashes it deterministically). Never build a key inline at a call site.

### 5.7 Mutations and invalidation

Mutations live in `*.mutations.ts` as hooks. Every mutation declares its invalidations explicitly — this table is part of the spec, not an implementation detail.

| Mutation                | Invalidates                                                      | Optimistic?       |
| ----------------------- | ---------------------------------------------------------------- | ----------------- |
| `register`, `login`     | `authKeys.session()`, then reset the whole cache                 | No                |
| `logout`                | `queryClient.clear()`                                            | No                |
| `createPet`             | `petKeys.lists()`, `petKeys.mine()`                              | No                |
| `updatePet`             | `petKeys.detail(id)`, `petKeys.lists()`, `petKeys.mine()`        | No                |
| `updatePetStatus`       | `petKeys.detail(id)`, `petKeys.mine()`, `requestKeys.received()` | Yes (status chip) |
| `deletePet`             | `petKeys.mine()`, `petKeys.lists()`                              | Yes (row removal) |
| `createAdoptionRequest` | `requestKeys.sent()`, `petKeys.detail(petId)`                    | No                |
| `respondToRequest`      | `requestKeys.received()`, `petKeys.mine()`                       | Yes (status chip) |
| `withdrawRequest`       | `requestKeys.sent()`                                             | Yes               |
| `toggleFavourite`       | `favouriteKeys.list()`, patch `petKeys.detail(id)` in place      | Yes               |
| `updateProfile`         | `authKeys.session()`, `userKeys.detail(me)`                      | No                |

```ts
// src/features/pets/api/pets.mutations.ts
export function useCreatePet() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: CreatePetRequest) => createPetFn({ data: input }),
    onSuccess: async (pet) => {
      await queryClient.invalidateQueries({ queryKey: petKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: petKeys.mine() })
      toast.success(`${pet.name} is published`)
      await navigate({ to: '/dashboard/pets' })
    },
    onError: (error) =>
      reportMutationError(error, 'Could not publish the listing'),
  })
}
```

`reportMutationError` is one shared helper: it runs `parseApiError`, maps `validation_error` details onto form fields when a form is in scope, shows a toast otherwise, and logs. Toast copy is never a raw server message.

Optimistic updates use the standard `onMutate` snapshot → `onError` rollback → `onSettled` invalidate pattern, and **only** for the four cases marked above. Everywhere else, a pending state is honest and cheaper.

### 5.8 Query client defaults

```ts
// src/shared/config/query-client.ts
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const apiError = parseApiError(error)
          if (apiError.status >= 400 && apiError.status < 500) return false
          return failureCount < 2
        },
      },
      mutations: { retry: 0 },
    },
  })
}
```

A fresh `QueryClient` is created **per request** in `getRouter()`. Sharing one across requests on the server leaks one user's data into another's response — this is the single most dangerous mistake available in this stack.

---

## 6. Routing and URL state

### 6.1 Search params are a typed contract

```ts
// src/features/pets/schemas/pet-search.schema.ts
import { z } from 'zod'
import {
  speciesSchema,
  sizeSchema,
  sexSchema,
  ageGroupSchema,
  petSortSchema,
} from '~/contracts'

export const petSearchSchema = z.object({
  q: z.string().trim().min(1).optional(),
  species: z.array(speciesSchema).optional(),
  size: z.array(sizeSchema).optional(),
  sex: sexSchema.optional(),
  ageGroup: ageGroupSchema.optional(),
  city: z.string().trim().min(1).optional(),
  sort: petSortSchema.default('newest'),
  page: z.coerce.number().int().positive().default(1),
})

export type PetSearch = z.infer<typeof petSearchSchema>
```

```tsx
// src/routes/pets/index.tsx
export const Route = createFileRoute('/pets/')({
  validateSearch: petSearchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(petListQuery(deps.search)),
  head: () => ({ meta: [{ title: 'Pets looking for a home · Adopta' }] }),
  component: PetsBrowsePage,
})

function PetsBrowsePage() {
  const search = Route.useSearch()
  const { data } = useSuspenseQuery(petListQuery(search))
  return (
    <BrowseLayout
      filters={<PetFilters />}
      results={<PetGrid pets={data.items} />}
      pagination={<Pagination meta={data.meta} />}
    />
  )
}
```

Rules:

- `default()` on every optional param, so `Route.useSearch()` is fully typed with no `undefined` juggling.
- Filter changes are always `navigate({ search: (prev) => ({ ...prev, ...patch, page: 1 }) })` — a single `useUpdatePetSearch()` hook owns that so "reset page on filter change" exists in exactly one place.
- `validateSearch` failures fall back to defaults; malformed URLs must never 500.
- Nothing that belongs in the URL is duplicated in `useState`.

### 6.2 Route conventions

| Convention           | Meaning                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `_authenticated.tsx` | Pathless layout that guards everything beneath it.                                                |
| `(auth)/`            | Group folder — shared layout, no URL segment.                                                     |
| `$param`             | Dynamic segment.                                                                                  |
| `loader`             | Prefetch via `ensureQueryData` only. Loaders never return raw data the component then re-fetches. |
| `beforeLoad`         | Auth and redirects only.                                                                          |
| `errorComponent`     | Every route that loads data has one.                                                              |
| `pendingComponent`   | Provided by the route when the skeleton is page-shaped; otherwise Suspense inside.                |
| `head`               | Title and OG tags for every public route.                                                         |

Guard:

```tsx
// src/routes/_authenticated.tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(sessionQuery())
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    return { session }
  },
  component: DashboardShell,
})
```

`defaultPreload: 'intent'` is on, so hovering a pet card prefetches its detail query. That is most of the perceived performance of this app for free.

---

## 7. Forms

- One schema per form in `features/<slice>/schemas/`. It validates the **form's** shape (strings from inputs, confirmation fields, client-only rules), then a `toRequest()` function converts it to the contract's request type. Do not reuse a wire schema as a form schema; they diverge the moment you add "confirm password".
- Validation on `onBlur` and `onSubmit`, not on every keystroke.
- Server field errors (`validation_error.details`) are mapped onto fields by name; unmapped ones go to a form-level error region.
- Every form: disabled + spinner on submit, `aria-invalid` and `aria-describedby` on failing fields, focus moved to the first error, unsaved-changes guard on navigation for the long forms (pet create/edit, profile).
- Submit buttons name the action ("Publish listing", "Save changes"), never "Submit".

---

## 8. Auth and session

- Session is an **httpOnly, SameSite=Lax, Secure** cookie set by the API. The client never reads or stores a token; no tokens in `localStorage`.
- `sessionQuery()` (`GET /auth/session` via server function) is the single source of truth for "who am I". It is prefetched in `__root.tsx`'s loader so the header renders correctly on first paint (US-104).
- `useSession()` returns `{ user, isAuthenticated }` from that query. No auth context provider, no duplicated state.
- 401 from any server function → a router-level handler clears the cache and redirects to `/login` (US-106).
- The mock backend implements the same cookie so this code path is real from day one.

---

## 9. Errors, logging, observability

Four tiers, each with a distinct owner:

| Tier                                  | Where                                              | UI                                                                                     |
| ------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Expected domain error (404, 403, 409) | Route `errorComponent`, or inline in the component | Specific state: "Pet not found", "You don't have access", "You already sent a request" |
| Query failure (network, 5xx)          | `ErrorState` inside the section that failed        | Message + Retry that calls `refetch()`                                                 |
| Mutation failure                      | Toast, plus field errors for 422                   | Action-specific wording                                                                |
| Unexpected render error               | Root `ErrorBoundary`                               | Full-page fallback + Reload                                                            |

Never show a raw server message or a stack trace to a user. Never swallow an error silently — `catch {}` without a `logger` call fails review.

```ts
// src/shared/lib/logger.ts
type Level = 'debug' | 'info' | 'warn' | 'error'

function emit(level: Level, event: string, data?: Record<string, unknown>) {
  const payload = { level, event, at: new Date().toISOString(), ...data }
  if (level === 'error') console.error(payload)
  else if (level === 'warn') console.warn(payload)
  else console.info(payload)
}

export const logger = {
  debug: (event: string, data?: Record<string, unknown>) => {
    if (import.meta.env.DEV) emit('debug', event, data)
  },
  info: (event: string, data?: Record<string, unknown>) =>
    emit('info', event, data),
  warn: (event: string, data?: Record<string, unknown>) =>
    emit('warn', event, data),
  error: (event: string, data?: Record<string, unknown>) =>
    emit('error', event, data),
}
```

Bare `console.log` is banned by `no-console` (allowing only `info`, `warn`, `error`), and application code logs through `logger`, never `console` directly. One structured log line per API call and per mutation outcome is enough observability for this project, and it is the seam where a real sink (Sentry, OTel) drops in later.

---

## 10. Naming and code standards

### Files

| Kind                   | Convention                                 | Example                                 |
| ---------------------- | ------------------------------------------ | --------------------------------------- |
| All files and folders  | `kebab-case`                               | `pet-card.tsx`, `adoption-requests/`    |
| Route files            | TanStack conventions                       | `$petId.edit.tsx`, `_authenticated.tsx` |
| Contract               | `<resource>.contract.ts`                   | `pet.contract.ts`                       |
| Endpoints              | `<resource>.endpoints.ts`                  | `pets.endpoints.ts`                     |
| Server functions       | `<slice>.server.ts`                        | `pets.server.ts`                        |
| Queries / mutations    | `<slice>.queries.ts` / `.mutations.ts`     |                                         |
| Form / URL schemas     | `<thing>.schema.ts`                        | `pet-form.schema.ts`                    |
| Domain model + mappers | `<entity>.model.ts`                        | `pet.model.ts`                          |
| Hooks                  | `use-<thing>.ts`                           | `use-debounced-value.ts`                |
| Tests                  | `<subject>.test.ts(x)` next to the subject | `pet-age.test.ts`                       |
| E2E                    | `<flow>.spec.ts` in `tests/e2e`            | `publish-listing.spec.ts`               |

### Symbols

- Components `PascalCase`; one exported component per file, named the same as the file.
- Hooks `useThing`. Functions `camelCase`, verb first (`fetchPets`, `toPet`, `formatAge`).
- Types and interfaces `PascalCase`, **no `I` prefix**. `interface` for object shapes, `type` for unions, aliases and mapped types.
- Booleans read as predicates: `isLoading`, `hasPhotos`, `canEdit`.
- Constants `SCREAMING_SNAKE_CASE` in `shared/config` or a slice's `constants.ts`.
- Event props `onX`; handlers inside a component `handleX`.
- Async functions never named `getX` if they hit the network — `fetchX` for network, `getX` for pure/local reads.
- Enum-like values are string union types from Zod enums, never TS `enum`.

### Components

- Named function declarations, not arrow consts, for components.
- Props interface declared above the component, named `<Component>Props`, not exported unless another module needs it.
- Order inside a component: hooks → derived values → handlers → early returns → JSX.
- No default exports anywhere except route files (which the router requires) and config files.
- Presentational components take data as props and do not fetch. Only one component per screen section owns a `useQuery`. Container/presentational split is by need, not by ritual.
- Files stay under ~200 lines. A component over ~150 lines is a sign a child component exists.
- `cn()` for class composition; conditional classes via CVA variants, not ternary soup in JSX.
- No inline styles except genuinely dynamic values (e.g. a computed upload progress width).

### Imports

Ordered by ESLint: node builtins → external → `~/contracts` → `~/server` → `~/features` → `~/shared` → relative → styles. Type-only imports use `import type`.

### Comments

Comment **why**, never **what**. Every non-obvious decision gets one line. Every workaround gets a link to the issue. JSDoc on exported functions in `contracts`, `server` and `shared/lib` — the parts read by people who didn't write them.

### Git

- Conventional Commits, enforced by commitlint: `feat(pets): filter by species`.
- Branches: `feat/…`, `fix/…`, `chore/…`.
- One PR per user story where possible; PR description links the `US-xxx` id.
- PR checklist: types pass, lint passes, tests pass, loading/empty/error states present, keyboard-navigable, no `TODO` without an issue.

---

## 11. Testing strategy

| Layer      | Tool             | What is actually tested                                                                                                                                                                                                                                                                      |
| ---------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pure logic | Vitest           | `pet-age`, formatters, mappers (`toPet` with edge DTOs), search-param schema parsing including invalid input                                                                                                                                                                                 |
| Contracts  | Vitest           | Every mock handler response parses against its contract schema. This is the test that keeps mock and contract honest.                                                                                                                                                                        |
| Components | RTL + user-event | Forms (validation, error mapping, submit states), filters (URL updates), `PetCard` states, empty/error states                                                                                                                                                                                |
| Hooks      | RTL              | `useUpdatePetSearch`, `useSession`                                                                                                                                                                                                                                                           |
| Flows      | Playwright       | 1. register → publish a pet → see it in browse. 2. sign in → request a pet → guardian accepts → adopter sees contact details. 3. filter + share URL → same results. 4. guard: `/dashboard/pets` while signed out → login → land on it. 5. photo upload with a failing file → retry succeeds. |

- MSW (`msw/node`) provides handler overrides in component tests so error and empty paths are trivial to exercise.
- No snapshot tests of markup. No tests asserting implementation details (class names, internal state).
- Coverage target: 80% on `features/*/model`, `features/*/schemas`, `shared/lib`; no target elsewhere. Coverage is a smoke detector, not a goal.
- Every bug fix ships with the test that would have caught it.

---

## 12. Tooling and CI

`package.json` scripts:

```jsonc
{
  "dev": "vite dev",
  "build": "vite build",
  "start": "node .output/server/index.mjs",
  "typecheck": "tsc --noEmit",
  "lint": "eslint . --max-warnings 0",
  "format": "prettier --write .",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "validate": "pnpm typecheck && pnpm lint && pnpm test",
}
```

- Husky `pre-commit` → lint-staged (eslint --fix, prettier). `commit-msg` → commitlint.
- CI on every PR: install (frozen lockfile) → typecheck → lint → unit tests → build → Playwright. Red CI blocks merge.
- Env validated at boot; the app refuses to start with a missing or malformed variable rather than failing at the first request.

```ts
// src/server/env.server.ts
const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  API_BASE_URL: z.url(),
  API_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  MOCK_API: z.stringbool().default(true),
  MOCK_LATENCY_MS: z.coerce.number().int().nonnegative().default(180),
  MOCK_ERROR_RATE: z.coerce.number().min(0).max(1).default(0),
})

export const serverEnv = schema.parse(process.env)
```

Client-visible variables go through `src/shared/config/env.client.ts` and must be prefixed `VITE_`. Anything not prefixed is server-only by construction — no secret can leak into the bundle by accident.

---

## 13. Performance and accessibility budgets

| Budget                                      | Target                                                                                                | How it's held                                                                                                                                                                                         |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LCP on `/pets` (mid-tier mobile, throttled) | < 2.5 s                                                                                               | SSR + loader prefetch, `fetchpriority="high"` on the first row's covers                                                                                                                               |
| CLS                                         | < 0.05                                                                                                | Fixed aspect-ratio image containers, skeletons matching final layout                                                                                                                                  |
| JS on first load                            | < 250 KB gzipped                                                                                      | Route-level code splitting is automatic; audit before Phase 8 sign-off                                                                                                                                |
| Images                                      | ≤ 6 per pet, lazy below the fold, `width`/`height` always set, `srcset` when the API returns variants |                                                                                                                                                                                                       |
| Accessibility                               | WCAG 2.1 AA                                                                                           | Semantic landmarks, one `<h1>` per page, labelled controls, 4.5:1 text contrast, visible focus, focus trap + restore in dialogs, `prefers-reduced-motion` respected, keyboard-only pass on every flow |

---

## 14. Definition of Done (any story)

1. Types pass, lint passes with zero warnings, unit tests pass.
2. Loading, empty and error states implemented — not just the happy path.
3. Works at 360 px and at 1440 px.
4. Keyboard-only pass completed; focus visible everywhere.
5. Any new endpoint use exists in `docs/03-api-contract.md` **and** in the mock backend, with a contract test.
6. No new dependency without a line in the PR description saying why nothing already installed does the job.
7. Layer boundaries respected (ESLint proves it).
