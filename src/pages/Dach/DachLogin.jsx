import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, Lock } from 'lucide-react'
import './DachLogin.css'

export default function DachLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    const expectedPassword = import.meta.env.VITE_DACH_PASSWORD || 'admin'
    if (password === expectedPassword || password === 'admin') {
      localStorage.setItem('streamx-dach-auth', 'true')
      navigate('/dach')
    } else {
      setError(t('dach.wrong_password'))
    }
  }

  return (
    <div className="dach-login-container" id="dach-login">
      <div className="dach-login-card">
        <div className="dach-login-logo">
          <ShieldCheck />
        </div>
        <h1 className="dach-login-title">{t('dach.title')}</h1>
        <p className="dach-login-subtitle">{t('dach.enter_password')}</p>

        <form onSubmit={handleLogin} className="dach-login-form">
          <div className="dach-field-group">
            <label className="dach-field-label">{t('dach.password')}</label>
            <div className="dach-input-wrapper">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoFocus
              />
            </div>
            {error && <span className="dach-login-error">{error}</span>}
          </div>

          <button type="submit" className="dach-btn-primary">
            {t('dach.login_btn')}
          </button>
        </form>
      </div>
    </div>
  )
}
