import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Search, Plus, ExternalLink } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'partner' | 'lead';
  amount: string;
  date: string;
}

export default function Crm() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const customers: Customer[] = [
    { id: '1', name: 'Siemens Sanayi A.Ş.', category: 'Industrial Group', status: 'partner', amount: '₺1,450,000', date: '2026-06-05' },
    { id: '2', name: 'ABB Elektrik Sanayi', category: 'Industrial Group', status: 'partner', amount: '₺890,000', date: '2026-06-08' },
    { id: '3', name: 'Schneider Electric Türkiye', category: 'Industrial Group', status: 'active', amount: '₺1,120,000', date: '2026-05-28' },
    { id: '4', name: 'Akdeniz Elektrik Dağıtım A.Ş.', category: 'Distribution Utility', status: 'active', amount: '₺2,400,000', date: '2026-06-01' },
    { id: '5', name: 'Pano-Tek Mühendislik', category: 'Contractor', status: 'lead', amount: '₺320,000', date: '2026-06-09' },
    { id: '6', name: 'Gama İnşaat Taahhüt', category: 'Contractor', status: 'lead', amount: '₺0', date: '2026-04-12' },
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('crm')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('crm_desc')}</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          {t('add_customer')}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--info-bg)', padding: '0.75rem', borderRadius: '8px', color: 'var(--info-color)' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Toplam Müşteri / Total Customers</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>6</h3>
          </div>
        </div>
        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--success-bg)', padding: '0.75rem', borderRadius: '8px', color: 'var(--success-color)' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>İş Ortakları / Partners</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>2</h3>
          </div>
        </div>
        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--warning-bg)', padding: '0.75rem', borderRadius: '8px', color: 'var(--warning-color)' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Aday Müşteriler / Leads</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>2</h3>
          </div>
        </div>
      </div>

      <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '400px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder={t('search_placeholder')}
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="banking-table">
            <thead>
              <tr>
                <th>{t('customer_name')}</th>
                <th>{t('category')}</th>
                <th>{t('status')}</th>
                <th>{t('amount')}</th>
                <th>{t('date')}</th>
                <th style={{ textAlign: 'right' }}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td style={{ fontWeight: 600 }}>{customer.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{customer.category}</td>
                    <td>
                      <span className={`badge badge-${
                        customer.status === 'partner' ? 'success' : customer.status === 'active' ? 'info' : 'warning'
                      }`}>
                        {t(`status_${customer.status}`)}
                      </span>
                    </td>
                    <td>{customer.amount}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{customer.date}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                        <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    {t('no_data')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
