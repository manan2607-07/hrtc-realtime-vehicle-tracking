import { useLanguage } from '../context/LanguageContext';

/**
 * Hindi/English language toggle
 */
export default function LanguageToggle() {
  const { lang, toggleLanguage, t } = useLanguage();

  return (
    <div className="lang-toggle" role="radiogroup" aria-label={t('language')}>
      <button
        className={`lang-toggle__option ${lang === 'en' ? 'active' : ''}`}
        onClick={() => lang !== 'en' && toggleLanguage()}
        role="radio"
        aria-checked={lang === 'en'}
      >
        EN
      </button>
      <button
        className={`lang-toggle__option ${lang === 'hi' ? 'active' : ''}`}
        onClick={() => lang !== 'hi' && toggleLanguage()}
        role="radio"
        aria-checked={lang === 'hi'}
      >
        हिं
      </button>
    </div>
  );
}
