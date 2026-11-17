import { LuCpu, LuLayers, LuTerminal } from 'react-icons/lu';
import { SpotlightCardGrid, type SpotlightCardItem } from '../components/ui/SpotlightCardGrid';

const PADS: SpotlightCardItem[] = [
  {
    id: 'inodes',
    title: 'Inodes',
    path: '/inodes',
    icon: <LuLayers className="pad-icon" />,
    tag: 'Ext4 · Diagrama de Bloques',
    description:
      'Estructura interna de inodos, indexación por punteros directos e indirectos y mapeo físico en disco.',
    accentClass: 'pad-inodes',
  },
  {
    id: 'processes',
    title: 'Procesos',
    path: '/processes',
    icon: <LuCpu className="pad-icon" />,
    tag: '5 Estados · Scheduler',
    description:
      'Ciclo de vida de procesos, diagramas de transición de estados y simulador interactivo de políticas.',
    accentClass: 'pad-processes',
  },
  {
    id: 'terminal',
    title: 'Terminal',
    path: '/terminal',
    icon: <LuTerminal className="pad-icon" />,
    tag: 'Shell POSIX · Debugfs',
    description:
      'Consola interactiva de comandos POSIX para inspeccionar inodos, consultar procesos y controlar el sistema.',
    accentClass: 'pad-terminal',
  },
];

export function HomePage() {
  return <SpotlightCardGrid items={PADS} />;
}
