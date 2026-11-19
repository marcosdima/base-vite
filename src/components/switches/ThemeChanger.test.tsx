import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useThemeContext } from '@/styles/AppThemeProvider';
import { screen, fireEvent, render } from '@/test/render';
import { ThemeChanger } from './ThemeChanger';

vi.mock('react-icons/fi', () => ({
  FiSun: (props: Record<string, unknown>) => <svg data-testid="icon-sun" {...props} />,
  FiMoon: (props: Record<string, unknown>) => <svg data-testid="icon-moon" {...props} />,
}));

vi.mock('@/styles/AppThemeProvider', () => ({
  useThemeContext: vi.fn(() => ({
    isDark: false,
    toggleTheme: vi.fn(),
  })),
}));

const mockedUseThemeContext = vi.mocked(useThemeContext);

describe('ThemeChanger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render toggle button', () => {
    render(<ThemeChanger />);

    expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument();
  });

  it('should call toggleTheme on click', () => {
    const toggleTheme = vi.fn();
    mockedUseThemeContext.mockReturnValue({ isDark: false, toggleTheme });

    render(<ThemeChanger />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle theme' }));

    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  it('should show the moon icon when dark mode is inactive', () => {
    mockedUseThemeContext.mockReturnValue({ isDark: false, toggleTheme: vi.fn() });

    render(<ThemeChanger />);

    expect(screen.getByTestId('icon-moon')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-sun')).not.toBeInTheDocument();
  });

  it('should show the sun icon when dark mode is active', () => {
    mockedUseThemeContext.mockReturnValue({ isDark: true, toggleTheme: vi.fn() });

    render(<ThemeChanger />);

    expect(screen.getByTestId('icon-sun')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-moon')).not.toBeInTheDocument();
  });
});
