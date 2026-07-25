# 03 — API Contract

This document is the contract the frontend is built against and the specification the backend will implement. The mock server implements it exactly; when the real backend exists, only `API_BASE_URL` changes.

## 1. Conventions

| Aspect               | Rule                                                                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base URL             | `{API_BASE_URL}` = `/api/v1` (mock: `http://localhost:3000/api/v1`)                                                                                            |
| Format               | JSON only. `Content-Type: application/json` except `POST /uploads` (multipart).                                                                                |
| Auth                 | httpOnly cookie `adopta_session`, `SameSite=Lax`, `Secure` in production, 30-day expiry. Set by `/auth/register` and `/auth/login`, cleared by `/auth/logout`. |
| Ids                  | UUID v7 strings. Never numeric, never exposed sequentially.                                                                                                    |
| Timestamps           | ISO 8601 with offset, UTC: `2026-07-25T10:15:00.000Z`. Read-only, server-generated.                                                                            |
| Absent values        | Nullable fields are `null`, never omitted, never `""`. The frontend maps `null → undefined`.                                                                   |
| Casing               | `camelCase` for all fields and query params.                                                                                                                   |
| Array query params   | Repeated: `?species=dog&species=cat`. Not comma-joined.                                                                                                        |
| Unknown query params | Ignored, never an error.                                                                                                                                       |
| Partial updates      | `PATCH` with only changed fields. Omitted field = unchanged. Explicit `null` = clear.                                                                          |
| Trailing slashes     | Not used.                                                                                                                                                      |
| Rate limits          | Not implemented in the mock. Backend should add them; frontend already handles `429 → rate_limited`.                                                           |

### 1.1 Status codes

