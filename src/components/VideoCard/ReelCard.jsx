import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Play, Pause, FastForward, Rewind } from 'lucide-react'
import './ReelCard.css'

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function ReelCard({ video, isActive, onView }) {
  const { i18n } = useTranslation()
  const [playing, setPlaying] = useState(false)
  const [showPlayBtn, setShowPlayBtn] = useState(false)
  const [showSkip, setShowSkip] = useState(null) // 'forward' | 'backward' | null
  const [isSpeeding, setIsSpeeding] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)

  const videoRef = useRef(null)
  const tapTimerRef = useRef(null)
  const tapCountRef = useRef(0)
  const longPressTimerRef = useRef(null)
  const isLongPressRef = useRef(false)
  const playBtnTimerRef = useRef(null)
  const skipTimerRef = useRef(null)
  const progressBarRef = useRef(null)

  const isAr = i18n.language === 'ar'
  const title = isAr ? (video.title_ar || video.title_en) : video.title_en
  const description = isAr ? (video.description_ar || video.description_en) : video.description_en
  const categoryName = video.categories
    ? (isAr ? video.categories.name_ar : video.categories.name_en)
    : null

  // Auto play/pause based on visibility
  useEffect(() => {
    if (!videoRef.current) return
    if (isActive) {
      videoRef.current.play().then(() => {
        setPlaying(true)
        if (onView) onView(video.id)
      }).catch(() => setPlaying(false))
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    }
  }, [isActive, video.id, onView])

  // Time update for progress bar
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(vid.currentTime)
        setProgress(vid.duration ? (vid.currentTime / vid.duration) * 100 : 0)
      }
    }
    const handleLoadedMetadata = () => {
      setDuration(vid.duration)
    }

    vid.addEventListener('timeupdate', handleTimeUpdate)
    vid.addEventListener('loadedmetadata', handleLoadedMetadata)
    return () => {
      vid.removeEventListener('timeupdate', handleTimeUpdate)
      vid.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [isSeeking])

  // Show play/pause icon briefly
  const flashPlayBtn = useCallback((icon) => {
    setShowPlayBtn(icon)
    if (playBtnTimerRef.current) clearTimeout(playBtnTimerRef.current)
    playBtnTimerRef.current = setTimeout(() => setShowPlayBtn(null), 700)
  }, [])

  // Show skip indicator briefly
  const flashSkip = useCallback((direction) => {
    setShowSkip(direction)
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current)
    skipTimerRef.current = setTimeout(() => setShowSkip(null), 600)
  }, [])

  // === SINGLE TAP: pause/play ===
  const handleSingleTap = useCallback(() => {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
      setPlaying(false)
      flashPlayBtn('pause')
    } else {
      videoRef.current.play()
      setPlaying(true)
      flashPlayBtn('play')
    }
  }, [playing, flashPlayBtn])

  // === DOUBLE TAP RIGHT: +5s ===
  const handleDoubleTapRight = useCallback(() => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 5)
    flashSkip('forward')
  }, [flashSkip])

  // === DOUBLE TAP LEFT: -5s ===
  const handleDoubleTapLeft = useCallback(() => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5)
    flashSkip('backward')
  }, [flashSkip])

  // Determine if tap is on right or left half
  const getTapSide = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX || (e.touches && e.touches[0]?.clientX) || 0) - rect.left
    return x > rect.width / 2 ? 'right' : 'left'
  }, [])

  // Handle tap logic (single vs double)
  const handleTap = useCallback((e) => {
    if (isLongPressRef.current) return // Ignore if just ended a long press

    const side = getTapSide(e)
    tapCountRef.current += 1

    if (tapCountRef.current === 1) {
      // Wait to see if it becomes a double tap
      tapTimerRef.current = setTimeout(() => {
        if (tapCountRef.current === 1) {
          handleSingleTap()
        }
        tapCountRef.current = 0
      }, 250)
    } else if (tapCountRef.current === 2) {
      clearTimeout(tapTimerRef.current)
      tapCountRef.current = 0
      if (side === 'right') {
        handleDoubleTapRight()
      } else {
        handleDoubleTapLeft()
      }
    }
  }, [handleSingleTap, handleDoubleTapRight, handleDoubleTapLeft, getTapSide])

  // === LONG PRESS: 2x speed ===
  const handlePointerDown = useCallback((e) => {
    // Don't interfere with progress bar or side actions
    if (e.target.closest('.reel-progress-area') || e.target.closest('.reel-side-actions') || e.target.closest('.reel-info')) return

    isLongPressRef.current = false
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true
      if (videoRef.current) {
        videoRef.current.playbackRate = 2
        setIsSpeeding(true)
      }
    }, 400)
  }, [])

  const handlePointerUp = useCallback(() => {
    clearTimeout(longPressTimerRef.current)
    if (isLongPressRef.current) {
      // Was a long press — restore speed
      if (videoRef.current) {
        videoRef.current.playbackRate = 1
        setIsSpeeding(false)
      }
      // Prevent the click from triggering tap
      setTimeout(() => { isLongPressRef.current = false }, 50)
    }
  }, [])

  const handleClick = useCallback((e) => {
    // Don't handle clicks on progress bar or side actions
    if (e.target.closest('.reel-progress-area') || e.target.closest('.reel-side-actions') || e.target.closest('.reel-info')) return
    handleTap(e)
  }, [handleTap])

  // === PROGRESS BAR SEEK (touch + click) ===
  const handleProgressInteraction = useCallback((e) => {
    e.stopPropagation()
    const bar = progressBarRef.current
    if (!bar || !videoRef.current) return

    const rect = bar.getBoundingClientRect()
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0
    let pct = (clientX - rect.left) / rect.width
    pct = Math.max(0, Math.min(1, pct))
    videoRef.current.currentTime = pct * videoRef.current.duration
    setProgress(pct * 100)
    setCurrentTime(pct * videoRef.current.duration)
  }, [])

  const handleProgressTouchStart = useCallback((e) => {
    e.stopPropagation()
    setIsSeeking(true)
    handleProgressInteraction(e)
  }, [handleProgressInteraction])

  const handleProgressTouchMove = useCallback((e) => {
    e.stopPropagation()
    handleProgressInteraction(e)
  }, [handleProgressInteraction])

  const handleProgressTouchEnd = useCallback((e) => {
    e.stopPropagation()
    setIsSeeking(false)
  }, [])

  const handleProgressClick = useCallback((e) => {
    e.stopPropagation()
    handleProgressInteraction(e)
  }, [handleProgressInteraction])

  const handleShare = async (e) => {
    e.stopPropagation()
    try {
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
      }
    } catch (err) { /* cancelled */ }
  }

  // Cleanup timers
  useEffect(() => {
    return () => {
      clearTimeout(tapTimerRef.current)
      clearTimeout(longPressTimerRef.current)
      clearTimeout(playBtnTimerRef.current)
      clearTimeout(skipTimerRef.current)
    }
  }, [])

  return (
    <div
      className="reel-container"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
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

      {/* Center play/pause indicator */}
      <div className={`reel-play-center ${showPlayBtn ? 'show' : ''}`}>
        {showPlayBtn === 'pause' ? <Pause /> : <Play />}
      </div>

      {/* Skip forward/backward indicator */}
      {showSkip === 'forward' && (
        <div className="reel-skip-indicator reel-skip-right animate-scale-in">
          <FastForward />
          <span>5s</span>
        </div>
      )}
      {showSkip === 'backward' && (
        <div className="reel-skip-indicator reel-skip-left animate-scale-in">
          <Rewind />
          <span>5s</span>
        </div>
      )}

      {/* 2x speed indicator */}
      {isSpeeding && (
        <div className="reel-speed-indicator">
          <span>2×</span>
        </div>
      )}

      {/* Video info */}
      <div className="reel-info">
        <div className="reel-title">{title}</div>
        {description && <div className="reel-description">{description}</div>}
        {categoryName && <span className="reel-category">{categoryName}</span>}
      </div>

      {/* Bottom progress bar + time */}
      <div
        className="reel-progress-area"
        onClick={handleProgressClick}
        onTouchStart={handleProgressTouchStart}
        onTouchMove={handleProgressTouchMove}
        onTouchEnd={handleProgressTouchEnd}
      >
        <div className="reel-time-display">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="reel-progress-bar" ref={progressBarRef}>
          <div className="reel-progress-fill" style={{ width: `${progress}%` }}>
            <div className="reel-progress-thumb" />
          </div>
        </div>
      </div>
    </div>
  )
}
