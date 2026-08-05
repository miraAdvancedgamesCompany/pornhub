import { NavLink } from 'react-router-dom'
import { Home, Film, PlaySquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './BottomNav.css'

export default function BottomNav() {
  const { t } = useTranslation()

  const navItems = [
    { to: '/', icon: Home, label: t('nav.feed') },
    { to: '/reels', icon: Film, label: t('nav.reels') },
    { to: '/videos', icon: PlaySquare, label: t('nav.videos') },
  ]

  return (
    <nav className="bottom-nav" id="bottom-nav">
      <div className="bottom-nav-inner">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `bottom-nav-link ${isActive ? 'active' : ''}`}
          >
            <item.icon />
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
