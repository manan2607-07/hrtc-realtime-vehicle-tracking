import { useLanguage } from '../context/LanguageContext';

/**
 * Hindi/English language toggle
 */
export default function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="lang-toggle" role="radiogroup" aria-label={t('language')}>
      <button
        className={`lang-toggle__option ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
        role="radio"
        aria-checked={lang === 'en'}
        title="English"
      >
        EN
      </button>
      <button
        className={`lang-toggle__option ${lang === 'hi' ? 'active' : ''}`}
        onClick={() => setLang('hi')}
        role="radio"
        aria-checked={lang === 'hi'}
        title="हिन्दी (Hindi)"
      >
        हिं
      </button>
      <button
        className={`lang-toggle__option ${lang === 'hinglish' ? 'active' : ''}`}
        onClick={() => setLang('hinglish')}
        role="radio"
        aria-checked={lang === 'hinglish'}
        title="Hinglish (Hindi + English)"
      >
        Hi-En
      </button>
    </div>
  );
}
