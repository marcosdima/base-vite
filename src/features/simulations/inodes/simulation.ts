import { SeededRandom } from '../common/prng';
import type {
  AllocationExplanation,
  DirectPointer,
  DiskBlock,
  DiskBlockRole,
  Ext4InodeMetadata,
  IndirectDoubleStructure,
  IndirectSimpleStructure,
  IndirectTripleStructure,
  InodeSimulationState,
  InodeStructure,
  ResolutionResult,
} from './types';

export class SimulationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SimulationError';
  }
}

export interface InodeSimulationOptions {
  seed?: number | null;
  blockSize?: number;
  ptrsPerIndexBlock?: number;
  totalDiskBlocks?: number;
  directPointerCount?: number;
  doubleIndexCount?: number;
}

export class InodeSimulation {
  public seed: number;
  public blockSize: number;
  public ptrsPerIndexBlock: number;
  public totalDiskBlocks: number;
  public directPointerCount: number;
  public doubleIndexCount: number;

  public inodeId = 42;
  public mode = '-rw-r--r--';
  public uid = 1000;
  public gid = 1000;

  public directBlocks: number[] = [];
  public indirectSimpleBlockId = 0;
  public indirectSimpleEntries: number[] = [];

  public indirectDoubleBlockId = 0;
  public indirectDoubleL1Entries: number[] = [];
  public indirectDoubleL2Map: Record<number, number[]> = {};

  public indirectTripleBlockId = 0;
  public indirectTripleL1Entries: number[] = [];
  public indirectTripleL2Entries: number[] = [];
  public indirectTripleDataBlocks: number[] = [];

  public directCount = 0;
  public simpleCount = 0;
  public doubleCount = 0;
  public tripleCount = 0;
  public totalLogicalPositions = 0;

  private rng!: SeededRandom;

  constructor(options: InodeSimulationOptions = {}) {
    this.seed = options.seed ?? Math.floor(Math.random() * 2147483647);
    this.blockSize = options.blockSize ?? 4096;
    this.ptrsPerIndexBlock = options.ptrsPerIndexBlock ?? 4;
    this.totalDiskBlocks = options.totalDiskBlocks ?? 100;
    this.directPointerCount = options.directPointerCount ?? 12;
    this.doubleIndexCount = options.doubleIndexCount ?? 2;

    this.reseed(this.seed);
  }

  public reseed(newSeed: number): void {
    if (typeof newSeed !== 'number' || !Number.isInteger(newSeed)) {
      throw new SimulationError('La semilla debe ser un entero.');
    }
    this.seed = newSeed;
    this.rng = new SeededRandom(this.seed);
    this.generateAddresses();
    this.refreshDerivedState();
    this.validateConfiguration();
  }

  private generateAddresses(): void {
    const nDirect = this.directPointerCount;
    const nSimple = this.ptrsPerIndexBlock;
    const nDoubleL1 = this.doubleIndexCount;
    const nDoubleDataPerL1 = this.ptrsPerIndexBlock;
    const nTripleData = this.ptrsPerIndexBlock;

    const totalNeeded =
      nDirect +
      1 + // indirect simple block
      nSimple +
      1 + // indirect double L1 block
      nDoubleL1 + // indirect double L2 sub-tables
      nDoubleL1 * nDoubleDataPerL1 + // double data blocks
      1 + // triple L1 block
      1 + // triple L2 block
      1 + // triple L3 block
      nTripleData; // triple data blocks

    if (totalNeeded > this.totalDiskBlocks) {
      throw new SimulationError('No hay suficientes bloques de disco para la configuración.');
    }

    const allIndices = Array.from({ length: this.totalDiskBlocks }, (_, i) => i);
    const chosen = this.rng.sample(allIndices, totalNeeded);
    let cursor = 0;

    this.directBlocks = chosen.slice(cursor, cursor + nDirect);
    cursor += nDirect;

    this.indirectSimpleBlockId = chosen[cursor++]!;
    this.indirectSimpleEntries = chosen.slice(cursor, cursor + nSimple);
    cursor += nSimple;

    this.indirectDoubleBlockId = chosen[cursor++]!;
    this.indirectDoubleL1Entries = chosen.slice(cursor, cursor + nDoubleL1);
    cursor += nDoubleL1;

    this.indirectDoubleL2Map = {};
    for (const l1Entry of this.indirectDoubleL1Entries) {
      this.indirectDoubleL2Map[l1Entry] = chosen.slice(cursor, cursor + nDoubleDataPerL1);
      cursor += nDoubleDataPerL1;
    }

    this.indirectTripleBlockId = chosen[cursor++]!;
    this.indirectTripleL1Entries = [chosen[cursor++]!];
    this.indirectTripleL2Entries = [chosen[cursor++]!];
    this.indirectTripleDataBlocks = chosen.slice(cursor, cursor + nTripleData);
  }

