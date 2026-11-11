import { describe, expect, it } from 'vitest';
import { render, screen } from '../test/render';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('should render the three giant simulation pads (Inodes, Procesos, Terminal)', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { level: 2, name: 'Inodes' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Procesos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Terminal' })).toBeInTheDocument();
  });

  it('should link each pad to its respective simulation path', () => {
    render(<HomePage />);

    const inodesPad = screen.getByRole('heading', { level: 2, name: 'Inodes' }).closest('a');
    const processesPad = screen.getByRole('heading', { level: 2, name: 'Procesos' }).closest('a');
    const terminalPad = screen.getByRole('heading', { level: 2, name: 'Terminal' }).closest('a');

    expect(inodesPad).toHaveAttribute('href', '/inodes');
    expect(processesPad).toHaveAttribute('href', '/processes');
    expect(terminalPad).toHaveAttribute('href', '/terminal');
  });
});
