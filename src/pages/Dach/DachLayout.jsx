import { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Video, FolderKanban, HardDrive, LogOut } from 'lucide-react'
import Header from '../../components/Layout/Header'
import './DachLayout.css'

export default function DachLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    const auth = localStorage.getItem('streamx-dach-auth')
    if (!auth) {
      navigate('/dach/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('streamx-dach-auth')
    navigate('/')
  }

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
