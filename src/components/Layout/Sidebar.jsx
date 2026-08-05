import { NavLink } from 'react-router-dom'
import { Home, Film, PlaySquare, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './Sidebar.css'

export default function Sidebar() {
  const { t } = useTranslation()

  const navItems = [
    { to: '/', icon: Home, label: t('nav.feed') },
    { to: '/reels', icon: Film, label: t('nav.reels') },
    { to: '/videos', icon: PlaySquare, label: t('nav.videos') },
  ]

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={item.label}
          >
            <item.icon />
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <NavLink
          to="/dach"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          title={t('nav.dashboard')}
        >
          <Settings />
        </NavLink>
      </div>
    </aside>
  )
}
