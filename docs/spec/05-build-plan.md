# 05 — Build Plan

Nine phases. Each has a single goal, a task checklist, and a definition of done that is demonstrable — you can show it to someone, not just claim it. **Do not start a phase before the previous one's DoD is met.** The ordering exists so that the expensive, hard-to-change decisions are validated by real screens as early as possible.

Estimates assume one developer. They are relative sizing, not commitments.

---

## Phase 0 — Foundation

**Goal:** an empty app that already enforces every standard, so no code ever has to be retrofitted.

- [ ] `pnpm create` a TanStack Start app; pin every dependency to an exact version; commit the lockfile.
- [ ] `tsconfig.json` with the strict flag set from doc 02 §1, `~/*` path alias.
- [ ] ESLint 9 flat config: typescript-eslint (type-checked rules), react, react-hooks, jsx-a11y, import ordering, `eslint-plugin-boundaries` with the layer rules from doc 02 §3, `no-console` allowing only `info`/`warn`/`error`.
- [ ] Prettier, `.editorconfig`, Husky + lint-staged + commitlint (Conventional Commits).
- [ ] Folder skeleton from doc 02 §4, with a `.gitkeep` in every empty directory so the structure is the first thing a reader sees.
- [ ] `src/server/env.server.ts` and `src/shared/config/env.client.ts` with Zod validation; `.env.example` committed.
- [ ] `src/shared/lib/logger.ts`, `cn.ts`, `format.ts`.
- [ ] `getRouter()` with a **per-request** `QueryClient`, `setupRouterSsrQueryIntegration`, `defaultPreload: 'intent'`, `defaultNotFoundComponent`, `defaultErrorComponent`.
- [ ] Root route with `<html>` shell, font loading, `globals.css`, devtools in dev only.
- [ ] Vitest config + one trivial passing test. Playwright config + one smoke test hitting `/`.
- [ ] GitHub Actions CI: install → typecheck → lint → test → build → e2e.
- [ ] Verify the pinned version's server-helper names (`getRequestHeaders`, `setCookie`, server-route handler signature) against its own docs; write findings to `docs/notes/start-api.md`.

**DoD** — `pnpm validate` is green on a clean clone; CI passes; an intentional cross-slice import fails lint; a missing env var stops the app at boot with a readable message.

**Size:** S–M. **Risk if skipped:** every later phase pays interest.

---

## Phase 1 — Design system and app shell

**Goal:** a styled, navigable, empty application. Nothing fetches anything yet.

- [ ] Tokens in `globals.css` as `@theme` variables (doc 04 §C.6). Fonts self-hosted or via a single preconnected provider, `font-display: swap`.
- [ ] Primitives, in this order: `Button`, `Input`, `Textarea`, `Field`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `SegmentedControl`, `Card`, `Avatar`, `Chip`, `StatusStamp`, `MonoLabel`, `Skeleton`, `Spinner`, `Tabs`, `DropdownMenu`, `Dialog`, `Sheet`, `Tooltip`, `Toast`, `Pagination`, `Progress`, `Combobox`.
- [ ] Composites: `AppHeader` (both signed-in/out variants, static), `AppFooter`, `PageHeader`, `EmptyState`, `ErrorState`, `ConfirmDialog`, `DashboardSidebar`.
- [ ] A dev-only `/_kitchen-sink` route rendering every component in every variant and state. It is how you review the design system and how you catch regressions by eye.
- [ ] Route shells for every path in doc 04 §A.1, each with static placeholder content and correct `head` meta.
- [ ] 404 and root error boundary.
- [ ] Keyboard pass over the kitchen sink: tab order, focus rings, dialog focus trap and restore.

**DoD** — every screen is reachable and looks finished with placeholder content; the kitchen sink shows all states; a keyboard-only user can operate every primitive; no hardcoded hex or px font size anywhere.

**Size:** L. **Note:** this is where the Claude Design output gets translated. Do it before data, so data work never blocks on visual decisions.

