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

  it('executes the inodes command and displays structure summary', async () => {
    render(<TerminalPage />);

    const input = screen.getByLabelText('Terminal input');
    fireEvent.change(input, { target: { value: 'inodes' } });
    fireEvent.submit(input.closest('form')!);

    expect(await screen.findByText(/Inodo ID: #42/i)).toBeInTheDocument();
  });

  it('executes the ps command and displays processes table', async () => {
    render(<TerminalPage />);

    const input = screen.getByLabelText('Terminal input');
    fireEvent.change(input, { target: { value: 'ps' } });
    fireEvent.submit(input.closest('form')!);

    expect(await screen.findByText(/PID/i)).toBeInTheDocument();
    expect(await screen.findByText(/Planificador: FCFS/i)).toBeInTheDocument();
  });
});
