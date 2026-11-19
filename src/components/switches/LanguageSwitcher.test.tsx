import { describe, it, expect, vi, beforeEach } from 'vitest';
import i18n from '@/i18n';
import { lightTheme as theme } from '@/styles/theme';
import { act, screen, fireEvent, render } from '@/test/render';
import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await act(() => i18n.changeLanguage('en'));
  });

  it('should render language buttons', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ES' })).toBeInTheDocument();
  });

  it('should expose an accessible label for the switcher', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByRole('group', { name: 'Language switcher' })).toBeInTheDocument();
  });

  it('should change language when clicking a button', async () => {
    const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage');
    render(<LanguageSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: 'ES' }));

    expect(changeLanguageSpy).toHaveBeenCalledWith('es');
    expect(i18n.resolvedLanguage).toBe('es');
  });

  it('should mark the active language button', async () => {
    const { container } = render(<LanguageSwitcher />);

    const [enButton, esButton] = Array.from(container.querySelectorAll('button'));

    // jsdom normalizes `transparent` to `rgba(0, 0, 0, 0)`.
    const transparent = 'rgba(0, 0, 0, 0)';

    expect(enButton).toHaveStyle({ backgroundColor: theme.colors.accent });
    expect(esButton).toHaveStyle({ backgroundColor: transparent });

    await act(() => i18n.changeLanguage('es'));

    expect(esButton).toHaveStyle({ backgroundColor: theme.colors.accent });
    expect(enButton).toHaveStyle({ backgroundColor: transparent });
  });
});
