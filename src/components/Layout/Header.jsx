import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'
import './Header.css'

export default function Header({ title }) {
  const { t } = useTranslation()

  return (
    <header className="app-header" id="app-header">
      <div className="header-mobile-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      </div>

      <h1 className="header-title">{title}</h1>

      <div className="header-actions">
        <LanguageSwitcher />
      </div>
    </header>
  )
}
