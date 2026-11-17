import { useCallback, useEffect, useState } from 'react';

export interface UsePlaybackOptions {
  /** Total number of steps in the timeline */
  totalSteps: number;
  /** Interval duration in milliseconds between auto-play steps */
  initialSpeed?: number;
  /** Initial step index (default 0) */
  initialStep?: number;
  /** Whether playback is active/allowed in the current mode (default true) */
  enabled?: boolean;
}

export interface UsePlaybackReturn {
  stepIndex: number;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  speed: number;
  setSpeed: React.Dispatch<React.SetStateAction<number>>;
  prev: () => void;
  next: () => void;
  togglePlay: () => void;
  pause: () => void;
  reset: (toStep?: number) => void;
}

/**
 * Reusable timeline playback controller hook for step-by-step simulations and walkthroughs.
 */
export function usePlayback({
  totalSteps,
  initialSpeed = 2500,
  initialStep = 0,
  enabled = true,
}: UsePlaybackOptions): UsePlaybackReturn {
  const [stepIndex, setStepIndex] = useState<number>(initialStep);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(initialSpeed);

  useEffect(() => {
    if (!isPlaying || !enabled || totalSteps <= 0) return;

    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev + 1 >= totalSteps) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [isPlaying, enabled, totalSteps, speed]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const prev = useCallback(() => {
    setIsPlaying(false);
    setStepIndex((curr) => Math.max(0, curr - 1));
  }, []);

  const next = useCallback(() => {
    setIsPlaying(false);
    setStepIndex((curr) => Math.min(Math.max(0, totalSteps - 1), curr + 1));
  }, [totalSteps]);

  const togglePlay = useCallback(() => {
    setIsPlaying((playing) => {
      if (playing) return false;
      setStepIndex((curr) => (curr >= totalSteps - 1 ? 0 : curr));
      return true;
    });
  }, [totalSteps]);

  const reset = useCallback((toStep = 0) => {
    setIsPlaying(false);
    setStepIndex(toStep);
  }, []);

  return {
    stepIndex,
    setStepIndex,
    isPlaying,
    setIsPlaying,
    speed,
    setSpeed,
    prev,
    next,
    togglePlay,
    pause,
    reset,
  };
}
