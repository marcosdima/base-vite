import { useCallback, useMemo, useState } from 'react';

export interface PollOptionInput {
  id: string;
  label: string;
  votes?: number;
}

export interface PollOptionState {
  id: string;
  label: string;
  votes: number;
}

export interface PollResultOption extends PollOptionState {
  percentage: number;
}

export interface UsePollOptions {
  /** Optional question or prompt associated with the poll */
  question?: string;
  /** Initial list of poll options */
  options: readonly PollOptionInput[];
  /** Whether voting is initially open (default true) */
  initialIsOpen?: boolean;
}

export interface UsePollReturn {
  question: string;
  setQuestion: (nextQuestion: string) => void;
  options: PollResultOption[];
  totalVotes: number;
  leadingOptionId: string | null;
  isOpen: boolean;
  vote: (optionId: string) => void;
  addOption: (label: string, id?: string) => void;
  close: () => void;
  reopen: () => void;
  reset: () => void;
}

interface InternalPollState {
  question: string;
  options: PollOptionState[];
  isOpen: boolean;
}

function normalizeOptions(options: readonly PollOptionInput[]): PollOptionState[] {
  return options.map((option) => ({
    id: option.id,
    label: option.label,
    votes: Math.max(0, option.votes ?? 0),
  }));
}

/**
 * Headless poll and voting state hook.
 * Manages options, vote counts, percentage calculation, leading option detection,
 * and open/closed lifecycle without imposing any UI structure.
 */
export function usePoll({
  question: initialQuestion = '',
  options: initialOptions,
  initialIsOpen = true,
}: UsePollOptions): UsePollReturn {
  const [state, setState] = useState<InternalPollState>(() => ({
    question: initialQuestion,
    options: normalizeOptions(initialOptions),
    isOpen: initialIsOpen,
  }));

  const totalVotes = useMemo(
    () => state.options.reduce((sum, option) => sum + option.votes, 0),
    [state.options],
  );

  const options = useMemo<PollResultOption[]>(
    () =>
      state.options.map((option) => ({
        ...option,
        percentage: totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100),
      })),
    [state.options, totalVotes],
  );

  const leadingOptionId = useMemo<string | null>(() => {
    if (totalVotes === 0 || state.options.length === 0) return null;

    let leader: PollOptionState | null = null;
    for (const option of state.options) {
      if (!leader || option.votes > leader.votes) {
        leader = option;
      }
    }
    return leader && leader.votes > 0 ? leader.id : null;
  }, [state.options, totalVotes]);

  const setQuestion = useCallback((nextQuestion: string) => {
    setState((current) => ({ ...current, question: nextQuestion }));
  }, []);

  const vote = useCallback((optionId: string) => {
    setState((current) => {
      if (!current.isOpen) return current;

      return {
        ...current,
        options: current.options.map((option) =>
          option.id === optionId ? { ...option, votes: option.votes + 1 } : option,
        ),
      };
    });
  }, []);

  const addOption = useCallback((label: string, id?: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;

    setState((current) => {
      const nextId = id?.trim() || `option-${current.options.length + 1}`;
      if (current.options.some((option) => option.id === nextId)) {
        return current;
      }
      return {
        ...current,
        options: [...current.options, { id: nextId, label: trimmed, votes: 0 }],
      };
    });
  }, []);

  const close = useCallback(() => {
    setState((current) => ({ ...current, isOpen: false }));
  }, []);

  const reopen = useCallback(() => {
    setState((current) => ({ ...current, isOpen: true }));
  }, []);

  const reset = useCallback(() => {
    setState({
      question: initialQuestion,
      options: normalizeOptions(initialOptions),
      isOpen: initialIsOpen,
    });
  }, [initialIsOpen, initialOptions, initialQuestion]);

  return {
    question: state.question,
    setQuestion,
    options,
    totalVotes,
    leadingOptionId,
    isOpen: state.isOpen,
    vote,
    addOption,
    close,
    reopen,
    reset,
  };
}