---

## Phase 2 — Contracts, fetch layer, mock backend

**Goal:** the data spine. No UI changes in this phase — the deliverable is proven by tests and devtools.

- [ ] `src/contracts/**`: every schema and type from doc 03, plus `enums.ts`. Contracts import nothing from the app.
- [ ] `src/server/api-client/api-error.ts` — `ApiError` with `status`, `code`, `details`, plus `fromResponse`, `network`, `contract` factories.
- [ ] `serialize-error.ts` — `withApiErrors` wrapper and client-side `parseApiError`. **Write this before any feature**; it is the thing that makes every later error path uniform.
- [ ] `http.ts` — the single `apiRequest`, with query serialisation, timeout, Zod parsing, one structured log line per call.
- [ ] All six endpoint modules from doc 03 §3. Signatures only — no logic.
- [ ] `src/mocks/repository.ts`, `seed.ts` (fixed faker seed, dataset from doc 03 §4.3), `latency.ts` (`withMockBehaviour`), and handlers for every endpoint including the `/__mock/*` control routes.
- [ ] `src/routes/api/v1/**` server routes wiring handlers to HTTP.
- [ ] `query-client.ts` defaults (doc 02 §5.8).
- [ ] Contract test: every mock handler's response parses against the `api-client` schema. This is the phase's most valuable test.
- [ ] Unit tests for `http.ts`: query serialisation, 204 handling, error mapping, contract-mismatch throwing.

**DoD** — `curl` every endpoint and get contract-valid responses with correct status codes; latency and error-rate knobs demonstrably work; the contract test suite is green; nothing in `features/` or `routes/` (outside `routes/api`) has changed.

**Size:** L. **This is the phase people rush and regret.** Everything after it is fast if this is right.

---

## Phase 3 — Auth

**Goal:** real sessions, real guards.

- [ ] Session cookie handling in the mock backend (`/auth/register`, `/auth/login`, `/auth/logout`, `/auth/session`).
- [ ] `features/auth`: `auth.server.ts`, `sessionQuery`, `authKeys`, `useSession`, `useLogin`, `useRegister`, `useLogout`.
- [ ] Session prefetch in `__root.tsx`'s loader so the header is correct on first paint.
- [ ] `LoginForm`, `RegisterForm` with TanStack Form + Zod, field-level server-error mapping, submit states.
- [ ] `_authenticated.tsx` guard with `redirect` search param round-trip.
- [ ] `UserMenu` wired to the real session; sign-out clears the cache.
- [ ] Global 401 handling → clear cache, redirect to `/login`, toast.
- [ ] Tests: register/login form validation and error mapping; guard redirect; E2E flow 4 (guarded route → login → land on original URL).

**DoD** — register, sign in, reload (still signed in), sign out; direct-navigate to a dashboard URL while signed out and land back on it after signing in; duplicate email shows on the field, not in a toast.

**Size:** M.

---

## Phase 4 — Browse and detail (read paths)

**Goal:** the public product works end to end. This is the first phase that produces something worth showing.

- [ ] `pet.model.ts` + `toPet` mapper + `pet-age.ts` utilities, with unit tests for boundary ages.
- [ ] `pet-search.schema.ts`, `useUpdatePetSearch()` (the single owner of "patch search, reset page").
- [ ] `pets.server.ts`, `petKeys`, `petListQuery`, `petDetailQuery`, `userPetsQuery`.
- [ ] `/pets`: `PetFilters` (inline + bottom sheet), `PetFilterChips`, `PetSortSelect`, debounced search, `PetGrid`, `PetCard`, `PetCardSkeleton`, `Pagination`, both empty states, error state.
- [ ] `/pets/:petId`: `PetGallery`, `PetRecord`, `PetTraits`, `GuardianSummary`, all five CTA states (request dialog itself comes in Phase 6 — stub the click), 404 page, `head` meta including Open Graph.
- [ ] `/users/:userId` public profile.
- [ ] `/` landing with real recent pets and real counts.
- [ ] Route loaders using `ensureQueryData` on every one of these.
- [ ] Tests: filter interactions write the correct URL; invalid search params fall back to defaults; `PetCard` renders each status; E2E flow 3 (filter, copy URL, reopen, same results).

