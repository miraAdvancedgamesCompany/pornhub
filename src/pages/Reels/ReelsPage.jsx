import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Film } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ReelCard from '../../components/VideoCard/ReelCard'
import Spinner from '../../components/Loading/Spinner'
import { useVideos } from '../../hooks/useVideos'
import './ReelsPage.css'

export default function ReelsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef(null)
  const { shuffledVideos, loading, markVideoViewed } = useVideos('reel')

  // IntersectionObserver to detect active reel
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index)
            if (!isNaN(index)) setActiveIndex(index)
          }
        })
      },
      {
        root: container,
        threshold: 0.7
      }
    )

    const items = container.querySelectorAll('[data-index]')
    items.forEach(item => observer.observe(item))

    return () => observer.disconnect()
  }, [shuffledVideos])

  // Add/remove reels-mode class on body
  useEffect(() => {
    document.body.classList.add('reels-mode')
    return () => document.body.classList.remove('reels-mode')
  }, [])

  const handleView = useCallback((videoId) => {
    markVideoViewed(videoId)
  }, [markVideoViewed])

  if (loading) return <Spinner />

  if (shuffledVideos.length === 0) {
    return (
      <div className="reels-empty">
        <Film />
        <span>{t('feed.empty')}</span>
      </div>
    )
  }

  return (
    <>
      <div className="reels-header-floating">
        <button className="reels-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft />
        </button>
        <span className="reels-title-float">{t('reels.title')}</span>
        <div style={{ width: 40 }} />
      </div>

      <div
        className="reels-page hide-scrollbar"
        ref={containerRef}
        id="reels-page"
      >
        {shuffledVideos.map((video, index) => (
          <div key={video.id} data-index={index}>
            <ReelCard
              video={video}
              isActive={index === activeIndex}
              onView={handleView}
            />
          </div>
        ))}
      </div>
    </>
  )
}
