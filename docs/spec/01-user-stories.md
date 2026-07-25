# 01 — User Stories

## Product in one sentence

Adopta lets people publish pets that need a home and lets others send an adoption request to the person caring for that pet.

## Roles

There is **one account type**. Capabilities are contextual, not role-based — the same user can list pets and request pets.

| Role         | Meaning                                                 |
| ------------ | ------------------------------------------------------- |
| **Visitor**  | Not signed in. Can browse and read everything public.   |
| **Guardian** | Signed-in user, in the context of a pet they published. |
| **Adopter**  | Signed-in user, in the context of a request they sent.  |

Because there are no roles in the data model, there is **no admin, no moderation, no verification**. That is deliberate — see Out of scope.

## Priority key

- **P0** — MVP. The product is broken without it.
- **P1** — MVP polish. Ships in the MVP, built after all P0.
- **P2** — Deliberately deferred. Listed so the architecture leaves room, not built now.

---

## Epic 1 — Account and session

### US-101 · Register · P0

As a visitor I want to create an account so I can publish pets and send requests.

- Given the register form, when I submit name, email, password, password confirmation and city, then my account is created, I am signed in, and I land on `/pets`.
- Email must be unique; a duplicate returns a field-level error on the email input, not a toast.
- Password: minimum 8 characters. Confirmation must match — validated client-side before submit.
- Submitting disables the button and shows a loading state; double submit is impossible.

### US-102 · Sign in · P0

As a registered user I want to sign in.

- Given valid credentials, when I submit, then I am signed in and redirected to the `redirect` search param if present, else `/pets`.
- Given invalid credentials, then a single non-specific form error appears ("Email or password is incorrect") and the password field is cleared.

### US-103 · Sign out · P0

- Given I am signed in, when I choose Sign out in the user menu, then my session ends, all cached user data is discarded, and I land on `/`.

### US-104 · Stay signed in across reloads · P0

- Given I signed in, when I reload or open a new tab, then I am still signed in and the header renders my avatar on first paint (no signed-out flash).

### US-105 · Guarded routes · P0

- Given I am not signed in, when I open any `/dashboard/*` URL directly, then I am redirected to `/login?redirect=<original-url>` before any dashboard UI renders.
- After signing in I land on the originally requested URL.

### US-106 · Session expiry · P1

- Given my session expired, when any request returns 401, then I am redirected to `/login`, the query cache is cleared, and a toast explains that I need to sign in again.

---

## Epic 2 — Discover pets

### US-201 · Browse pets · P0

As a visitor I want to see pets available for adoption.

- `/pets` shows a paginated grid of available pets, newest first.
- Each card shows cover photo, name, species, age, size, city and status.
- Only pets with status `available` or `reserved` appear; `adopted` and `withdrawn` never appear in public browse.

### US-202 · Filter pets · P0

- Filters: species (multi), size (multi), sex, age group, city (text).
- Applying a filter updates the URL, resets to page 1, and refetches.
- Active filters render as removable chips with a "Clear all" action.
- Filters are visible inline on desktop and inside a bottom sheet on mobile.

### US-203 · Search by text · P0

- A search input matches against pet name, breed and description.
- Input is debounced (400 ms) before it reaches the URL.

### US-204 · Sort · P1

- Sort options: Newest, Oldest, Name A–Z. Default Newest.

### US-205 · Paginate · P0

- 12 results per page, page controls at the bottom, current page in the URL.
- Result count is always visible ("38 pets").

### US-206 · Share a filtered view · P0

- Given any combination of search, filters, sort and page, when I copy the URL and open it in a new tab or share it, then the exact same result set renders server-side.
- Invalid or unknown search params fall back to defaults instead of crashing.

### US-207 · View a pet · P0

- `/pets/:petId` shows photo gallery, name, full metadata record, description, city, publication date and the guardian's public summary.
- The page is server-rendered with correct `<title>` and Open Graph tags so links preview properly.
- An unknown id renders a "Pet not found" page with a link back to browse, and returns 404.

### US-208 · See who is caring for the pet · P0

- The pet page links to the guardian's public profile (`/users/:userId`) showing their name, city, short bio and their other available pets.
- Email and phone are **never** shown publicly — only after a request is accepted (US-407).

---

## Epic 3 — Publish and manage listings

### US-301 · Publish a pet · P0

As a guardian I want to publish a pet.

- Form fields: name, species, breed (optional), sex, age in months, size, weight (optional), description, city, and health/behaviour flags (vaccinated, neutered, good with children, good with other pets).
- At least one photo, maximum six.
- Validation: name 2–40 chars, description 30–2000 chars, age 0–360 months.
- On success I go to `/dashboard/pets` and the new listing appears at the top with a success toast.
- Leaving the form with unsaved changes asks for confirmation.

### US-302 · Upload photos · P0

