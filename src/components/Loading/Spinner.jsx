import { useTranslation } from 'react-i18next'
import './Spinner.css'

export default function Spinner({ size = 'default', inline = false, text = true }) {
  const { t } = useTranslation()

  return (
    <div className={`spinner-overlay ${inline ? 'inline' : ''}`}>
      <div className="spinner-container">
        <div className={`spinner-ring ${size}`} />
        {text && <span className="spinner-text">{t('common.loading')}</span>}
      </div>
    </div>
  )
}
