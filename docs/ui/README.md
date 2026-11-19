# UI Primitives (`@/components/ui`)

- **Barrel Export**: `src/components/ui/index.ts`

## What Qualifies as a UI Primitive?

A **UI Primitive** is an atomic, reusable visual building block that satisfies all of the following:

1. **Zero domain or business logic**: It knows nothing about users, polls, APIs, or application routes.
2. **100% token-driven**: Every color, font size, radius, border, focus ring, and spacing value comes from `theme` (`src/styles/theme.ts`), ensuring automatic light and dark theme compatibility.
3. **Standard HTML or Radix foundation**:
   - Simple controls (`Button`, `Input`, `Card`, `Badge`, `Stack`) wrap native semantic HTML elements and forward `ref` + standard HTML attributes.
   - Complex interactive controls requiring ARIA state machines, keyboard navigation, focus traps, or portals (`Tabs`, and future `Dialog`, `DropdownMenu`, `Tooltip`, `Select`, `Popover`) **must** wrap the corresponding `@radix-ui/react-*` primitive styled with `styled-components` (see `src/components/ui/Tabs/` as the reference pattern).

## Available Primitives

- [`Badge`](./badge.md) — Status and metadata pill tag (`neutral`, `accent`, `success`, `warning`, `error`).
- [`Button`](./button.md) — Interactive button (`primary`, `secondary`, `ghost`, `danger`, sizes `sm`/`md`/`lg`, `isLoading`).
- [`Card`](./card.md) — Surface container (`default`, `muted`, `elevated`, padding `sm`/`md`/`lg`).
- [`Input`](./input.md) — Accessible form field with `label`, `hint`, `error` alert, and `leftIcon`.
- [`Stack`](./stack.md) — Flexbox layout helper driven by `theme.spacing` keys.
- [`Tabs`](./tabs.md) — Accessible tabbed interface backed by `@radix-ui/react-tabs`.

## Maintenance Rule

When adding or modifying a primitive in `src/components/ui/<Name>/`:

1. Keep `<Name>.tsx`, `<Name>.styles.ts`, `<Name>.test.tsx`, and `index.ts` colocated.
2. Re-export from `src/components/ui/index.ts`.
3. Showcase its states in the `primitives` tab of `src/pages/PlaygroundPage/PlaygroundPage.tsx`.
4. Add or update its documentation file in `docs/ui/` and register it in `docs/INDEX.md`.
