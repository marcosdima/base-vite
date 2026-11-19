# Roadmap & Next Implementation Step

Tracked backlog items for upcoming work on `main`.

## Next Step: Playground & Widget Polish

### 1. Categorized Visual Testing Menu in `PlaygroundPage`

- **Target**: `src/pages/PlaygroundPage/`
- **Goal**: Replace the single vertical scroll listing everything at once with a categorized navigation menu (tabs or sidebar selector, using `@radix-ui/react-tabs` per `AGENTS.md`) so users can select which category or component to inspect (`Design Tokens`, `UI Primitives`, `Widgets`, or individual widget views).

### 2. Fix `SpotlightCardGrid` Neon Sliding Shadow Bug

- **Target**: `src/components/widgets/SpotlightCardGrid/`
- **Observed bug**: Moving between the 2nd and 3rd cards animates the neon sliding backdrop smoothly, but moving back to the 1st card jumps instantaneously instead of animating.
- **Goal**: Ensure the sliding shadow transition animates smoothly across all card indices, including transitions back to index `0`.

### 3. Improve `PollDemo` Visuals & Interaction Details

- **Target**: `src/components/widgets/PollDemo/`
- **Goal**: Add richer visual feedback and details to make the poll widget engaging out of the box (e.g., animated percentage fill bars per option, total vote count, clear open/closed badge, and refined option layout using `@/components/ui` primitives).

### 4. Improve `GroupInputBoard` Drag-and-Drop Continuity

- **Target**: `src/components/widgets/GroupInputBoard/`
- **Goal**: Add smooth visual continuity when dragging and moving items between containers (e.g., active drag state, target container highlight on drag-over, and motion layout continuity across group lists).
