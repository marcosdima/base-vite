# `Card` Primitive

- **Source**: `src/components/ui/Card/Card.tsx`, `src/components/ui/Card/Card.styles.ts`
- **Import**: `import { Card, type CardProps, type CardVariant, type CardPadding } from '@/components/ui';`

## Purpose

Themed surface container with border, radius, and configurable background elevation and padding. Forwards `ref` to the underlying `div`.

## Props (`CardProps`)

Extends `React.HTMLAttributes<HTMLDivElement>`:

| Prop      | Type                                 | Default     | Description                                                                                                     |
| --------- | ------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------- |
| `variant` | `'default' \| 'muted' \| 'elevated'` | `'default'` | `'default'` uses `theme.colors.surface`; `'muted'` uses `surfaceMuted`; `'elevated'` adds `theme.shadows.card`. |
| `padding` | `'sm' \| 'md' \| 'lg'`               | `'md'`      | Inner padding (`16px`, `24px`, or `32px`).                                                                      |

## Usage

```tsx
import { Card } from '@/components/ui';

export function SummaryPanel() {
  return (
    <Card variant="elevated" padding="lg">
      <h2>Account Overview</h2>
    </Card>
  );
}
```
