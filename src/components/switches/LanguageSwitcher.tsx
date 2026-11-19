import { FiGlobe } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { APP_CONFIG } from '@/config/app.config';
import { GlobeIcon, LangButton, Wrapper } from './LanguageSwitcher.styles';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  return (
    <Wrapper role="group" aria-label={t('layout.languageSwitcher')}>
      <GlobeIcon aria-hidden="true">
        <FiGlobe />
      </GlobeIcon>

      {APP_CONFIG.supportedLocales.map((code) => (
        <LangButton
          key={code}
          type="button"
          $active={i18n.resolvedLanguage === code}
          onClick={() => i18n.changeLanguage(code)}
        >
          {code.toUpperCase()}
        </LangButton>
      ))}
    </Wrapper>
  );
}
