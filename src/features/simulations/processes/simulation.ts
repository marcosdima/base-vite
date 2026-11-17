import type {
  ProcessApplyResult,
  ProcessControlBlock,
  ProcessEvent,
  ProcessHistoryEntry,
  ProcessSimulationState,
  ProcessState,
  ProcessStateSnapshot,
  SchedulingAlgorithm,
} from './types';

export class ProcessSimulationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProcessSimulationError';
  }
}

export class ProcessLifecycleSimulation {
  public seed: number;
  public events: ProcessEvent[] = [];
  public algorithm: SchedulingAlgorithm = 'FCFS';
  public quantum = 2;

  public pcbs: Record<number, ProcessControlBlock> = {};
  public ready_queue: number[] = [];
  public waiting_queue: number[] = [];
  public running: number | null = null;
  public terminated: number[] = [];
  public applied_events: ProcessEvent[] = [];
  public history: ProcessHistoryEntry[] = [];
  public current_time = 0;

  constructor(options: { seed?: number; events?: ProcessEvent[] } = {}) {
    this.seed = options.seed ?? Math.floor(Math.random() * 2147483647);
    this.rebuild(options.events ?? []);
  }

  private resetState(): void {
    this.pcbs = {};
    this.ready_queue = [];
    this.waiting_queue = [];
    this.running = null;
    this.terminated = [];
    this.applied_events = [];
    this.history = [];
    this.current_time = 0;
    this.algorithm = 'FCFS';
    this.quantum = 2;
  }

  public rebuild(events: ProcessEvent[]): void {
    this.resetState();
    for (const event of events) {
      const { applied, reason } = this.applySingle(event);
      if (!applied) {
        throw new ProcessSimulationError(`Evento inválido en el historial (${reason}).`);
      }
      this.applied_events.push(event);
      this.history.push({ event, state: this.getStateSnapshot() });
    }
  }

  private sortReadyQueue(): void {
    if (this.algorithm === 'PRIORITY') {
      // Lower number = higher priority
      this.ready_queue.sort(
        (a, b) => (this.pcbs[a]?.priority ?? 5) - (this.pcbs[b]?.priority ?? 5),
      );
    } else if (this.algorithm === 'SJF') {
      // Shortest remaining / burst time first
      this.ready_queue.sort(
        (a, b) =>
          (this.pcbs[a]?.remaining_time ?? this.pcbs[a]?.burst_time ?? 20) -
          (this.pcbs[b]?.remaining_time ?? this.pcbs[b]?.burst_time ?? 20),
      );
    }
    // FCFS and RR keep natural FIFO insertion order
  }

  private enqueueReady(pid: number): void {
    if (!this.ready_queue.includes(pid)) {
      this.ready_queue.push(pid);
    }
    this.sortReadyQueue();
  }

  public getNextScheduledPid(): number | null {
    if (this.ready_queue.length === 0) {
      return null;
    }
    return this.ready_queue[0] ?? null;
  }

  private handleSetAlgorithm(event: ProcessEvent): [boolean, string] {
    const algoName = event.payload?.algorithm ?? event.algorithm ?? 'FCFS';
    const quantum = event.payload?.quantum ?? event.quantum ?? 2;

    if (!['FCFS', 'RR', 'SJF', 'PRIORITY'].includes(algoName)) {
      return [false, `Algoritmo desconocido: '${algoName}'.`];
    }

    this.algorithm = algoName;
    if (typeof quantum === 'number' && quantum >= 1) {
      this.quantum = quantum;
    }
    this.sortReadyQueue();
    return [true, ''];
  }

  private handleCreate(event: ProcessEvent): [boolean, string] {
    const pid = event.pid;
    const priority = event.priority ?? 1;
    const burst = event.burst_time ?? 4;

    if (typeof pid !== 'number' || !Number.isInteger(pid) || pid < 1) {
      return [false, 'PID inválido.'];
    }
    if (this.pcbs[pid]) {
      return [false, `P${pid} ya existe.`];
    }
    if (
      typeof priority !== 'number' ||
      !Number.isInteger(priority) ||
      priority < 1 ||
      priority > 5
    ) {
      return [false, 'La prioridad debe ser un entero entre 1 (alta) y 5 (baja).'];
    }
    if (typeof burst !== 'number' || !Number.isInteger(burst) || burst < 1 || burst > 20) {
      return [false, 'La ráfaga de CPU debe ser un entero entre 1 y 20.'];
    }

    this.pcbs[pid] = {
      pid,
      state: 'NEW',
      priority,
      burst_time: burst,
      remaining_time: burst,
      quantum_used: 0,
    };
    return [true, ''];
  }

