# `Input` Primitive

- **Source**: `src/components/ui/Input/Input.tsx`, `src/components/ui/Input/Input.styles.ts`
- **Test**: `src/components/ui/Input/Input.test.tsx`
- **Import**: `import { Input, type InputProps } from '@/components/ui';`

## Purpose

Accessible form input field that automatically wires `<label htmlFor>`, helper hints, error alerts (`role="alert"`), `aria-invalid`, and `aria-describedby` using `useId()`. Forwards `ref` to the native `<input>`.

## Props (`InputProps`)

Extends `React.InputHTMLAttributes<HTMLInputElement>`:

| Prop        | Type              | Default     | Description                                                                                                                 |
| ----------- | ----------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| `label`     | `string`          | `undefined` | Optional visible label bound to the input via `htmlFor`.                                                                    |
| `hint`      | `string`          | `undefined` | Helper caption shown below the input when `error` is not set.                                                               |
| `error`     | `string`          | `undefined` | Validation error message; styles border with `theme.colors.danger`, sets `aria-invalid="true"`, and renders `role="alert"`. |
| `leftIcon`  | `React.ReactNode` | `undefined` | Optional leading icon inside the input shell (e.g., `<FiUser />`).                                                          |
| `fullWidth` | `boolean`         | `true`      | Whether the field wrapper spans `100%` width.                                                                               |

## Usage

```tsx
import { FiUser } from 'react-icons/fi';
import { Input } from '@/components/ui';

export function UsernameField({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  return (
    <Input
      label="Username"
      placeholder="jane_doe"
      leftIcon={<FiUser />}
      value={value}
      error={error}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
```
