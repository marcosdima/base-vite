# General-Purpose Widgets (`@/components/widgets`)

- **Barrel Export**: `src/components/widgets/index.ts`

## What Qualifies as a Widget?

A **Widget** in `base-vite` is a self-contained, optional, plug-and-play module where **the visual metaphor and interactive behavior are inseparable** and solve a specific implementation problem across projects.

### Strict Qualification Checklist

Before adding anything to `src/components/widgets/`, verify that it passes **all** of these checks:

1. **Inseparable UI + Behavior**: The component represents a well-known, self-contained interactive artifact (e.g., [`Terminal`](./terminal.md) — a CLI console window with prompt, scrollable output log, command parser, and ArrowUp/ArrowDown history).
2. **Project-Agnostic API**: It accepts configuration and callbacks via props (`commands`, `onCommand`, `title`, `prompt`) without hardcoding domain data.
3. **Self-Contained**: It lives in `src/components/widgets/<Name>/` with colocated `.tsx`, `.styles.ts`, `.types.ts`, `.test.tsx`, and `index.ts`.

---

## Anti-Patterns: What Must NOT Be a Widget

To keep the template lean and prevent dead or rigid code, **never** create a widget for the following cases:

1. **Stateful logic that needs different visual designs across projects (e.g., Polls, Steppers, Filters)**:
   - _Wrong_: Creating a `<PollWidget />` with fixed buttons and layout.
   - _Right_: Extract a headless hook in `src/hooks/` (like [`usePoll`](../hooks/use-poll.md) or [`usePlayback`](../hooks/use-playback.md)) so any page can render the state using `@/components/ui` primitives (`Card`, `Button`, `Badge`, custom bars, or charts) with full control over colors and layout.
2. **Decorative Card Grids or Landing-Page Visual Effects (e.g., Neon Spotlight Cards)**:
   - _Wrong_: Creating a `<SpotlightCardGrid />` widget with hardcoded grid columns and hover shadows.
   - _Right_: Compose [`Card`](../ui/card.md) and [`Stack`](../ui/stack.md) from `@/components/ui` with colocated page styles.
3. **Custom HTML5 Drag-and-Drop Boards**:
   - _Wrong_: Hand-rolling `draggable` / `dataTransfer` two-column boards as a widget.
   - _Right_: When a project requires drag-and-drop or sortable lists, install `@dnd-kit/core` + `@dnd-kit/sortable` (or use `motion`'s `Reorder` for single-axis lists) directly in that feature.

## Available Widgets

- [`Terminal`](./terminal.md) — Interactive CLI emulator with command registry, built-in commands (`help`, `clear`, `echo`, `history`, `date`), custom command handlers, and command history navigation.
