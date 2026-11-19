# `Tabs` Primitive

- **Source**: `src/components/ui/Tabs/Tabs.tsx`, `src/components/ui/Tabs/Tabs.styles.ts`
- **Test**: `src/components/ui/Tabs/Tabs.test.tsx`
- **Import**: `import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';`

## Purpose

Accessible tabbed navigation primitive built on `@radix-ui/react-tabs` and styled with `theme.ts` tokens. Serves as the reference pattern for wrapping headless Radix primitives with `styled-components`.

## Exported Components

- `Tabs` (`TabsProps`): Root container managing active tab state (`defaultValue`, `value`, `onValueChange`).
- `TabsList` (`TabsListProps`): Pill-bar container for triggers (`aria-label` recommended).
- `TabsTrigger` (`TabsTriggerProps`): Individual tab button (`value`); automatically styled when `[data-state='active']`.
- `TabsContent` (`TabsContentProps`): Panel content associated with a matching `value`.

## Usage

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';

export function SettingsTabs() {
  return (
    <Tabs defaultValue="general">
      <TabsList aria-label="Settings sections">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="general">General settings panel</TabsContent>
      <TabsContent value="security">Security settings panel</TabsContent>
    </Tabs>
  );
}
```
