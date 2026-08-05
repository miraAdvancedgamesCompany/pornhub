import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Play, Pause, Share2, Eye } from 'lucide-react'
import './ReelCard.css'

function formatViews(count) {
  if (!count) return '0'
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
  return count.toString()
}

export default function ReelCard({ video, isActive, onView }) {
  const { i18n } = useTranslation()
  const [playing, setPlaying] = useState(false)
  const [showPlayBtn, setShowPlayBtn] = useState(false)
  const videoRef = useRef(null)
  const isAr = i18n.language === 'ar'

  const title = isAr ? (video.title_ar || video.title_en) : video.title_en
  const description = isAr ? (video.description_ar || video.description_en) : video.description_en
  const categoryName = video.categories
    ? (isAr ? video.categories.name_ar : video.categories.name_en)
    : null

  useEffect(() => {
    if (!videoRef.current) return

    if (isActive) {
      videoRef.current.play().then(() => {
        setPlaying(true)
        if (onView) onView(video.id)
      }).catch(() => {
        setPlaying(false)
      })
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setPlaying(false)
    }
  }, [isActive, video.id, onView])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
      setPlaying(false)
      setShowPlayBtn(true)
      setTimeout(() => setShowPlayBtn(false), 1500)
    } else {
      videoRef.current.play()
      setPlaying(true)
      setShowPlayBtn(true)
      setTimeout(() => setShowPlayBtn(false), 800)
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
      }
    } catch (err) { /* cancelled */ }
  }

  return (
    <div className="reel-container" onClick={togglePlay}>
      <video
        ref={videoRef}
        className="reel-video"
        src={video.video_url}
        poster={video.thumbnail_url || undefined}
        preload="metadata"
        playsInline
        loop
        muted={!isActive}
      />

      <div className={`reel-play-center ${showPlayBtn ? 'show' : ''}`}>
        {playing ? <Pause /> : <Play />}
      </div>

      <div className="reel-info">
        <div className="reel-title">{title}</div>
        {description && <div className="reel-description">{description}</div>}
        {categoryName && <span className="reel-category">{categoryName}</span>}
      </div>

      <div className="reel-side-actions">
        <button className="reel-side-btn" onClick={(e) => e.stopPropagation()}>
          <Eye />
          <span>{formatViews(video.views_count)}</span>
        </button>
        <button className="reel-side-btn" onClick={(e) => { e.stopPropagation(); handleShare(); }}>
          <Share2 />
        </button>
      </div>
    </div>
  )
}
