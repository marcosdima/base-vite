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
  });

  it('opens and closes the Theory modal', () => {
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

    // Close modal
    const closeBtn = document.getElementById('btn-close-modal');
    if (closeBtn) fireEvent.click(closeBtn);
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
});
