import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Film } from 'lucide-react'
import './FeedCard.css'

function formatDuration(seconds) {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function FeedCard({ video, onView }) {
  const { i18n } = useTranslation()
  const [hasStarted, setHasStarted] = useState(false)
  const videoRef = useRef(null)
  const isAr = i18n.language === 'ar'

  const title = isAr ? (video.title_ar || video.title_en) : video.title_en
  const description = isAr ? (video.description_ar || video.description_en) : video.description_en
  const categoryName = video.categories
    ? (isAr ? video.categories.name_ar : video.categories.name_en)
    : null

  const handlePlay = () => {
    setHasStarted(true)
    if (onView) onView(video.id)
  }

  return (
    <article className="feed-card" id={`feed-card-${video.id}`}>
      <div className="feed-card-header">
        <div className="feed-avatar">
          <Film />
        </div>
        <div className="feed-info">
          <div className="feed-title">{title}</div>
          <div className="feed-meta">
            {categoryName && (
              <span className="feed-category-badge">{categoryName}</span>
            )}
          </div>
        </div>
      </div>

      {description && (
        <p className="feed-description">{description}</p>
      )}

      <div className="feed-video-wrapper">
        {video.video_url ? (
          <video
            ref={videoRef}
            src={video.video_url}
            poster={video.thumbnail_url || undefined}
            preload="metadata"
            playsInline
            loop
            controls
            controlsList="nodownload"
            onPlay={handlePlay}
          />
        ) : video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={title} className="feed-thumbnail" />
        ) : (
          <div style={{ height: 300, background: 'var(--bg-card)' }} />
        )}

        {!hasStarted && video.duration && (
          <span className="feed-duration">{formatDuration(video.duration)}</span>
        )}
      </div>
    </article>
  )
}
