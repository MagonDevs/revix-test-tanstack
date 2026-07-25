# 04 — Features and Design

## Part A — Information architecture

### A.1 Route map

| Route                          | Auth    | Purpose                                        | Data (query)                                   | URL state                                               |
| ------------------------------ | ------- | ---------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| `/`                            | public  | Landing: what this is, entry to browse         | `petListQuery({ sort: 'newest', perPage: 6 })` | —                                                       |
| `/pets`                        | public  | Browse and filter all pets                     | `petListQuery(search)`                         | `q, species[], size[], sex, ageGroup, city, sort, page` |
| `/pets/:petId`                 | public  | One pet, full detail, request action           | `petDetailQuery(petId)`                        | —                                                       |
| `/users/:userId`               | public  | Guardian's public profile + their pets         | `userQuery(userId)`, `userPetsQuery(userId)`   | `page`                                                  |
| `/login`                       | public  | Sign in                                        | —                                              | `redirect`                                              |
| `/register`                    | public  | Create account                                 | —                                              | `redirect`                                              |
| `/dashboard`                   | ✓       | Redirects to `/dashboard/pets`                 | —                                              | —                                                       |
| `/dashboard/pets`              | ✓       | My listings, status management                 | `myPetsQuery(status, page)`                    | `status, page`                                          |
| `/dashboard/pets/new`          | ✓       | Publish a pet                                  | —                                              | —                                                       |
| `/dashboard/pets/:petId/edit`  | ✓ owner | Edit a pet                                     | `petDetailQuery(petId)`                        | —                                                       |
| `/dashboard/requests/received` | ✓       | Requests for my pets; accept/decline           | `requestsQuery({ role: 'guardian', status })`  | `status, page`                                          |
| `/dashboard/requests/sent`     | ✓       | Requests I sent; contact details when accepted | `requestsQuery({ role: 'adopter', status })`   | `status, page`                                          |
| `/dashboard/favourites`        | ✓       | Saved pets                                     | `favouritesQuery(page)`                        | `page`                                                  |
| `/dashboard/profile`           | ✓       | Edit my profile                                | `sessionQuery()`                               | —                                                       |
| `*`                            | public  | 404                                            | —                                              | —                                                       |

### A.2 Navigation

**Header** (all pages, sticky, 64 px, hairline bottom border)

- Left: wordmark → `/`.
- Centre-left: `Pets` link. That's it — a two-item nav is a feature, not an omission.
- Right, signed out: `Sign in` (ghost) + `Publish a pet` (primary → `/register?redirect=/dashboard/pets/new`).
- Right, signed in: `Publish a pet` (primary) + avatar menu → My listings, Requests (with a count badge when pending > 0), Favourites, Profile, Sign out.
- Mobile: wordmark + avatar/sign-in; `Pets` and `Publish` move into a slide-over.

**Dashboard shell** — sidebar on `lg+` (240 px, hairline right border): My listings, Requests received, Requests sent, Favourites, Profile. On smaller screens it becomes a horizontal scrollable tab strip under the page header.

**Footer** — one row: wordmark, "A demo project", year. No link farm.

---

## Part B — Page specifications

Every page below lists its four states. A page is not done until all four exist (see DoD in doc 02).

### B.1 `/` Landing

**Job:** in one screen, make it obvious what this site does and send the visitor to `/pets`.

```
┌──────────────────────────────────────────────────────┐
│ HEADER                                               │
├──────────────────────────────────────────────────────┤
│  ┌────────────────────────┐ ┌──────────────────────┐ │
│  │ 28 PETS · 6 CITIES     │ │                      │ │
│  │ display-lg headline    │ │   3-photo collage,   │ │
│  │ one supporting line    │ │   hairline-framed,   │ │
│  │ [Browse pets] [Publish]│ │   mono caption tags  │ │
│  └────────────────────────┘ └──────────────────────┘ │
├──────────────────────────────────────────────────────┤
│  RECENTLY ADDED            (mono eyebrow)            │
│  [PetCard] [PetCard] [PetCard]  → View all pets      │
├──────────────────────────────────────────────────────┤
│  HOW IT WORKS — 3 hairline-divided columns           │
│  Publish · Get requests · Meet                       │
└──────────────────────────────────────────────────────┘
```

