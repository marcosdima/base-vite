import { FiMoon, FiSun } from 'react-icons/fi';
import { useThemeContext } from '../../../styles/AppThemeProvider';
import { ToggleButton } from '../../../styles/components/themeChanger.styles';

export function ThemeChanger() {
  const { isDark, toggleTheme } = useThemeContext();

  return (
    <ToggleButton type="button" onClick={toggleTheme} aria-label="Toggle theme">
      {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
    </ToggleButton>
  );
}
