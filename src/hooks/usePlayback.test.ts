import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlayback } from './usePlayback';

describe('usePlayback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('navigates steps manually with next, prev, and reset', () => {
    const { result } = renderHook(() => usePlayback({ totalSteps: 4, initialSpeed: 1000 }));

    expect(result.current.stepIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);

    act(() => result.current.next());
    expect(result.current.stepIndex).toBe(1);

    act(() => result.current.prev());
    expect(result.current.stepIndex).toBe(0);

    // Should clamp at 0
    act(() => result.current.prev());
    expect(result.current.stepIndex).toBe(0);

    act(() => result.current.reset(2));
    expect(result.current.stepIndex).toBe(2);
  });

  it('auto-advances while playing and stops at the last step, restarting from 0 when re-toggled', () => {
    const { result } = renderHook(() => usePlayback({ totalSteps: 3, initialSpeed: 500 }));

    act(() => result.current.togglePlay());
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.stepIndex).toBe(1);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.stepIndex).toBe(2);

    // Next tick hits the end and pauses
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.stepIndex).toBe(2);
    expect(result.current.isPlaying).toBe(false);

    // Toggling play at the end rewinds to 0 and plays
    act(() => result.current.togglePlay());
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.isPlaying).toBe(true);
  });
});