- The hero's live count (`28 pets · 6 cities`) comes from the real `meta.total` — the number is a fact, not decoration, which is the only reason it earns the position.
- "How it works" is genuinely a three-step sequence, so numbered markers are justified here and nowhere else in the product.
- **Loading:** hero renders instantly (static copy); count and cards are skeletons. **Empty:** if zero pets, the hero drops the count and the card row becomes a single "Be the first to publish" panel. **Error:** the card row shows an inline retry; the hero stays.

### B.2 `/pets` Browse — the most important screen

```
lg+                                        │ mobile
┌───────────┬────────────────────────────┐ │ ┌──────────────────┐
│ FILTERS   │ [search…]      [sort ▾]    │ │ │ [search…]        │
│ 240px     │ 38 pets                    │ │ │ [Filters (2)] [↕]│
│           ├────────────────────────────┤ │ │ 38 pets          │
│ Species   │ ┌──────┐ ┌──────┐ ┌──────┐ │ │ ├──────────────────┤
│ ☐ Dog 18  │ │ card │ │ card │ │ card │ │ │ │ ┌──────────────┐ │
│ ☐ Cat 12  │ └──────┘ └──────┘ └──────┘ │ │ │ │    card      │ │
│ Size      │ ┌──────┐ ┌──────┐ ┌──────┐ │ │ │ └──────────────┘ │
│ Sex       │ │ card │ │ card │ │ card │ │ │ │        ⋮         │
│ Age       │ └──────┘ └──────┘ └──────┘ │ │ │  [Load / pages]  │
│ City      │      ‹ 1 2 3 4 ›           │ │ └──────────────────┘
└───────────┴────────────────────────────┘ │  Filters = bottom sheet
```

- Grid: 1 col < 640, 2 col ≥ 640, 3 col ≥ 1024. Card gap 20 px.
- Active filters render as removable mono chips above the grid with `Clear all`.
- Search input debounced 400 ms, then written to the URL. The input is controlled by local state that syncs _from_ the URL, so typing stays responsive while the URL stays canonical.
- Sort is a `Select`, not a dropdown menu — it holds a value.
- **Loading:** 12 `PetCardSkeleton` in the grid, filters interactive throughout. On filter change, the existing grid dims to 60% opacity rather than unmounting (no layout jump).
- **Empty (no results):** centred panel — "No pets match these filters." + `Clear all filters` button. Distinct from **Empty (no pets at all)**: "No pets have been published yet." + `Publish a pet`.
- **Error:** `ErrorState` replacing the grid only; filters and header remain usable.

### B.3 `/pets/:petId` Pet detail

```
┌──────────────────────────────────────────────────────┐
│ ‹ Back to pets            (mono, hairline underline) │
├───────────────────────────────┬──────────────────────┤
│                               │ NALA        [AVAILABLE]│
│      GALLERY                  │ Podenco mix          │
│      4:3 main image           │                      │
│      + thumbnail strip        │ ┌──── RECORD ──────┐ │
│                               │ │ SPECIES   Dog    │ │
│                               │ │ AGE       1y 6m  │ │
│                               │ │ SEX       Female │ │
│                               │ │ SIZE      Medium │ │
│                               │ │ WEIGHT    14.5kg │ │
│                               │ │ CITY      Bcn    │ │
│                               │ │ LISTED    12 Jul │ │
│                               │ └──────────────────┘ │
│                               │ ✓ Vaccinated         │
│                               │ ✓ Neutered           │
│                               │ ✓ Good with children │
│                               │ ─ Not with other pets│
│                               │                      │
│                               │ [Request to adopt]   │
│                               │ [♡ Save]             │
├───────────────────────────────┴──────────────────────┤
│ ABOUT NALA — description prose, max 68ch             │
├──────────────────────────────────────────────────────┤
│ GUARDIAN — avatar, name, city, "3 other pets" → link │
└──────────────────────────────────────────────────────┘
```

