import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'
import './DachLogin.css'

// Simple token generation — not cryptographic but prevents casual localStorage tampering
function generateToken() {
  const payload = {
    ts: Date.now(),
    r: Math.random().toString(36).substring(2)
  }
  return btoa(JSON.stringify(payload))
}

export function isValidDachToken() {
  try {
    const token = localStorage.getItem('streamx-dach-auth')
    if (!token) return false
    const payload = JSON.parse(atob(token))
    // Session valid for 2 hours
    const TWO_HOURS = 2 * 60 * 60 * 1000
    if (Date.now() - payload.ts > TWO_HOURS) {
      localStorage.removeItem('streamx-dach-auth')
      return false
    }
    return !!payload.r
  } catch {
    localStorage.removeItem('streamx-dach-auth')
    return false
  }
}

const MAX_ATTEMPTS = 5
const LOCKOUT_SECONDS = 30

export default function DachLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockoutTime, setLockoutTime] = useState(0)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (isValidDachToken()) {
      navigate('/dach')
    }
  }, [navigate])

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTime <= 0) return
    const interval = setInterval(() => {
      setLockoutTime(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [lockoutTime])

  const handleLogin = (e) => {
    e.preventDefault()

    // Rate limiting check
    if (lockoutTime > 0) return

    const expectedPassword = import.meta.env.VITE_DACH_PASSWORD
    if (!expectedPassword) {
      setError('Dashboard password not configured')
      return
    }

    if (password === expectedPassword) {
      localStorage.setItem('streamx-dach-auth', generateToken())
      navigate('/dach')
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setError(t('dach.wrong_password'))
      setShake(true)
      setTimeout(() => setShake(false), 600)

      if (newAttempts >= MAX_ATTEMPTS) {
        setLockoutTime(LOCKOUT_SECONDS)
        setAttempts(0)
      }

      // Refocus input
      inputRef.current?.focus()
    }
  }

  const isLocked = lockoutTime > 0

  return (
    <div className="dach-login-container" id="dach-login">
      <div className={`dach-login-card ${shake ? 'shake' : ''}`}>
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
                ref={inputRef}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoFocus
                disabled={isLocked}
              />
            </div>
            {error && <span className="dach-login-error">{error}</span>}
            {isLocked && (
              <div className="dach-lockout-timer">
                <div className="dach-lockout-bar">
                  <div
                    className="dach-lockout-fill"
                    style={{ width: `${(lockoutTime / LOCKOUT_SECONDS) * 100}%` }}
                  />
                </div>
                <span className="dach-lockout-text">
                  {t('dach.too_many_attempts', { seconds: lockoutTime })}
                </span>
              </div>
            )}
          </div>

          <button type="submit" className="dach-btn-primary" disabled={isLocked}>
            {isLocked ? `${lockoutTime}s` : t('dach.login_btn')}
          </button>
        </form>
      </div>
    </div>
  )
}