  private handleUpdatePcb(event: ProcessEvent): [boolean, string] {
    const pid = event.pid;
    if (typeof pid !== 'number' || !this.pcbs[pid]) {
      return [false, `P${pid} no existe.`];
    }
    const pcb = this.pcbs[pid]!;
    if (pcb.state === 'TERMINATED') {
      return [false, `P${pid} ya ha terminado y su PCB no puede modificarse.`];
    }

    if (event.priority !== undefined) {
      const prio = event.priority;
      if (typeof prio !== 'number' || !Number.isInteger(prio) || prio < 1 || prio > 5) {
        return [false, 'La prioridad debe estar entre 1 y 5.'];
      }
      pcb.priority = prio;
      this.sortReadyQueue();
    }

    if (event.burst_time !== undefined) {
      if (pcb.state !== 'NEW') {
        return [
          false,
          `La ráfaga total de P${pid} solo puede configurarse antes de ser admitido (estado NEW).`,
        ];
      }
      const burst = event.burst_time;
      if (typeof burst !== 'number' || !Number.isInteger(burst) || burst < 1 || burst > 20) {
        return [false, 'La ráfaga de CPU debe estar entre 1 y 20.'];
      }
      pcb.burst_time = burst;
      pcb.remaining_time = burst;
    }

    return [true, ''];
  }

  private handleAdmit(pid?: number): [boolean, string] {
    if (pid === undefined) return [false, 'PID no especificado.'];
    const pcb = this.pcbs[pid];
    if (!pcb || pcb.state !== 'NEW') {
      return [false, `P${pid} no está en NEW.`];
    }
    pcb.state = 'READY';
    this.enqueueReady(pid);
    return [true, ''];
  }

  private handleDispatch(pid?: number): [boolean, string] {
    if (this.running !== null) {
      return [false, `CPU ocupada por P${this.running}.`];
    }

    let targetPid = pid;
    if (targetPid === undefined || targetPid === 0) {
      if (this.ready_queue.length === 0) {
        return [false, 'No hay procesos en la cola de listos (READY).'];
      }
      targetPid = this.ready_queue[0]!;
    }

    const pcb = this.pcbs[targetPid];
    if (!pcb || pcb.state !== 'READY') {
      return [false, `P${targetPid} no está en READY.`];
    }
    if (!this.ready_queue.includes(targetPid)) {
      return [false, `P${targetPid} no está en la cola de listos.`];
    }

    this.ready_queue = this.ready_queue.filter((p) => p !== targetPid);
    this.running = targetPid;
    pcb.state = 'RUNNING';
    pcb.quantum_used = 0;
    return [true, ''];
  }

  private handleInterrupt(pid?: number): [boolean, string] {
    if (this.running !== pid || pid === undefined) {
      return [false, `P${pid} no está en RUNNING.`];
    }
    const pcb = this.pcbs[pid]!;
    this.running = null;
    pcb.state = 'READY';
    pcb.quantum_used = 0;
    this.enqueueReady(pid);
    return [true, ''];
  }

  private handleIoWait(pid?: number): [boolean, string] {
    if (this.running !== pid || pid === undefined) {
      return [false, `P${pid} no está en RUNNING.`];
    }
    const pcb = this.pcbs[pid]!;
    this.running = null;
    pcb.state = 'WAITING';
    pcb.quantum_used = 0;
    if (!this.waiting_queue.includes(pid)) {
      this.waiting_queue.push(pid);
    }
    return [true, ''];
  }

  private handleIoComplete(pid?: number): [boolean, string] {
    if (pid === undefined) return [false, 'PID no especificado.'];
    const pcb = this.pcbs[pid];
    if (!pcb || !this.waiting_queue.includes(pid)) {
      return [false, `P${pid} no está en WAITING.`];
    }
    this.waiting_queue = this.waiting_queue.filter((p) => p !== pid);
    pcb.state = 'READY';
    this.enqueueReady(pid);
    return [true, ''];
  }

  private handleExit(pid?: number): [boolean, string] {
    if (this.running !== pid || pid === undefined) {
      return [false, `P${pid} no está en RUNNING.`];
    }
    const pcb = this.pcbs[pid]!;
    this.running = null;
    pcb.state = 'TERMINATED';
    pcb.remaining_time = 0;
    if (!this.terminated.includes(pid)) {
      this.terminated.push(pid);
    }
    return [true, ''];
  }

