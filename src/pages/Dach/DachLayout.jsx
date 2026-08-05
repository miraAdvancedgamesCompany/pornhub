import { useEffect, useCallback } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Video, FolderKanban, HardDrive, LogOut } from 'lucide-react'
import { isValidDachToken } from './DachLogin'
import { useToast } from '../../components/Toast/Toast'
import Header from '../../components/Layout/Header'
import './DachLayout.css'

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes of inactivity

export default function DachLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()

  // Check authentication
  useEffect(() => {
    if (!isValidDachToken()) {
      navigate('/dach/login')
    }
  }, [navigate])

  // Session timeout — reset on user activity
  const handleLogout = useCallback(() => {
    localStorage.removeItem('streamx-dach-auth')
    navigate('/')
  }, [navigate])

  useEffect(() => {
    let timeoutId = null

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        toast.warning(t('dach.session_expired'))
        handleLogout()
      }, SESSION_TIMEOUT)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      events.forEach(e => window.removeEventListener(e, resetTimer))
    }
  }, [handleLogout, toast, t])

  return (
    <div id="dach-layout-wrapper">
      <Header title={t('dach.title')} />
      <div className="dach-layout" id="dach-layout">
        <nav className="dach-nav">
          <NavLink to="/dach" end className={({ isActive }) => `dach-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard />
            <span>{t('dach.overview')}</span>
          </NavLink>
          <NavLink to="/dach/videos" className={({ isActive }) => `dach-nav-item ${isActive ? 'active' : ''}`}>
            <Video />
            <span>{t('dach.manage_videos')}</span>
          </NavLink>
          <NavLink to="/dach/categories" className={({ isActive }) => `dach-nav-item ${isActive ? 'active' : ''}`}>
            <FolderKanban />
            <span>{t('dach.manage_categories')}</span>
          </NavLink>
          <NavLink to="/dach/storage" className={({ isActive }) => `dach-nav-item ${isActive ? 'active' : ''}`}>
            <HardDrive />
            <span>{t('dach.manage_storage')}</span>
          </NavLink>

          <button className="dach-nav-item dach-logout-btn" onClick={handleLogout}>
            <LogOut />
            <span>{t('dach.logout')}</span>
          </button>
        </nav>

        <Outlet />
      </div>
    </div>
  )
}
