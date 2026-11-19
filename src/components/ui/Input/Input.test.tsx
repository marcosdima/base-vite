import { describe, expect, it } from 'vitest';
import { render, screen } from '@/test/render';
import { Input } from './Input';

describe('Input', () => {
  it('connects label and helper hint to the input control', () => {
    render(<Input label="Email" hint="Use your work email" placeholder="you@company.com" />);

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('placeholder', 'you@company.com');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.getByText('Use your work email')).toBeInTheDocument();
  });

  it('marks input as aria-invalid and renders error alert when error is set', () => {
    render(<Input label="Username" error="Username is required" />);

    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Username is required');
  });
});
