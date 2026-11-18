import { describe, expect, it } from 'vitest';
import { ProcessLifecycleSimulation } from './simulation';
import { SCRIPT_FCFS, SCRIPT_PRIORITY, SCRIPT_RR, SCRIPT_SJF } from './demoScripts';

describe('ProcessLifecycleSimulation', () => {
  it('CA1: initial state has no processes, running=null, algorithm="FCFS"', () => {
    const sim = new ProcessLifecycleSimulation();
    const state = sim.getState();
    expect(state.pids).toEqual([]);
    expect(state.running).toBeNull();
    expect(state.algorithm).toBe('FCFS');
    expect(state.ready_queue).toEqual([]);
    expect(state.waiting_queue).toEqual([]);
    expect(state.terminated).toEqual([]);
  });

  it('CA2: create adds a process in NEW with its initialized PCB', () => {
    const sim = new ProcessLifecycleSimulation();
    const res = sim.dispatch('apply', {
      events: [],
      event: { type: 'create', pid: 1, priority: 2, burst_time: 5 },
    });
    expect(res.applied).toBe(true);

    const state = sim.getState();
    expect(state.pids).toEqual([1]);
    expect(state.states['1']).toBe('NEW');
    expect(state.pcbs['1']).toEqual({
      pid: 1,
      state: 'NEW',
      priority: 2,
      burst_time: 5,
      remaining_time: 5,
      quantum_used: 0,
    });
  });

  it('CA3: sequence create -> admit -> dispatch -> exit leaves process in TERMINATED', () => {
    const sim = new ProcessLifecycleSimulation();
    const events = [
      { type: 'create' as const, pid: 1 },
      { type: 'admit' as const, pid: 1 },
      { type: 'dispatch' as const, pid: 1 },
      { type: 'exit' as const, pid: 1 },
    ];
    sim.rebuild(events);

    const state = sim.getState();
    expect(state.states['1']).toBe('TERMINATED');
    expect(state.running).toBeNull();
    expect(state.terminated).toEqual([1]);
  });

  it('CA4: interrupt on RUNNING returns it to READY and frees the CPU', () => {
    const sim = new ProcessLifecycleSimulation();
    const events = [
      { type: 'create' as const, pid: 1 },
      { type: 'admit' as const, pid: 1 },
      { type: 'dispatch' as const, pid: 1 },
    ];
    sim.rebuild(events);
    expect(sim.running).toBe(1);

    const res = sim.dispatch('apply', {
      events,
      event: { type: 'interrupt', pid: 1 },
    });
    expect(res.applied).toBe(true);

    const state = sim.getState();
    expect(state.running).toBeNull();
    expect(state.states['1']).toBe('READY');
    expect(state.ready_queue).toEqual([1]);
  });

  it('CA5: invalid transition or tick with idle CPU responds applied=false with reason', () => {
    const sim = new ProcessLifecycleSimulation();
    const res = sim.dispatch('apply', {
      events: [],
      event: { type: 'tick' },
    });
    expect(res.applied).toBe(false);
    expect(res.reason).toContain('IDLE');
    expect(sim.applied_events.length).toBe(0);
  });

  it('CA6: tick decrements remaining_time and preempts on Round Robin quantum exhaustion', () => {
    const sim = new ProcessLifecycleSimulation();
    const events = [
      { type: 'set_algorithm' as const, payload: { algorithm: 'RR' as const, quantum: 2 } },
      { type: 'create' as const, pid: 1, burst_time: 4 },
      { type: 'admit' as const, pid: 1 },
      { type: 'dispatch' as const, pid: 1 },
    ];
    sim.rebuild(events);

    // 1st tick
    let res = sim.dispatch('apply', { events: sim.applied_events, event: { type: 'tick' } });
    expect(res.applied).toBe(true);
    expect(sim.running).toBe(1);
    expect(sim.pcbs[1]?.remaining_time).toBe(3);
    expect(sim.pcbs[1]?.quantum_used).toBe(1);

    // 2nd tick (exhausts quantum 2 -> interrupt back to READY)
    res = sim.dispatch('apply', { events: sim.applied_events, event: { type: 'tick' } });
    expect(res.applied).toBe(true);
    expect(sim.running).toBeNull();
    expect(sim.pcbs[1]?.state).toBe('READY');
    expect(sim.pcbs[1]?.remaining_time).toBe(2);
    expect(sim.pcbs[1]?.quantum_used).toBe(0);
  });

  it('CA7: under PRIORITY, ready_queue orders by priority ascending (1 highest)', () => {
    const sim = new ProcessLifecycleSimulation();
    const events = [
      { type: 'set_algorithm' as const, payload: { algorithm: 'PRIORITY' as const } },
      { type: 'create' as const, pid: 1, priority: 3, burst_time: 3 },
      { type: 'create' as const, pid: 2, priority: 1, burst_time: 2 },
      { type: 'create' as const, pid: 3, priority: 2, burst_time: 4 },
      { type: 'admit' as const, pid: 1 },
      { type: 'admit' as const, pid: 2 },
      { type: 'admit' as const, pid: 3 },
    ];
    sim.rebuild(events);

    expect(sim.ready_queue).toEqual([2, 3, 1]);
    expect(sim.getNextScheduledPid()).toBe(2);
  });

  it('CA7b: under SJF, ready_queue orders by remaining_time ascending (shortest job first)', () => {
    const sim = new ProcessLifecycleSimulation();
    const events = [
      { type: 'set_algorithm' as const, payload: { algorithm: 'SJF' as const } },
      { type: 'create' as const, pid: 1, burst_time: 6 },
      { type: 'create' as const, pid: 2, burst_time: 2 },
      { type: 'create' as const, pid: 3, burst_time: 4 },
      { type: 'admit' as const, pid: 1 },
      { type: 'admit' as const, pid: 2 },
      { type: 'admit' as const, pid: 3 },
    ];
    sim.rebuild(events);

    expect(sim.ready_queue).toEqual([2, 3, 1]);
    expect(sim.getNextScheduledPid()).toBe(2);
  });

  it('CA8: update_pcb allows updating priority anytime before TERMINATED, and burst_time only in NEW', () => {
    const sim = new ProcessLifecycleSimulation();
    const events = [
      { type: 'set_algorithm' as const, payload: { algorithm: 'PRIORITY' as const } },
      { type: 'create' as const, pid: 1, priority: 3, burst_time: 3 },
      { type: 'create' as const, pid: 2, priority: 2, burst_time: 2 },
    ];
    sim.rebuild(events);

    // Burst time can be edited while in NEW
    const burstInNew = sim.dispatch('apply', {
      events: sim.applied_events,
      event: { type: 'update_pcb', pid: 1, burst_time: 8 },
    });
    expect(burstInNew.applied).toBe(true);
    expect(sim.pcbs[1]?.burst_time).toBe(8);
    expect(sim.pcbs[1]?.remaining_time).toBe(8);

    // Admit both to READY
    sim.applyEvent({ type: 'admit', pid: 1 });
    sim.applyEvent({ type: 'admit', pid: 2 });
    expect(sim.ready_queue).toEqual([2, 1]);

    // Burst time cannot be altered after NEW
    const burstInReady = sim.dispatch('apply', {
      events: sim.applied_events,
      event: { type: 'update_pcb', pid: 1, burst_time: 5 },
    });
    expect(burstInReady.applied).toBe(false);
    expect(sim.pcbs[1]?.burst_time).toBe(8);

    // Priority can still be adjusted dynamically in READY
    const res = sim.dispatch('apply', {
      events: sim.applied_events,
      event: { type: 'update_pcb', pid: 1, priority: 1 },
    });
    expect(res.applied).toBe(true);
    expect(sim.pcbs[1]?.priority).toBe(1);
    expect(sim.ready_queue).toEqual([1, 2]);
  });

  it('CA9: kill terminates any active process from READY, RUNNING, or WAITING and cleans up queues', () => {
    const sim = new ProcessLifecycleSimulation();
    sim.rebuild([
      { type: 'create', pid: 1, burst_time: 4 },
      { type: 'create', pid: 2, burst_time: 3 },
      { type: 'admit', pid: 1 },
      { type: 'admit', pid: 2 },
      { type: 'dispatch', pid: 1 },
    ]);

    // Kill P2 while in READY
    const killReady = sim.applyEvent({ type: 'kill', pid: 2 });
    expect(killReady.applied).toBe(true);
    expect(sim.pcbs[2]?.state).toBe('TERMINATED');
    expect(sim.ready_queue).toEqual([]);
    expect(sim.terminated).toContain(2);

    // Kill P1 while in RUNNING
    const killRunning = sim.applyEvent({ type: 'kill', pid: 1 });
    expect(killRunning.applied).toBe(true);
    expect(sim.running).toBeNull();
    expect(sim.pcbs[1]?.state).toBe('TERMINATED');

    // Killing an already terminated process fails cleanly
    const killAgain = sim.applyEvent({ type: 'kill', pid: 1 });
    expect(killAgain.applied).toBe(false);
  });

  it('successfully executes all demo scripts (FCFS, RR, SJF, PRIORITY)', () => {
    // Test FCFS
    const simFCFS = new ProcessLifecycleSimulation();
    const allEventsFCFS = SCRIPT_FCFS.flatMap((step) => step.events);
    simFCFS.rebuild(allEventsFCFS);
    expect(simFCFS.terminated.length).toBe(3);

    // Test RR
    const simRR = new ProcessLifecycleSimulation();
    const allEventsRR = SCRIPT_RR.flatMap((step) => step.events);
    simRR.rebuild(allEventsRR);
    expect(simRR.terminated.length).toBe(2);

    // Test SJF
    const simSJF = new ProcessLifecycleSimulation();
    const allEventsSJF = SCRIPT_SJF.flatMap((step) => step.events);
    simSJF.rebuild(allEventsSJF);
    expect(simSJF.terminated.length).toBe(3);

    // Test Priority
    const simPrio = new ProcessLifecycleSimulation();
    const allEventsPrio = SCRIPT_PRIORITY.flatMap((step) => step.events);
    simPrio.rebuild(allEventsPrio);
    expect(simPrio.terminated.length).toBe(3);
  });
});