Below `lg`, the column order is gallery → name+status → record → traits → **sticky bottom action bar** with the primary CTA.

The primary button has five mutually exclusive states, driven entirely by `viewerRequestStatus`, `status` and the session:

| Condition                      | Button                                              |
| ------------------------------ | --------------------------------------------------- |
| Signed out                     | `Request to adopt` → `/login?redirect=/pets/:id`    |
| It's my pet                    | `Manage this listing` (secondary) → edit page       |
| `pending` request exists       | Disabled `Request sent` + link to sent requests     |
| `accepted` request exists      | Disabled `Request accepted` + link to sent requests |
| Pet is `adopted` / `withdrawn` | Disabled `No longer available`                      |
| Otherwise                      | `Request to adopt` (primary) → dialog               |

**Request dialog:** pet name in the title, a textarea with a live character counter (20–1000), a mono line stating exactly what the guardian will see (`Your name, city and this message`), `Cancel` / `Send request`.

**Loading:** full page skeleton mirroring the two-column layout — a grey block at the gallery's aspect ratio, seven hairline record rows. **Error 404:** dedicated "This pet isn't available" page with `Browse pets`. **Error other:** page-level `ErrorState` with retry.

### B.4 `/login` and `/register`

- Single centred card, max 400 px, on `paper`. No illustration, no split-screen hero.
- Register fields: name, email, password, confirm password, city. Login: email, password.
- Cross-link at the bottom, preserving `redirect`.
- Login page shows the demo credentials in a mono note (`marta@example.com · password123`) because this is a demo and hiding them wastes reviewers' time.
- **States:** inline field errors under inputs; one form-level error region above the submit for credential failures; submit disabled + spinner while pending.

### B.5 `/users/:userId` Public profile

- Header band: avatar (64 px), name, city, `MEMBER SINCE JUL 2025` in mono, bio (max 60ch).
- Then `AVAILABLE PETS` and a grid of their `available` pets, paginated.
- **Empty:** "This person has no pets listed right now."

### B.6 `/dashboard/pets` My listings

- `PageHeader`: title `My listings`, count, primary `Publish a pet`.
- Status tab strip: All · Available · Reserved · Adopted · Withdrawn (counts on each).
- Rows, not cards — this is a management table:

```
┌────┬─────────────────────┬────────────┬──────────┬─────────┐
│ 64 │ Nala                │ [AVAILABLE]│ 3 pending│  ⋯      │
│ px │ DOG · 1Y6M · MEDIUM │            │ requests │         │
└────┴─────────────────────┴────────────┴──────────┴─────────┘
```

- Row click → public pet page. `⋯` menu: Edit, Mark as reserved / available / adopted, Withdraw, Delete.
- `3 pending requests` is a link to `/dashboard/requests/received?petId=…`.
- On `< 640`, rows become stacked cards with the actions as a bottom row of buttons.
- **Empty:** "You haven't published any pets yet." + `Publish a pet`. Per-tab empty: "No adopted pets yet."

### B.7 `/dashboard/pets/new` and `/dashboard/pets/:petId/edit`

One `PetForm` component, two modes. Single scrolling column, max 640 px, with hairline-separated sections — **not** a wizard. A wizard on eight fields is theatre.

1. **Photos** — dropzone + reorderable thumbnail grid. First slot labelled `COVER` in mono. Per-file progress bar, per-file retry, per-file remove.
2. **The basics** — name, species (segmented control), breed (combobox with suggestions, free text allowed), sex (radio), age (number + unit hint), size (segmented), weight (optional).
3. **About** — description textarea, 6 rows, counter, helper text: "What is this pet like to live with? Routine, energy, quirks."
4. **Health and behaviour** — four switches.
5. **Where** — city.

Sticky footer bar: `Cancel` (ghost) and `Publish listing` / `Save changes` (primary). Edit mode adds a `Last updated 2 days ago` mono note and a destructive `Delete listing` at the very bottom, visually separated.

- **Loading (edit):** form skeleton; never render empty inputs that then populate.
- **Error on submit:** field errors mapped from `details`; a form-level region for anything unmapped; the page does not scroll-jump, it moves focus to the first invalid field.
- **Guard:** navigating away with unsaved changes opens `ConfirmDialog` — "Discard your changes?" / `Keep editing` / `Discard`.

