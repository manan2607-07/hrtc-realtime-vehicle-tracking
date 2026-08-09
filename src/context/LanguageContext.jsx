import { createContext, useContext, useState, useCallback } from 'react';
import { STRINGS } from '../i18n/strings.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  const t = useCallback((key) => {
    return STRINGS[lang]?.[key] ?? STRINGS.en?.[key] ?? key;
  }, [lang]);

  const toggleLanguage = useCallback(() => {
    setLang(prev => {
      if (prev === 'en') return 'hi';
      if (prev === 'hi') return 'hinglish';
      return 'en';
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
