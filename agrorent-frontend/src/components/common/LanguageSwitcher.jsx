import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <button className="language-btn" onClick={toggleLanguage}>
      <Globe size={18} />
      {i18n.language === 'hi' ? 'EN' : 'हिंदी'}
    </button>
  );
};

export default LanguageSwitcher;
