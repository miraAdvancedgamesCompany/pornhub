import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Edit, X } from 'lucide-react'
import { useAllVideos } from '../../hooks/useVideos'
import { useCategories } from '../../hooks/useCategories'
import { useStorageAccounts } from '../../hooks/useStorageAccounts'
import { supabase } from '../../config/supabase'
import { uploadToStorage, getPublicUrl, findLeastUsedAccount } from '../../utils/storageClient'
import Spinner from '../../components/Loading/Spinner'
import './VideoManager.css'

export default function VideoManager() {
  const { t, i18n } = useTranslation()
  const { videos, loading, refetch } = useAllVideos()
  const { categories } = useCategories()
  const { accounts } = useStorageAccounts()
  const isAr = i18n.language === 'ar'

  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [titleEn, setTitleEn] = useState('')
  const [titleAr, setTitleAr] = useState('')
  const [descEn, setDescEn] = useState('')
  const [descAr, setDescAr] = useState('')
  const [type, setType] = useState('feed')
  const [categoryId, setCategoryId] = useState('')
  const [selectedStorage, setSelectedStorage] = useState('auto')
  const [videoFile, setVideoFile] = useState(null)
  const [thumbFile, setThumbFile] = useState(null)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!titleEn) return

    setUploading(true)
    try {
      let videoUrl = ''
      let thumbUrl = ''
      let storageAccountId = null

      // Select storage account
      let targetAccount = null
      if (selectedStorage === 'auto') {
        targetAccount = findLeastUsedAccount(accounts)
      } else {
        targetAccount = accounts.find(a => a.id === selectedStorage)
      }

      // If video file provided, upload
      if (videoFile) {
        const filePath = `videos/${Date.now()}_${videoFile.name}`
        if (targetAccount) {
          await uploadToStorage(targetAccount, filePath, videoFile)
          videoUrl = getPublicUrl(targetAccount, filePath)
          storageAccountId = targetAccount.id
        } else {
          // Upload to primary Supabase bucket
          const { data, error } = await supabase.storage.from('videos').upload(filePath, videoFile)
          if (!error && data) {
            const { data: pubData } = supabase.storage.from('videos').getPublicUrl(filePath)
            videoUrl = pubData.publicUrl
          }
        }
      }

      // Upload thumbnail
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

      // Insert record into Supabase
      const { error: dbError } = await supabase.from('videos').insert({
        title_en: titleEn,
        title_ar: titleAr,
        description_en: descEn,
        description_ar: descAr,
        type,
        category_id: categoryId || null,
        video_url: videoUrl,
        thumbnail_url: thumbUrl,
        storage_account_id: storageAccountId
      })

      if (dbError) throw dbError

      setShowModal(false)
      resetForm()
      refetch()
    } catch (err) {
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('dach.confirm_delete'))) return
    await supabase.from('videos').delete().eq('id', id)
    refetch()
  }

  const resetForm = () => {
    setTitleEn(''); setTitleAr(''); setDescEn(''); setDescAr('')
    setType('feed'); setCategoryId(''); setSelectedStorage('auto')
    setVideoFile(null); setThumbFile(null)
  }

  if (loading) return <Spinner inline />

  return (
    <div className="video-manager animate-fade-in" id="video-manager">
      <div className="dach-section-header">
        <h2 className="dach-section-title">{t('dach.manage_videos')}</h2>
        <button className="dach-btn-add" onClick={() => setShowModal(true)}>
          <Plus />
          <span>{t('dach.add_video')}</span>
        </button>
      </div>

      <div className="dach-table-container">
        <table className="dach-table">
          <thead>
            <tr>
              <th>{t('dach.video_title_en')}</th>
              <th>{t('dach.video_type')}</th>
              <th>{t('dach.video_category')}</th>
              <th>{t('feed.views')}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">{t('dach.no_data')}</td>
              </tr>
            ) : (
              videos.map(v => (
                <tr key={v.id}>
                  <td>{isAr ? (v.title_ar || v.title_en) : v.title_en}</td>
                  <td><span className="feed-category-badge">{v.type}</span></td>
                  <td>{v.categories ? (isAr ? v.categories.name_ar : v.categories.name_en) : '-'}</td>
                  <td>{v.views_count || 0}</td>
                  <td>
                    <button onClick={() => handleDelete(v.id)} style={{ color: 'var(--danger)' }}>
                      <Trash2 style={{ width: 18, height: 18 }} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="dach-modal-backdrop">
          <div className="dach-modal animate-scale-in">
            <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
              <h3>{t('dach.add_video')}</h3>
              <button onClick={() => setShowModal(false)}><X /></button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-md">
              <div className="dach-form-grid">
                <input
                  type="text"
                  placeholder={t('dach.video_title_en')}
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder={t('dach.video_title_ar')}
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                />
              </div>

              <div className="dach-form-grid">
                <textarea
                  placeholder={t('dach.video_desc_en')}
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                />
                <textarea
                  placeholder={t('dach.video_desc_ar')}
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                />
              </div>

              <div className="dach-form-grid">
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="feed">Feed (Twitter)</option>
                  <option value="reel">Reel (TikTok)</option>
                  <option value="video">Video (YouTube)</option>
                </select>

                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">{t('dach.video_category')}...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {isAr ? c.name_ar : c.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dach-form-grid">
                <div>
                  <label className="text-sm text-muted">{t('dach.storage_account')}</label>
                  <select value={selectedStorage} onChange={(e) => setSelectedStorage(e.target.value)}>
                    <option value="auto">{t('dach.auto_select')}</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="text-sm text-muted">{t('dach.video_file')}</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="text-sm text-muted">{t('dach.thumbnail_file')}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbFile(e.target.files[0])}
                />
              </div>

              <div className="flex justify-between gap-md" style={{ marginTop: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} className="dach-nav-item">
                  {t('dach.cancel')}
                </button>
                <button type="submit" className="dach-btn-primary" disabled={uploading}>
                  {uploading ? t('dach.uploading') : t('dach.upload')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
