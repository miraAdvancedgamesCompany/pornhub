import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Play, Film } from 'lucide-react'
import './VideoGridCard.css'

function formatDuration(seconds) {
  if (!seconds) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatViews(count) {
  if (!count) return '0'
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
  return count.toString()
}

export default function VideoGridCard({ video, index = 0, onView }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isAr = i18n.language === 'ar'

  const title = isAr ? (video.title_ar || video.title_en) : video.title_en
  const categoryName = video.categories
    ? (isAr ? video.categories.name_ar : video.categories.name_en)
    : null

  const handleClick = () => {
    if (onView) onView(video.id)
    navigate(`/watch/${video.id}`)
  }

  return (
    <div
      className="video-grid-card"
      id={`video-card-${video.id}`}
      onClick={handleClick}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="video-grid-thumb">
        {video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={title} loading="lazy" />
        ) : (
          <div className="video-grid-thumb-placeholder">
            <Film />
          </div>
        )}

        {video.duration && (
          <span className="video-grid-duration">{formatDuration(video.duration)}</span>
        )}

        <div className="video-grid-play-hover">
          <Play />
        </div>
      </div>

      <div className="video-grid-body">
        <h3 className="video-grid-title">{title}</h3>
        <div className="video-grid-meta">
          <span>{formatViews(video.views_count)} {t('feed.views')}</span>
        </div>
        {categoryName && (
          <span className="video-grid-category">{categoryName}</span>
        )}
      </div>
    </div>
  )
}
