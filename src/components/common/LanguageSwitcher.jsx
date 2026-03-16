import { useLanguage } from '@/contexts/LanguageContext'

/**
 * Language Switcher Component
 * Toggle between English and Arabic
 */
export default function LanguageSwitcher({ className = '' }) {
  const { language, toggleLanguage, t } = useLanguage()

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${className} ${
        language === 'ar'
          ? 'bg-qgo-navy text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
    >
      <span className="text-base">🌐</span>
      <span>{language === 'en' ? 'English' : 'العربية'}</span>
      <span className="text-xs opacity-70">
        {language === 'en' ? 'EN' : 'ع'}
      </span>
    </button>
  )
}

/**
 * Compact Language Toggle for Navbar
 */
export function CompactLanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <button
      onClick={toggleLanguage}
      className="px-2 py-1 rounded text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
      title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      {language === 'en' ? 'عربي' : 'EN'}
    </button>
  )
}
