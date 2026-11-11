export type DiskBlockRole =
  | 'direct'
  | 'index_simple'
  | 'indirect_simple_data'
  | 'index_double_1'
  | 'index_double_2'
  | 'indirect_double_data'
  | 'index_triple_1'
  | 'index_triple_sub'
  | 'indirect_triple_data'
  | 'free';

export interface DiskBlock {
  id: number;
  label: string;
  role: DiskBlockRole;
  desc: string;
  position?: number;
  direct_idx?: number;
}

export interface DirectPointer {
  index: number;
  position: number;
  block: number;
  is_allocated?: boolean;
}

export interface IndirectSimpleEntry {
  index: number;
  position: number;
  block: number;
}

export interface IndirectSimpleStructure {
  block_id: number;
  is_allocated?: boolean;
  entries: IndirectSimpleEntry[];
}

export interface IndirectDoubleStructure {
  block_id: number;
  is_allocated?: boolean;
  l1_entries: number[];
  l2_map: Record<number, number[]>;
}

export interface IndirectTripleStructure {
  block_id: number;
  is_allocated?: boolean;
  l1_entries: number[];
  l2_entries: number[];
  data_blocks: number[];
}

export interface SubstructureInfo {
  role: 'inode' | 'index' | 'data';
  name: string;
  info: string;
  block: number | null;
}

export interface ResolutionStep {
  step_num: number;
  title: string;
  explanation: string;
  highlight_dom: string;
  disk_block: number;
}

export type RouteType = 'DIRECT' | 'INDIRECT_SIMPLE' | 'INDIRECT_DOUBLE' | 'INDIRECT_TRIPLE';

export interface ResolutionResult {
  logical_position: number;
  logical_block_index: number;
  route_type: RouteType;
  physical_block: number;
  index_block?: number;
  table_index?: number;
  pointer_label: string;
  pointer_dom_id: string;
  formal_calc: string;
  substructures: SubstructureInfo[];
  steps: ResolutionStep[];
}

export interface InodeStructure {
  block_size: number;
  inode_id: number;
  mode: string;
  uid: number;
  gid: number;
  total_blocks: number;
  total_logical_positions: number;
  direct_pointers: DirectPointer[];
  indirect_simple: IndirectSimpleStructure;
  indirect_double: IndirectDoubleStructure;
  indirect_triple: IndirectTripleStructure;
  disk_blocks: DiskBlock[];
}

export interface Ext4InodeMetadata {
  inode_id: number;
  filename: string;
  distro: string;
  kernel: string;
  filesystem: string;
  mount_point: string;
  mode_octal: string;
  mode_str: string;
  file_type: string;
  uid: number;
  user: string;
  gid: number;
  group: string;
  size_bytes: number;
  size_formatted: string;
  blocks_sectors: number;
  io_block_size: number;
  links_count: number;
  ext4_flags: string;
  atime: string;
  mtime: string;
  ctime: string;
  crtime: string;
  generation: string;
  extra_isize: number;
  inode_size_bytes: number;
}

export type LoadingPhase =
  'EMPTY' | 'DIRECT' | 'INDIRECT_SIMPLE' | 'INDIRECT_DOUBLE' | 'INDIRECT_TRIPLE';

export interface AllocationExplanation {
  phase: LoadingPhase;
  phaseTitle: string;
  badge: string;
  summary: string;
  details: string;
  linuxKernelLog: string;
}

export interface InodeSimulationState extends InodeStructure {
  meta: {
    slug: 'inodes';
    seed: number;
  };
}
