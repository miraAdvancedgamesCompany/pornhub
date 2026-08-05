import { useState, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Film } from 'lucide-react'
import Header from '../../components/Layout/Header'
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter'
import FeedCard from '../../components/VideoCard/FeedCard'
import Spinner from '../../components/Loading/Spinner'
import { useVideos } from '../../hooks/useVideos'
import { AdBanner, NativeAdBanner } from '../../components/Ads/AdsterraBanner'
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

      {/* Top Feed Banner 468x60 */}
      <AdBanner atKey="b9670ba388717e18dace28268a78c094" width={468} height={60} />

      {loading ? (
        <Spinner />
      ) : shuffledVideos.length === 0 ? (
        <div className="feed-empty">
          <Film />
          <span className="feed-empty-text">{t('feed.empty')}</span>
        </div>
      ) : (
        <div className="feed-list">
          {shuffledVideos.map((video, index) => (
            <Fragment key={video.id}>
              <FeedCard
                video={video}
                onView={markVideoViewed}
              />
              {/* Insert Native Banner after 2nd video */}
              {index === 1 && <NativeAdBanner />}
              {/* Insert 300x250 Banner after 5th video */}
              {index === 4 && <AdBanner atKey="164345d475dc31d1cabd8eb59f44af46" width={300} height={250} />}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}
