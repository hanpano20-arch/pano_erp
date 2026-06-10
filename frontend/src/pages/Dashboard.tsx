import { useTranslation } from 'react-i18next';
import { DollarSign, Briefcase, FileSignature, TrendingUp, Plus, Users, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function StatCard({ title, value, icon: Icon, trend }: { title: string, value: string, icon: any, trend: string }) {
  const { t } = useTranslation();
  return (
    <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 500 }}>{title}</p>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</h3>
        </div>
        <div style={{ background: 'var(--info-bg)', padding: '0.6rem', borderRadius: '6px', color: 'var(--primary-color)' }}>
          <Icon size={20} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)', fontSize: '0.8rem', fontWeight: 500 }}>
        <TrendingUp size={14} />
        <span>{trend}</span>
        <span style={{ color: 'var(--text-muted)' }}>{t('since_last_month')}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const recentQuotes = [
    { id: 'Q-2026-001', name: 'Siemens 1600A MDB Panel', customer: 'Siemens A.Ş.', amount: '₺640,000', status: 'approved' },
    { id: 'Q-2026-002', name: 'Schneider MCC Panel Block-A', customer: 'Gama İnşaat', amount: '₺1,200,000', status: 'production' },
    { id: 'Q-2026-003', name: 'ABB Compensation Board', customer: 'ABB Elektrik', amount: '₺220,000', status: 'sent' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            {t('welcome')}, Admin 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('here_is_summary')}</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/quotations')}>
          <Plus size={18} />
          {t('create_quotation')}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard title={t('total_revenue')} value="₺2,060,000" icon={DollarSign} trend="+15.3%" />
        <StatCard title={t('active_projects')} value="14" icon={Briefcase} trend="+2" />
        <StatCard title={t('pending_quotations')} value="8" icon={FileSignature} trend="-1" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Quotations Table */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('recent_quotations')}</h3>
          <div className="table-container">
            <table className="banking-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t('quote_name')}</th>
                  <th>{t('amount')}</th>
                  <th>{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {recentQuotes.map(quote => (
                  <tr key={quote.id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary-color)', fontFamily: 'monospace' }}>{quote.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{quote.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{quote.customer}</div>
                    </td>
                    <td>{quote.amount}</td>
                    <td>
                      <span className={`badge badge-${
                        quote.status === 'approved' || quote.status === 'production' ? 'success' : 'info'
                      }`}>
                        {t(`status_${quote.status}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('quick_actions')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/crm')}>
              <Users size={16} />
              {t('add_customer')}
            </button>
            <button className="btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/products')}>
              <Upload size={16} />
              {t('import_excel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

