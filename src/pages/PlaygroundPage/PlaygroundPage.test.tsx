import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@/test/render';
import { PlaygroundPage } from './PlaygroundPage';

describe('PlaygroundPage', () => {
  it('renders primitives and general-purpose widgets for visual testing', () => {
    render(<PlaygroundPage />);

    expect(screen.getByRole('heading', { name: 'Visual Testing Playground' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'UI Primitives' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'General-Purpose Widgets' })).toBeInTheDocument();
    expect(screen.getByText('Base-Vite Playground Terminal')).toBeInTheDocument();

    const primaryButton = screen.getByRole('button', { name: /Primary \(0\)/i });
    fireEvent.click(primaryButton);
    expect(screen.getByRole('button', { name: /Primary \(1\)/i })).toBeInTheDocument();
  });
});
