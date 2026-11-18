import type { DemoStep } from './types';

export const SCRIPT_FCFS: DemoStep[] = [
  {
    events: [
      { type: 'set_algorithm', payload: { algorithm: 'FCFS' } },
      { type: 'create', pid: 1, priority: 3, burst_time: 3 },
      { type: 'create', pid: 2, priority: 2, burst_time: 4 },
      { type: 'create', pid: 3, priority: 1, burst_time: 2 },
    ],
    tag: 'FCFS · Creación',
    text: 'Se crean los procesos P1 (ráfaga 3), P2 (ráfaga 4) y P3 (ráfaga 2) en estado NEW. El sistema operativo inicializa el PCB de cada proceso.',
  },
  {
    events: [
      { type: 'admit', pid: 1 },
      { type: 'admit', pid: 2 },
      { type: 'admit', pid: 3 },
    ],
    transition: 'Admitir',
    tag: 'FCFS · Admisión',
    text: 'El planificador de largo plazo admite los tres procesos en memoria principal (READY). La cola de listos conserva el orden de llegada: [P1, P2, P3].',
  },
  {
    events: [{ type: 'dispatch', pid: 1 }],
    transition: 'Despachar',
    tag: 'FCFS · Despachar P1',
    text: 'El planificador de corto plazo selecciona a P1 por encontrarse al frente de la cola FIFO. P1 transiciona a RUNNING.',
  },
  {
    events: [{ type: 'tick' }, { type: 'io_wait', pid: 1 }],
    transition: 'E/S o evento espera',
    tag: 'FCFS · Bloqueo de P1',
    text: 'Tras ejecutar 1 tick en CPU (restan 2), P1 invoca una llamada al sistema para una operación de E/S. El proceso se bloquea, pasa a WAITING y libera la CPU.',
  },
  {
    events: [{ type: 'dispatch', pid: 2 }],
    transition: 'Despachar',
    tag: 'FCFS · Despachar P2',
    text: 'Al encontrarse libre el procesador, el planificador FCFS despacha al siguiente proceso en la cola de listos: P2 (ráfaga 4).',
  },
  {
    events: [{ type: 'io_complete', pid: 1 }],
    transition: 'E/S o evento fin',
    tag: 'FCFS · E/S completada',
    text: 'Finaliza la operación de E/S de P1 mediante una interrupción de dispositivo. P1 se inserta al final de la cola READY [P3, P1], mientras P2 continúa en ejecución (política no preemptiva).',
  },
  {
    events: [{ type: 'tick' }, { type: 'tick' }, { type: 'tick' }, { type: 'tick' }],
    transition: 'Salir',
    tag: 'FCFS · Salida de P2',
    text: 'P2 completa sus 4 ticks de ráfaga en CPU sin interrupciones, transiciona a TERMINATED y el sistema operativo libera sus recursos.',
  },
  {
    events: [{ type: 'dispatch', pid: 3 }],
    transition: 'Despachar',
    tag: 'FCFS · Despachar P3',
    text: 'Con la CPU disponible y la cola READY conformada por [P3, P1], el planificador asigna el procesador a P3 (ráfaga 2).',
  },
  {
    events: [{ type: 'tick' }, { type: 'tick' }],
    transition: 'Salir',
    tag: 'FCFS · Salida de P3',
    text: 'P3 concluye sus 2 ticks de ejecución y pasa al estado TERMINATED.',
  },
  {
    events: [{ type: 'dispatch', pid: 1 }],
    transition: 'Despachar',
    tag: 'FCFS · Despachar P1',
    text: 'P1 es el único proceso restante en la cola READY y es despachado nuevamente a la CPU para ejecutar sus 2 ticks restantes.',
  },
  {
    events: [{ type: 'tick' }, { type: 'tick' }],
    transition: 'Salir',
    tag: 'FCFS · Finalizado',
    text: 'P1 finaliza los 2 ticks restantes de su ráfaga y pasa a TERMINATED. La secuencia bajo política FCFS ha concluido.',
  },
];

