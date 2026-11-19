import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@/test/render';
import { PlaygroundPage } from './PlaygroundPage';

describe('PlaygroundPage', () => {
  it('renders categorized tabs and lets users switch between primitives, tokens, hooks, and widgets', () => {
    render(<PlaygroundPage />);

    expect(screen.getByRole('heading', { name: 'Visual Testing Playground' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'UI Primitives' })).toBeInTheDocument();

    const primaryButton = screen.getByRole('button', { name: /Primary \(0\)/i });
    fireEvent.click(primaryButton);
    expect(screen.getByRole('button', { name: /Primary \(1\)/i })).toBeInTheDocument();

    // Switch to Headless Hooks tab
    const hooksTab = screen.getByRole('tab', { name: /Headless Hooks/i });
    fireEvent.mouseDown(hooksTab);
    fireEvent.click(hooksTab);
    expect(screen.getByRole('heading', { name: 'Headless Hooks' })).toBeInTheDocument();
    expect(screen.getByText(/usePoll — Headless voting state/i)).toBeInTheDocument();

    // Switch to Widgets tab
    const widgetsTab = screen.getByRole('tab', { name: /Widgets/i });
    fireEvent.mouseDown(widgetsTab);
    fireEvent.click(widgetsTab);
    expect(screen.getByText('Base-Vite Playground Terminal')).toBeInTheDocument();
  });
});