  private refreshDerivedState(): void {
    this.directCount = this.directBlocks.length;
    this.simpleCount = this.indirectSimpleEntries.length;
    this.doubleCount = Object.values(this.indirectDoubleL2Map).reduce(
      (acc, v) => acc + v.length,
      0,
    );
    this.tripleCount = this.indirectTripleDataBlocks.length;
    this.totalLogicalPositions =
      this.directCount + this.simpleCount + this.doubleCount + this.tripleCount;
  }

  private validateConfiguration(): void {
    const allBlocks = [
      ...this.directBlocks,
      this.indirectSimpleBlockId,
      ...this.indirectSimpleEntries,
      this.indirectDoubleBlockId,
      ...this.indirectDoubleL1Entries,
      ...Object.values(this.indirectDoubleL2Map).flat(),
      this.indirectTripleBlockId,
      ...this.indirectTripleL1Entries,
      ...this.indirectTripleL2Entries,
      ...this.indirectTripleDataBlocks,
    ];

    if (new Set(allBlocks).size !== allBlocks.length) {
      throw new SimulationError('Configuración inválida: bloques físicos duplicados.');
    }

    if (allBlocks.some((b) => b < 0 || b >= this.totalDiskBlocks)) {
      throw new SimulationError('Configuración inválida: bloque fuera de rango.');
    }

    if (this.ptrsPerIndexBlock <= 0) {
      throw new SimulationError('ptrs_per_index_block debe ser > 0.');
    }
  }

  public getStructure(): InodeStructure {
    const directPointers: DirectPointer[] = this.directBlocks.map((blk, i) => ({
      index: i,
      position: i + 1,
      block: blk,
      is_allocated: true,
    }));

    const indirectSimple: IndirectSimpleStructure = {
      block_id: this.indirectSimpleBlockId,
      is_allocated: true,
      entries: this.indirectSimpleEntries.map((blk, i) => ({
        index: i,
        position: this.directCount + 1 + i,
        block: blk,
      })),
    };

    const indirectDouble: IndirectDoubleStructure = {
      block_id: this.indirectDoubleBlockId,
      is_allocated: true,
      l1_entries: this.indirectDoubleL1Entries,
      l2_map: this.indirectDoubleL2Map,
    };

    const indirectTriple: IndirectTripleStructure = {
      block_id: this.indirectTripleBlockId,
      is_allocated: true,
      l1_entries: this.indirectTripleL1Entries,
      l2_entries: this.indirectTripleL2Entries,
      data_blocks: this.indirectTripleDataBlocks,
    };

    return {
      block_size: this.blockSize,
      inode_id: this.inodeId,
      mode: this.mode,
      uid: this.uid,
      gid: this.gid,
      total_blocks: this.totalDiskBlocks,
      total_logical_positions: this.totalLogicalPositions,
      direct_pointers: directPointers,
      indirect_simple: indirectSimple,
      indirect_double: indirectDouble,
      indirect_triple: indirectTriple,
      disk_blocks: this.getDiskBlocks(),
    };
  }

