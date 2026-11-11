import { useState } from 'react';
import { LuArrowRight, LuCpu, LuLayers, LuTerminal } from 'react-icons/lu';
import { Link } from 'react-router-dom';

interface SimPadItem {
  id: string;
  title: string;
  path: string;
  icon: React.ReactNode;
  tag: string;
  description: string;
  accentClass: string;
}

const PADS: SimPadItem[] = [
  {
    id: 'inodes',
    title: 'Inodes',
    path: '/inodes',
    icon: <LuLayers className="pad-icon" />,
    tag: 'Ext4 · 100 Bloques',
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [lastIndex, setLastIndex] = useState<number>(0);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : lastIndex;
  const isVisible = hoveredIndex !== null;

  return (
    <div className="home-pads-container">
      <div className="home-pads-grid" onMouseLeave={() => setHoveredIndex(null)}>
        {/* Dynamic sliding shadow with spring bounce */}
        <div
          className={`pads-sliding-shadow pos-${activeIndex} ${
            isVisible ? 'is-visible' : 'is-hidden'
          }`}
          aria-hidden="true"
        />

        {PADS.map((pad, idx) => (
          <Link
            key={pad.id}
            to={pad.path}
            className={`huge-sim-pad ${pad.accentClass} ${
              hoveredIndex === idx ? 'is-hovered' : ''
            }`}
            id={`pad-${pad.id}`}
            onMouseEnter={() => {
              setHoveredIndex(idx);
              setLastIndex(idx);
            }}
            onFocus={() => {
              setHoveredIndex(idx);
              setLastIndex(idx);
            }}
            onBlur={() => setHoveredIndex(null)}
          >
            <div className="pad-top-tag">{pad.tag}</div>

            <div className="pad-icon-wrapper">{pad.icon}</div>

            <h2 className="pad-title">{pad.title}</h2>

            <p className="pad-desc">{pad.description}</p>

            <div className="pad-action">
              <span>Ingresar a la simulación</span>
              <LuArrowRight className="pad-arrow" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