**DoD** — SSR view-source on `/pets?species=dog&page=2` contains the right pets; JS disabled still renders content; hovering a card prefetches its detail; every state visible with `MOCK_ERROR_RATE=1` and an empty seed.

**Size:** L.

---

## Phase 5 — Listing management (write paths)

**Goal:** a user can put a pet on the site.

- [ ] `POST /uploads` in the mock, serving real bytes at a real URL.
- [ ] `PetPhotoUploader`: multi-select and drag-drop, client-side type/size validation before upload, per-file progress, per-file retry, remove, reorder (keyboard-accessible reordering, not drag-only), cover label.
- [ ] `pet-form.schema.ts` + `toCreatePetRequest()`; `PetForm` in create and edit modes; all five sections from doc 04 §B.7.
- [ ] `useCreatePet`, `useUpdatePet`, `useUpdatePetStatus`, `useDeletePet` with the invalidations from doc 02 §5.7.
- [ ] `/dashboard/pets`: status tabs with counts, `PetListingRow`, `⋯` actions menu, mobile card layout, empty states.
- [ ] `UnsavedChangesGuard` on create/edit.
- [ ] Ownership: edit route `beforeLoad` fetches the pet and throws a 403 state if it isn't yours.
- [ ] Confirm dialogs for mark-adopted and delete, with the copy from doc 04 §E.
- [ ] Tests: form validation including all boundaries; server 422 → field errors; optimistic delete rollback on failure; E2E flows 1 and 5.

**DoD** — publish a pet with three photos, see it in `/pets`, edit it, change its status, delete it; a 5.1 MB file is rejected client-side with the right message; a forced upload failure is retryable per file.

**Size:** L. **Riskiest phase** — uploads and reorderable file state is where scope quietly grows. Keep it to the contract.

---

## Phase 6 — Adoption requests

**Goal:** the actual point of the product.

- [ ] Mock handlers for all five request endpoints including every 409 case from doc 03 §3.6.
- [ ] `features/adoption-requests`: server fns, `requestKeys`, `requestsQuery(role, status)`, `useCreateRequest`, `useRespondToRequest`, `useWithdrawRequest`.
- [ ] `RequestDialog` on the pet page, with the signed-out → login → return-to-dialog path.
- [ ] Wire all five pet-page CTA states to real `viewerRequestStatus` data.
- [ ] `/dashboard/requests/received`: tabs, `RequestPanel`, message clamping, accept-with-reserve confirm, decline, `ContactBlock` after acceptance.
- [ ] `/dashboard/requests/sent`: mirrored panels, `ContactBlock`, withdraw.
- [ ] Pending-count badge in the header and sidebar.
- [ ] Deep link `?petId=` from the listing row's pending-requests link.
- [ ] Tests: duplicate request blocked; self-request blocked; non-pending response returns 409 and the UI recovers; E2E flow 2 (request → accept → adopter sees contact details).

**DoD** — with two browser profiles, the full two-sided flow works, and contact details appear for exactly the two parties and nowhere else.

**Size:** M–L.

---

## Phase 7 — Favourites and profile

**Goal:** finish the MVP surface.

- [ ] Favourites endpoints in the mock; `useToggleFavourite` with optimistic update, rollback, and in-place patch of `petKeys.detail`.
- [ ] `FavouriteButton` on cards and detail; signed-out → sign-in prompt.
- [ ] `/dashboard/favourites` with honest status chips and remove action.
- [ ] `ProfileForm`, avatar upload, dirty-only sticky save bar, read-only email with explanation, the privacy footnote.
- [ ] Tests: optimistic toggle rollback; profile validation.

