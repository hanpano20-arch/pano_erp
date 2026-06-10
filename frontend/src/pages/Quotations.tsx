import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Search, Plus, Trash2, X, AlertCircle } from 'lucide-react';
import {
  productApi,
  customerApi,
  quotationApi,
  type Product,
  type Customer,
  type Quotation,
  type QuotationCreate,
  type QuotationItemCreate
} from '../services/api';

interface WizardItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  currency: string;
}

export default function Quotations() {
  const { t } = useTranslation();
  
  // Data State
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Wizard Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [currency, setCurrency] = useState('TRY');
  const [laborCost, setLaborCost] = useState('0');
  const [marginPercentage, setMarginPercentage] = useState('0');
  const [wizardItems, setWizardItems] = useState<WizardItem[]>([]);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [quotesData, customersData, productsData] = await Promise.all([
        quotationApi.list(),
        customerApi.list(),
        productApi.list(),
      ]);
      setQuotations(quotesData);
      setCustomers(customersData);
      setProducts(productsData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Show notification
  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Open Wizard and set default code
  const handleOpenWizard = () => {
    setCode(`TEK-${Math.floor(100000 + Math.random() * 900000)}`);
    setName('');
    setCustomerId(customers[0]?.id || '');
    setCurrency('TRY');
    setLaborCost('0');
    setMarginPercentage('15');
    setWizardItems([{ product_id: products[0]?.id || '', quantity: 1, unit_price: Number(products[0]?.list_price) || 0, currency: products[0]?.currency || 'TRY' }]);
    setShowWizard(true);
  };

  // Delete quotation
  const handleDeleteQuotation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Bu teklifi silmek istediğinize emin misiniz?')) return;
    try {
      await quotationApi.delete(id);
      notify(t('success_deleted'), 'success');
      fetchData();
      if (selectedQuotation?.id === id) {
        setSelectedQuotation(null);
      }
    } catch (err) {
      notify('Teklif silinirken hata oluştu.', 'error');
    }
  };

  // Currency Converter
  const convertCurrency = (amount: number, from: string, to: string): number => {
    if (from === to) return amount;
    
    // Convert to TRY base
    let amountInTry = amount;
    if (from === 'EUR') amountInTry = amount * 35.0;
    else if (from === 'USD') amountInTry = amount * 33.0;
    
    // Convert TRY to target
    if (to === 'TRY') return amountInTry;
    if (to === 'EUR') return amountInTry / 35.0;
    if (to === 'USD') return amountInTry / 33.0;
    
    return amount;
  };

  // Calculate Wizard Totals
  const calculateTotals = () => {
    let materialSubtotal = 0;
    
    wizardItems.forEach((item) => {
      const lineTotal = item.quantity * item.unit_price;
      const converted = convertCurrency(lineTotal, item.currency, currency);
      materialSubtotal += converted;
    });

    const labor = Number(laborCost) || 0;
    const subtotalWithLabor = materialSubtotal + labor;
    const margin = Number(marginPercentage) || 0;
    const grandTotal = subtotalWithLabor * (1 + margin / 100);

    return {
      materialSubtotal,
      labor,
      subtotalWithLabor,
      marginAmount: subtotalWithLabor * (margin / 100),
      grandTotal
    };
  };

  const totals = calculateTotals();

  // Wizard handlers
  const handleItemProductChange = (index: number, productId: string) => {
    const selectedProd = products.find(p => p.id === productId);
    if (!selectedProd) return;
    
    const newItems = [...wizardItems];
    newItems[index] = {
      ...newItems[index],
      product_id: productId,
      unit_price: Number(selectedProd.list_price),
      currency: selectedProd.currency
    };
    setWizardItems(newItems);
  };

  const handleItemQtyChange = (index: number, qty: number) => {
    const newItems = [...wizardItems];
    newItems[index] = {
      ...newItems[index],
      quantity: Math.max(0.01, qty)
    };
    setWizardItems(newItems);
  };

  const handleItemPriceChange = (index: number, price: number) => {
    const newItems = [...wizardItems];
    newItems[index] = {
      ...newItems[index],
      unit_price: Math.max(0, price)
    };
    setWizardItems(newItems);
  };

  const addWizardRow = () => {
    setWizardItems([
      ...wizardItems,
      {
        product_id: products[0]?.id || '',
        quantity: 1,
        unit_price: Number(products[0]?.list_price) || 0,
        currency: products[0]?.currency || 'TRY'
      }
    ]);
  };

  const removeWizardRow = (index: number) => {
    if (wizardItems.length <= 1) {
      notify(t('add_at_least_one'), 'error');
      return;
    }
    setWizardItems(wizardItems.filter((_, i) => i !== index));
  };

  // Submit Wizard
  const handleSaveQuotation = async () => {
    if (!name || !customerId || !code) {
      notify(t('fill_required'), 'error');
      return;
    }

    const itemsPayload: QuotationItemCreate[] = wizardItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      currency: item.currency
    }));

    const payload: QuotationCreate = {
      code,
      name,
      customer_id: customerId,
      currency,
      labor_cost: totals.labor,
      margin_percentage: Number(marginPercentage) || 0,
      total_amount: totals.grandTotal,
      status: 'draft',
      items: itemsPayload
    };

    try {
      await quotationApi.create(payload);
      notify(t('success_created'), 'success');
      setShowWizard(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      notify(err.response?.data?.detail || 'Teklif oluşturulurken bir hata oluştu.', 'error');
    }
  };

  // Format currency display helpers
  const formatCurrency = (val: number, curr: string) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Filter list
  const getCustomerName = (cId: string) => {
    const cust = customers.find(c => c.id === cId);
    return cust ? cust.company_name : 'Bilinmeyen Müşteri';
  };

  const getProductName = (pId: string) => {
    const prod = products.find(p => p.id === pId);
    return prod ? `${prod.code} - ${prod.name}` : 'Bilinmeyen Ürün';
  };

  const filteredQuotations = quotations.filter(q =>
    q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCustomerName(q.customer_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute stats in TRY
  const totalVolumeTRY = quotations.reduce((acc, q) => acc + convertCurrency(q.total_amount, q.currency, 'TRY'), 0);
  const approvedCount = quotations.filter(q => q.status === 'approved' || q.status === 'production').length;
  const inProductionCount = quotations.filter(q => q.status === 'production').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
      
      {/* Notifications */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1100,
          background: notification.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
          border: `1px solid ${notification.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`,
          color: notification.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 500,
        }}>
          {notification.type === 'error' && <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('quotations')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('quotations_desc')}</p>
        </div>
        <button className="btn-primary" onClick={handleOpenWizard}>
          <Plus size={18} />
          {t('create_quotation')}
        </button>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--info-bg)', padding: '0.75rem', borderRadius: '8px', color: 'var(--info-color)' }}>
            <FileText size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('total_volume')}</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(totalVolumeTRY, 'TRY')}</h3>
          </div>
        </div>
        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--success-bg)', padding: '0.75rem', borderRadius: '8px', color: 'var(--success-color)' }}>
            <FileText size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('approved_volume')}</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{approvedCount}</h3>
          </div>
        </div>
        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--warning-bg)', padding: '0.75rem', borderRadius: '8px', color: 'var(--warning-color)' }}>
            <FileText size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('in_production_volume')}</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{inProductionCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Grid */}
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Yükleniyor...</div>
        ) : error ? (
          <div style={{ color: 'var(--danger-color)', padding: '1rem', border: '1px solid var(--danger-border)', borderRadius: '8px', background: 'var(--danger-bg)' }}>{error}</div>
        ) : (
          <div className="table-container">
            <table className="banking-table">
              <thead>
                <tr>
                  <th>{t('quotation_code')}</th>
                  <th>{t('quote_name')}</th>
                  <th>{t('customer_name')}</th>
                  <th>{t('amount')}</th>
                  <th>{t('status')}</th>
                  <th style={{ textAlign: 'right' }}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.length > 0 ? (
                  filteredQuotations.map(q => (
                    <tr 
                      key={q.id} 
                      onClick={() => setSelectedQuotation(q)} 
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--primary-color)', fontFamily: 'monospace' }}>{q.code}</td>
                      <td style={{ fontWeight: 500 }}>{q.name}</td>
                      <td>{getCustomerName(q.customer_id)}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(q.total_amount, q.currency)}</td>
                      <td>
                        <span className={`badge badge-${
                          q.status === 'approved' ? 'success' : q.status === 'production' ? 'success' : q.status === 'sent' ? 'info' : 'warning'
                        }`}>
                          {t(`status_${q.status}`)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn-secondary" 
                          onClick={(e) => handleDeleteQuotation(q.id, e)}
                          style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--danger-border)', color: 'var(--danger-color)' }}
                        >
                          <Trash2 size={14} />
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
        )}
      </div>

      {/* WIZARD BACKDROP OVERLAY */}
      {showWizard && (
        <div 
          onClick={() => setShowWizard(false)} 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 999,
          }}
        />
      )}

      {/* WIZARD SLIDING DRAWER */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: showWizard ? 0 : '-750px',
        width: '750px',
        height: '100vh',
        backgroundColor: 'var(--surface-color)',
        borderLeft: '1px solid var(--surface-border)',
        boxShadow: '-5px 0 25px rgba(0, 0, 0, 0.5)',
        transition: 'right 0.3s ease-in-out',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Wizard Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid var(--surface-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.01)',
        }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t('new_quotation_wizard')}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>BOM ve maliyet hesaplamalı elektrik panosu teklif sihirbazı</p>
          </div>
          <button 
            onClick={() => setShowWizard(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Wizard Body (Scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Metadata Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('quotation_code')}</label>
              <input 
                type="text" 
                className="form-control" 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('quote_name')}</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Örn: Siemens 1600A Dağıtım Panosu" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('select_customer')}</label>
              <select 
                className="form-control" 
                value={customerId} 
                onChange={(e) => setCustomerId(e.target.value)}
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id} style={{ background: 'var(--surface-color)' }}>{c.company_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('currency')}</label>
              <select 
                className="form-control" 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="TRY" style={{ background: 'var(--surface-color)' }}>TRY (₺)</option>
                <option value="EUR" style={{ background: 'var(--surface-color)' }}>EUR (€)</option>
                <option value="USD" style={{ background: 'var(--surface-color)' }}>USD ($)</option>
              </select>
            </div>
          </div>

          {/* BOM Section */}
          <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-color)' }}>{t('bom')}</h3>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={addWizardRow}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                <Plus size={14} />
                {t('add_row')}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {wizardItems.map((item, idx) => {
                return (
                  <div key={idx} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '3fr 1.2fr 1.5fr 40px', 
                    gap: '0.75rem', 
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '6px',
                    padding: '0.75rem'
                  }}>
                    {/* Component Selector */}
                    <div>
                      <select 
                        className="form-control"
                        value={item.product_id}
                        onChange={(e) => handleItemProductChange(idx, e.target.value)}
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id} style={{ background: 'var(--surface-color)' }}>
                            {p.code} - {p.name} ({formatCurrency(Number(p.list_price), p.currency)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <input 
                        type="number" 
                        step="any"
                        className="form-control"
                        value={item.quantity}
                        onChange={(e) => handleItemQtyChange(idx, parseFloat(e.target.value) || 0)}
                        placeholder={t('quantity')}
                      />
                    </div>

                    {/* Unit Price */}
                    <div>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="number" 
                          step="any"
                          className="form-control"
                          value={item.unit_price}
                          onChange={(e) => handleItemPriceChange(idx, parseFloat(e.target.value) || 0)}
                          style={{ paddingRight: '2.5rem' }}
                        />
                        <span style={{ 
                          position: 'absolute', 
                          right: '10px', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          fontWeight: 600
                        }}>{item.currency}</span>
                      </div>
                      {/* Sub-conversion text */}
                      {item.currency !== currency && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', textAlign: 'right' }}>
                          ≈ {formatCurrency(convertCurrency(item.unit_price, item.currency, currency), currency)}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <button 
                      type="button" 
                      onClick={() => removeWizardRow(idx)}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'var(--danger-color)', 
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing & Margin Calculations */}
          <div style={{ 
            borderTop: '1px solid var(--surface-border)', 
            paddingTop: '1.5rem', 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1.5rem',
            background: 'rgba(255, 255, 255, 0.005)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--surface-border)'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('labor_cost_input')} ({currency})</label>
              <input 
                type="number" 
                className="form-control" 
                value={laborCost} 
                onChange={(e) => setLaborCost(e.target.value)} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('profit_margin')}</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  className="form-control" 
                  value={marginPercentage} 
                  onChange={(e) => setMarginPercentage(e.target.value)} 
                  style={{ paddingRight: '2rem' }}
                />
                <span style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 600
                }}>%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wizard Footer / Cost Summary Card */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid var(--surface-border)',
          background: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {t('material_subtotal')}: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatCurrency(totals.materialSubtotal, currency)}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {t('labor_cost_input')}: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatCurrency(totals.labor, currency)}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Kâr Payı (%{marginPercentage}): <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatCurrency(totals.marginAmount, currency)}</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-color)', marginTop: '0.25rem' }}>
              {t('grand_total')}: {formatCurrency(totals.grandTotal, currency)}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-secondary" onClick={() => setShowWizard(false)}>{t('cancel')}</button>
            <button className="btn-primary" onClick={handleSaveQuotation}>{t('save')}</button>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL / DRAWER */}
      {selectedQuotation && (
        <div 
          onClick={() => setSelectedQuotation(null)} 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 999,
          }}
        />
      )}

      <div style={{
        position: 'fixed',
        top: 0,
        right: selectedQuotation ? 0 : '-650px',
        width: '650px',
        height: '100vh',
        backgroundColor: 'var(--surface-color)',
        borderLeft: '1px solid var(--surface-border)',
        boxShadow: '-5px 0 25px rgba(0, 0, 0, 0.5)',
        transition: 'right 0.3s ease-in-out',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Detail Header */}
        {selectedQuotation && (
          <>
            <div style={{
              padding: '1.5rem 2rem',
              borderBottom: '1px solid var(--surface-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.01)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-color)', fontSize: '1.1rem' }}>{selectedQuotation.code}</span>
                  <span className={`badge badge-${
                    selectedQuotation.status === 'approved' ? 'success' : selectedQuotation.status === 'production' ? 'success' : selectedQuotation.status === 'sent' ? 'info' : 'warning'
                  }`}>
                    {t(`status_${selectedQuotation.status}`)}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{selectedQuotation.name}</h2>
              </div>
              <button 
                onClick={() => setSelectedQuotation(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Detail Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Customer and Date Card */}
              <div className="card-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{t('customer_name')}</p>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{getCustomerName(selectedQuotation.customer_id)}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{t('date')}</p>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{new Date(selectedQuotation.created_at || Date.now()).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>

              {/* BOM Table */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--primary-color)' }}>{t('bom')} (Malzeme Listesi)</h3>
                <div className="table-container">
                  <table className="banking-table">
                    <thead>
                      <tr>
                        <th>{t('component')}</th>
                        <th style={{ textAlign: 'center' }}>{t('quantity')}</th>
                        <th style={{ textAlign: 'right' }}>{t('unit_price')}</th>
                        <th style={{ textAlign: 'right' }}>Satır Tutarı</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuotation.items && selectedQuotation.items.length > 0 ? (
                        selectedQuotation.items.map(item => {
                          const rowTotal = item.quantity * item.unit_price;
                          return (
                            <tr key={item.id}>
                              <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>{getProductName(item.product_id)}</td>
                              <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                              <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{formatCurrency(item.unit_price, item.currency)}</td>
                              <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'monospace' }}>{formatCurrency(rowTotal, item.currency)}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>BOM kalemleri bulunamadı.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Price Breakdown Card */}
              <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem', border: '1px solid var(--primary-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Malzeme Toplamı:</span>
                  <span style={{ fontWeight: 500 }}>{formatCurrency(selectedQuotation.total_amount / (1 + selectedQuotation.margin_percentage / 100) - selectedQuotation.labor_cost, selectedQuotation.currency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('labor_cost_input')}:</span>
                  <span style={{ fontWeight: 500 }}>{formatCurrency(selectedQuotation.labor_cost, selectedQuotation.currency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Kâr Payı (%{selectedQuotation.margin_percentage}):</span>
                  <span>{formatCurrency((selectedQuotation.total_amount / (1 + selectedQuotation.margin_percentage / 100)) * (selectedQuotation.margin_percentage / 100), selectedQuotation.currency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-color)' }}>{t('grand_total')}:</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{formatCurrency(selectedQuotation.total_amount, selectedQuotation.currency)}</span>
                </div>
              </div>
            </div>
            
            {/* Detail Footer */}
            <div style={{
              padding: '1.5rem 2rem',
              borderTop: '1px solid var(--surface-border)',
              background: 'rgba(0, 0, 0, 0.2)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button className="btn-secondary" onClick={() => setSelectedQuotation(null)}>Kapat</button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
