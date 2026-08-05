import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Film } from 'lucide-react'
import Header from '../../components/Layout/Header'
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter'
import VideoGridCard from '../../components/VideoCard/VideoGridCard'
import Spinner from '../../components/Loading/Spinner'
import { useVideos } from '../../hooks/useVideos'
import { usePopunderAd, AdBanner } from '../../components/Ads/AdsterraBanner'
import './VideosPage.css'

export default function VideosPage() {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { shuffledVideos, loading, markVideoViewed } = useVideos('video', selectedCategory)

  // Trigger Popunder ONLY in Videos section as requested
  usePopunderAd()

  return (
    <div className="videos-page" id="videos-page">
      <Header title={t('videos.title')} />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Top Banner Ad 728x90 */}
      <AdBanner atKey="684b083d6431d13f1987eb3661a2ede7" width={728} height={90} />

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

      {/* Bottom Banner Ad 320x50 */}
      <AdBanner atKey="1f8dc68e790c11db380c65267448b8e2" width={320} height={50} />
    </div>
  )
}
