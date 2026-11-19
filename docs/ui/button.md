# `Button` Primitive

- **Source**: `src/components/ui/Button/Button.tsx`, `src/components/ui/Button/Button.styles.ts`
- **Test**: `src/components/ui/Button/Button.test.tsx`
- **Import**: `import { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from '@/components/ui';`

## Purpose

Accessible button control supporting visual variants, size presets, full-width layout, ref forwarding, and an accessible loading state (`aria-busy` + spinner + disabled interaction).

## Props (`ButtonProps`)

Extends `React.ButtonHTMLAttributes<HTMLButtonElement>`:

| Prop        | Type                                              | Default     | Description                                                              |
| ----------- | ------------------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `variant`   | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Visual hierarchy variant.                                                |
| `size`      | `'sm' \| 'md' \| 'lg'`                            | `'md'`      | Height, padding, and font-size preset.                                   |
| `isLoading` | `boolean`                                         | `false`     | Renders an inline spinner, sets `aria-busy="true"`, and disables clicks. |
| `fullWidth` | `boolean`                                         | `false`     | Expands button width to `100%`.                                          |
| `type`      | `'button' \| 'submit' \| 'reset'`                 | `'button'`  | Defaults to `'button'` to prevent accidental form submissions.           |

## Usage

```tsx
import { Button } from '@/components/ui';

export function SaveAction({ isSaving, onSave }: { isSaving: boolean; onSave: () => void }) {
  return (
    <Button variant="primary" size="md" isLoading={isSaving} onClick={onSave}>
      Save changes
    </Button>
  );
}
```
