import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Play, Pause, Eye, Share2, Film } from 'lucide-react'
import './FeedCard.css'

function formatDuration(seconds) {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatViews(count) {
  if (!count) return '0'
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
  return count.toString()
}

export default function FeedCard({ video, onView }) {
  const { t, i18n } = useTranslation()
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef(null)
  const isAr = i18n.language === 'ar'

  const title = isAr ? (video.title_ar || video.title_en) : video.title_en
  const description = isAr ? (video.description_ar || video.description_en) : video.description_en
  const categoryName = video.categories
    ? (isAr ? video.categories.name_ar : video.categories.name_en)
    : null

  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
      if (onView) onView(video.id)
    }
    setPlaying(!playing)
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
      }
    } catch (err) {
      // Cancelled or not supported
    }
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

      <div className="feed-video-wrapper" onClick={togglePlay}>
        {video.video_url ? (
          <video
            ref={videoRef}
            src={video.video_url}
            poster={video.thumbnail_url || undefined}
            preload="metadata"
            playsInline
            loop
            onEnded={() => setPlaying(false)}
          />
        ) : video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={title} className="feed-thumbnail" />
        ) : (
          <div style={{ height: 300, background: 'var(--bg-card)' }} />
        )}

        <div className={`feed-play-overlay ${playing ? 'hidden' : ''}`}>
          <div className="feed-play-btn">
            {playing ? <Pause /> : <Play />}
          </div>
        </div>

        {video.duration && (
          <span className="feed-duration">{formatDuration(video.duration)}</span>
        )}
      </div>

      <div className="feed-actions">
        <button className="feed-action-btn">
          <Eye />
          <span>{formatViews(video.views_count)} {t('feed.views')}</span>
        </button>
        <button className="feed-action-btn" onClick={handleShare}>
          <Share2 />
          <span>{t('feed.share')}</span>
        </button>
      </div>
    </article>
  )
}