### B.8 `/dashboard/requests/received`

- Tabs: Pending (default) · Accepted · Declined · All.
- Each request is a hairline-bordered panel:

```
┌──────────────────────────────────────────────────────┐
│ [48] Marc Vidal · Girona           [PENDING]  2d ago │
│      wants to adopt  NALA  →                         │
│      ┌──────────────────────────────────────────────┐│
│      │ "We have a garden and I work from home…"     ││
│      └──────────────────────────────────────────────┘│
│      [Accept]  [Decline]        View profile ›       │
└──────────────────────────────────────────────────────┘
```

- Long messages clamp at 4 lines with `Show more`.
- `Accept` opens a confirm with a checkbox, checked by default: `Also mark Nala as reserved`.
- After acceptance the panel shows a `CONTACT` mono block with the adopter's email and phone.
- **Empty:** "No pending requests. When someone asks about one of your pets, it'll show up here."

### B.9 `/dashboard/requests/sent`

- Same panel shape, mirrored: shows the pet prominently and the guardian secondarily.
- `accepted` → `CONTACT` block with the guardian's details and a one-line mono note: `Reach out to arrange a meeting.`
- `pending` → `Withdraw request` (ghost, destructive on hover).
- **Empty:** "You haven't asked about any pets yet." + `Browse pets`.

### B.10 `/dashboard/favourites`

- Same `PetCard` grid as browse, with a status chip that is honest about pets no longer available and a `Remove` action on hover/focus.
- **Empty:** "Nothing saved yet. Tap the heart on any pet to keep it here." + `Browse pets`.

### B.11 `/dashboard/profile`

