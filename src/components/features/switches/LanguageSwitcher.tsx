import { FiGlobe } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import {
  GlobeIcon,
  LangButton,
  Wrapper,
} from '../../../styles/components/languageSwitcher.styles';

interface Language {
  code: 'en' | 'es';
  label: string;
}

const languages: Language[] = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  return (
    <Wrapper aria-label={t('layout.languageSwitcher')}>
      <GlobeIcon aria-hidden="true">
        <FiGlobe />
      </GlobeIcon>

      {languages.map((language) => (
        <LangButton
          key={language.code}
          type="button"
          $active={i18n.resolvedLanguage === language.code}
          onClick={() => i18n.changeLanguage(language.code)}
        >
          {language.label}
        </LangButton>
      ))}
    </Wrapper>
  );
}