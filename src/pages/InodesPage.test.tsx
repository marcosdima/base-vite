import { fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '../test/render';
import { InodesPage } from './InodesPage';

describe('InodesPage', () => {
  it('renders the Ubuntu 24.04 Ext4 reference, inode card, and block diagram', () => {
    render(<InodesPage />);

    // Header toolbar context
    expect(screen.getByText(/Ubuntu 24.04 LTS/i)).toBeInTheDocument();
    expect(screen.getByText(/Ext4 sin extents · Mapeo Indirecto Real/i)).toBeInTheDocument();

    // Inode card
    expect(screen.getAllByText(/^Inodo$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/documento\.dat/i).length).toBeGreaterThan(0);

    // Block Diagram panel (initially empty with NULL pointers)
    expect(screen.getByText(/Diagrama de Bloques y Punteros/i)).toBeInTheDocument();
    expect(screen.getByText(/Direcciones Físicas en Hexadecimal/i)).toBeInTheDocument();
    expect(screen.getByText(/Archivo vacío \(0 bytes asignados\)/i)).toBeInTheDocument();

    // Side column controls
    expect(screen.getByText(/Control de Tamaño y Bloques/i)).toBeInTheDocument();
    expect(screen.getByText(/Inspección de Bloque Lógico/i)).toBeInTheDocument();
  });

  it('loads blocks dynamically via quick-load buttons (+1 Bloque, +1,024 Bloques, Vaciar)', () => {
    render(<InodesPage />);

    // Initially 0 blocks
    expect(screen.getAllByText(/0 B/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/0 Bloques de datos/i).length).toBeGreaterThan(0);

    // Click +1 Bloque (4 KB)
    const add1Btn = screen.getByRole('button', { name: /\+1 Bloque \(4 KB\)/i });
    fireEvent.click(add1Btn);

    expect(screen.getAllByText(/4 KB/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1 Bloques de datos/i).length).toBeGreaterThan(0);

    // Direct pointer [0] is allocated and displays hexadecimal 32-bit physical address
    const ptr0 = document.getElementById('ptr-direct-0');
    expect(ptr0).toBeInTheDocument();
    expect(ptr0).toHaveClass('stack-direct');
    expect(ptr0).not.toHaveClass('stack-empty');
    expect(ptr0).toHaveTextContent(/0x001080b6/i);

    // Click +1,024 Bloques (4 MB)
    const add1024Btn = screen.getByRole('button', { name: /\+1,024 Bloques \(4 MB\)/i });
    fireEvent.click(add1024Btn);

    // 1 + 1024 = 1,025 blocks (enters simple indirect branch)
    expect(screen.getAllByText(/1[.,]025 Bloques de datos/i).length).toBeGreaterThan(0);
    // Simple indirect pointer [12] is now active and displays hex address
    const ptrSimple = document.getElementById('ptr-indirect-1');
    expect(ptrSimple).toHaveClass('stack-indirect-1');
    expect(ptrSimple).toHaveTextContent(/0x001080c2/i);

    // Click Vaciar (0 B)
    const clearBtn = screen.getByRole('button', { name: /Vaciar \(0 B\)/i });
    fireEvent.click(clearBtn);

    expect(screen.getAllByText(/0 Bloques de datos/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Archivo vacío \(0 bytes asignados\)/i)).toBeInTheDocument();
  });

  it('supports presets and typed file size input', () => {
    render(<InodesPage />);

    // Click 48 KB preset chip (fills all 12 direct pointers)
    const preset48KB = screen.getByRole('button', { name: /48 KB - Llena los 12 directos/i });
    fireEvent.click(preset48KB);

    expect(screen.getAllByText(/48 KB/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/12 Bloques de datos/i).length).toBeGreaterThan(0);

    // All direct pointers are allocated, simple indirect pointer is still empty
    const ptr11 = document.getElementById('ptr-direct-11');
    expect(ptr11).toHaveClass('stack-direct');
    const ptr12 = document.getElementById('ptr-indirect-1');
    expect(ptr12).toHaveClass('stack-empty');

    // Use typed size input to set 100 MB
    const sizeInput = screen.getByLabelText(/Fijar tamaño:/i);
    const unitSelect = screen.getByRole('combobox', { name: /Unidad de tamaño/i });
    const applyBtn = screen.getByRole('button', { name: /Aplicar/i });

    fireEvent.change(sizeInput, { target: { value: '100' } });
    fireEvent.change(unitSelect, { target: { value: 'MB' } });
    fireEvent.click(applyBtn);

    // 100 MB uses double indirect addressing
    expect(screen.getAllByText(/100 MB/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/25[.,]600 Bloques de datos/i).length).toBeGreaterThan(0);
  });

  it('switches between block pointers view and friendly Ext4 metadata view with explanation modal', () => {
    render(<InodesPage />);

    // Initially in pointers view
    expect(screen.getByRole('button', { name: /Punteros a Bloques/i })).toHaveClass('active');
    expect(document.getElementById('ptr-direct-0')).toBeInTheDocument();

    // Switch to friendly metadata view
    const metaSwitchBtn = screen.getByRole('button', { name: /Metadatos Ext4/i });
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

    // Close the explanation modal via Done button
    const doneBtn = screen.getByRole('button', { name: /Entendido/i });
    fireEvent.click(doneBtn);
    expect(screen.queryByText(/¿Qué es este campo en un inodo\?/i)).not.toBeInTheDocument();

    // Open again and test closing via Escape key
    fireEvent.click(screen.getByText(/Permisos de acceso/i));
    expect(screen.getByText(/¿Qué es este campo en un inodo\?/i)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText(/¿Qué es este campo en un inodo\?/i)).not.toBeInTheDocument();

    // Switch back to pointers
    const pointersSwitchBtn = screen.getByRole('button', { name: /Punteros a Bloques/i });
    fireEvent.click(pointersSwitchBtn);
    expect(document.getElementById('ptr-direct-0')).toBeInTheDocument();
  });

  it('inspects logical blocks, displays hexadecimal hops, and filters diagram branches', () => {
    render(<InodesPage />);

    // Load 100 MB preset
    const preset100MB = screen.getByRole('button', {
      name: /100 MB - Dentro del indirecto doble/i,
    });
    fireEvent.click(preset100MB);

    // Inspect logical block 2000
    const logicalInput = document.getElementById('logical-block-search') as HTMLInputElement;
    fireEvent.change(logicalInput, { target: { value: '2000' } });

    // Logical block 2000 is in double indirect branch
    expect(screen.getAllByText(/Ind\. Doble/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/3 lecturas a disco/i)).toBeInTheDocument();

    // Check resolution formula
    expect(screen.getByText(/Fórmula de direccionamiento:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/964/i).length).toBeGreaterThan(0);

    // Check hexadecimal addresses in the resolution chain
    expect(screen.getAllByText(/0x001085ac/i).length).toBeGreaterThan(0);

    // Filter diagram to Double Indirect tab
    const doubleTabBtn = screen.getByRole('tab', { name: /Ind\. Doble \[13\]/i });
    fireEvent.click(doubleTabBtn);
    expect(doubleTabBtn).toHaveClass('active');

    // Switch to focused path tab
    const pathTabBtn = screen.getByRole('tab', { name: /Ruta Bloque L/i });
    fireEvent.click(pathTabBtn);
    expect(pathTabBtn).toHaveClass('active');
    expect(screen.getByText(/Ruta Completa de Resolución/i)).toBeInTheDocument();
  });
});
