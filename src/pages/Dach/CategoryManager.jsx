import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, X } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { supabase } from '../../config/supabase'
import Spinner from '../../components/Loading/Spinner'
import './CategoryManager.css'

export default function CategoryManager() {
  const { t, i18n } = useTranslation()
  const { categories, loading, refetch } = useCategories()
  const [showModal, setShowModal] = useState(false)
  const [nameEn, setNameEn] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [saving, setSaving] = useState(false)
  const isAr = i18n.language === 'ar'

  const handleSave = async (e) => {
    e.preventDefault()
    if (!nameEn) return
    setSaving(true)
    try {
      const { error } = await supabase.from('categories').insert({
        name_en: nameEn,
        name_ar: nameAr || nameEn,
        order: categories.length + 1
      })
      if (error) throw error
      setShowModal(false)
      setNameEn(''); setNameAr('')
      refetch()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('dach.confirm_delete'))) return
    await supabase.from('categories').delete().eq('id', id)
    refetch()
  }

  if (loading) return <Spinner inline />

  return (
    <div className="category-manager animate-fade-in" id="category-manager">
      <div className="dach-section-header">
        <h2 className="dach-section-title">{t('dach.manage_categories')}</h2>
        <button className="dach-btn-add" onClick={() => setShowModal(true)}>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center text-muted">{t('dach.no_data')}</td>
              </tr>
            ) : (
              categories.map(c => (
                <tr key={c.id}>
                  <td>{c.name_en}</td>
                  <td>{c.name_ar}</td>
                  <td>
                    <button onClick={() => handleDelete(c.id)} style={{ color: 'var(--danger)' }}>
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
              <h3>{t('dach.add_category')}</h3>
              <button onClick={() => setShowModal(false)}><X /></button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-md">
              <input
                type="text"
                placeholder={t('dach.category_name_en')}
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder={t('dach.category_name_ar')}
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
              />

              <div className="flex justify-between gap-md" style={{ marginTop: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} className="dach-nav-item">
                  {t('dach.cancel')}
                </button>
                <button type="submit" className="dach-btn-primary" disabled={saving}>
                  {saving ? t('common.loading') : t('dach.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
