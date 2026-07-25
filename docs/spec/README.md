# Adopta — Frontend Specification

Pet adoption platform. Frontend-only for now; the backend will be built later against the contract defined here.

**Product name placeholder:** Adopta. Rename in one place (`src/shared/config/app.ts`) if it changes.

## Documents

| Doc                                                      | Contents                                                                                                                                  |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [01-user-stories.md](./01-user-stories.md)               | Personas, epics, numbered user stories with acceptance criteria, explicit out-of-scope list                                               |
| [02-architecture.md](./02-architecture.md)               | Stack, architectural style, folder structure, layer rules, fetch layer, state, forms, auth, error handling, conventions, testing, tooling |
| [03-api-contract.md](./03-api-contract.md)               | Full REST contract (every endpoint, every schema), error model, pagination, mock server behaviour                                         |
| [04-features-and-design.md](./04-features-and-design.md) | Route map, per-page functional spec, design direction, design tokens, component inventory, Claude Design handoff brief                    |
| [05-build-plan.md](./05-build-plan.md)                   | Nine phases, task checklists, definition of done per phase, risks                                                                         |

## Reading order

1. Skim `01` to agree on scope.
2. Read `02` fully before writing any code — it decides everything that is expensive to change later.
3. `03` is the reference you keep open while building the fetch layer, and the handover artifact for the backend.
4. `04` is the input to Claude Design.
5. `05` is the execution order.

## Non-negotiables

- TypeScript everywhere, `strict` mode, no `any`.
- The browser never talks to the domain API directly. All domain traffic goes through TanStack Start server functions.
- Every endpoint response is validated with Zod at the boundary before it enters the app.
- Every filter, sort and page value lives in the URL, not in component state.
- No feature ships without its loading, empty and error states.
