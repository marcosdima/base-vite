import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@/test/render';
import { PollDemo } from './PollDemo';

describe('PollDemo', () => {
  it('increments votes and calculates percentage on option click', () => {
    render(<PollDemo />);

    const optionButton = screen.getByRole('button', { name: /Reports dashboard/i });
    fireEvent.click(optionButton);

    expect(optionButton).toHaveTextContent('1 (100%)');
  });

  it('closes and resets the poll', () => {
    render(<PollDemo />);

    const optionButton = screen.getByRole('button', { name: /Reports dashboard/i });
    fireEvent.click(optionButton);
    expect(optionButton).toHaveTextContent('1 (100%)');

    fireEvent.click(screen.getByRole('button', { name: 'Close poll' }));
    expect(optionButton).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Reset votes' }));
    expect(screen.getByRole('button', { name: /Reports dashboard/i })).toHaveTextContent('0 (0%)');
  });
});
