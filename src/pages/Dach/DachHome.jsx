import { useTranslation } from 'react-i18next'
import { Video, FolderKanban, HardDrive } from 'lucide-react'
import { useAllVideos } from '../../hooks/useVideos'
import { useCategories } from '../../hooks/useCategories'
import { useStorageAccounts } from '../../hooks/useStorageAccounts'
import Spinner from '../../components/Loading/Spinner'
import './DachHome.css'

export default function DachHome() {
  const { t } = useTranslation()
  const { videos, loading: vLoading } = useAllVideos()
  const { categories, loading: cLoading } = useCategories()
  const { accounts, loading: sLoading } = useStorageAccounts()

  if (vLoading || cLoading || sLoading) return <Spinner inline />

  return (
    <div className="dach-home animate-fade-in" id="dach-home">
      <div className="dach-grid-stats">
        <div className="dach-stat-card">
          <div className="dach-stat-icon"><Video /></div>
          <div>
            <div className="dach-stat-val">{videos.length}</div>
            <div className="dach-stat-lbl">{t('dach.total_videos')}</div>
          </div>
        </div>

        <div className="dach-stat-card">
          <div className="dach-stat-icon"><FolderKanban /></div>
          <div>
            <div className="dach-stat-val">{categories.length}</div>
            <div className="dach-stat-lbl">{t('dach.total_categories')}</div>
          </div>
        </div>

        <div className="dach-stat-card">
          <div className="dach-stat-icon"><HardDrive /></div>
          <div>
            <div className="dach-stat-val">{accounts.length + 1}</div>
            <div className="dach-stat-lbl">{t('dach.storage_accounts')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
