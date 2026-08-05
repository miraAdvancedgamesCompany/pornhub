import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, HardDrive, X } from 'lucide-react'
import { useStorageAccounts } from '../../hooks/useStorageAccounts'
import { supabase } from '../../config/supabase'
import Spinner from '../../components/Loading/Spinner'
import './StorageManager.css'

export default function StorageManager() {
  const { t } = useTranslation()
  const { accounts, loading, refetch } = useStorageAccounts()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [key, setKey] = useState('')
  const [bucket, setBucket] = useState('videos')
  const [maxGb, setMaxGb] = useState('1')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name || !url || !key) return
    setSaving(true)
    try {
      const maxBytes = parseFloat(maxGb) * 1024 * 1024 * 1024
      const { error } = await supabase.from('storage_accounts').insert({
        name,
        supabase_url: url,
        supabase_anon_key: key,
        bucket_name: bucket,
        max_storage: maxBytes,
        used_storage: 0,
        is_active: true
      })
      if (error) throw error
      setShowModal(false)
      setName(''); setUrl(''); setKey('')
      refetch()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('dach.confirm_delete'))) return
    await supabase.from('storage_accounts').delete().eq('id', id)
    refetch()
  }

  if (loading) return <Spinner inline />

  return (
    <div className="storage-manager animate-fade-in" id="storage-manager">
      <div className="dach-section-header">
        <h2 className="dach-section-title">{t('dach.manage_storage')}</h2>
        <button className="dach-btn-add" onClick={() => setShowModal(true)}>
          <Plus />
          <span>{t('dach.add_storage')}</span>
        </button>
      </div>

      <div className="flex flex-col gap-md">
        {/* Primary Account (Default) */}
        <div className="storage-account-card">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-md">
              <HardDrive style={{ color: 'var(--text-primary)' }} />
              <div>
                <h4 style={{ fontWeight: 600 }}>Primary Supabase (Default)</h4>
                <p className="text-sm text-muted">{import.meta.env.VITE_SUPABASE_URL || 'Configured in .env'}</p>
              </div>
            </div>
            <span className="feed-category-badge">{t('dach.active')}</span>
          </div>
        </div>

        {/* Additional Accounts */}
        {accounts.map(acc => {
          const usedGb = (acc.used_storage / (1024 * 1024 * 1024)).toFixed(2)
          const maxGbVal = (acc.max_storage / (1024 * 1024 * 1024)).toFixed(2)
          const pct = Math.min(100, (acc.used_storage / acc.max_storage) * 100)

          return (
            <div key={acc.id} className="storage-account-card">
              <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                <div className="flex items-center gap-md">
                  <HardDrive />
                  <div>
                    <h4 style={{ fontWeight: 600 }}>{acc.name}</h4>
                    <p className="text-sm text-muted">{acc.supabase_url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <span className="text-sm text-muted">{usedGb} GB / {maxGbVal} GB</span>
                  <button onClick={() => handleDelete(acc.id)} style={{ color: 'var(--danger)' }}>
                    <Trash2 style={{ width: 18, height: 18 }} />
                  </button>
                </div>
              </div>
              <div className="storage-progress-bar">
                <div className="storage-progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="dach-modal-backdrop">
          <div className="dach-modal animate-scale-in">
            <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
              <h3>{t('dach.add_storage')}</h3>
              <button onClick={() => setShowModal(false)}><X /></button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-md">
              <input
                type="text"
                placeholder={t('dach.account_name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="url"
                placeholder={t('dach.supabase_url')}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder={t('dach.supabase_key')}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                required
              />
              <div className="dach-form-grid">
                <input
                  type="text"
                  placeholder={t('dach.bucket_name')}
                  value={bucket}
                  onChange={(e) => setBucket(e.target.value)}
                />
                <input
                  type="number"
                  placeholder={t('dach.max_storage')}
                  value={maxGb}
                  onChange={(e) => setMaxGb(e.target.value)}
                  step="0.5"
                />
              </div>

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
