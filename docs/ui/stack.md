# `Stack` Primitive

- **Source**: `src/components/ui/Stack/Stack.tsx`, `src/components/ui/Stack/Stack.styles.ts`
- **Import**: `import { Stack, type StackProps, type StackGap } from '@/components/ui';`

## Purpose

Flexbox layout container that spaces children consistently using semantic `theme.spacing` tokens (`compact`, `component`, `section`, `page`).

## Props (`StackProps`)

Extends `React.HTMLAttributes<HTMLDivElement>`:

| Prop        | Type                                              | Default        | Description                                              |
| ----------- | ------------------------------------------------- | -------------- | -------------------------------------------------------- |
| `direction` | `'row' \| 'column'`                               | `'column'`     | Flex direction.                                          |
| `gap`       | `'compact' \| 'component' \| 'section' \| 'page'` | `'component'`  | Maps to `theme.spacing` (`8px`, `16px`, `24px`, `48px`). |
| `align`     | `React.CSSProperties['alignItems']`               | `'stretch'`    | Cross-axis alignment.                                    |
| `justify`   | `React.CSSProperties['justifyContent']`           | `'flex-start'` | Main-axis alignment.                                     |
| `wrap`      | `boolean`                                         | `false`        | Enables `flex-wrap: wrap`.                               |

## Usage

```tsx
import { Button, Stack } from '@/components/ui';

export function ActionToolbar() {
  return (
    <Stack direction="row" gap="compact" align="center" wrap>
      <Button variant="primary">Confirm</Button>
      <Button variant="ghost">Cancel</Button>
    </Stack>
  );
}
```
