import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@/test/render';
import { SpotlightCardGrid, type SpotlightCardItem } from './SpotlightCardGrid';

const ITEMS: SpotlightCardItem[] = [
  {
    id: 'one',
    title: 'First Module',
    path: '/one',
    icon: <span>1</span>,
    tag: 'Tag 1',
    description: 'First description',
    accentColor: '#38bdf8',
  },
  {
    id: 'two',
    title: 'Second Module',
    path: '/two',
    icon: <span>2</span>,
    tag: 'Tag 2',
    description: 'Second description',
    accentColor: '#a855f7',
  },
];

describe('SpotlightCardGrid', () => {
  it('tracks hovered card index on the sliding shadow element', () => {
    render(<SpotlightCardGrid items={ITEMS} actionLabel="Open module" />);

    const shadow = screen.getByTestId('spotlight-sliding-shadow');
    expect(shadow).toHaveClass('is-hidden');

    const secondCard = screen
      .getByRole('heading', { level: 2, name: 'Second Module' })
      .closest('a')!;
    fireEvent.mouseEnter(secondCard);

    expect(shadow).toHaveClass('pos-1', 'is-visible');
    expect(secondCard).toHaveClass('is-hovered');

    fireEvent.mouseLeave(secondCard.parentElement!);
    expect(shadow).toHaveClass('pos-1', 'is-hidden');
  });
});