export const SCRIPT_RR: DemoStep[] = [
  {
    events: [
      { type: 'set_algorithm', payload: { algorithm: 'RR', quantum: 2 } },
      { type: 'create', pid: 1, burst_time: 4 },
      { type: 'create', pid: 2, burst_time: 3 },
    ],
    tag: 'Round Robin · Creación',
    text: 'Se crean P1 (ráfaga de 4 ticks) y P2 (ráfaga de 3 ticks) en estado NEW. Se configura el planificador Round Robin con quantum q = 2 ticks.',
  },
  {
    events: [
      { type: 'admit', pid: 1 },
      { type: 'admit', pid: 2 },
    ],
    transition: 'Admitir',
    tag: 'Round Robin · Admisión',
    text: 'P1 y P2 son admitidos en memoria principal y pasan al estado READY. Cola de listos inicial: [P1, P2].',
  },
  {
    events: [{ type: 'dispatch', pid: 1 }],
    transition: 'Despachar',
    tag: 'Round Robin · Despacho P1',
    text: 'El planificador asigna la CPU a P1 e inicia el conteo del quantum asignado (0 / 2).',
  },
  {
    events: [{ type: 'tick' }, { type: 'tick' }],
    transition: 'Interrumpir',
    tag: 'Round Robin · Expiración de Quantum',
    text: 'P1 consume 2 ticks (restan 2) y alcanza el límite de su quantum. El temporizador genera una interrupción, desaloja al proceso y lo reubica al final de READY: [P2, P1].',
  },
  {
    events: [{ type: 'dispatch', pid: 2 }],
    transition: 'Despachar',
    tag: 'Round Robin · Despacho P2',
    text: 'Se realiza el cambio de contexto y el planificador asigna el procesador a P2 (ráfaga de 3 ticks).',
  },
  {
    events: [{ type: 'tick' }, { type: 'tick' }],
    transition: 'Interrumpir',
    tag: 'Round Robin · Expiración de Quantum',
    text: 'P2 consume los 2 ticks de su quantum (resta 1) y es desalojado por interrupción de reloj, retornando al final de READY: [P1, P2].',
  },
  {
    events: [{ type: 'dispatch', pid: 1 }],
    transition: 'Despachar',
    tag: 'Round Robin · Despacho P1',
    text: 'El planificador despacha nuevamente a P1 para ejecutar los 2 ticks restantes de su ráfaga.',
  },
  {
    events: [{ type: 'tick' }, { type: 'tick' }],
    transition: 'Salir',
    tag: 'Round Robin · Salida P1',
    text: 'P1 completa sus 2 ticks restantes dentro del segundo turno asignado y transiciona a TERMINATED.',
  },
  {
    events: [{ type: 'dispatch', pid: 2 }],
    transition: 'Despachar',
    tag: 'Round Robin · Despacho P2',
    text: 'P2 obtiene la CPU para ejecutar el último tick restante de su ráfaga.',
  },
  {
    events: [{ type: 'tick' }],
    transition: 'Salir',
    tag: 'Round Robin · Finalizado',
    text: 'P2 completa su último tick antes de agotar el quantum y pasa a TERMINATED. La secuencia bajo política Round Robin ha concluido.',
  },
];

export const SCRIPT_SJF: DemoStep[] = [
  {
    events: [
      { type: 'set_algorithm', payload: { algorithm: 'SJF' } },
      { type: 'create', pid: 1, burst_time: 6 },
      { type: 'create', pid: 2, burst_time: 2 },
      { type: 'create', pid: 3, burst_time: 4 },
    ],
    tag: 'SJF · Creación',
    text: 'Se crean P1 (ráfaga estimada de 6 ticks), P2 (ráfaga de 2 ticks) y P3 (ráfaga de 4 ticks) bajo la política no preemptiva Shortest Job First (SJF).',
  },
  {
    events: [
      { type: 'admit', pid: 1 },
      { type: 'admit', pid: 2 },
      { type: 'admit', pid: 3 },
    ],
    transition: 'Admitir',
    tag: 'SJF · Ordenamiento por Ráfaga',
    text: 'Al admitirse en READY, el planificador SJF ordena la cola de menor a mayor ráfaga estimada: [P2 (2 ticks), P3 (4 ticks), P1 (6 ticks)].',
  },
  {
    events: [{ type: 'dispatch', pid: 2 }],
    transition: 'Despachar',
    tag: 'SJF · Despacho P2 (Más Corto)',
    text: 'El planificador selecciona a P2 por tener el trabajo más corto (2 ticks), evitando que espere detrás de P1 (elimina el efecto convoy de FCFS).',
  },
  {
    events: [{ type: 'tick' }, { type: 'tick' }],
    transition: 'Salir',
    tag: 'SJF · Salida P2',
    text: 'P2 finaliza rápidamente sus 2 ticks de CPU y pasa a TERMINATED, reduciendo el tiempo de espera promedio del sistema.',
  },
  {
    events: [{ type: 'dispatch', pid: 3 }],
    transition: 'Despachar',
    tag: 'SJF · Despacho P3',
    text: 'Entre los procesos restantes en READY [P3 (4 ticks), P1 (6 ticks)], el planificador selecciona a P3 por tener menor ráfaga estimada.',
  },
  {
    events: [{ type: 'tick' }, { type: 'tick' }, { type: 'tick' }, { type: 'tick' }],
    transition: 'Salir',
    tag: 'SJF · Salida P3',
    text: 'P3 completa sus 4 ticks de CPU y transiciona al estado TERMINATED.',
  },
  {
    events: [{ type: 'dispatch', pid: 1 }],
    transition: 'Despachar',
    tag: 'SJF · Despacho P1',
    text: 'Finalmente se despacha a P1 (el proceso con la ráfaga más larga, de 6 ticks) hacia la CPU.',
  },
  {
    events: [
      { type: 'tick' },
      { type: 'tick' },
      { type: 'tick' },
      { type: 'tick' },
      { type: 'tick' },
      { type: 'tick' },
    ],
    transition: 'Salir',
    tag: 'SJF · Finalizado',
    text: 'P1 concluye sus 6 ticks de ejecución y pasa a TERMINATED. La secuencia bajo política SJF ha finalizado con tiempo de espera promedio mínimo.',
  },
];

