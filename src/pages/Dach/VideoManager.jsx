import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Edit, X, Search, Filter, CheckSquare, Square, Image } from 'lucide-react'
import { useAllVideos } from '../../hooks/useVideos'
import { useCategories } from '../../hooks/useCategories'
import { useStorageAccounts } from '../../hooks/useStorageAccounts'
import { supabase } from '../../config/supabase'
import { uploadToStorage, getPublicUrl, findLeastUsedAccount } from '../../utils/storageClient'
import { useToast } from '../../components/Toast/Toast'
import Spinner from '../../components/Loading/Spinner'
import './VideoManager.css'

export default function VideoManager() {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const { videos, loading, refetch } = useAllVideos()
  const { categories } = useCategories()
  const { accounts } = useStorageAccounts()
  const isAr = i18n.language === 'ar'

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null) // null = add mode, object = edit mode
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState(new Set())

  // Form state
  const [titleEn, setTitleEn] = useState('')
  const [titleAr, setTitleAr] = useState('')
  const [descEn, setDescEn] = useState('')
  const [descAr, setDescAr] = useState('')
  const [type, setType] = useState('feed')
  const [categoryId, setCategoryId] = useState('')
  const [selectedStorage, setSelectedStorage] = useState('auto')
  const [videoSourceType, setVideoSourceType] = useState('file') // 'file' | 'url'
  const [directVideoUrl, setDirectVideoUrl] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [thumbFile, setThumbFile] = useState(null)

  // Close modal on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false)
        resetForm()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showModal])

  // Filtered videos
  const filteredVideos = useMemo(() => {
    let result = videos
    if (typeFilter !== 'all') {
      result = result.filter(v => v.type === typeFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(v =>
        (v.title_en || '').toLowerCase().includes(q) ||
        (v.title_ar || '').toLowerCase().includes(q) ||
        (v.description_en || '').toLowerCase().includes(q) ||
        (v.description_ar || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [videos, typeFilter, searchQuery])

  const openAddModal = () => {
    resetForm()
    setEditingVideo(null)
    setShowModal(true)
  }

  const openEditModal = (video) => {
    setEditingVideo(video)
    setTitleEn(video.title_en || '')
    setTitleAr(video.title_ar || '')
    setDescEn(video.description_en || '')
    setDescAr(video.description_ar || '')
    setType(video.type || 'feed')
    setCategoryId(video.category_id || '')
    setSelectedStorage(video.storage_account_id || 'auto')
    setVideoFile(null)
    setThumbFile(null)
    if (video.video_url && !video.video_url.includes('supabase.co/storage')) {
      setVideoSourceType('url')
      setDirectVideoUrl(video.video_url)
    } else {
      setVideoSourceType('file')
      setDirectVideoUrl('')
    }
    setShowModal(true)
  }

  const simulateProgress = useCallback(() => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 300)
    return () => clearInterval(interval)
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!titleEn) return

    setUploading(true)
    const clearProgress = simulateProgress()

    try {
      let videoUrl = editingVideo?.video_url || ''
      let thumbUrl = editingVideo?.thumbnail_url || ''
      let storageAccountId = editingVideo?.storage_account_id || null

      // Select storage account
      let targetAccount = null
      if (selectedStorage === 'auto') {
        targetAccount = findLeastUsedAccount(accounts)
      } else {
        targetAccount = accounts.find(a => a.id === selectedStorage)
      }

      // Process video source
      if (videoSourceType === 'url') {
        if (directVideoUrl.trim()) {
          videoUrl = directVideoUrl.trim()
        }
      } else if (videoFile) {
        // Enforce 50MB max file size limit for desktop file uploads
        const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB in bytes
        if (videoFile.size > MAX_FILE_SIZE) {
          clearProgress()
          setUploading(false)
          toast.warning(t('dach.file_size_exceeded'))
          return
        }

        // Remove special characters and spaces from filename
        const safeFileName = videoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const filePath = `videos/${Date.now()}_${safeFileName}`
        if (targetAccount) {
          await uploadToStorage(targetAccount, filePath, videoFile)
          videoUrl = getPublicUrl(targetAccount, filePath)
          storageAccountId = targetAccount.id
        } else {
          const { data, error: uploadErr } = await supabase.storage.from('videos').upload(filePath, videoFile)
          if (uploadErr) {
            throw new Error(`خطأ في رفع الفيديو إلى التخزين: ${uploadErr.message || 'تأكد من إعدادات Supabase Storage'}`)
          }
          if (data) {
            const { data: pubData } = supabase.storage.from('videos').getPublicUrl(filePath)
            videoUrl = pubData.publicUrl
          }
        }
      }

      // Upload thumbnail if provided
      if (thumbFile) {
        const thumbPath = `thumbnails/${Date.now()}_${thumbFile.name}`
        if (targetAccount) {
          await uploadToStorage(targetAccount, thumbPath, thumbFile)
          thumbUrl = getPublicUrl(targetAccount, thumbPath)
        } else {
          const { data, error } = await supabase.storage.from('thumbnails').upload(thumbPath, thumbFile)
          if (!error && data) {
            const { data: pubData } = supabase.storage.from('thumbnails').getPublicUrl(thumbPath)
            thumbUrl = pubData.publicUrl
          }
        }
      }

      const record = {
        title_en: titleEn,
        title_ar: titleAr,
        description_en: descEn,
        description_ar: descAr,
        type,
        category_id: categoryId || null,
        video_url: videoUrl,
        thumbnail_url: thumbUrl,
        storage_account_id: storageAccountId
      }

      setUploadProgress(95)

      if (editingVideo) {
        // Update existing video
        const { error: dbError } = await supabase
          .from('videos')
          .update(record)
          .eq('id', editingVideo.id)
        if (dbError) throw dbError
        toast.success(t('dach.video_updated'))
      } else {
        // Insert new video
        const { error: dbError } = await supabase.from('videos').insert(record)
        if (dbError) throw dbError
        toast.success(t('dach.video_saved'))
      }

      setUploadProgress(100)
      setTimeout(() => {
        setShowModal(false)
        resetForm()
        refetch()
      }, 400)
    } catch (err) {
      toast.error(err.message)
    } finally {
      clearProgress()
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('dach.confirm_delete'))) return
    try {
      const { error } = await supabase.from('videos').delete().eq('id', id)
      if (error) throw error
      toast.success(t('dach.video_deleted'))
      setSelectedIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      refetch()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!window.confirm(t('dach.confirm_delete_multiple', { count: selectedIds.size }))) return
    try {
      const ids = Array.from(selectedIds)
      const { error } = await supabase.from('videos').delete().in('id', ids)
      if (error) throw error
      toast.success(t('dach.video_deleted'))
      setSelectedIds(new Set())
      refetch()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredVideos.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredVideos.map(v => v.id)))
    }
  }

  const resetForm = () => {
    setTitleEn(''); setTitleAr(''); setDescEn(''); setDescAr('')
    setType('feed'); setCategoryId(''); setSelectedStorage('auto')
    setVideoFile(null); setThumbFile(null); setEditingVideo(null)
    setVideoSourceType('file'); setDirectVideoUrl('')
    setUploadProgress(0)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false)
      resetForm()
    }
  }

  if (loading) return <Spinner inline />

  const isEditMode = !!editingVideo

  return (
    <div className="video-manager animate-fade-in" id="video-manager">
      <div className="dach-section-header">
        <h2 className="dach-section-title">{t('dach.manage_videos')}</h2>
        <div className="dach-header-actions">
          {selectedIds.size > 0 && (
            <button className="dach-btn-danger" onClick={handleBulkDelete}>
              <Trash2 />
              <span>{t('dach.delete_selected')} ({selectedIds.size})</span>
            </button>
          )}
          <button className="dach-btn-add" onClick={openAddModal}>
            <Plus />
            <span>{t('dach.add_video')}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="dach-toolbar">
        <div className="dach-search-box">
          <Search className="dach-search-icon" />
          <input
            type="text"
            placeholder={t('dach.search_videos')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="dach-search-input"
          />
        </div>
        <div className="dach-filter-group">
          <Filter className="dach-filter-icon" />
          {['all', 'feed', 'reel', 'video'].map(f => (
            <button
              key={f}
              className={`dach-filter-btn ${typeFilter === f ? 'active' : ''}`}
              onClick={() => setTypeFilter(f)}
            >
              {t(`dach.filter_${f}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="dach-table-container">
        <table className="dach-table">
          <thead>
            <tr>
              <th className="dach-th-checkbox">
                <button onClick={toggleSelectAll} className="dach-checkbox-btn">
                  {selectedIds.size === filteredVideos.length && filteredVideos.length > 0
                    ? <CheckSquare />
                    : <Square />
                  }
                </button>
              </th>
              <th className="dach-th-thumb">{t('dach.thumbnail_file')}</th>
              <th>{t('dach.video_title_en')}</th>
              <th>{t('dach.video_type')}</th>
              <th>{t('dach.video_category')}</th>
              <th>{t('feed.views')}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVideos.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted">
                  {searchQuery || typeFilter !== 'all' ? t('dach.no_results') : t('dach.no_data')}
                </td>
              </tr>
            ) : (
              filteredVideos.map(v => (
                <tr key={v.id} className={selectedIds.has(v.id) ? 'dach-row-selected' : ''}>
                  <td className="dach-td-checkbox">
                    <button onClick={() => toggleSelect(v.id)} className="dach-checkbox-btn">
                      {selectedIds.has(v.id) ? <CheckSquare /> : <Square />}
                    </button>
                  </td>
                  <td className="dach-td-thumb">
                    {v.thumbnail_url ? (
                      <img src={v.thumbnail_url} alt="" className="dach-thumb-img" />
                    ) : (
                      <div className="dach-thumb-placeholder">
                        <Image />
                      </div>
                    )}
                  </td>
                  <td className="dach-td-title">
                    <span className="dach-video-title-text">
                      {isAr ? (v.title_ar || v.title_en) : v.title_en}
                    </span>
                  </td>
                  <td><span className={`dach-type-badge dach-type-${v.type}`}>{v.type}</span></td>
                  <td>{v.categories ? (isAr ? v.categories.name_ar : v.categories.name_en) : '-'}</td>
                  <td>{v.views_count || 0}</td>
                  <td>
                    <div className="dach-action-btns">
                      <button onClick={() => openEditModal(v)} className="dach-action-edit" title={t('dach.edit_video')}>
                        <Edit style={{ width: 17, height: 17 }} />
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="dach-action-delete" title={t('dach.delete_video')}>
                        <Trash2 style={{ width: 17, height: 17 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="dach-modal-backdrop" onClick={handleBackdropClick}>
          <div className="dach-modal animate-scale-in">
            <div className="dach-modal-header">
              <h3>{isEditMode ? t('dach.edit_video') : t('dach.add_video')}</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="dach-modal-close">
                <X />
              </button>
            </div>

            {/* Upload Progress Bar */}
            {uploading && (
              <div className="dach-upload-progress">
                <div className="dach-upload-bar">
                  <div
                    className="dach-upload-fill"
                    style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                  />
                </div>
                <span className="dach-upload-percent">
                  {t('dach.upload_progress', { percent: Math.round(uploadProgress) })}
                </span>
              </div>
            )}

            <form onSubmit={handleSave} className="dach-modal-form">
              <div className="dach-form-grid">
                <div className="dach-form-field">
                  <label className="dach-form-label">{t('dach.video_title_en')}</label>
                  <input
                    type="text"
                    placeholder={t('dach.video_title_en')}
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    required
                  />
                </div>
                <div className="dach-form-field">
                  <label className="dach-form-label">{t('dach.video_title_ar')}</label>
                  <input
                    type="text"
                    placeholder={t('dach.video_title_ar')}
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                  />
                </div>
              </div>

              <div className="dach-form-grid">
                <div className="dach-form-field">
                  <label className="dach-form-label">{t('dach.video_desc_en')}</label>
                  <textarea
                    placeholder={t('dach.video_desc_en')}
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="dach-form-field">
                  <label className="dach-form-label">{t('dach.video_desc_ar')}</label>
                  <textarea
                    placeholder={t('dach.video_desc_ar')}
                    value={descAr}
                    onChange={(e) => setDescAr(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="dach-form-grid">
                <div className="dach-form-field">
                  <label className="dach-form-label">{t('dach.video_type')}</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="feed">Feed (Twitter)</option>
                    <option value="reel">Reel (TikTok)</option>
                    <option value="video">Video (YouTube)</option>
                  </select>
                </div>

                <div className="dach-form-field">
                  <label className="dach-form-label">{t('dach.video_category')}</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">{t('dach.video_category')}...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {isAr ? c.name_ar : c.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!isEditMode && (
                <div className="dach-form-field">
                  <label className="dach-form-label">{t('dach.storage_account')}</label>
                  <select value={selectedStorage} onChange={(e) => setSelectedStorage(e.target.value)}>
                    <option value="auto">{t('dach.auto_select')}</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="dach-form-field">
                <label className="dach-form-label">{t('dach.video_source_type')}</label>
                <div className="dach-source-toggle">
                  <button
                    type="button"
                    className={`dach-source-btn ${videoSourceType === 'file' ? 'active' : ''}`}
                    onClick={() => setVideoSourceType('file')}
                  >
                    📁 {t('dach.video_source_file')}
                  </button>
                  <button
                    type="button"
                    className={`dach-source-btn ${videoSourceType === 'url' ? 'active' : ''}`}
                    onClick={() => setVideoSourceType('url')}
                  >
                    🔗 {t('dach.video_source_url')}
                  </button>
                </div>
              </div>

              <div className="dach-form-grid">
                <div className="dach-form-field">
                  <label className="dach-form-label">
                    {videoSourceType === 'file'
                      ? (isEditMode ? t('dach.change_video') : t('dach.video_file'))
                      : t('dach.video_source_url')
                    }
                  </label>
                  {videoSourceType === 'file' ? (
                    <>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files[0])}
                      />
                      <span className="dach-file-hint">{t('dach.max_file_size_hint')}</span>
                    </>
                  ) : (
                    <input
                      type="url"
                      placeholder={t('dach.direct_url_placeholder')}
                      value={directVideoUrl}
                      onChange={(e) => setDirectVideoUrl(e.target.value)}
                    />
                  )}
                  {isEditMode && !videoFile && !directVideoUrl && editingVideo?.video_url && (
                    <span className="dach-file-hint">{t('dach.keep_current')}</span>
                  )}
                </div>

                <div className="dach-form-field">
                  <label className="dach-form-label">
                    {isEditMode ? t('dach.change_thumbnail') : t('dach.thumbnail_file')}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbFile(e.target.files[0])}
                  />
                  {isEditMode && !thumbFile && editingVideo?.thumbnail_url && (
                    <div className="dach-current-thumb">
                      <img src={editingVideo.thumbnail_url} alt="" />
                    </div>
                  )}
                </div>
              </div>

              <div className="dach-modal-actions">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="dach-btn-cancel">
                  {t('dach.cancel')}
                </button>
                <button type="submit" className="dach-btn-primary" disabled={uploading}>
                  {uploading ? t('dach.uploading') : isEditMode ? t('dach.save') : t('dach.upload')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