  public getDiskBlocks(): DiskBlock[] {
    const roleMap = new Map<
      number,
      { role: DiskBlockRole; desc: string; position?: number; direct_idx?: number }
    >();

    this.directBlocks.forEach((blk, idx) => {
      const pos = idx + 1;
      roleMap.set(blk, {
        role: 'direct',
        desc: `Bloque #${blk.toString().padStart(2, '0')}: Dato Directo [${idx}] (Posición lógica ${pos})`,
        direct_idx: idx,
        position: pos,
      });
    });

    const simpleBasePos = this.directCount + 1;
    const simpleLastPos = this.directCount + this.simpleCount;
    roleMap.set(this.indirectSimpleBlockId, {
      role: 'index_simple',
      desc: `Bloque #${this.indirectSimpleBlockId.toString().padStart(2, '0')}: Bloque de Índice Simple (Posiciones lógicas ${simpleBasePos} a ${simpleLastPos})`,
      position: simpleBasePos,
    });

    this.indirectSimpleEntries.forEach((blk, idx) => {
      const pos = simpleBasePos + idx;
      roleMap.set(blk, {
        role: 'indirect_simple_data',
        desc: `Bloque #${blk.toString().padStart(2, '0')}: Dato de Índice Simple (Entrada [${idx}], Posición lógica ${pos})`,
        position: pos,
      });
    });

    const doubleBasePos = this.directCount + this.simpleCount + 1;
    const doubleLastPos = doubleBasePos + this.doubleCount - 1;
    roleMap.set(this.indirectDoubleBlockId, {
      role: 'index_double_1',
      desc: `Bloque #${this.indirectDoubleBlockId.toString().padStart(2, '0')}: Índice Doble Nivel 1 (Posiciones lógicas ${doubleBasePos} a ${doubleLastPos})`,
      position: doubleBasePos,
    });

    this.indirectDoubleL1Entries.forEach((blk, l1Idx) => {
      const subBasePos = doubleBasePos + l1Idx * this.ptrsPerIndexBlock;
      const subLastPos = subBasePos + this.ptrsPerIndexBlock - 1;
      roleMap.set(blk, {
        role: 'index_double_2',
        desc: `Bloque #${blk.toString().padStart(2, '0')}: Índice Doble Nivel 2 (Subtabla [${l1Idx}], Posiciones lógicas ${subBasePos} a ${subLastPos})`,
        position: subBasePos,
      });

      const l2List = this.indirectDoubleL2Map[blk] ?? [];
      l2List.forEach((dataBlk, l2Idx) => {
        const pos = subBasePos + l2Idx;
        roleMap.set(dataBlk, {
          role: 'indirect_double_data',
          desc: `Bloque #${dataBlk.toString().padStart(2, '0')}: Dato Indirecto Doble (Entrada [${l1Idx}][${l2Idx}], Posición lógica ${pos})`,
          position: pos,
        });
      });
    });

    const tripleBasePos = this.directCount + this.simpleCount + this.doubleCount + 1;
    const tripleLastPos = this.totalLogicalPositions;
    roleMap.set(this.indirectTripleBlockId, {
      role: 'index_triple_1',
      desc: `Bloque #${this.indirectTripleBlockId.toString().padStart(2, '0')}: Índice Triple Nivel 1 (Posiciones lógicas ${tripleBasePos} a ${tripleLastPos})`,
      position: tripleBasePos,
    });

    [...this.indirectTripleL1Entries, ...this.indirectTripleL2Entries].forEach((blk) => {
      roleMap.set(blk, {
        role: 'index_triple_sub',
        desc: `Bloque #${blk.toString().padStart(2, '0')}: Subíndice Triple (Nivel intermedio, Posiciones lógicas ${tripleBasePos} a ${tripleLastPos})`,
        position: tripleBasePos,
      });
    });

    this.indirectTripleDataBlocks.forEach((blk, idx) => {
      const pos = tripleBasePos + idx;
      roleMap.set(blk, {
        role: 'indirect_triple_data',
        desc: `Bloque #${blk.toString().padStart(2, '0')}: Dato Indirecto Triple (Entrada [${idx}], Posición lógica ${pos})`,
        position: pos,
      });
    });

    const blocks: DiskBlock[] = [];
    for (let blk = 0; blk < this.totalDiskBlocks; blk++) {
      const entry = roleMap.get(blk);
      if (entry) {
        blocks.push({
          id: blk,
          label: blk.toString().padStart(2, '0'),
          role: entry.role,
          desc: entry.desc,
          position: entry.position,
          direct_idx: entry.direct_idx,
        });
      } else {
        blocks.push({
          id: blk,
          label: blk.toString().padStart(2, '0'),
          role: 'free',
          desc: `Bloque #${blk.toString().padStart(2, '0')} (Libre / Disponible)`,
        });
      }
    }
    return blocks;
  }

  public getState(): InodeSimulationState {
    return {
      meta: { slug: 'inodes', seed: this.seed },
      ...this.getStructure(),
    };
  }

  public resolvePosition(logicalPosition: number): ResolutionResult {
    if (typeof logicalPosition !== 'number' || !Number.isInteger(logicalPosition)) {
      throw new SimulationError('logical_position debe ser un entero.');
    }
    if (logicalPosition < 1 || logicalPosition > this.totalLogicalPositions) {
      throw new SimulationError(
        `logical_position fuera de rango: debe estar entre 1 y ${this.totalLogicalPositions}.`,
      );
    }

    const n = logicalPosition - 1;
    if (n < this.directCount) {
      return this.resolveDirect(n, logicalPosition);
    }
    if (n < this.directCount + this.simpleCount) {
      return this.resolveIndirectSimple(n, logicalPosition);
    }
    if (n < this.directCount + this.simpleCount + this.doubleCount) {
      return this.resolveIndirectDouble(n, logicalPosition);
    }
    return this.resolveTriple(n, logicalPosition);
  }

  private resolveDirect(n: number, logicalPosition: number): ResolutionResult {
    const physBlock = this.directBlocks[n]!;
    const physLabel = physBlock.toString().padStart(2, '0');

    return {
      logical_position: logicalPosition,
      logical_block_index: n,
      route_type: 'DIRECT',
      physical_block: physBlock,
      pointer_label: `Directo [${n}]`,
      pointer_dom_id: `ptr-direct-${n}`,
      formal_calc: `N = ${logicalPosition} − 1 = ${n}  │  0 ≤ ${n} < ${this.directCount} (Directo)  ➜  Inodo.Directo[${n}] = Bloque #${physLabel}`,
      substructures: [
        {
          role: 'inode',
          name: `Inodo #${this.inodeId}`,
          info: `Puntero Directo [${n}]`,
          block: null,
        },
        {
          role: 'data',
          name: `Bloque Físico #${physLabel}`,
          info: 'Bloque de Datos en Disco',
          block: physBlock,
        },
      ],
      steps: [
        {
          step_num: 1,
          title: 'Conversión a Índice de Bloque Lógico',
          explanation: `Para la posición lógica ${logicalPosition}, se resta 1 porque las tablas internas del sistema operativo comienzan a numerarse desde 0: N = ${logicalPosition} − 1 = ${n}.`,
          highlight_dom: `ptr-direct-${n}`,
          disk_block: physBlock,
        },
        {
          step_num: 2,
          title: 'Verificación de Rango Directo',
          explanation: `El inodo dispone de ${this.directCount} punteros directos (índices 0 al ${this.directCount - 1}). Como N = ${n} < ${this.directCount}, se consulta directamente la entrada Directo [${n}] del inodo.`,
          highlight_dom: `ptr-direct-${n}`,
          disk_block: physBlock,
        },
        {
          step_num: 3,
          title: 'Acceso al Bloque Físico en Disco',
          explanation: `La entrada Directo [${n}] apunta al Bloque Físico #${physLabel}. Se accede a los datos en disco en una única lectura.`,
          highlight_dom: `disk-cell-${physBlock}`,
          disk_block: physBlock,
        },
      ],
    };
  }

