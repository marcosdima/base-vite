import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@/test/render';
import { GroupInputBoard } from './GroupInputBoard';

describe('GroupInputBoard', () => {
  it('renders default keys in Group A and empty state in Group B', () => {
    render(<GroupInputBoard keys={['alpha', 'beta']} />);

    expect(screen.getByText('alpha')).toBeInTheDocument();
    expect(screen.getByText('beta')).toBeInTheDocument();
    expect(screen.getByText('No keys in this group.')).toBeInTheDocument();
  });

  it('allows renaming groups', () => {
    render(<GroupInputBoard keys={['alpha']} />);

    const groupAInput = screen.getByLabelText('Group A name') as HTMLInputElement;
    fireEvent.change(groupAInput, { target: { value: 'Active' } });

    expect(groupAInput.value).toBe('Active');
  });
});
