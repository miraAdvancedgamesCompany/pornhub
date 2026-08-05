import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Edit, X } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { useAllVideos } from '../../hooks/useVideos'
import { supabase } from '../../config/supabase'
import { useToast } from '../../components/Toast/Toast'
import Spinner from '../../components/Loading/Spinner'
import './CategoryManager.css'

export default function CategoryManager() {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const { categories, loading: cLoading, refetch } = useCategories()
  const { videos, loading: vLoading } = useAllVideos()
  const isAr = i18n.language === 'ar'

  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [nameEn, setNameEn] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [saving, setSaving] = useState(false)

  // Map category IDs to video counts
  const categoryCounts = useMemo(() => {
    const counts = {}
    if (videos) {
      videos.forEach(v => {
        if (v.category_id) {
          counts[v.category_id] = (counts[v.category_id] || 0) + 1
        }
      })
    }
    return counts
  }, [videos])

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

  const openAddModal = () => {
    resetForm()
    setEditingCategory(null)
    setShowModal(true)
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    setNameEn(category.name_en || '')
    setNameAr(category.name_ar || '')
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!nameEn) return
    setSaving(true)

    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name_en: nameEn,
            name_ar: nameAr || nameEn
          })
          .eq('id', editingCategory.id)

        if (error) throw error
        toast.success(t('dach.category_updated'))
      } else {
        // Insert new category
        const { error } = await supabase
          .from('categories')
          .insert({
            name_en: nameEn,
            name_ar: nameAr || nameEn,
            order: categories.length + 1
          })

        if (error) throw error
        toast.success(t('dach.category_saved'))
      }

      setShowModal(false)
      resetForm()
      refetch()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('dach.confirm_delete'))) return
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      toast.success(t('dach.category_deleted'))
      refetch()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const resetForm = () => {
    setNameEn('')
    setNameAr('')
    setEditingCategory(null)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false)
      resetForm()
    }
  }

  if (cLoading || vLoading) return <Spinner inline />

  return (
    <div className="category-manager animate-fade-in" id="category-manager">
      <div className="dach-section-header">
        <h2 className="dach-section-title">{t('dach.manage_categories')}</h2>
        <button className="dach-btn-add" onClick={openAddModal}>
          <Plus />
          <span>{t('dach.add_category')}</span>
        </button>
      </div>

      <div className="dach-table-container">
        <table className="dach-table">
          <thead>
            <tr>
              <th>{t('dach.category_name_en')}</th>
              <th>{t('dach.category_name_ar')}</th>
              <th>{t('dach.total_videos')}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted">{t('dach.no_data')}</td>
              </tr>
            ) : (
              categories.map(c => {
                const count = categoryCounts[c.id] || 0
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name_en}</td>
                    <td>{c.name_ar}</td>
                    <td>
                      <span className="category-video-count-badge">
                        {t('dach.category_video_count', { count })}
                      </span>
                    </td>
                    <td>
                      <div className="dach-action-btns">
                        <button onClick={() => openEditModal(c)} className="dach-action-edit" title={t('dach.edit_category')}>
                          <Edit style={{ width: 17, height: 17 }} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="dach-action-delete" title={t('dach.delete_video')}>
                          <Trash2 style={{ width: 17, height: 17 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="dach-modal-backdrop" onClick={handleBackdropClick}>
          <div className="dach-modal animate-scale-in">
            <div className="dach-modal-header">
              <h3>{editingCategory ? t('dach.edit_category') : t('dach.add_category')}</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="dach-modal-close">
                <X />
              </button>
            </div>

            <form onSubmit={handleSave} className="dach-modal-form">
              <div className="dach-form-field">
                <label className="dach-form-label">{t('dach.category_name_en')}</label>
                <input
                  type="text"
                  placeholder={t('dach.category_name_en')}
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="dach-form-field">
                <label className="dach-form-label">{t('dach.category_name_ar')}</label>
                <input
                  type="text"
                  placeholder={t('dach.category_name_ar')}
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                />
              </div>

              <div className="dach-modal-actions">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="dach-btn-cancel">
                  {t('dach.cancel')}
                </button>
                <button type="submit" className="dach-btn-primary" disabled={saving}>
                  {saving ? t('dach.saving') : t('dach.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
