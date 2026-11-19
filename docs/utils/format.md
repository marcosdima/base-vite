# Formatting Utilities (`@/utils/format`)

- **Source**: `src/utils/format.ts`
- **Test**: `src/utils/format.test.ts`

## Purpose

Pure formatting helpers for byte sizes, localized numbers, and zero-padded unsigned 32-bit hexadecimal strings.

## Exported Functions

| Function      | Signature                                     | Description                                                                                                                                      |
| ------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `formatBytes` | `(bytes: number, locale = 'es-AR') => string` | Converts a byte count into `B`, `KB`, `MB`, `GB`, or `TB` with adaptive fraction digits (`0` for integers/bytes, `2` for `< 10`, `1` otherwise). |
| `fmt`         | `(n: number, locale = 'es-AR') => string`     | Formats a number with localized thousand separators via `toLocaleString`.                                                                        |
| `fmtHex`      | `(n: number, width = 8) => string`            | Converts a number to an unsigned 32-bit zero-padded hex string prefixed with `'0x'` (e.g., `'0x00108000'`).                                      |

## Usage

```ts
import { fmt, fmtHex, formatBytes } from '@/utils/format';

formatBytes(1536, 'en-US'); // "1.5 KB"
fmt(1250000, 'en-US'); // "1,250,000"
fmtHex(255, 4); // "0x00ff"
```