  private resolveIndirectSimple(n: number, logicalPosition: number): ResolutionResult {
    const relIdx = n - this.directCount;
    const physBlock = this.indirectSimpleEntries[relIdx]!;
    const idxBlock = this.indirectSimpleBlockId;
    const physLabel = physBlock.toString().padStart(2, '0');
    const idxLabel = idxBlock.toString().padStart(2, '0');

    return {
      logical_position: logicalPosition,
      logical_block_index: n,
      route_type: 'INDIRECT_SIMPLE',
      physical_block: physBlock,
      index_block: idxBlock,
      table_index: relIdx,
      pointer_label: 'Ind. Simple',
      pointer_dom_id: 'ptr-indirect-1',
      formal_calc: `N = ${logicalPosition} − 1 = ${n}  │  d = ${n} − ${this.directCount} = ${relIdx}  ➜  Tabla(#${idxLabel})[${relIdx}] = Bloque #${physLabel}`,
      substructures: [
        {
          role: 'inode',
          name: `Inodo #${this.inodeId}`,
          info: 'Puntero Ind. Simple',
          block: null,
        },
        {
          role: 'index',
          name: `Bloque Índice #${idxLabel}`,
          info: `Entrada [${relIdx}]`,
          block: idxBlock,
        },
        {
          role: 'data',
          name: `Bloque Físico #${physLabel}`,
          info: 'Bloque de Datos en Disco',
          block: physBlock,
        },
      ],
      steps: [
        {
          step_num: 1,
          title: 'Conversión a Índice Lógico y Desborde Directo',
          explanation: `Se resta 1 a la posición ${logicalPosition} porque los índices internos comienzan desde 0: N = ${logicalPosition} − 1 = ${n}. Como N = ${n} supera los ${this.directCount} punteros directos (0..${this.directCount - 1}), se recurre al Puntero Indirecto Simple.`,
          highlight_dom: 'ptr-indirect-1',
          disk_block: idxBlock,
        },
        {
          step_num: 2,
          title: 'Lectura de la Tabla de Índice Simple',
          explanation: `El Puntero Indirecto Simple del inodo apunta al Bloque Físico #${idxLabel} en disco, que almacena una tabla con ${this.ptrsPerIndexBlock} entradas (índices 0 al ${this.ptrsPerIndexBlock - 1}).`,
          highlight_dom: 'simple-node-parent',
          disk_block: idxBlock,
        },
        {
          step_num: 3,
          title: 'Cálculo de la Entrada en la Tabla',
          explanation: `Se restan los ${this.directCount} bloques directos previos para obtener la posición dentro de la tabla: Entrada = ${n} − ${this.directCount} = [${relIdx}]. En el bloque #${idxLabel}, la Entrada [${relIdx}] contiene la dirección #${physLabel}.`,
          highlight_dom: `simple-entry-${relIdx}`,
          disk_block: idxBlock,
        },
        {
          step_num: 4,
          title: 'Acceso al Bloque Físico de Datos',
          explanation: `Obtenida la dirección en la tabla de índice simple, se realiza el segundo acceso a disco para leer el Bloque Físico #${physLabel}.`,
          highlight_dom: `disk-cell-${physBlock}`,
          disk_block: physBlock,
        },
      ],
    };
  }

