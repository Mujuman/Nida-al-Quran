import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import '../styles/LanguageSwitcher.css';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    // Update text direction for Arabic (future support)
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  return (
    <div className="language-switcher">
      <div className="lang-toggle">
        <button
          className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
          onClick={() => changeLanguage('en')}
          title="Switch to English"
        >
          EN
        </button>
        <button
          className={`lang-btn ${i18n.language === 'am' ? 'active' : ''}`}
          onClick={() => changeLanguage('am')}
          title="Switch to Amharic"
        >
          አ
        </button>
      </div>
    </div>
  );
}

export default LanguageSwitcher;