| Code | Used for                                                                                                       |
| ---- | -------------------------------------------------------------------------------------------------------------- |
| 200  | Successful GET, PATCH                                                                                          |
| 201  | Successful POST that creates a resource; includes `Location` header                                            |
| 204  | Successful DELETE or logout; empty body                                                                        |
| 400  | Malformed request (unparseable JSON, bad query type)                                                           |
| 401  | No session, or an expired one → `unauthenticated`                                                              |
| 403  | Authenticated but not permitted (editing another user's pet) → `forbidden`                                     |
| 404  | Resource missing, or exists but not visible to this caller → `not_found`                                       |
| 409  | State conflict (duplicate email, duplicate adoption request, responding to a non-pending request) → `conflict` |
| 413  | Upload too large                                                                                               |
| 422  | Semantic validation failure with field details → `validation_error`                                            |
| 429  | Rate limited                                                                                                   |
| 500  | Anything unexpected → `internal_error`, no details leaked                                                      |

> Deliberate choice: a pet that exists but is `withdrawn` and not yours returns **404, not 403**, so the API doesn't confirm the existence of records the caller shouldn't know about.

### 1.2 Error envelope

Every non-2xx response, without exception:

```json
{
  "error": {
    "code": "validation_error",
    "message": "The listing could not be saved.",
    "details": [
      { "field": "name", "message": "Name must be at least 2 characters." },
      { "field": "photos", "message": "Add at least one photo." }
    ]
  }
}
```

- `code` is one of: `validation_error`, `unauthenticated`, `forbidden`, `not_found`, `conflict`, `rate_limited`, `internal_error`. The frontend branches on `code`, never on `message`.
- `message` is human-readable and safe to log, but the UI shows **its own** copy. Server messages are not user-facing strings.
- `details` appears only with `validation_error`. `field` uses dot/bracket paths for nested values: `photos[0].url`.

### 1.3 List envelope

```json
{
  "items": [/* … */],
  "meta": { "page": 1, "perPage": 12, "total": 38, "totalPages": 4 }
}
```

Page-based pagination, chosen because pages map cleanly onto shareable URLs (US-206). `page` is 1-based. Out-of-range pages return an empty `items` array with correct `meta`, not a 404. Cursor pagination is a documented future change; the frontend reads `meta` through one component so the swap touches two files.

### 1.4 Enums

```ts
species = 'dog' | 'cat' | 'rabbit' | 'bird' | 'other'
sex = 'male' | 'female' | 'unknown'
size = 'small' | 'medium' | 'large'
ageGroup = 'baby' | 'young' | 'adult' | 'senior' // derived, filter-only
petStatus = 'available' | 'reserved' | 'adopted' | 'withdrawn'
requestStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn'
petSort = 'newest' | 'oldest' | 'name_asc'
requestRole = 'adopter' | 'guardian'
```

`ageGroup` boundaries (applied by the API when filtering, and by the frontend when labelling — both derive from the same table):

| Group    | Months |
| -------- | ------ |
| `baby`   | 0–5    |
| `young`  | 6–23   |
| `adult`  | 24–95  |
| `senior` | 96+    |

### 1.5 Field constraints

Single source of truth for validation. The frontend enforces these client-side **and** the API enforces them again.

| Field                     | Constraint                       |
| ------------------------- | -------------------------------- |
| `user.name`               | 2–60 chars                       |
| `user.email`              | valid email, unique, ≤ 254 chars |
| `password`                | 8–72 chars                       |
| `user.city`               | 2–80 chars                       |
| `user.bio`                | ≤ 500 chars, nullable            |
| `user.phone`              | ≤ 30 chars, nullable             |
| `pet.name`                | 2–40 chars                       |
| `pet.breed`               | ≤ 60 chars, nullable             |
| `pet.ageMonths`           | integer 0–360                    |
| `pet.weightKg`            | 0.1–120, one decimal, nullable   |
| `pet.description`         | 30–2000 chars                    |
| `pet.city`                | 2–80 chars                       |
| `pet.photos`              | 1–6 items                        |
| `adoptionRequest.message` | 20–1000 chars                    |
| upload file               | JPEG/PNG/WebP, ≤ 5 MB            |

---

## 2. Resources

### 2.1 `UserSummary` — public, embedded

```ts
{
  id: string
  name: string
  city: string
  avatarUrl: string | null
  createdAt: string
}
```

### 2.2 `User` — public profile (`GET /users/:userId`)

`UserSummary` plus:

```ts
{
  bio: string | null
  availablePetCount: number
}
```

### 2.3 `SessionUser` — the authenticated user (`GET /auth/session`)

`User` plus private fields:

```ts
{
  email: string
  phone: string | null
}
```

### 2.4 `PetPhoto`

```ts
{
  id: string
  url: string
  alt: string | null
  width: number
  height: number
}
```

Order in the array is meaningful: index 0 is the cover.

### 2.5 `Pet`

```ts
{
  id: string
  name: string
  species: Species
  breed: string | null
  sex: Sex
  ageMonths: number
  size: Size
  weightKg: number | null
  description: string
  photos: PetPhoto[]
  city: string
  status: PetStatus
  isVaccinated: boolean
  isNeutered: boolean
  isGoodWithKids: boolean
  isGoodWithPets: boolean
  isFavourited: boolean          // false when unauthenticated
  viewerRequestStatus: RequestStatus | null   // this viewer's own request, if any
  guardian: UserSummary
  createdAt: string
  updatedAt: string
}
```

`isFavourited` and `viewerRequestStatus` are **viewer-dependent**. They exist so the pet page can render the correct button state in one request instead of three (US-402). The backend must compute them from the session, and must return `false`/`null` for anonymous callers.

### 2.6 `OwnedPet` — only in `GET /me/pets`

`Pet` plus:

```ts
{
  pendingRequestCount: number
}
```

### 2.7 `AdoptionRequest`

```ts
{
  id: string
  status: RequestStatus
  message: string
  pet: {
    id: string
    name: string
    status: PetStatus
    coverPhoto: PetPhoto | null
  }
  adopter: UserSummary
  guardian: UserSummary
  /** Present only when status === 'accepted', and only to the two parties. */
  contact: { email: string; phone: string | null } | null
  createdAt: string
  respondedAt: string | null
}
```

`contact` holds the **counterparty's** details: the adopter sees the guardian's, the guardian sees the adopter's. Anyone else gets 404 on the resource entirely. This is the whole of US-407.

### 2.8 `Upload`

```ts
{
  id: string
  url: string
  width: number
  height: number
  byteSize: number
}
```

---

## 3. Endpoints

### 3.1 Auth

| Method | Path             | Auth     | Returns                                    |
| ------ | ---------------- | -------- | ------------------------------------------ |
| POST   | `/auth/register` | —        | `201 SessionUser` + `Set-Cookie`           |
| POST   | `/auth/login`    | —        | `200 SessionUser` + `Set-Cookie`           |
| POST   | `/auth/logout`   | ✓        | `204` + cleared cookie                     |
| GET    | `/auth/session`  | optional | `200 SessionUser` or `401 unauthenticated` |

**POST /auth/register**

```json
{
  "name": "Marta Ruiz",
  "email": "marta@example.com",
  "password": "correct-horse",
  "city": "Barcelona"
}
```

- `409 conflict` with `details: [{ field: "email", message: "…" }]` when the email exists. The frontend surfaces it on the email input (US-101).

**POST /auth/login**

```json
{ "email": "marta@example.com", "password": "correct-horse" }
```

- `401 unauthenticated` for both wrong email and wrong password, with one generic message. No user enumeration.

**GET /auth/session** returns 401 rather than `200 null` when there is no session, so the frontend's 401 interceptor is the only place session-expiry is handled. `sessionQuery` treats 401 as `null` data, not an error.

### 3.2 Users

| Method | Path                  | Auth     | Returns                                 |
| ------ | --------------------- | -------- | --------------------------------------- |
| GET    | `/users/:userId`      | optional | `200 User`                              |
| PATCH  | `/users/me`           | ✓        | `200 SessionUser`                       |
| GET    | `/users/:userId/pets` | optional | `200 Paginated<Pet>` — `available` only |

**PATCH /users/me** — any subset of `{ name, city, phone, bio, avatarUrl }`. `email` is rejected with `422` in the MVP.

### 3.3 Pets — public

| Method | Path           | Auth     | Returns              |
| ------ | -------------- | -------- | -------------------- |
| GET    | `/pets`        | optional | `200 Paginated<Pet>` |
| GET    | `/pets/:petId` | optional | `200 Pet`            |

**GET /pets** query parameters:

| Param      | Type      | Default  | Notes                                                                |
| ---------- | --------- | -------- | -------------------------------------------------------------------- |
| `q`        | string    | —        | Case-insensitive substring match over `name`, `breed`, `description` |
| `species`  | species[] | —        | OR within the param                                                  |
| `size`     | size[]    | —        | OR within the param                                                  |
| `sex`      | sex       | —        |                                                                      |
| `ageGroup` | ageGroup  | —        | Translated to a month range by the API                               |
| `city`     | string    | —        | Case-insensitive substring                                           |
| `sort`     | petSort   | `newest` |                                                                      |
| `page`     | int ≥ 1   | `1`      |                                                                      |
| `perPage`  | int 1–48  | `12`     | Frontend always sends the app constant                               |

Different params AND together; repeated values of one param OR together. Public browse returns only `available` and `reserved` — never `adopted` or `withdrawn` (US-201).

**GET /pets/:petId** — visible to anyone if `available`/`reserved`; visible to the guardian in any status; `404` otherwise.

### 3.4 Pets — owned

| Method | Path                  | Auth    | Returns                                  |
| ------ | --------------------- | ------- | ---------------------------------------- |
| GET    | `/me/pets`            | ✓       | `200 Paginated<OwnedPet>` — all statuses |
| POST   | `/pets`               | ✓       | `201 Pet`                                |
| PATCH  | `/pets/:petId`        | ✓ owner | `200 Pet`                                |
| PATCH  | `/pets/:petId/status` | ✓ owner | `200 Pet`                                |
| DELETE | `/pets/:petId`        | ✓ owner | `204`                                    |

`GET /me/pets` accepts `status`, `page`, `perPage`, `sort`.

**POST /pets**

```json
{
  "name": "Nala",
  "species": "dog",
  "breed": "Podenco mix",
  "sex": "female",
  "ageMonths": 18,
  "size": "medium",
  "weightKg": 14.5,
  "description": "Nala walks calmly on the lead and settles quickly indoors…",
  "city": "Barcelona",
  "photos": [{ "uploadId": "018f…", "alt": "Nala sitting in the sun" }],
  "isVaccinated": true,
  "isNeutered": true,
  "isGoodWithKids": true,
  "isGoodWithPets": false
}
```

Photos are referenced by `uploadId` from a prior `POST /uploads`, in display order. The API resolves them to `PetPhoto` objects and rejects unknown or already-consumed ids with `422`. `status` cannot be set on create — new pets are always `available`.

**PATCH /pets/:petId** — any subset of the create body. Sending `photos` replaces the whole array (order included); omitting it leaves photos untouched.

**PATCH /pets/:petId/status**

```json
{ "status": "adopted", "declinePendingRequests": true }
```

- Legal transitions: `available ↔ reserved`, `available|reserved → adopted`, any → `withdrawn`. Anything else → `409 conflict`.
- `declinePendingRequests` (default `true`) declines all `pending` requests for that pet when moving to `adopted`. The frontend states this in the confirmation dialog (US-305).

**DELETE /pets/:petId** — hard delete in the MVP; cascades to its adoption requests and favourites.

### 3.5 Uploads

| Method | Path       | Auth | Returns      |
| ------ | ---------- | ---- | ------------ |
| POST   | `/uploads` | ✓    | `201 Upload` |

`multipart/form-data`, single field `file`. One file per request so the frontend can show per-file progress and per-file retry (US-302).

- `413` when over 5 MB, `422 validation_error` on an unsupported type.
- Uploads are orphaned until referenced by a pet or a profile; the backend should sweep them.
- The mock stores the bytes in memory and returns a `/api/v1/uploads/:id/raw` URL that serves them, so real `<img>` loading, dimensions and lazy-loading are exercised.

### 3.6 Adoption requests

| Method | Path                                   | Auth       | Returns                          |
| ------ | -------------------------------------- | ---------- | -------------------------------- |
| POST   | `/pets/:petId/adoption-requests`       | ✓          | `201 AdoptionRequest`            |
| GET    | `/me/adoption-requests`                | ✓          | `200 Paginated<AdoptionRequest>` |
| GET    | `/adoption-requests/:requestId`        | ✓ party    | `200 AdoptionRequest`            |
| PATCH  | `/adoption-requests/:requestId/status` | ✓ guardian | `200 AdoptionRequest`            |
| DELETE | `/adoption-requests/:requestId`        | ✓ adopter  | `204`                            |

**POST /pets/:petId/adoption-requests** — body `{ "message": "…" }`.

| Situation                                                         | Response        |
| ----------------------------------------------------------------- | --------------- |
| Requesting your own pet                                           | `409 conflict`  |
| An existing `pending` or `accepted` request from you for this pet | `409 conflict`  |
| Pet is `adopted` or `withdrawn`                                   | `409 conflict`  |
| Pet not visible                                                   | `404 not_found` |

**GET /me/adoption-requests** query: `role` (**required**, `adopter` \| `guardian`), `status`, `petId`, `page`, `perPage`. `role=guardian` returns requests received for my pets; `role=adopter` returns requests I sent. Default sort: `pending` first, then newest.

**PATCH /adoption-requests/:requestId/status**

```json
{ "status": "accepted", "reservePet": true }
```

- Only `pending → accepted | declined`. Anything else → `409 conflict` (US-404).
- `reservePet` (default `false`) also moves the pet to `reserved`, in the same transaction, so the frontend never has to fire two mutations and reconcile a half-failure.
- On acceptance, `contact` becomes populated for both parties.

**DELETE /adoption-requests/:requestId** — the adopter withdrawing. Only from `pending`; sets status to `withdrawn` (soft) and returns `204`.

### 3.7 Favourites

| Method | Path                    | Auth | Returns              |
| ------ | ----------------------- | ---- | -------------------- |
| GET    | `/me/favourites`        | ✓    | `200 Paginated<Pet>` |
| PUT    | `/me/favourites/:petId` | ✓    | `204`                |
| DELETE | `/me/favourites/:petId` | ✓    | `204`                |

`PUT` is idempotent — favouriting twice is `204`, not `409`. That is what makes the optimistic toggle safe.

### 3.8 Reference data

| Method | Path                       | Auth | Returns                   |
| ------ | -------------------------- | ---- | ------------------------- |
| GET    | `/meta/breeds?species=dog` | —    | `200 { items: string[] }` |

Backing a combobox with suggestions. In the MVP the frontend ships a static list in `shared/config/breeds.ts` and this endpoint is defined but unused — noted so the backend knows it's coming and the swap is a one-line query change.

### 3.9 Mock-only endpoints

Available only when `MOCK_API=true`. Used by Playwright to get a deterministic starting state.

| Method | Path               | Purpose                                        |
| ------ | ------------------ | ---------------------------------------------- |
| POST   | `/__mock/reset`    | Reseed from the fixed seed                     |
| POST   | `/__mock/config`   | `{ latencyMs?, errorRate?, failNextRequest? }` |
| POST   | `/__mock/login-as` | Sign in as a seeded user without a password    |

---

## 4. Mock server implementation

Location: `src/routes/api/v1/**` (transport) + `src/mocks/**` (logic and data). Both are deleted when the real backend lands.

### 4.1 Shape

Each route file is a thin adapter; all behaviour lives in `src/mocks/handlers`, which are plain functions over the repository. That keeps the handlers unit-testable and makes them readable as a specification.

```ts
// src/routes/api/v1/pets.index.ts
import { createFileRoute } from '@tanstack/react-router'
import { listPets, createPet } from '~/mocks/handlers/pets.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/pets')({
  server: {
    handlers: {
      GET: withMockBehaviour(listPets),
      POST: withMockBehaviour(createPet),
    },
  },
})
```

### 4.2 Repository

- A module-level `Map` per collection: `users`, `sessions`, `pets`, `adoptionRequests`, `favourites`, `uploads`.
- Passwords stored as a trivial hash — enough that the login path is real, explicitly **not** security.
- Optional persistence to `.mock-db.json` in dev (`MOCK_PERSIST=true`) so a server restart doesn't wipe a listing you were testing. Ignored by git.
- Every write goes through a single `mutate()` helper that bumps `updatedAt` and persists once.

### 4.3 Seed

`src/mocks/seed.ts`, faker with a **fixed seed** so every developer and CI run sees identical data:

- 8 users, one of them `marta@example.com` / `password123` documented in the README as the demo account.
- 40 pets across all species, sizes and statuses (28 `available`, 5 `reserved`, 5 `adopted`, 2 `withdrawn`), spread over 6 cities, `createdAt` spread across 90 days so sorting is visible.
- 14 adoption requests in a mix of statuses, including one accepted pair so US-407 is demonstrable without clicking through.
- 6 favourites for the demo user.
- Photos: seeded placeholder images served by the mock, with real dimensions in a mix of portrait and landscape so the grid's aspect-ratio handling is tested honestly.

### 4.4 Behaviour knobs

`withMockBehaviour` wraps every handler and, driven by env or `/__mock/config`:

- sleeps `MOCK_LATENCY_MS` ± 40% jitter (default 180 ms) so skeletons are visible in normal development;
- fails with `500 internal_error` at `MOCK_ERROR_RATE` (default 0, set to 0.2 when building error states);
- honours `failNextRequest` for deterministic error-path tests;
- validates the request body against the contract schema and returns a real `422` with `details` — so the frontend's field-error mapping is built against real responses, not imagined ones.

### 4.5 The rule that keeps this honest

A contract test iterates every mock handler, calls it with representative input, and parses the response with the same Zod schema the `api-client` uses. **Mock and contract cannot drift** — if a handler returns a field the contract doesn't know about, or omits one it requires, CI fails.

---

## 5. What the real backend must add

The frontend assumes these are enforced server-side. The mock fakes them; a real implementation must not.

1. **Ownership checks** on every write to `/pets/:petId` and every read of `/adoption-requests/:requestId`. The frontend hides the buttons; that is UX, not security.
2. **Password hashing** (argon2id/bcrypt) and session invalidation on logout.
3. **Rate limiting** on `/auth/*`, `/uploads`, and adoption-request creation.
4. **Upload validation by content sniffing**, not by extension or client-declared MIME type; strip EXIF; generate resized variants and return them as `srcset` candidates.
5. **Transactional guarantees** for the two compound operations: accept-and-reserve, and mark-adopted-and-decline-pending.
6. **`viewerRequestStatus` / `isFavourited`** computed per request from the session, never cached across users.
7. **Cache headers**: `private, no-store` on everything under `/me/*` and `/auth/*`.