  private resolveIndirectDouble(n: number, logicalPosition: number): ResolutionResult {
    const k = this.ptrsPerIndexBlock;
    const dblBase = this.directCount + this.simpleCount;
    const relDouble = n - dblBase;
    const l1Idx = Math.floor(relDouble / k);
    const l2BlockId = this.indirectDoubleL1Entries[l1Idx]!;
    const l2Entries = this.indirectDoubleL2Map[l2BlockId] ?? [];
    const l2Idx = relDouble % k;
    const physBlock = l2Entries[l2Idx]!;
    const n1BlockId = this.indirectDoubleBlockId;

    const physLabel = physBlock.toString().padStart(2, '0');
    const n1Label = n1BlockId.toString().padStart(2, '0');
    const l2Label = l2BlockId.toString().padStart(2, '0');

    return {
      logical_position: logicalPosition,
      logical_block_index: n,
      route_type: 'INDIRECT_DOUBLE',
      physical_block: physBlock,
      pointer_label: 'Ind. Doble',
      pointer_dom_id: 'ptr-indirect-2',
      formal_calc: `N = ${n}  │  d = ${n} − ${dblBase} = ${relDouble}  │  i₁ = ⌊${relDouble} ÷ ${k}⌋ = [${l1Idx}] (N2 #${l2Label})  │  i₂ = ${relDouble} mod ${k} = [${l2Idx}]  ➜  Bloque #${physLabel}`,
      substructures: [
        {
          role: 'inode',
          name: `Inodo #${this.inodeId}`,
          info: 'Puntero Ind. Doble',
          block: null,
        },
        {
          role: 'index',
          name: `Índice N1 #${n1Label}`,
          info: `Entrada [${l1Idx}] ➜ Blk #${l2Label}`,
          block: n1BlockId,
        },
        {
          role: 'index',
          name: `Índice N2 #${l2Label}`,
          info: `Entrada [${l2Idx}] ➜ Blk #${physLabel}`,
          block: l2BlockId,
        },
        {
          role: 'data',
          name: `Bloque Físico #${physLabel}`,
          info: 'Bloque de Datos en Disco',
          block: physBlock,
        },
      ],
      steps: [
        {
          step_num: 1,
          title: 'Desplazamiento dentro del Indirecto Doble',
          explanation: `Primero se pasa a numeración desde 0: N = ${logicalPosition} − 1 = ${n}. Luego se restan los ${this.directCount} bloques directos y los ${this.simpleCount} del indirecto simple (${dblBase} en total): d = ${n} − ${dblBase} = ${relDouble}.`,
          highlight_dom: 'double-node-n1',
          disk_block: n1BlockId,
        },
        {
          step_num: 2,
          title: 'Selección de Subtabla en Nivel 1 (División Entera)',
          explanation: `Cada subtabla de Nivel 2 abarca ${k} bloques. Dividiendo el desplazamiento d = ${relDouble} entre ${k}, el cociente entero es ${relDouble} ÷ ${k} = [${l1Idx}]. En la tabla N1 (#${n1Label}), la entrada [${l1Idx}] apunta a la Subtabla N2 en el bloque #${l2Label}.`,
          highlight_dom: `double-node-n2-${l1Idx}`,
          disk_block: l2BlockId,
        },
        {
          step_num: 3,
          title: 'Posición dentro de la Subtabla N2 (Resto)',
          explanation: `El resto de la división (${relDouble} mod ${k} = [${l2Idx}]) indica qué fila leer dentro de la Subtabla N2 (#${l2Label}). La Entrada [${l1Idx}][${l2Idx}] contiene el bloque físico #${physLabel}.`,
          highlight_dom: `double-entry-${logicalPosition}`,
          disk_block: l2BlockId,
        },
        {
          step_num: 4,
          title: 'Acceso al Bloque Físico de Datos',
          explanation: `Tras recorrer el bloque N1 (#${n1Label}) y la subtabla N2 (#${l2Label}), el tercer acceso a disco lee el Bloque Físico de Datos #${physLabel}.`,
          highlight_dom: `disk-cell-${physBlock}`,
          disk_block: physBlock,
        },
      ],
    };
  }

