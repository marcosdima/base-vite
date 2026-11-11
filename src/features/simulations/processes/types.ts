export type ProcessState = 'NEW' | 'READY' | 'RUNNING' | 'WAITING' | 'TERMINATED';

export type SchedulingAlgorithm = 'FCFS' | 'RR' | 'PRIORITY';

export interface ProcessControlBlock {
  pid: number;
  state: ProcessState;
  priority: number; // 1 (highest) to 5 (lowest)
  burst_time: number; // Estimated CPU burst time in ticks (1-20)
  remaining_time: number; // Remaining CPU ticks to completion
  quantum_used: number; // Quantum ticks consumed in the current burst (for RR)
}

export type ProcessEventType =
  | 'create'
  | 'admit'
  | 'dispatch'
  | 'interrupt'
  | 'io_wait'
  | 'io_complete'
  | 'exit'
  | 'tick'
  | 'set_algorithm'
  | 'update_pcb';

export interface ProcessEvent {
  type: ProcessEventType;
  pid?: number;
  priority?: number;
  burst_time?: number;
  payload?: {
    algorithm?: SchedulingAlgorithm;
    quantum?: number;
  };
  algorithm?: SchedulingAlgorithm;
  quantum?: number;
}

export interface ProcessStateSnapshot {
  states: Record<string, ProcessState>;
  pcbs: Record<string, ProcessControlBlock>;
  ready_queue: number[];
  waiting_queue: number[];
  running: number | null;
  terminated: number[];
  algorithm: SchedulingAlgorithm;
  quantum: number;
  next_scheduled: number | null;
  current_time: number;
}

export interface ProcessHistoryEntry {
  event: ProcessEvent;
  state: ProcessStateSnapshot;
}

export interface ProcessSimulationState extends ProcessStateSnapshot {
  meta: {
    slug: 'processes';
    seed: number;
  };
  pids: number[];
  events: ProcessEvent[];
  history: ProcessHistoryEntry[];
}

export interface ProcessApplyResult {
  applied: boolean;
  reason: string;
  event: ProcessEvent | null;
}

export interface DemoStep {
  events: ProcessEvent[];
  transition?: string;
  tag: string;
  text: string;
}
