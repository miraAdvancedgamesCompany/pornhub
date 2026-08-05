import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Video, FolderKanban, HardDrive, Eye, Upload, TrendingUp } from 'lucide-react'
import { useAllVideos } from '../../hooks/useVideos'
import { useCategories } from '../../hooks/useCategories'
import { useStorageAccounts } from '../../hooks/useStorageAccounts'
import Spinner from '../../components/Loading/Spinner'
import './DachHome.css'

function getGreeting(t) {
  const hour = new Date().getHours()
  if (hour < 12) return t('dach.welcome_morning')
  if (hour < 18) return t('dach.welcome_afternoon')
  return t('dach.welcome_evening')
}

export default function DachHome() {
  const { t, i18n } = useTranslation()
  const { videos, loading: vLoading } = useAllVideos()
  const { categories, loading: cLoading } = useCategories()
  const { accounts, loading: sLoading } = useStorageAccounts()
  const isAr = i18n.language === 'ar'

  const stats = useMemo(() => {
    if (!videos) return { totalViews: 0, todayCount: 0, feedCount: 0, reelCount: 0, videoCount: 0 }

    const totalViews = videos.reduce((sum, v) => sum + (v.views_count || 0), 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCount = videos.filter(v => {
      const created = new Date(v.created_at)
      return created >= today
    }).length

    const feedCount = videos.filter(v => v.type === 'feed').length
    const reelCount = videos.filter(v => v.type === 'reel').length
    const videoCount = videos.filter(v => v.type === 'video').length

    return { totalViews, todayCount, feedCount, reelCount, videoCount }
  }, [videos])

  const recentVideos = useMemo(() => {
    if (!videos) return []
    return videos.slice(0, 5)
  }, [videos])

  if (vLoading || cLoading || sLoading) return <Spinner inline />

  const total = videos.length || 1
  const feedPct = ((stats.feedCount / total) * 100).toFixed(0)
  const reelPct = ((stats.reelCount / total) * 100).toFixed(0)
  const videoPct = ((stats.videoCount / total) * 100).toFixed(0)

  return (
    <div className="dach-home animate-fade-in" id="dach-home">
      {/* Greeting */}
      <div className="dach-greeting">
        <h2 className="dach-greeting-text">{getGreeting(t)} 👋</h2>
      </div>

      {/* Stats Grid */}
      <div className="dach-grid-stats">
        <div className="dach-stat-card dach-stat-videos">
          <div className="dach-stat-icon">
            <Video />
          </div>
          <div>
            <div className="dach-stat-val">{videos.length}</div>
            <div className="dach-stat-lbl">{t('dach.total_videos')}</div>
          </div>
        </div>

        <div className="dach-stat-card dach-stat-categories">
          <div className="dach-stat-icon">
            <FolderKanban />
          </div>
          <div>
            <div className="dach-stat-val">{categories.length}</div>
            <div className="dach-stat-lbl">{t('dach.total_categories')}</div>
          </div>
        </div>

        <div className="dach-stat-card dach-stat-storage">
          <div className="dach-stat-icon">
            <HardDrive />
          </div>
          <div>
            <div className="dach-stat-val">{accounts.length + 1}</div>
            <div className="dach-stat-lbl">{t('dach.storage_accounts')}</div>
          </div>
        </div>

        <div className="dach-stat-card dach-stat-views">
          <div className="dach-stat-icon">
            <Eye />
          </div>
          <div>
            <div className="dach-stat-val">{stats.totalViews.toLocaleString()}</div>
            <div className="dach-stat-lbl">{t('dach.total_views')}</div>
          </div>
        </div>

        <div className="dach-stat-card dach-stat-today">
          <div className="dach-stat-icon">
            <Upload />
          </div>
          <div>
            <div className="dach-stat-val">{stats.todayCount}</div>
            <div className="dach-stat-lbl">{t('dach.videos_today')}</div>
          </div>
        </div>
      </div>

      {/* Two-column layout for distribution + recent */}
      <div className="dach-home-grid">
        {/* Video Distribution */}
        <div className="dach-panel">
          <div className="dach-panel-header">
            <TrendingUp className="dach-panel-icon" />
            <h3 className="dach-panel-title">{t('dach.video_distribution')}</h3>
          </div>
          <div className="dach-distribution">
            <div className="dach-dist-row">
              <div className="dach-dist-label">
                <span className="dach-dist-dot dach-dot-feed" />
                <span>Feed</span>
              </div>
              <div className="dach-dist-bar-wrap">
                <div className="dach-dist-bar dach-bar-feed" style={{ width: `${feedPct}%` }} />
              </div>
              <span className="dach-dist-count">{stats.feedCount}</span>
            </div>
            <div className="dach-dist-row">
              <div className="dach-dist-label">
                <span className="dach-dist-dot dach-dot-reel" />
                <span>Reels</span>
              </div>
              <div className="dach-dist-bar-wrap">
                <div className="dach-dist-bar dach-bar-reel" style={{ width: `${reelPct}%` }} />
              </div>
              <span className="dach-dist-count">{stats.reelCount}</span>
            </div>
            <div className="dach-dist-row">
              <div className="dach-dist-label">
                <span className="dach-dist-dot dach-dot-video" />
                <span>Videos</span>
              </div>
              <div className="dach-dist-bar-wrap">
                <div className="dach-dist-bar dach-bar-video" style={{ width: `${videoPct}%` }} />
              </div>
              <span className="dach-dist-count">{stats.videoCount}</span>
            </div>
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="dach-panel">
          <div className="dach-panel-header">
            <Upload className="dach-panel-icon" />
            <h3 className="dach-panel-title">{t('dach.recent_uploads')}</h3>
          </div>
          <div className="dach-recent-list">
            {recentVideos.length === 0 ? (
              <p className="text-muted text-sm">{t('dach.no_data')}</p>
            ) : (
              recentVideos.map(v => (
                <div key={v.id} className="dach-recent-item">
                  <div className="dach-recent-thumb">
                    {v.thumbnail_url ? (
                      <img src={v.thumbnail_url} alt="" />
                    ) : (
                      <div className="dach-recent-thumb-empty"><Video /></div>
                    )}
                  </div>
                  <div className="dach-recent-info">
                    <span className="dach-recent-title">
                      {isAr ? (v.title_ar || v.title_en) : v.title_en}
                    </span>
                    <span className="dach-recent-meta">
                      <span className={`dach-type-badge-sm dach-type-${v.type}`}>{v.type}</span>
                      <span>{v.views_count || 0} {t('feed.views')}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