  private resolveTriple(n: number, logicalPosition: number): ResolutionResult {
    const tripBase = this.directCount + this.simpleCount + this.doubleCount;
    const relTriple = n - tripBase;
    const n1BlockId = this.indirectTripleBlockId;
    const n2BlockId = this.indirectTripleL1Entries[0]!;
    const n3BlockId = this.indirectTripleL2Entries[0]!;
    const physBlock = this.indirectTripleDataBlocks[relTriple]!;

    const physLabel = physBlock.toString().padStart(2, '0');
    const n1Label = n1BlockId.toString().padStart(2, '0');
    const n2Label = n2BlockId.toString().padStart(2, '0');
    const n3Label = n3BlockId.toString().padStart(2, '0');

    return {
      logical_position: logicalPosition,
      logical_block_index: n,
      route_type: 'INDIRECT_TRIPLE',
      physical_block: physBlock,
      pointer_label: 'Ind. Triple',
      pointer_dom_id: 'ptr-indirect-3',
      formal_calc: `N = ${n}  │  d = ${n} − ${tripBase} = ${relTriple}  │  N1(#{${n1Label}}) ➜ N2(#{${n2Label}}) ➜ N3(#{${n3Label}}) ➜ Bloque #${physLabel}`,
      substructures: [
        {
          role: 'inode',
          name: `Inodo #${this.inodeId}`,
          info: 'Puntero Ind. Triple',
          block: null,
        },
        {
          role: 'index',
          name: `Índice N1 #${n1Label}`,
          info: `Nivel 1 ➜ N2 #${n2Label}`,
          block: n1BlockId,
        },
        {
          role: 'index',
          name: `Índice N2 #${n2Label}`,
          info: `Nivel 2 ➜ N3 #${n3Label}`,
          block: n2BlockId,
        },
        {
          role: 'index',
          name: `Índice N3 #${n3Label}`,
          info: `Entrada [${relTriple}] ➜ Blk #${physLabel}`,
          block: n3BlockId,
        },
        {
          role: 'data',
          name: `Bloque Físico #${physLabel}`,
          info: 'Bloque de Datos en Disco',
          block: physBlock,
        },
      ],
      steps: [
        {
          step_num: 1,
          title: 'Desplazamiento dentro del Indirecto Triple',
          explanation: `Se resta el total de bloques anteriores: ${this.directCount} directos + ${this.simpleCount} simples + ${this.doubleCount} dobles = ${tripBase}. El desplazamiento es d = ${n} − ${tripBase} = ${relTriple}.`,
          highlight_dom: 'triple-node-n1',
          disk_block: n1BlockId,
        },
        {
          step_num: 2,
          title: 'Recorrido de la Cadena de Indirección Triple',
          explanation: `Se consulta el bloque N1 (#${n1Label}), que conduce a la tabla intermedia N2 (#${n2Label}) y de allí a la tabla hoja N3 (#${n3Label}).`,
          highlight_dom: 'triple-node-n2',
          disk_block: n2BlockId,
        },
        {
          step_num: 3,
          title: 'Acceso a la Entrada de Datos en Nivel 3',
          explanation: `Dentro de la tabla N3 (#${n3Label}), la entrada [${relTriple}] apunta al Bloque Físico #${physLabel}.`,
          highlight_dom: `triple-entry-${logicalPosition}`,
          disk_block: n3BlockId,
        },
        {
          step_num: 4,
          title: 'Acceso al Bloque Físico de Datos',
          explanation: `Cuarto acceso a disco: lectura del Bloque Físico de Datos #${physLabel}.`,
          highlight_dom: `disk-cell-${physBlock}`,
          disk_block: physBlock,
        },
      ],
    };
  }

