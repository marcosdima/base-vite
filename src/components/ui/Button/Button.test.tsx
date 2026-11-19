import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@/test/render';
import { Button } from './Button';

describe('Button', () => {
  it('renders label and triggers onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save changes</Button>);

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables interaction and sets aria-busy while loading', () => {
    const onClick = vi.fn();
    render(
      <Button isLoading onClick={onClick}>
        Submitting
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Submitting' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
