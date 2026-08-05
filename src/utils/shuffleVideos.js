/**
 * Fisher-Yates shuffle algorithm
 */
function fisherYatesShuffle(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const STORAGE_PREFIX = 'streamx-viewed-'

/**
 * Get viewed video IDs from localStorage for a given mode
 */
export function getViewedIds(mode) {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + mode)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Mark a video as viewed
 */
export function markAsViewed(mode, videoId) {
  const viewed = getViewedIds(mode)
  if (!viewed.includes(videoId)) {
    viewed.push(videoId)
    localStorage.setItem(STORAGE_PREFIX + mode, JSON.stringify(viewed))
  }
}

/**
 * Clear viewed history for a mode
 */
export function clearViewed(mode) {
  localStorage.removeItem(STORAGE_PREFIX + mode)
}

/**
 * Get shuffled videos with no-repeat logic
 * - Filters out already-viewed videos
 * - If all viewed, resets and reshuffles
 * - Returns shuffled array of unwatched videos
 */
export function getShuffledVideos(videos, mode) {
  if (!videos || videos.length === 0) return []

  let viewedIds = getViewedIds(mode)
  
  // If all videos have been viewed, reset
  const allIds = videos.map(v => v.id)
  const unwatchedIds = allIds.filter(id => !viewedIds.includes(id))
  
  if (unwatchedIds.length === 0) {
    clearViewed(mode)
    viewedIds = []
  }

  // Filter out viewed videos
  const unwatched = videos.filter(v => !viewedIds.includes(v.id))
  
  // Shuffle the unwatched videos
  return fisherYatesShuffle(unwatched)
}
