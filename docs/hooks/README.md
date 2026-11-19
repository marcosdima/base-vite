# Headless Hooks (`@/hooks`)

- **Barrel Export**: `src/hooks/index.ts`

## What Qualifies as a Headless Hook?

A **Headless Hook** encapsulates reusable state transitions, derived calculations, or timer/lifecycle orchestration with **zero UI assumptions**:

1. **No JSX or styled-components**: It returns plain TypeScript state and action callbacks.
2. **Presentation-agnostic**: Because different projects (or different pages within the same project) need to render the same state logic with different layouts, colors, or component types (e.g., rendering a poll as buttons, progress bars, radio cards, or a chart), the logic lives in `src/hooks/` rather than in a rigid widget.
3. **Isolated & testable**: Every headless hook has a unit test file (`src/hooks/use<Name>.test.ts`) using `renderHook` from `@testing-library/react`.

## Available Headless Hooks

- [`usePlayback`](./use-playback.md) — Timeline controller for step-by-step walkthroughs, simulations, and guided tours (`stepIndex`, `isPlaying`, `speed`, `prev`, `next`, `togglePlay`, `pause`, `reset`).
- [`usePoll`](./use-poll.md) — Voting and poll state controller (`question`, `options` with computed `percentage`, `totalVotes`, `leadingOptionId`, `isOpen`, `vote`, `addOption`, `close`, `reopen`, `reset`).

## Maintenance Rule

When adding a new headless hook in `src/hooks/use<Name>.ts`:

1. Add unit tests in `src/hooks/use<Name>.test.ts` using `renderHook`.
2. Re-export from `src/hooks/index.ts`.
3. Mount an interactive visual demo using `@/components/ui` primitives in the `hooks` tab of `src/pages/PlaygroundPage/PlaygroundPage.tsx`.
4. Document the hook in `docs/hooks/` and register it in `docs/INDEX.md`.
