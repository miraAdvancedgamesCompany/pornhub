import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Film } from 'lucide-react'
import Header from '../../components/Layout/Header'
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter'
import FeedCard from '../../components/VideoCard/FeedCard'
import Spinner from '../../components/Loading/Spinner'
import { useVideos } from '../../hooks/useVideos'
import './FeedPage.css'

export default function FeedPage() {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { shuffledVideos, loading, markVideoViewed } = useVideos('feed', selectedCategory)

  return (
    <div className="feed-page" id="feed-page">
      <Header title={t('feed.title')} />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {loading ? (
        <Spinner />
      ) : shuffledVideos.length === 0 ? (
        <div className="feed-empty">
          <Film />
          <span className="feed-empty-text">{t('feed.empty')}</span>
        </div>
      ) : (
        <div className="feed-list">
          {shuffledVideos.map(video => (
            <FeedCard
              key={video.id}
              video={video}
              onView={markVideoViewed}
            />
          ))}
        </div>
      )}
    </div>
  )
}
