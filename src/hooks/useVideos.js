import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../config/supabase'
import { getShuffledVideos, markAsViewed } from '../utils/shuffleVideos'

export function useVideos(mode = null, categoryId = null) {
  const [videos, setVideos] = useState([])
  const [shuffledVideos, setShuffledVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('videos')
        .select('*, categories(id, name_en, name_ar, icon)')
        .order('created_at', { ascending: false })

      if (mode && mode !== 'all') {
        query = query.eq('type', mode)
      }

      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setVideos(data || [])
      
      // Apply shuffle logic for public-facing views
      const viewMode = mode || 'all'
      setShuffledVideos(getShuffledVideos(data || [], viewMode))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [mode, categoryId])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const markVideoViewed = useCallback((videoId) => {
    const viewMode = mode || 'all'
    markAsViewed(viewMode, videoId)
  }, [mode])

  const reshuffle = useCallback(() => {
    const viewMode = mode || 'all'
    setShuffledVideos(getShuffledVideos(videos, viewMode))
  }, [videos, mode])

  return {
    videos,
    shuffledVideos,
    loading,
    error,
    refetch: fetchVideos,
    markVideoViewed,
    reshuffle
  }
}

// For dashboard — no shuffling, return raw data
export function useAllVideos() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('videos')
        .select('*, categories(id, name_en, name_ar), storage_accounts(id, name)')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setVideos(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  return { videos, loading, error, refetch: fetchVideos }
}
