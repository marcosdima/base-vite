# `usePlayback` Hook

- **Source**: `src/hooks/usePlayback.ts`
- **Test**: `src/hooks/usePlayback.test.ts`
- **Import**: `import { usePlayback, type UsePlaybackOptions, type UsePlaybackReturn } from '@/hooks';`

## Purpose

Headless timeline playback controller for step-by-step walkthroughs, simulations, and multi-step interactive flows. Manages current step bounds (`[0, totalSteps - 1]`), auto-advance interval timer, playback speed, and automatic pause upon reaching the final step.

## Options (`UsePlaybackOptions`)

| Option         | Type      | Default    | Description                                                |
| -------------- | --------- | ---------- | ---------------------------------------------------------- |
| `totalSteps`   | `number`  | _required_ | Total number of discrete steps in the timeline.            |
| `initialSpeed` | `number`  | `2500`     | Interval duration in milliseconds between auto-play steps. |
| `initialStep`  | `number`  | `0`        | Starting step index.                                       |
| `enabled`      | `boolean` | `true`     | Enables or disables the auto-advance timer.                |

## Return Value (`UsePlaybackReturn`)

| Property / Action | Type                                | Description                                                                 |
| ----------------- | ----------------------------------- | --------------------------------------------------------------------------- |
| `stepIndex`       | `number`                            | Current active step index (`0` to `totalSteps - 1`).                        |
| `setStepIndex`    | `Dispatch<SetStateAction<number>>`  | Jump directly to a specific step index.                                     |
| `isPlaying`       | `boolean`                           | Whether auto-play is currently running.                                     |
| `setIsPlaying`    | `Dispatch<SetStateAction<boolean>>` | Directly set play state.                                                    |
| `speed`           | `number`                            | Current interval duration in milliseconds.                                  |
| `setSpeed`        | `Dispatch<SetStateAction<number>>`  | Update auto-play interval speed.                                            |
| `prev()`          | `() => void`                        | Pauses playback and decrements `stepIndex` (clamped to `0`).                |
| `next()`          | `() => void`                        | Pauses playback and increments `stepIndex` (clamped to `totalSteps - 1`).   |
| `togglePlay()`    | `() => void`                        | Toggles `isPlaying`; if currently on the last step, restarts from step `0`. |
| `pause()`         | `() => void`                        | Pauses auto-play.                                                           |
| `reset(toStep?)`  | `(toStep?: number) => void`         | Pauses auto-play and resets `stepIndex` (defaults to `0`).                  |

## Usage

```tsx
import { Button, Stack } from '@/components/ui';
import { usePlayback } from '@/hooks';

export function WalkthroughControls({ steps }: { steps: string[] }) {
  const { stepIndex, isPlaying, prev, next, togglePlay, reset } = usePlayback({
    totalSteps: steps.length,
    initialSpeed: 1500,
  });

  return (
    <Stack gap="compact">
      <p>{steps[stepIndex]}</p>
      <Stack direction="row" gap="compact">
        <Button onClick={prev} disabled={stepIndex === 0}>
          Prev
        </Button>
        <Button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</Button>
        <Button onClick={next} disabled={stepIndex >= steps.length - 1}>
          Next
        </Button>
        <Button variant="ghost" onClick={() => reset()}>
          Reset
        </Button>
      </Stack>
    </Stack>
  );
}
```