**DoD** — favourite from a card and see it reflected on the detail page without a refetch; a forced failure reverts the heart; profile changes appear immediately in the header.

**Size:** S–M.

---

## Phase 8 — Hardening and handover

**Goal:** ship quality, and leave the backend team something to build against.

- [ ] Accessibility pass: keyboard-only run of all five E2E flows; axe on every route; landmarks, single `h1`, labelled controls, contrast, focus trap/restore, `prefers-reduced-motion`.
- [ ] Performance pass against the budgets in doc 02 §13: Lighthouse on `/pets` and `/pets/:id`, bundle audit, `fetchpriority` on above-fold covers, lazy-load the rest, confirm no CLS from images.
- [ ] Responsive sweep at 360 / 390 / 768 / 1024 / 1440 px on every screen.
- [ ] Error-path sweep with `MOCK_ERROR_RATE=1` and `MOCK_LATENCY_MS=3000`: confirm every skeleton, every retry, no infinite spinner, no unhandled rejection.
- [ ] Empty-state sweep with an empty seed.
- [ ] Remove dead code, `TODO`s without issues, unused dependencies, and the kitchen sink from production builds.
- [ ] README: setup, scripts, env vars, demo credentials, architecture summary, how to switch off the mock.
- [ ] **Backend handover package:** doc 03 as-is, the contract schemas in `src/contracts`, an OpenAPI 3.1 document generated from the Zod schemas, and the mock handlers as reference behaviour.
- [ ] Deploy a preview build.

**DoD** — CI green, budgets met, axe clean, handover package reviewed by whoever will build the backend.

**Size:** M.

---

## Phase 9 — Real backend swap (future)

Written now so the seams stay honest.

- [ ] Point `API_BASE_URL` at the real host; set `MOCK_API=false`.
- [ ] Run the contract test suite against the real API; every failure is either a backend bug or a contract amendment — never a frontend patch.
- [ ] Delete `src/routes/api/`, `src/mocks/`, and the `/__mock/*` calls in Playwright fixtures (replace with a seeded test database).
- [ ] Move Playwright to a seeded staging environment.

If Phase 2 was done properly, this phase is a day. If it wasn't, it's a rewrite. That is the whole argument for doc 02's decisions D4 and D5.

---

## Sequencing notes

- **Critical path:** 0 → 1 → 2 → 3 → 4 → 5 → 6. Phases 1 and 2 can run in parallel by two people with zero conflicts, because Phase 1 touches only `shared/` and `routes/` shells and Phase 2 touches only `contracts/`, `server/`, `mocks/`. That parallelism is a direct payoff of the layer rules.
- Phase 7 can slip behind Phase 8 without harming the MVP; both P1 stories live there.
- Never build a feature before its mock endpoint exists. Building UI against imagined responses is how the contract quietly becomes fiction.

## Risk register

| Risk                                            | Likelihood          | Mitigation                                                                                          |
| ----------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------- |
| TanStack Start API drift on the 1.x line        | Medium              | Exact pins; upgrades are scheduled work with a full `validate` run, never incidental                |
| Server-fn error serialisation surprises         | High if unaddressed | `withApiErrors` / `parseApiError` built in Phase 2, before any feature depends on error shapes      |
| Query cache leaking across SSR requests         | Low, catastrophic   | `QueryClient` created inside `getRouter()`, asserted by a test                                      |
| Photo upload scope creep (crop, EXIF, variants) | High                | The contract defines one file per request and no transforms; anything more is post-MVP              |
| Contract drift between mock and frontend        | Medium              | The contract test in Phase 2 makes drift a CI failure                                               |
| TanStack Form friction                          | Low                 | Forms are local to slices; a single form can move to React Hook Form without touching anything else |
| Design system rework after Claude Design        | Medium              | Phase 1 builds tokens first and components second, so a palette or type change is a variable edit   |
