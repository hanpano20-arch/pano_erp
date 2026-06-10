import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Globe, Database, Server } from 'lucide-react';

export default function Settings() {
  const { t, i18n } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('settings')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('settings_desc')}</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* General Settings */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
            <SettingsIcon size={20} style={{ color: 'var(--primary-color)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('general_settings')}</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                {t('language')} (Active: {i18n.language.toUpperCase()})
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={`btn-secondary ${i18n.language === 'tr' ? 'active' : ''}`}
                  onClick={() => i18n.changeLanguage('tr')}
                  style={{ flex: 1, borderColor: i18n.language === 'tr' ? 'var(--primary-color)' : 'var(--surface-border)' }}
                >
                  <Globe size={16} />
                  {t('turkish')} (TR)
                </button>
                <button 
                  className={`btn-secondary ${i18n.language === 'en' ? 'active' : ''}`}
                  onClick={() => i18n.changeLanguage('en')}
                  style={{ flex: 1, borderColor: i18n.language === 'en' ? 'var(--primary-color)' : 'var(--surface-border)' }}
                >
                  <Globe size={16} />
                  {t('english')} (EN)
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                {t('currency')}
              </label>
              <select className="form-control" defaultValue="TRY">
                <option value="TRY">TRY (₺)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
            <Server size={20} style={{ color: 'var(--success-color)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('system_status')}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Database size={16} />
                Database:
              </span>
              <span className="badge badge-success">SQLite (aiosqlite)</span>
            </div>
            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Server size={16} />
                Backend API:
              </span>
              <span className="badge badge-success">FastAPI (Port 8000)</span>
            </div>
            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={16} />
                Frontend:
              </span>
              <span className="badge badge-info">React + Vite</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
