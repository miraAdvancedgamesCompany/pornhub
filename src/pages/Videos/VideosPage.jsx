import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Film } from 'lucide-react'
import Header from '../../components/Layout/Header'
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter'
import VideoGridCard from '../../components/VideoCard/VideoGridCard'
import Spinner from '../../components/Loading/Spinner'
import { useVideos } from '../../hooks/useVideos'
import './VideosPage.css'

export default function VideosPage() {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { shuffledVideos, loading, markVideoViewed } = useVideos('video', selectedCategory)

  return (
    <div className="videos-page" id="videos-page">
      <Header title={t('videos.title')} />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {loading ? (
        <Spinner />
      ) : shuffledVideos.length === 0 ? (
        <div className="videos-empty">
          <Film />
          <span>{t('videos.no_videos')}</span>
        </div>
      ) : (
        <div className="videos-grid">
          {shuffledVideos.map((video, index) => (
            <VideoGridCard
              key={video.id}
              video={video}
              index={index}
              onView={markVideoViewed}
            />
          ))}
        </div>
      )}
    </div>
  )
}
