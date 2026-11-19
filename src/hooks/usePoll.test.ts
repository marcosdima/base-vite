import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePoll } from './usePoll';

const INITIAL_OPTIONS = [
  { id: 'a', label: 'Option A', votes: 0 },
  { id: 'b', label: 'Option B', votes: 0 },
];

describe('usePoll', () => {
  it('initializes options with zero votes and percentages', () => {
    const { result } = renderHook(() =>
      usePoll({ question: 'Favorite stack?', options: INITIAL_OPTIONS }),
    );

    expect(result.current.question).toBe('Favorite stack?');
    expect(result.current.totalVotes).toBe(0);
    expect(result.current.leadingOptionId).toBeNull();
    expect(result.current.isOpen).toBe(true);
    expect(result.current.options).toEqual([
      { id: 'a', label: 'Option A', votes: 0, percentage: 0 },
      { id: 'b', label: 'Option B', votes: 0, percentage: 0 },
    ]);
  });

  it('records votes, updates percentages, and tracks the leading option', () => {
    const { result } = renderHook(() => usePoll({ options: INITIAL_OPTIONS }));

    act(() => {
      result.current.vote('a');
      result.current.vote('a');
      result.current.vote('b');
    });

    expect(result.current.totalVotes).toBe(3);
    expect(result.current.leadingOptionId).toBe('a');
    expect(result.current.options).toEqual([
      { id: 'a', label: 'Option A', votes: 2, percentage: 67 },
      { id: 'b', label: 'Option B', votes: 1, percentage: 33 },
    ]);
  });

  it('prevents voting while closed and allows reopening and resetting', () => {
    const { result } = renderHook(() => usePoll({ options: INITIAL_OPTIONS }));

    act(() => {
      result.current.vote('a');
      result.current.close();
      result.current.vote('b');
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.totalVotes).toBe(1);

    act(() => {
      result.current.reopen();
      result.current.vote('b');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.totalVotes).toBe(2);

    act(() => {
      result.current.reset();
    });

    expect(result.current.totalVotes).toBe(0);
    expect(result.current.leadingOptionId).toBeNull();
  });

  it('adds new options and ignores blank labels', () => {
    const { result } = renderHook(() => usePoll({ options: INITIAL_OPTIONS }));

    act(() => {
      result.current.addOption('   ');
      result.current.addOption('Option C', 'c');
    });

    expect(result.current.options).toHaveLength(3);
    expect(result.current.options[2]).toEqual({
      id: 'c',
      label: 'Option C',
      votes: 0,
      percentage: 0,
    });
  });
});
