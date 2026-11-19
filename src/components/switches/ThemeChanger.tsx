import { FiMoon, FiSun } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from '@/styles/AppThemeProvider';
import { ToggleButton } from './ThemeChanger.styles';

export function ThemeChanger() {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useThemeContext();

  return (
    <ToggleButton type="button" onClick={toggleTheme} aria-label={t('layout.toggleTheme')}>
      {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
    </ToggleButton>
  );
}