export const SCRIPT_PRIORITY: DemoStep[] = [
  {
    events: [
      { type: 'set_algorithm', payload: { algorithm: 'PRIORITY' } },
      { type: 'create', pid: 1, priority: 3, burst_time: 3 },
      { type: 'create', pid: 2, priority: 1, burst_time: 2 },
      { type: 'create', pid: 3, priority: 2, burst_time: 4 },
    ],
    tag: 'Prioridad · Creación',
    text: 'Se crean P1 (prioridad 3, ráfaga 3), P2 (prioridad 1 máxima, ráfaga 2) y P3 (prioridad 2, ráfaga 4) bajo planificación no preemptiva por Prioridades.',
  },
  {
    events: [
      { type: 'admit', pid: 1 },
      { type: 'admit', pid: 2 },
      { type: 'admit', pid: 3 },
    ],
    transition: 'Admitir',
    tag: 'Prioridad · Ordenamiento',
    text: 'Al ser admitidos en READY, el planificador ordena la cola según el nivel de prioridad de cada PCB: [P2 (Pri: 1), P3 (Pri: 2), P1 (Pri: 3)].',
  },
  {
    events: [{ type: 'dispatch', pid: 2 }],
    transition: 'Despachar',
    tag: 'Prioridad · Despacho P2',
    text: 'El planificador selecciona a P2 por poseer la prioridad más alta (1), independientemente de que P1 haya sido creado antes.',
  },
  {
    events: [{ type: 'tick' }, { type: 'tick' }],
    transition: 'Salir',
    tag: 'Prioridad · Salida P2',
    text: 'P2 completa sus 2 ticks de CPU y transiciona al estado TERMINATED.',
  },
  {
    events: [{ type: 'dispatch', pid: 3 }],
    transition: 'Despachar',
    tag: 'Prioridad · Despacho P3',
    text: 'Entre los procesos disponibles en READY [P3 (Pri: 2), P1 (Pri: 3)], el planificador selecciona a P3.',
  },
  {
    events: [{ type: 'tick' }, { type: 'tick' }, { type: 'tick' }, { type: 'tick' }],
    transition: 'Salir',
    tag: 'Prioridad · Salida P3',
    text: 'P3 finaliza sus 4 ticks de ejecución y pasa a TERMINATED.',
  },
  {
    events: [{ type: 'dispatch', pid: 1 }],
    transition: 'Despachar',
    tag: 'Prioridad · Despacho P1',
    text: 'Sin procesos de mayor prioridad en la cola de listos, el planificador asigna la CPU a P1 (ráfaga 3).',
  },
  {
    events: [{ type: 'tick' }, { type: 'tick' }, { type: 'tick' }],
    transition: 'Salir',
    tag: 'Prioridad · Finalizado',
    text: 'P1 completa sus 3 ticks de ejecución y pasa a TERMINATED. La secuencia bajo política por Prioridades ha concluido.',
  },
];
