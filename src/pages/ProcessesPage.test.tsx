import { fireEvent, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '../test/render';
import { ProcessesPage } from './ProcessesPage';

describe('ProcessesPage', () => {
  it('renders all 5 process lifecycle nodes and narration bar', () => {
    render(<ProcessesPage />);

    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('Terminated')).toBeInTheDocument();
    expect(screen.getByText('Waiting')).toBeInTheDocument();

    expect(screen.getByText(/Guía del Planificador/i)).toBeInTheDocument();
  });

  it('steps through the demo script when clicking step button', () => {
    render(<ProcessesPage />);

    const stepBtn = document.getElementById('btn-step');
    expect(stepBtn).toBeInTheDocument();

    // Initial state: Step 0 has P1, P2, P3 in NEW
    expect(document.getElementById('proc-token-1')).toBeInTheDocument();

    // Step forward: P1, P2, P3 admitted to READY
    if (stepBtn) fireEvent.click(stepBtn);
    expect(screen.getByText(/FCFS · Admisión/i)).toBeInTheDocument();

    // Step forward: P1 dispatched to RUNNING
    if (stepBtn) fireEvent.click(stepBtn);
    expect(screen.getByText(/FCFS · Despachar P1/i)).toBeInTheDocument();

    // Keyboard navigation: ArrowLeft steps back, ArrowRight steps forward
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText(/FCFS · Admisión/i)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText(/FCFS · Despachar P1/i)).toBeInTheDocument();
  });

  it('opens and closes the Theory modal via button and Escape key', () => {
    render(<ProcessesPage />);

    const openTheoryBtn = screen.getByText(/Guía del Planificador/i);
    fireEvent.click(openTheoryBtn);

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByText('Políticas del Planificador de Corto Plazo'),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('First-Come, First-Served (FCFS / FIFO)')).toBeInTheDocument();

    // Click Round Robin tab within the modal
    const rrTab = within(dialog).getByRole('button', { name: 'Round Robin' });
    fireEvent.click(rrTab);
    expect(within(dialog).getByText('Round Robin (Turno Rotatorio)')).toBeInTheDocument();

    // Close modal via Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText('Políticas del Planificador de Corto Plazo')).not.toBeInTheDocument();
  });

  it('switches to manual mode and creates a process', () => {
    render(<ProcessesPage />);

    const manualTab = document.getElementById('tab-manual');
    expect(manualTab).toBeInTheDocument();
    if (manualTab) fireEvent.click(manualTab);

    expect(screen.getByText(/Crear Proceso/i)).toBeInTheDocument();
    const addBtn = document.getElementById('btn-add-proc');
    if (addBtn) fireEvent.click(addBtn);

    // New process P1 created
    expect(document.getElementById('proc-token-1')).toBeInTheDocument();
  });

  it('filters PCB inspector fields to match the active scheduler and supports SJF', () => {
    render(<ProcessesPage />);

    // Select P1 in FCFS mode
    fireEvent.click(document.getElementById('proc-token-1')!);
    const inspector = document.getElementById('pcb-inspector')!;
    expect(within(inspector).getByText(/Ráfaga total:/i)).toBeInTheDocument();
    expect(within(inspector).queryByText(/Prioridad/i)).not.toBeInTheDocument();
    expect(within(inspector).queryByText(/Quantum/i)).not.toBeInTheDocument();

    // Switch to SJF
    fireEvent.click(screen.getByRole('button', { name: 'SJF' }));
    expect(screen.getByText(/SJF · Creación/i)).toBeInTheDocument();
    fireEvent.click(document.getElementById('proc-token-2')!);
    expect(within(inspector).getByText(/Ráfaga estimada:/i)).toBeInTheDocument();
    expect(within(inspector).queryByText(/Prioridad/i)).not.toBeInTheDocument();
    expect(within(inspector).queryByText(/Quantum/i)).not.toBeInTheDocument();

    // Switch to Round Robin
    fireEvent.click(screen.getByRole('button', { name: 'Round Robin' }));
    fireEvent.click(document.getElementById('proc-token-1')!);
    expect(within(inspector).getByText(/Quantum consumido:/i)).toBeInTheDocument();
    expect(within(inspector).queryByText(/Prioridad/i)).not.toBeInTheDocument();

    // Switch to Priority
    fireEvent.click(screen.getByRole('button', { name: 'Prioridades' }));
    fireEvent.click(document.getElementById('proc-token-2')!);
    expect(within(inspector).getByText(/Prioridad \(1-5\):/i)).toBeInTheDocument();
    expect(within(inspector).queryByText(/Quantum/i)).not.toBeInTheDocument();
  });

  it('allows editing burst_time only in NEW and locks it once admitted to READY', () => {
    render(<ProcessesPage />);

    // Switch to manual mode and create P1 (in NEW)
    fireEvent.click(document.getElementById('tab-manual')!);
    fireEvent.click(document.getElementById('btn-add-proc')!);
    fireEvent.click(document.getElementById('proc-token-1')!);

    const inspector = document.getElementById('pcb-inspector')!;
    expect(within(inspector).getByTitle('Aumentar ráfaga')).toBeInTheDocument();

    // Admit P1 -> READY
    fireEvent.click(document.querySelector('[data-action="admit"]')!);
    expect(within(inspector).queryByTitle('Aumentar ráfaga')).not.toBeInTheDocument();
    expect(within(inspector).queryByTitle('Reducir ráfaga')).not.toBeInTheDocument();
  });
});
