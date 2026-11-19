# `Badge` Primitive

- **Source**: `src/components/ui/Badge/Badge.tsx`, `src/components/ui/Badge/Badge.styles.ts`
- **Import**: `import { Badge, type BadgeProps, type BadgeTone } from '@/components/ui';`

## Purpose

Compact pill indicator for status labels, tags, counts, and semantic metadata.

## Props (`BadgeProps`)

Extends `React.HTMLAttributes<HTMLSpanElement>`:

| Prop   | Type                                                         | Default     | Description                                     |
| ------ | ------------------------------------------------------------ | ----------- | ----------------------------------------------- |
| `tone` | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'error'` | `'neutral'` | Semantic color scheme mapped to `theme.colors`. |

## Usage

```tsx
import { Badge, Stack } from '@/components/ui';

export function StatusHeader() {
  return (
    <Stack direction="row" gap="compact">
      <Badge tone="accent">Protected route</Badge>
      <Badge tone="success">Active</Badge>
    </Stack>
  );
}
```