  public getDynamicStructure(allocatedCount: number): InodeStructure {
    const clamped = Math.max(0, Math.min(allocatedCount, this.totalLogicalPositions));

    // Direct pointers (12)
    const directPointers: DirectPointer[] = this.directBlocks.map((blk, i) => ({
      index: i,
      position: i + 1,
      block: i < clamped ? blk : 0,
      is_allocated: i < clamped,
    }));

    // Indirect Simple
    const simpleAllocated = Math.max(0, Math.min(clamped - this.directCount, this.simpleCount));
    const hasSimple = clamped > this.directCount;
    const indirectSimple: IndirectSimpleStructure = {
      block_id: hasSimple ? this.indirectSimpleBlockId : 0,
      is_allocated: hasSimple,
      entries: this.indirectSimpleEntries.slice(0, simpleAllocated).map((blk, i) => ({
        index: i,
        position: this.directCount + i + 1,
        block: blk,
      })),
    };

    // Indirect Double
    const doubleOffset = this.directCount + this.simpleCount;
    const doubleAllocated = Math.max(0, Math.min(clamped - doubleOffset, this.doubleCount));
    const hasDouble = clamped > doubleOffset;
    const doubleL1Count = Math.ceil(doubleAllocated / this.ptrsPerIndexBlock);
    const activeL1Entries = hasDouble
      ? this.indirectDoubleL1Entries.slice(0, Math.max(1, doubleL1Count))
      : [];
    const activeL2Map: Record<number, number[]> = {};

    let remainingDouble = doubleAllocated;
    for (const l1 of activeL1Entries) {
      const take = Math.min(remainingDouble, this.ptrsPerIndexBlock);
      activeL2Map[l1] = (this.indirectDoubleL2Map[l1] || []).slice(0, take);
      remainingDouble -= take;
    }

    const indirectDouble: IndirectDoubleStructure = {
      block_id: hasDouble ? this.indirectDoubleBlockId : 0,
      is_allocated: hasDouble,
      l1_entries: activeL1Entries,
      l2_map: activeL2Map,
    };

    // Indirect Triple
    const tripleOffset = doubleOffset + this.doubleCount;
    const tripleAllocated = Math.max(0, Math.min(clamped - tripleOffset, this.tripleCount));
    const hasTriple = clamped > tripleOffset;
    const indirectTriple: IndirectTripleStructure = {
      block_id: hasTriple ? this.indirectTripleBlockId : 0,
      is_allocated: hasTriple,
      l1_entries: hasTriple ? this.indirectTripleL1Entries : [],
      l2_entries: hasTriple ? this.indirectTripleL2Entries : [],
      data_blocks: hasTriple ? this.indirectTripleDataBlocks.slice(0, tripleAllocated) : [],
    };

    // Active disk blocks map
    const activeDataBlocks = new Map<number, { role: DiskBlockRole; desc: string; pos: number }>();

    for (let i = 0; i < Math.min(clamped, this.directCount); i++) {
      const blk = this.directBlocks[i]!;
      activeDataBlocks.set(blk, {
        role: 'direct',
        desc: `Bloque Directo [${i}] ➜ Posición Lógica ${i + 1} (Físico #${String(blk).padStart(2, '0')})`,
        pos: i + 1,
      });
    }

    if (hasSimple) {
      activeDataBlocks.set(this.indirectSimpleBlockId, {
        role: 'index_simple',
        desc: `Bloque de Índice Simple #${String(this.indirectSimpleBlockId).padStart(2, '0')}`,
        pos: 0,
      });
      for (let i = 0; i < simpleAllocated; i++) {
        const blk = this.indirectSimpleEntries[i]!;
        const pos = this.directCount + i + 1;
        activeDataBlocks.set(blk, {
          role: 'indirect_simple_data',
          desc: `Dato Ind. Simple [${i}] ➜ Posición Lógica ${pos} (Físico #${String(blk).padStart(2, '0')})`,
          pos,
        });
      }
    }

    if (hasDouble) {
      activeDataBlocks.set(this.indirectDoubleBlockId, {
        role: 'index_double_1',
        desc: `Bloque de Índice Doble N1 #${String(this.indirectDoubleBlockId).padStart(2, '0')}`,
        pos: 0,
      });
      for (const l1 of activeL1Entries) {
        activeDataBlocks.set(l1, {
          role: 'index_double_2',
          desc: `Subtabla N2 #${String(l1).padStart(2, '0')}`,
          pos: 0,
        });
        const dataBlks = activeL2Map[l1] || [];
        dataBlks.forEach((blk, idx) => {
          const l1Idx = this.indirectDoubleL1Entries.indexOf(l1);
          const pos = doubleOffset + l1Idx * this.ptrsPerIndexBlock + idx + 1;
          activeDataBlocks.set(blk, {
            role: 'indirect_double_data',
            desc: `Dato Ind. Doble [${l1Idx}][${idx}] ➜ Posición Lógica ${pos} (Físico #${String(blk).padStart(2, '0')})`,
            pos,
          });
        });
      }
    }

    if (hasTriple) {
      activeDataBlocks.set(this.indirectTripleBlockId, {
        role: 'index_triple_1',
        desc: `Bloque de Índice Triple N1 #${String(this.indirectTripleBlockId).padStart(2, '0')}`,
        pos: 0,
      });
      if (this.indirectTripleL1Entries[0]) {
        activeDataBlocks.set(this.indirectTripleL1Entries[0], {
          role: 'index_triple_sub',
          desc: `Índice Triple N2 #${String(this.indirectTripleL1Entries[0]).padStart(2, '0')}`,
          pos: 0,
        });
      }
      if (this.indirectTripleL2Entries[0]) {
        activeDataBlocks.set(this.indirectTripleL2Entries[0], {
          role: 'index_triple_sub',
          desc: `Índice Triple N3 #${String(this.indirectTripleL2Entries[0]).padStart(2, '0')}`,
          pos: 0,
        });
      }
      for (let i = 0; i < tripleAllocated; i++) {
        const blk = this.indirectTripleDataBlocks[i]!;
        const pos = tripleOffset + i + 1;
        activeDataBlocks.set(blk, {
          role: 'indirect_triple_data',
          desc: `Dato Ind. Triple [${i}] ➜ Posición Lógica ${pos} (Físico #${String(blk).padStart(2, '0')})`,
          pos,
        });
      }
    }

    const diskBlocks: DiskBlock[] = Array.from({ length: this.totalDiskBlocks }, (_, idx) => {
      const active = activeDataBlocks.get(idx);
      if (active) {
        return {
          id: idx,
          label: `#${String(idx).padStart(2, '0')}`,
          role: active.role,
          desc: active.desc,
          position: active.pos > 0 ? active.pos : undefined,
        };
      }
      return {
        id: idx,
        label: `#${String(idx).padStart(2, '0')}`,
        role: 'free',
        desc: `Bloque Libre #${String(idx).padStart(2, '0')} (Disponible)`,
      };
    });

    return {
      block_size: this.blockSize,
      inode_id: this.inodeId,
      mode: this.mode,
      uid: this.uid,
      gid: this.gid,
      total_blocks: this.totalDiskBlocks,
      total_logical_positions: this.totalLogicalPositions,
      direct_pointers: directPointers,
      indirect_simple: indirectSimple,
      indirect_double: indirectDouble,
      indirect_triple: indirectTriple,
      disk_blocks: diskBlocks,
    };
  }