  private handleTick(): [boolean, string] {
    if (this.running === null) {
      return [
        false,
        'La CPU está inactiva (IDLE): no hay ningún proceso en ejecución para consumir ciclos.',
      ];
    }

    this.current_time += 1;
    const pcb = this.pcbs[this.running]!;
    pcb.remaining_time = Math.max(0, pcb.remaining_time - 1);

    if (this.algorithm === 'RR') {
      pcb.quantum_used += 1;
    }

    if (pcb.remaining_time === 0) {
      return this.handleExit(pcb.pid);
    }

    if (this.algorithm === 'RR' && pcb.quantum_used >= this.quantum) {
      return this.handleInterrupt(pcb.pid);
    }

    return [true, ''];
  }

  public applySingle(event: ProcessEvent): { applied: boolean; reason: string } {
    switch (event.type) {
      case 'tick': {
        const [applied, reason] = this.handleTick();
        return { applied, reason };
      }
      case 'set_algorithm': {
        const [applied, reason] = this.handleSetAlgorithm(event);
        return { applied, reason };
      }
      case 'update_pcb': {
        const [applied, reason] = this.handleUpdatePcb(event);
        return { applied, reason };
      }
      case 'create': {
        const [applied, reason] = this.handleCreate(event);
        return { applied, reason };
      }
      case 'admit': {
        const [applied, reason] = this.handleAdmit(event.pid);
        return { applied, reason };
      }
      case 'dispatch': {
        const [applied, reason] = this.handleDispatch(event.pid);
        return { applied, reason };
      }
      case 'interrupt': {
        const [applied, reason] = this.handleInterrupt(event.pid);
        return { applied, reason };
      }
      case 'io_wait': {
        const [applied, reason] = this.handleIoWait(event.pid);
        return { applied, reason };
      }
      case 'io_complete': {
        const [applied, reason] = this.handleIoComplete(event.pid);
        return { applied, reason };
      }
      case 'exit': {
        const [applied, reason] = this.handleExit(event.pid);
        return { applied, reason };
      }
      default:
        return [false, `Evento desconocido: '${(event as { type: string }).type}'`].reduce(
          (_acc, reason) => ({ applied: false, reason: String(reason) }),
          { applied: false, reason: '' },
        );
    }
  }

  public applyEvent(event: ProcessEvent): { applied: boolean; reason: string } {
    const { applied, reason } = this.applySingle(event);
    if (applied) {
      this.applied_events.push(event);
      this.history.push({ event, state: this.getStateSnapshot() });
    }
    return { applied, reason };
  }

  public getStateSnapshot(): ProcessStateSnapshot {
    const states: Record<string, ProcessState> = {};
    const pcbs: Record<string, ProcessControlBlock> = {};

    Object.entries(this.pcbs).forEach(([pid, pcb]) => {
      states[pid] = pcb.state;
      pcbs[pid] = { ...pcb };
    });

    return {
      states,
      pcbs,
      ready_queue: [...this.ready_queue],
      waiting_queue: [...this.waiting_queue],
      running: this.running,
      terminated: [...this.terminated],
      algorithm: this.algorithm,
      quantum: this.quantum,
      next_scheduled: this.getNextScheduledPid(),
      current_time: this.current_time,
    };
  }

  public getState(): ProcessSimulationState {
    return {
      meta: { slug: 'processes', seed: this.seed },
      pids: Object.keys(this.pcbs).map(Number),
      ...this.getStateSnapshot(),
      events: [...this.applied_events],
      history: [...this.history],
    };
  }

  public dispatch(
    action: 'apply',
    payload: { events?: ProcessEvent[]; event?: ProcessEvent | null },
  ): ProcessApplyResult {
    if (action === 'apply') {
      const events = payload.events ?? [];
      this.rebuild(events);

      const newEvent = payload.event;
      if (!newEvent) {
        return { applied: true, reason: '', event: null };
      }

      const { applied, reason } = this.applySingle(newEvent);
      if (applied) {
        this.applied_events.push(newEvent);
        this.history.push({ event: newEvent, state: this.getStateSnapshot() });
      }
      return { applied, reason, event: newEvent };
    }

    throw new ProcessSimulationError(`Acción desconocida: '${action}'.`);
  }
}
