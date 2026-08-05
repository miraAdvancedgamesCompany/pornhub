import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, HardDrive, X, Copy, Eye, EyeOff } from 'lucide-react'
import { useStorageAccounts } from '../../hooks/useStorageAccounts'
import { supabase } from '../../config/supabase'
import { useToast } from '../../components/Toast/Toast'
import Spinner from '../../components/Loading/Spinner'
import './StorageManager.css'

export default function StorageManager() {
  const { t } = useTranslation()
  const toast = useToast()
  const { accounts, loading, refetch } = useStorageAccounts()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [key, setKey] = useState('')
  const [bucket, setBucket] = useState('videos')
  const [maxGb, setMaxGb] = useState('1')
  const [saving, setSaving] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState(new Set())

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

  const toggleKeyVisibility = (id) => {
    setVisibleKeys(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success(t('dach.key_copied'))
  }

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
      toast.success(t('dach.storage_saved'))
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
      const { error } = await supabase.from('storage_accounts').delete().eq('id', id)
      if (error) throw error
      toast.success(t('dach.storage_deleted'))
      refetch()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const resetForm = () => {
    setName(''); setUrl(''); setKey('')
    setBucket('videos'); setMaxGb('1')
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false)
      resetForm()
    }
  }

  const maskKey = (str) => {
    if (!str || str.length <= 10) return '••••••••'
    return str.substring(0, 6) + '••••••••' + str.substring(str.length - 4)
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
          const isKeyVisible = visibleKeys.has(acc.id)

          // Color progress bar based on percentage
          let progressColorClass = 'progress-normal'
          if (pct >= 90) progressColorClass = 'progress-danger'
          else if (pct >= 75) progressColorClass = 'progress-warning'

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
                  <button onClick={() => handleDelete(acc.id)} className="dach-action-delete" title={t('dach.delete_video')}>
                    <Trash2 style={{ width: 18, height: 18 }} />
                  </button>
                </div>
              </div>

              {/* Masked Anon Key Section */}
              <div className="storage-key-box">
                <span className="storage-key-label">{t('dach.supabase_key')}:</span>
                <code className="storage-key-text">
                  {isKeyVisible ? acc.supabase_anon_key : maskKey(acc.supabase_anon_key)}
                </code>
                <div className="storage-key-actions">
                  <button
                    onClick={() => toggleKeyVisibility(acc.id)}
                    className="storage-key-btn"
                    title={isKeyVisible ? 'Hide Key' : 'Show Key'}
                  >
                    {isKeyVisible ? <EyeOff /> : <Eye />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(acc.supabase_anon_key)}
                    className="storage-key-btn"
                    title={t('dach.copy_key')}
                  >
                    <Copy />
                  </button>
                </div>
              </div>

              <div className="storage-progress-bar">
                <div className={`storage-progress-fill ${progressColorClass}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="dach-modal-backdrop" onClick={handleBackdropClick}>
          <div className="dach-modal animate-scale-in">
            <div className="dach-modal-header">
              <h3>{t('dach.add_storage')}</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="dach-modal-close">
                <X />
              </button>
            </div>

            <form onSubmit={handleSave} className="dach-modal-form">
              <div className="dach-form-field">
                <label className="dach-form-label">{t('dach.account_name')}</label>
                <input
                  type="text"
                  placeholder={t('dach.account_name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="dach-form-field">
                <label className="dach-form-label">{t('dach.supabase_url')}</label>
                <input
                  type="url"
                  placeholder={t('dach.supabase_url')}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              <div className="dach-form-field">
                <label className="dach-form-label">{t('dach.supabase_key')}</label>
                <input
                  type="text"
                  placeholder={t('dach.supabase_key')}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  required
                />
              </div>

              <div className="dach-form-grid">
                <div className="dach-form-field">
                  <label className="dach-form-label">{t('dach.bucket_name')}</label>
                  <input
                    type="text"
                    placeholder={t('dach.bucket_name')}
                    value={bucket}
                    onChange={(e) => setBucket(e.target.value)}
                  />
                </div>
                <div className="dach-form-field">
                  <label className="dach-form-label">{t('dach.max_storage')}</label>
                  <input
                    type="number"
                    placeholder={t('dach.max_storage')}
                    value={maxGb}
                    onChange={(e) => setMaxGb(e.target.value)}
                    step="0.5"
                  />
                </div>
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
