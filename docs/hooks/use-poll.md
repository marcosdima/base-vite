# `usePoll` Hook

- **Source**: `src/hooks/usePoll.ts`
- **Test**: `src/hooks/usePoll.test.ts`
- **Import**: `import { usePoll, type UsePollOptions, type UsePollReturn, type PollResultOption } from '@/hooks';`

## Purpose

Headless poll and voting state hook. Manages options, atomic vote increments, rounded percentage calculations, total vote counts, leading option detection, dynamic option addition, and open/closed lifecycle without imposing any UI structure.

## Options (`UsePollOptions`)

| Option          | Type                         | Default    | Description                                                        |
| --------------- | ---------------------------- | ---------- | ------------------------------------------------------------------ |
| `question`      | `string`                     | `''`       | Optional question or prompt associated with the poll.              |
| `options`       | `readonly PollOptionInput[]` | _required_ | Initial options (`{ id: string; label: string; votes?: number }`). |
| `initialIsOpen` | `boolean`                    | `true`     | Whether voting is initially open.                                  |

## Return Value (`UsePollReturn`)

| Property / Action       | Type                                   | Description                                                                  |
| ----------------------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| `question`              | `string`                               | Current poll question.                                                       |
| `setQuestion`           | `(nextQuestion: string) => void`       | Update poll question text.                                                   |
| `options`               | `PollResultOption[]`                   | Options with `{ id, label, votes, percentage }` (`0`–`100`).                 |
| `totalVotes`            | `number`                               | Sum of votes across all options.                                             |
| `leadingOptionId`       | `string \| null`                       | ID of the option with the most votes (`null` when `totalVotes === 0`).       |
| `isOpen`                | `boolean`                              | Whether voting is currently allowed.                                         |
| `vote(optionId)`        | `(optionId: string) => void`           | Increments votes for `optionId` if `isOpen` is `true`.                       |
| `addOption(label, id?)` | `(label: string, id?: string) => void` | Appends a new option with `0` votes (ignores blank labels or duplicate IDs). |
| `close()`               | `() => void`                           | Closes voting (`isOpen = false`).                                            |
| `reopen()`              | `() => void`                           | Reopens voting (`isOpen = true`).                                            |
| `reset()`               | `() => void`                           | Restores initial question, options, and open state.                          |

## Usage

```tsx
import { Badge, Button, Card, Stack } from '@/components/ui';
import { usePoll } from '@/hooks';

export function FeaturePoll() {
  const { question, options, totalVotes, isOpen, vote, close, reset } = usePoll({
    question: 'Which feature should we prioritize?',
    options: [
      { id: 'sso', label: 'Single Sign-On' },
      { id: 'webhooks', label: 'Webhooks API' },
    ],
  });

  return (
    <Card>
      <Stack gap="compact">
        <h3>{question}</h3>
        <Badge tone="accent">{totalVotes} votes</Badge>
        {options.map((opt) => (
          <Button key={opt.id} variant="secondary" disabled={!isOpen} onClick={() => vote(opt.id)}>
            {opt.label} — {opt.votes} ({opt.percentage}%)
          </Button>
        ))}
        <Stack direction="row" gap="compact">
          <Button variant="ghost" size="sm" onClick={close}>
            Close
          </Button>
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
```