- Avatar with `Change photo`, then name, email (read-only, mono, with a note that it can't be changed), city, phone, bio.
- Sticky save bar appears only when the form is dirty.
- Mono footnote: `Your email and phone are only shared with people whose adoption request you accept.` — this is the sentence that makes US-407 legible to users.

### B.12 System pages

- **404:** large mono `404`, "We couldn't find that page.", `Browse pets` + `Go home`.
- **403 inside dashboard:** "This listing isn't yours." + `My listings`.
- **Root error boundary:** "Something went wrong on our side." + `Reload`, and the error id in mono if one exists.

---

## Part C — Design direction

### C.1 The brief in one paragraph

Adopta is a public registry of animals waiting for a home. The emotional weight comes entirely from the photographs, so the interface must be quiet enough to disappear behind them and precise enough to feel trustworthy — you are handing over a living animal to a stranger. The reference world is not a consumer marketplace; it is a **veterinary clinic's record system**: hairline-ruled forms, monospaced labels, stamped status marks, information laid out in rows you can read at a glance.

### C.2 Signature element — the record strip

Pet metadata is always rendered as **uppercase monospaced label/value pairs**, tracked out, separated by hairlines or middots. On cards it is a single line (`DOG · 1Y 6M · MEDIUM · BARCELONA`); on the detail page it becomes a bordered `RECORD` card of label/value rows; on dashboard rows it sits under the name. Status is a **stamp**: a small hairline-bordered chip with mono uppercase text and a 6 px status dot — never a filled pill.

This is the one deliberate risk. Mono metadata across an entire consumer product is unusual, and it works here for a specific reason: it lets colour, warmth and personality come exclusively from the animal photographs while the chrome reads as a careful, institutional record. Everything else stays disciplined so this device can carry the identity alone.

### C.3 Palette — six values

| Token      | Hex       | Use                                                                 |
| ---------- | --------- | ------------------------------------------------------------------- |
| `ink`      | `#14181A` | Headings, body text, primary button fill                            |
| `mute`     | `#6A736D` | Secondary text, mono labels, placeholders                           |
| `hairline` | `#DDE2DC` | All borders, dividers, input outlines                               |
| `paper`    | `#F5F7F4` | Page background (a cool, faintly green off-white — not cream)       |
| `surface`  | `#FFFFFF` | Cards, inputs, dialogs, sheets                                      |
| `pine`     | `#1E6A56` | The single accent: links, focus rings, `available`, selected states |

Derived: `pine-hover` `#175443`, `pine-tint` `#EAF1EE` (selected rows, chips).

Status colours, used only in stamps and dots:

| Status                   | Hex       |       |
| ------------------------ | --------- | ----- |
| `available`              | `#1E6A56` | pine  |
| `reserved` / `pending`   | `#9A6B0F` | amber |
| `adopted` / `accepted`   | `#3C5A6B` | slate |
| `withdrawn`              | `#6A736D` | mute  |
| `declined` / destructive | `#A33B2C` | clay  |

No gradients anywhere. Warm-clay/terracotta accents are explicitly excluded — pine is the choice, and it carries the clinical-institutional read the brief asks for.

### C.4 Typography — three roles

| Role      | Face              | Weights  | Treatment                                                                            |
| --------- | ----------------- | -------- | ------------------------------------------------------------------------------------ |
| Display   | **Archivo**       | 600, 700 | Headings. Tracking `-0.02em`, `-0.03em` at display sizes.                            |
| Body / UI | **IBM Plex Sans** | 400, 500 | Everything readable. Not Inter.                                                      |
| Utility   | **IBM Plex Mono** | 500      | The record strip, labels, counts, ids, dates, stamps. Uppercase, tracking `+0.08em`. |

Scale (desktop / mobile):

| Token        | Size / line-height          | Face          |
| ------------ | --------------------------- | ------------- |
| `display-lg` | 40/44 · 32/36               | Archivo 700   |
| `display`    | 30/36 · 26/32               | Archivo 700   |
| `heading`    | 22/28                       | Archivo 600   |
| `subheading` | 18/24                       | Archivo 600   |
| `body`       | 15/24                       | Plex Sans 400 |
| `body-sm`    | 13/20                       | Plex Sans 400 |
| `label`      | 13/16                       | Plex Sans 500 |
| `mono`       | 11/16, `+0.08em`, uppercase | Plex Mono 500 |

Prose measure caps at 68 characters. Numbers in tables and records use `font-variant-numeric: tabular-nums`.

### C.5 Space, shape, depth, motion

- **Spacing** — 4 px base: `1 2 3 4 6 8 12 16 20 24` (4→96 px). Section rhythm: 48 px mobile, 72 px desktop.
- **Grid** — 12 columns, 1200 px max content, 24 px gutters, 20 px page padding on mobile.
- **Radius** — `sm 4` (chips, inputs), `md 6` (buttons), `lg 10` (cards, dialogs), `full` (avatars, hearts).
- **Borders** — 1 px `hairline` is the primary structural device. Cards are bordered, not shadowed.
- **Elevation** — exactly two shadows: `overlay` (`0 8px 24px -8px rgb(20 24 26 / .16)`) for dialogs, dropdowns and sheets; `raised` (`0 1px 2px rgb(20 24 26 / .05)`) for the sticky header once scrolled. Nothing else has a shadow.
- **Focus** — 2 px `pine` ring at 2 px offset, on every focusable element, never removed.
- **Motion** — 140 ms `ease-out` default; 200 ms for dialog and sheet entry; hover is colour and border only, no scale or lift except a 2% image zoom on card hover. Skeletons use an opacity pulse, not a shimmer sweep. All of it disabled under `prefers-reduced-motion`.
- **Imagery** — pet photos in a fixed `4:3` container, `object-fit: cover`, hairline border, `lg` radius. Every image has an explicit width/height. No photo is ever cropped to a circle. Placeholder for a missing photo: `paper` fill with a centred mono `NO PHOTO`.

### C.6 Tailwind token wiring

Tokens are declared once as CSS variables and never hardcoded in components.

```css
/* src/styles/globals.css */
@import 'tailwindcss';

@theme {
  --color-ink: #14181a;
  --color-mute: #6a736d;
  --color-hairline: #dde2dc;
  --color-paper: #f5f7f4;
  --color-surface: #ffffff;
  --color-pine: #1e6a56;
  --color-pine-hover: #175443;
  --color-pine-tint: #eaf1ee;

  --color-status-available: #1e6a56;
  --color-status-reserved: #9a6b0f;
  --color-status-adopted: #3c5a6b;
  --color-status-withdrawn: #6a736d;
  --color-status-declined: #a33b2c;

  --font-display: 'Archivo', system-ui, sans-serif;
  --font-sans: 'IBM Plex Sans', system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;

  --shadow-overlay: 0 8px 24px -8px rgb(20 24 26 / 0.16);
  --shadow-raised: 0 1px 2px rgb(20 24 26 / 0.05);

  --ease-out-fast: cubic-bezier(0.16, 1, 0.3, 1);
}
```

Review rule: a hex value or a raw `px` font size in a component file is a review blocker. No dark mode in the MVP — the token layer makes it additive later.

---

## Part D — Component inventory

`src/shared/ui` — primitives. Behaviour from Radix where interaction is non-trivial; appearance is ours.

| Component                          | Variants                                                                                                             | States                                                                                             |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `Button`                           | `primary` (ink fill), `secondary` (surface + hairline), `ghost`, `destructive`, `link`; sizes `sm md lg`; `iconOnly` | default, hover, active, focus-visible, disabled, loading (spinner replaces label, width preserved) |
| `Input`, `Textarea`                | `default`, `invalid`; `withPrefix`                                                                                   | focus, invalid (clay border + `aria-invalid`), disabled, read-only                                 |
| `Select`                           | —                                                                                                                    | open, focus, disabled                                                                              |
| `Combobox`                         | free-text allowed                                                                                                    | loading suggestions, no match, selected                                                            |
| `SegmentedControl`                 | 2–5 options                                                                                                          | selected (pine-tint + pine text), focus                                                            |
| `Checkbox`, `RadioGroup`, `Switch` | —                                                                                                                    | checked, indeterminate (checkbox), focus, disabled                                                 |
| `Field`                            | wraps label + control + hint + error                                                                                 | invalid wires `aria-describedby`                                                                   |
| `StatusStamp`                      | one per `petStatus` and `requestStatus`                                                                              | —                                                                                                  |
| `Chip`                             | `filter` (removable), `static`                                                                                       | hover, focus, removing                                                                             |
| `Card`                             | `default`, `interactive`                                                                                             | hover (hairline → ink/20 + 2% image zoom), focus-within                                            |
| `Avatar`                           | `sm md lg`; initials fallback                                                                                        | —                                                                                                  |
| `Tabs`                             | underline style                                                                                                      | active, hover, focus                                                                               |
| `DropdownMenu`                     | —                                                                                                                    | open, item hover, destructive item                                                                 |
| `Dialog`                           | `sm md`; `ConfirmDialog` preset                                                                                      | open/close, focus trap + restore                                                                   |
| `Sheet`                            | `bottom` (mobile filters), `right` (mobile nav)                                                                      | drag-to-dismiss optional                                                                           |
| `Tooltip`                          | —                                                                                                                    | keyboard-triggerable                                                                               |
| `Toast` (sonner)                   | `success`, `error`, `info`                                                                                           | —                                                                                                  |
| `Pagination`                       | —                                                                                                                    | current, disabled ends, truncated ranges                                                           |
| `Skeleton`                         | `text`, `block`, `avatar`, `card`                                                                                    | pulse                                                                                              |
| `Spinner`                          | `sm md`                                                                                                              | —                                                                                                  |
| `Progress`                         | determinate                                                                                                          | —                                                                                                  |
| `MonoLabel`                        | —                                                                                                                    | the record-strip typographic primitive                                                             |

`src/shared/components` — app composites: `AppHeader`, `AppFooter`, `UserMenu`, `DashboardSidebar`, `PageHeader`, `EmptyState`, `ErrorState`, `ConfirmDialog`, `Pagination`, `UnsavedChangesGuard`.

Feature components: `PetCard`, `PetCardSkeleton`, `PetGrid`, `PetFilters`, `PetFilterChips`, `PetSortSelect`, `PetRecord`, `PetRecordStrip`, `PetStatusStamp`, `PetGallery`, `PetTraits`, `PetForm`, `PetPhotoUploader`, `PetListingRow`, `RequestPanel`, `RequestDialog`, `RequestStatusStamp`, `ContactBlock`, `FavouriteButton`, `LoginForm`, `RegisterForm`, `ProfileForm`, `GuardianSummary`.

---

## Part E — Microcopy

Voice: plain, specific, active. Buttons name the action; the resulting toast reuses the same verb. No exclamation marks, no "Oops", no apologies from errors.

| Situation            | Copy                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| Publish button       | `Publish listing` → toast `Nala is published`                                                                 |
| Save profile         | `Save changes` → toast `Profile saved`                                                                        |
| Send request         | `Send request` → toast `Request sent to Marta`                                                                |
| Accept               | `Accept request` → toast `Request accepted`                                                                   |
| Mark adopted         | `Mark as adopted` → confirm: "Nala will no longer appear in search, and 3 pending requests will be declined." |
| Delete listing       | `Delete listing` → confirm: "This removes Nala and all requests for her. This can't be undone."               |
| Discard form         | "Discard your changes?" / `Keep editing` · `Discard`                                                          |
| No results           | "No pets match these filters." + `Clear all filters`                                                          |
| No pets at all       | "No pets have been published yet." + `Publish a pet`                                                          |
| No listings          | "You haven't published any pets yet." + `Publish a pet`                                                       |
| No requests received | "No pending requests. When someone asks about one of your pets, it'll show up here."                          |
| No requests sent     | "You haven't asked about any pets yet." + `Browse pets`                                                       |
| No favourites        | "Nothing saved yet. Tap the heart on any pet to keep it here." + `Browse pets`                                |
| Fetch failed         | "We couldn't load this. Check your connection and try again." + `Try again`                                   |
| Save failed          | "We couldn't save your listing. Your changes are still here — try again."                                     |
| 401 expired          | "Your session ended. Sign in to continue."                                                                    |
| 403                  | "This listing isn't yours."                                                                                   |
| 404 pet              | "This pet isn't available." + `Browse pets`                                                                   |
| Upload too large     | "That image is over 5 MB. Try a smaller file."                                                                |
| Duplicate email      | "An account already uses this email." (on the field)                                                          |
| Bad credentials      | "Email or password is incorrect." (form-level)                                                                |
| Privacy note         | "Your email and phone are only shared with people whose adoption request you accept."                         |

---

## Part F — Claude Design handoff brief

Paste the following into Claude Design, together with Parts B–E above.

> **Product:** Adopta, a pet adoption listing platform. Audience: ordinary people rehoming an animal, and people looking to adopt. Each screen's job is stated in Part B.
>
> **Direction:** minimal and institutional — a veterinary clinic's record system, not a consumer marketplace. Photographs carry all warmth and colour; the interface is hairline-ruled, quiet and precise. Palette exactly as Part C.3 (six values, single pine accent, no gradients, no terracotta or cream). Type exactly as C.4: Archivo for display, IBM Plex Sans for body, IBM Plex Mono for all metadata, labels and status stamps, uppercase with `+0.08em` tracking. Cards are bordered, not shadowed; only dialogs and dropdowns get a shadow.
>
> **Signature:** the record strip — pet metadata always as uppercase monospaced label/value pairs, and status as a hairline-bordered stamp with a colour dot, never a filled pill. Keep everything else disciplined so this device carries the identity.
>
> **Deliver, at 1440 px and 390 px:** landing; browse (default, filtered-with-chips, loading skeletons, no-results empty); pet detail (available, already-requested, adopted); request dialog; login; register; my listings (populated + empty); publish form (all five sections, plus photo-uploading and field-error states); requests received (pending and accepted-with-contact); requests sent; favourites; profile; 404.
>
> **Also deliver:** a component sheet showing every variant and state from Part D, and the token sheet from C.3–C.5.
>
> **Quality floor:** no horizontal scroll at 360 px, touch targets ≥ 44 px, 4.5:1 text contrast, a visible 2 px pine focus ring on every interactive element, and a defined skeleton for every data-backed region.
