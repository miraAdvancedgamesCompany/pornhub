import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Eye } from 'lucide-react'
import { supabase } from '../../config/supabase'
import VideoGridCard from '../../components/VideoCard/VideoGridCard'
import Spinner from '../../components/Loading/Spinner'
import Header from '../../components/Layout/Header'
import './VideoPlayer.css'

function formatViews(count) {
  if (!count) return '0'
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
  return count.toString()
}

export default function VideoPlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  const [video, setVideo] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVideo() {
      setLoading(true)
      const { data } = await supabase
        .from('videos')
        .select('*, categories(id, name_en, name_ar)')
        .eq('id', id)
        .single()

      if (data) {
        setVideo(data)
        // Increment views
        await supabase
          .from('videos')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', id)

        // Fetch related videos
        const { data: relatedData } = await supabase
          .from('videos')
          .select('*, categories(id, name_en, name_ar)')
          .neq('id', id)
          .eq('type', 'video')
          .limit(6)

        setRelated(relatedData || [])
      }
      setLoading(false)
    }
    fetchVideo()
  }, [id])

  if (loading) return <Spinner />
  if (!video) return <div className="videos-empty"><span>{t('common.error')}</span></div>

  const title = isAr ? (video.title_ar || video.title_en) : video.title_en
  const description = isAr ? (video.description_ar || video.description_en) : video.description_en
  const categoryName = video.categories
    ? (isAr ? video.categories.name_ar : video.categories.name_en)
    : null

  return (
    <div id="video-player-page">
      <Header title={t('videos.watch')} />
      <div className="video-player-page">
        <button className="player-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft />
          {t('player.back')}
        </button>

        <div className="player-video-container">
          <video
            src={video.video_url}
            poster={video.thumbnail_url || undefined}
            controls
            autoPlay
            playsInline
          />
        </div>

        <div className="player-info">
          <h1 className="player-title">{title}</h1>
          <div className="player-meta">
            <span className="flex items-center gap-xs">
              <Eye style={{ width: 16, height: 16 }} />
              {formatViews(video.views_count)} {t('feed.views')}
            </span>
            {categoryName && (
              <span className="player-category">{categoryName}</span>
            )}
          </div>
          {description && (
            <p className="player-description">{description}</p>
          )}
        </div>

        {related.length > 0 && (
          <div className="player-related">
            <h2 className="player-related-title">{t('player.related')}</h2>
            <div className="player-related-grid">
              {related.map((v, i) => (
                <VideoGridCard key={v.id} video={v} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