- I can select or drag up to six images (JPEG, PNG, WebP; max 5 MB each).
- Each shows an upload progress state and a thumbnail when done; failures are retryable per file.
- I can reorder photos and remove them. The first photo is the cover, labelled as such.

### US-303 · See my listings · P0

- `/dashboard/pets` lists all my pets including `adopted` and `withdrawn`, filterable by status, each showing its pending-request count.

### US-304 · Edit a listing · P0

- I can edit every field of my own pet. The form is pre-filled. Only changed fields are sent.
- Editing another user's pet is impossible: the route returns 403 and renders a "You don't have access" state.

### US-305 · Change listing status · P0

- I can move a pet between `available`, `reserved` and `adopted` from the listing row and from the edit page.
- Marking a pet `adopted` asks for confirmation and explains that pending requests will be declined.

### US-306 · Delete a listing · P1

- Deleting asks for typed-free confirmation in a dialog, is irreversible, and removes it from my list optimistically with rollback on failure.

---

## Epic 4 — Adoption requests

### US-401 · Send an adoption request · P0

As an adopter I want to contact the guardian about a pet.

- On a pet page, "Request to adopt" opens a dialog with a message field (20–1000 chars) and a summary of what the guardian will see.
- Signed-out users are sent to `/login?redirect=/pets/:petId` and return to the same dialog after signing in.
- On success the button becomes a disabled "Request sent" state and a link to `/dashboard/requests/sent`.

### US-402 · Prevent duplicates and self-requests · P0

- I cannot send a second request for the same pet while one is `pending` or `accepted`; the button reflects the existing state.
- I cannot request my own pet; the button is replaced by "Manage this listing".

### US-403 · Review requests I received · P0

- `/dashboard/requests/received` lists requests for my pets: adopter name and city, pet, message, date, status. Filterable by status, pending first.
- Each row links to the pet and to the adopter's public profile.

### US-404 · Accept or decline · P0

- I can accept or decline a pending request. Accepting asks whether to mark the pet as `reserved`.
- The list updates immediately and the adopter's view reflects the new status.
- Accepted and declined requests cannot be changed again.

### US-405 · Track requests I sent · P0

- `/dashboard/requests/sent` lists my requests with the pet, the date and a status chip.

### US-406 · Withdraw a request · P1

- I can withdraw a `pending` request I sent, with confirmation.

### US-407 · Contact details after acceptance · P0

- Given my request was accepted, then the guardian's email and phone appear on that request in my sent list, and mine appear on theirs — nowhere else in the product.

---

## Epic 5 — Favourites

### US-501 · Save a pet · P1

- Signed in, I can toggle a heart on any pet card or pet page. The toggle is optimistic and reverts on failure.
- Signed out, the heart prompts sign-in.

### US-502 · My favourites · P1

- `/dashboard/favourites` shows saved pets with their current status, so I can see if something I saved is now adopted.

---

## Epic 6 — Profile

### US-601 · Edit my profile · P0

- `/dashboard/profile` lets me edit name, city, phone, short bio and avatar. Email is read-only in the MVP.

### US-602 · Public profile · P0

- `/users/:userId` shows a user's name, avatar, city, bio, member-since date and their available pets.

---

## Epic 7 — Cross-cutting quality

These are stories because they get tested and reviewed, not assumed.

| ID     | Story                                                                                                                                  | Priority |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| US-701 | Every data-backed surface has a skeleton matching its final layout — no spinners on full pages, no layout shift.                       | P0       |
| US-702 | Every list has an empty state with a specific message and one clear action.                                                            | P0       |
| US-703 | Any failed fetch shows an inline error with a working Retry that does not remount the whole page.                                      | P0       |
| US-704 | Every page works at 360 px and up; no horizontal scroll; touch targets ≥ 44 px.                                                        | P0       |
| US-705 | Every interactive element is reachable and operable by keyboard with a visible focus ring; dialogs trap focus and restore it on close. | P0       |
| US-706 | Unknown routes render a branded 404 with navigation out.                                                                               | P0       |
| US-707 | Mutations report outcomes through a single toast system with consistent wording (action name matches result wording).                  | P1       |
| US-708 | `prefers-reduced-motion` disables all non-essential animation.                                                                         | P1       |

---

## Out of scope (explicitly not built)

Listed so nobody designs around them: real-time chat or message threads, email/push notifications, admin or moderation tools, reporting/abuse flows, payments or donations, shelter/organisation accounts, geolocation or radius search, maps, breed data from an external source, image moderation, i18n and localisation, password reset and email verification, OAuth providers, two-factor auth, accessibility of user-uploaded content (alt text is optional free text), analytics, SEO beyond per-page meta tags, adoption contracts or legal flows, pet medical records.

Deferred to a named future phase: `P2` favourite collections, saved searches with alerts, request message threads, listing drafts and expiry, cursor pagination, RSC.
