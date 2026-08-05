import { useTranslation } from 'react-i18next'
import './LanguageSwitcher.css'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('streamx-lang', lang)
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }

  return (
    <div className="lang-switcher" id="lang-switcher">
      <button
        className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
        onClick={() => switchLanguage('en')}
      >
        EN
      </button>
      <button
        className={`lang-btn ${i18n.language === 'ar' ? 'active' : ''}`}
        onClick={() => switchLanguage('ar')}
      >
        عر
      </button>
    </div>
  )
}
