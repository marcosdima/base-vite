# Roadmap & Next Implementation Steps

Tracked milestones and optional future additions for `base-vite` on `main`.

## Completed Milestones

- **AI-Agent-First Foundation**:
  - `AGENTS.md` with English-only communication/code/docs policy, folder ownership, canonical patterns, and task recipes.
  - Central project configuration (`src/config/app.config.ts`) and semantic design tokens (`src/styles/theme.ts`).
  - Shared RTK Query `baseApi`, `createAppStore`, typed Redux hooks (`useAppDispatch`, `useAppSelector`), and unified `src/test/render.tsx`.
  - One-command CI verification (`pnpm verify`).
- **Primitive / Hook / Widget Boundary & Categorized Playground**:
  - Core UI primitives in `src/components/ui/`: `Badge`, `Button`, `Card`, `Input`, `Stack`, and Radix-backed `Tabs`.
  - Headless state hooks in `src/hooks/`: `usePlayback` and `usePoll`.
  - Self-contained general-purpose widget in `src/components/widgets/`: `Terminal`.
  - Removed niche/legacy widgets (`SpotlightCardGrid`, `GroupInputBoard`, `PollDemo`) and documented `@dnd-kit` / `motion` `Reorder` for drag-and-drop needs.
  - Categorized `PlaygroundPage` (`/playground`) with `Tabs` for inspecting **UI Primitives**, **Design Tokens**, **Headless Hooks**, and **Widgets**.

## Potential Future Additions (On Demand)

1. **Additional Radix UI Primitives (`src/components/ui/`)**:
   - Add `Dialog` (`@radix-ui/react-dialog`) or `Tooltip` (`@radix-ui/react-tooltip`) wrappers when modal or tooltip patterns are needed across projects.
2. **Toast / Notification Feedback**:
   - Integrate a lightweight toast system or token-styled alert primitive for global async feedback.
3. **Form Validation Recipe**:
   - Document or provide a lightweight form validation hook/helper composing `Input` error states cleanly.
