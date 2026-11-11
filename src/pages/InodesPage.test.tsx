import { fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '../test/render';
import { InodesPage } from './InodesPage';

describe('InodesPage', () => {
  it('renders the Ubuntu 24.04 Ext4 reference and 100-block disk matrix', () => {
    render(<InodesPage />);

    expect(screen.getAllByText(/Ubuntu 24.04 LTS/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/documento.dat/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/INODO #42/i).length).toBeGreaterThan(0);

    // 100 disk cell elements
    const cells = document.querySelectorAll('.matrix-cell');
    expect(cells.length).toBe(100);
  });

  it('progressively loads blocks and fills pointers when using loading buttons', () => {
    render(<InodesPage />);

    // Initially empty at 0 blocks (0.0 KB)
    expect(screen.getByText(/0.0 KB/i)).toBeInTheDocument();
    expect(screen.getByText(/0 de 28 Bloques/i)).toBeInTheDocument();

    const add1Btn = screen.getByRole('button', { name: /\+1 Bloque/i });
    fireEvent.click(add1Btn);

    // Now at 1 block (4.0 KB)
    expect(screen.getByText(/4.0 KB/i)).toBeInTheDocument();
    expect(screen.getByText(/1 de 28 Bloques/i)).toBeInTheDocument();

    // Add 4 blocks -> 5 blocks (20.0 KB)
    const add4Btn = screen.getByRole('button', { name: /\+4 Bloques/i });
    fireEvent.click(add4Btn);

    expect(screen.getByText(/20.0 KB/i)).toBeInTheDocument();
    expect(screen.getByText(/5 de 28 Bloques/i)).toBeInTheDocument();

    // Directo [4] (5th block) must be allocated and show Bloque #00, not (Vacío / NULL)
    const ptrDirect4 = document.getElementById('ptr-direct-4');
    expect(ptrDirect4).toHaveClass('stack-direct');
    expect(ptrDirect4).not.toHaveClass('pointer-empty');
    expect(ptrDirect4).toHaveTextContent(/Bloque #00/i);
  });

  it('switches between block pointers view and friendly Ext4 metadata view with explanation modal', () => {
    render(<InodesPage />);

    // Initially in pointers view
    expect(screen.getByRole('button', { name: /punteros a bloques/i })).toHaveClass('active');
    expect(document.getElementById('ptr-direct-0')).toBeInTheDocument();

    // Switch to friendly metadata view
    const metaSwitchBtn = screen.getByRole('button', { name: /metadatos ext4/i });
    fireEvent.click(metaSwitchBtn);

    expect(metaSwitchBtn).toHaveClass('active');
    expect(screen.getByText(/Permisos de acceso/i)).toBeInTheDocument();
    expect(screen.getByText(/Tamaño del archivo/i)).toBeInTheDocument();
    expect(screen.getByText(/Propietario y grupo/i)).toBeInTheDocument();
    expect(screen.getByText(/Sectores ocupados en disco/i)).toBeInTheDocument();

    // Click on a metadata field to open the explanation modal
    const permItem = screen.getByText(/Permisos de acceso/i);
    fireEvent.click(permItem);

    // Modal dialog is opened explaining the field simply
    expect(screen.getByText(/¿Qué es este campo en un inodo\?/i)).toBeInTheDocument();
    expect(screen.getByText(/st_mode \(i_mode\)/i)).toBeInTheDocument();
    expect(screen.getByText(/chmod 644 documento\.dat/i)).toBeInTheDocument();

    // Close the explanation modal
    const doneBtn = screen.getByRole('button', { name: /Entendido/i });
    fireEvent.click(doneBtn);
    expect(screen.queryByText(/¿Qué es este campo en un inodo\?/i)).not.toBeInTheDocument();

    // Switch back to pointers
    const pointersSwitchBtn = screen.getByRole('button', { name: /punteros a bloques/i });
    fireEvent.click(pointersSwitchBtn);
    expect(document.getElementById('ptr-direct-0')).toBeInTheDocument();
  });
});
