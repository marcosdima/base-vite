import { fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '../test/render';
import { TerminalPage } from './TerminalPage';

describe('TerminalPage', () => {
  it('renders the interactive terminal with header and prompt', () => {
    render(<TerminalPage />);

    expect(screen.getByText(/Terminal interactivo del SO/i)).toBeInTheDocument();
    expect(screen.getByText(/so-user@kernel:~\$/i)).toBeInTheDocument();
  });

  it('executes the uname command and prints system information', async () => {
    render(<TerminalPage />);

    const input = screen.getByLabelText('Terminal input');
    fireEvent.change(input, { target: { value: 'uname -a' } });
    fireEvent.submit(input.closest('form')!);

    expect(await screen.findByText(/Linux so-simulator 6.8.0-generic/i)).toBeInTheDocument();
  });

  it('executes the inodes and stat commands using VFS and real-scale BlockMap', async () => {
    render(<TerminalPage />);

    const input = screen.getByLabelText('Terminal input');
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: 'inodes' } });
    fireEvent.submit(form);
    expect(await screen.findByText(/i_block\[0\.\.11\] Directos/i)).toBeInTheDocument();

    // Stat on a real VFS file
    fireEvent.change(input, { target: { value: 'stat notes.md' } });
    fireEvent.submit(form);
    expect(await screen.findByText(/Archivo: \/home\/dev\/notes\.md/i)).toBeInTheDocument();

    // Stat on a logical block index
    fireEvent.change(input, { target: { value: 'stat 12' } });
    fireEvent.submit(form);
    expect(await screen.findByText(/Bloque Lógico L = 12/i)).toBeInTheDocument();
  });

  it('executes ps and kill commands, terminating READY and RUNNING processes properly', async () => {
    render(<TerminalPage />);

    const input = screen.getByLabelText('Terminal input');
    const form = input.closest('form')!;

    // Kill P1 (which is in READY)
    fireEvent.change(input, { target: { value: 'kill 1' } });
    fireEvent.submit(form);
    expect(await screen.findByText(/Proceso P1 finalizado \(TERMINATED\)/i)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'ps' } });
    fireEvent.submit(form);
    expect(await screen.findByText(/1\s+TERMINATED/i)).toBeInTheDocument();
    expect(await screen.findByText(/Planificador: FCFS/i)).toBeInTheDocument();
  });

  it('executes POSIX filesystem commands (pwd, ls, touch, df)', async () => {
    render(<TerminalPage />);

    const input = screen.getByLabelText('Terminal input');
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: 'pwd' } });
    fireEvent.submit(form);
    expect(await screen.findByText('/home/dev')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'touch demo.txt' } });
    fireEvent.submit(form);
    expect(await screen.findByText(/Archivo creado: \/home\/dev\/demo\.txt/i)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'ls' } });
    fireEvent.submit(form);
    expect(await screen.findByText(/#16\s+-rw-r--r--.*demo\.txt/i)).toBeInTheDocument();
  });
});