  public getAllocationStepExplanation(allocatedCount: number): AllocationExplanation {
    if (allocatedCount === 0) {
      return {
        phase: 'EMPTY',
        phaseTitle: 'Inodo Ext4 Inicializado (Archivo Vacío · 0 KB)',
        badge: '0 / 12 Directos',
        summary: 'Inodo #42 creado en Ubuntu 24.04 LTS (0 bytes asignados).',
        details:
          'Todos los 12 punteros directos y punteros indirectos tienen valor 0 (NULL). No hay bloques físicos ocupados en disco.',
        linuxKernelLog:
          '[ext4_new_inode] Inodo #42 reservado en /dev/sda1 (modo: -rw-r--r--, i_size=0)',
      };
    }

    if (allocatedCount <= this.directCount) {
      return {
        phase: 'DIRECT',
        phaseTitle: `Llenando Punteros Directos (${allocatedCount}/12 Bloques)`,
        badge: `${allocatedCount * 4} KB Escritos`,
        summary: `Los datos se direccionan mediante los punteros directos del inodo (i_block[0..${allocatedCount - 1}]).`,
        details:
          'Máxima velocidad de lectura/escritura (1 acceso a disco por bloque). Cada entrada en el inodo apunta directamente a un bloque físico.',
        linuxKernelLog: `[ext4_alloc_branch] Asignado bloque directo [${allocatedCount - 1}] en bloque físico #${this.directBlocks[allocatedCount - 1]}`,
      };
    }

    if (allocatedCount <= this.directCount + this.simpleCount) {
      const idx = allocatedCount - this.directCount;
      return {
        phase: 'INDIRECT_SIMPLE',
        phaseTitle: `Punteros Directos Agotados ➜ Índice Simple (${idx}/${this.simpleCount})`,
        badge: `Índice Simple (${allocatedCount * 4} KB)`,
        summary:
          'Capacidad directa de 12 bloques superada. Ext4 reservó un bloque de índice simple en disco.',
        details: `El puntero i_block[12] del inodo apunta al bloque de índice #${this.indirectSimpleBlockId}, el cual contiene las direcciones de los siguientes bloques de datos (2 accesos a disco).`,
        linuxKernelLog: `[ext4_ind_alloc] i_block[12] -> Bloque de índice simple #${this.indirectSimpleBlockId} (entrada [${idx - 1}] -> #${this.indirectSimpleEntries[idx - 1]})`,
      };
    }

    if (allocatedCount <= this.directCount + this.simpleCount + this.doubleCount) {
      const idx = allocatedCount - (this.directCount + this.simpleCount);
      return {
        phase: 'INDIRECT_DOUBLE',
        phaseTitle: `Índice Simple Lleno ➜ Índice Doble (${idx}/${this.doubleCount})`,
        badge: `Índice Doble (${allocatedCount * 4} KB)`,
        summary:
          'Índice simple completado. Ext4 inicializó el Bloque de Índice Doble N1 y subtablas N2.',
        details: `El puntero i_block[13] apunta a la tabla N1 (#${this.indirectDoubleBlockId}), permitiendo indexar múltiples subtablas secundarias para escalar la capacidad (3 accesos a disco).`,
        linuxKernelLog: `[ext4_dind_alloc] i_block[13] -> N1 #${this.indirectDoubleBlockId} -> N2 subtablas -> datos`,
      };
    }

    const idx = allocatedCount - (this.directCount + this.simpleCount + this.doubleCount);
    return {
      phase: 'INDIRECT_TRIPLE',
      phaseTitle: `Índice Doble Lleno ➜ Cadena de Índice Triple (${idx}/${this.tripleCount})`,
      badge: `Índice Triple (${allocatedCount * 4} KB)`,
      summary:
        'Archivo de gran escala. Ext4 encadena 3 niveles de indirección jerárquica (N1 ➜ N2 ➜ N3).',
      details: `El puntero i_block[14] encadena 3 niveles de índices en disco (#${this.indirectTripleBlockId} -> N2 -> N3 -> datos) para soportar archivos de hasta varios Terabytes (4 accesos a disco).`,
      linuxKernelLog: `[ext4_tind_alloc] i_block[14] -> N1 #${this.indirectTripleBlockId} -> N2 -> N3 -> datos`,
    };
  }

  public getInodeMetadata(allocatedCount: number): Ext4InodeMetadata {
    const sizeBytes = allocatedCount * this.blockSize;
    const sectors = sizeBytes / 512;

    return {
      inode_id: this.inodeId,
      filename: 'documento.dat',
      distro: 'Ubuntu 24.04 LTS (Noble Numbat)',
      kernel: 'Linux 6.8.0-31-generic x86_64',
      filesystem: 'ext4',
      mount_point: '/dev/sda1 on /',
      mode_octal: '0644',
      mode_str: this.mode,
      file_type: 'Regular File (S_IFREG)',
      uid: this.uid,
      user: 'ubuntu (1000)',
      gid: this.gid,
      group: 'ubuntu (1000)',
      size_bytes: sizeBytes,
      size_formatted: `${(sizeBytes / 1024).toFixed(1)} KB`,
      blocks_sectors: sectors,
      io_block_size: this.blockSize,
      links_count: 1,
      ext4_flags: '0x00080000 (EXT4_EXTENTS_FL / TRADITIONAL_BLOCKS)',
      atime: '2026-11-10 12:45:02 UTC',
      mtime: '2026-11-10 12:48:30 UTC',
      ctime: '2026-11-10 12:48:30 UTC',
      crtime: '2026-11-10 12:00:00 UTC',
      generation: '0x3fa1c94b',
      extra_isize: 32,
      inode_size_bytes: 256,
    };
  }
}
