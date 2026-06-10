import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Search, Plus, Trash2, AlertTriangle, X } from 'lucide-react';
import { productApi, type Product } from '../services/api';

export default function Products() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('0.00');
  const [newCurrency, setNewCurrency] = useState('TRY');
  const [formError, setFormError] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productApi.list();
      setProducts(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Could not load products from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku.trim() || !newName.trim()) {
      setFormError('Please fill in all fields');
      return;
    }
    
    try {
      await productApi.create({
        code: newSku.trim(),
        name: newName.trim(),
        list_price: parseFloat(newPrice) || 0,
        currency: newCurrency,
        is_active: true
      });
      
      // Reset & Reload
      setNewSku('');
      setNewName('');
      setNewPrice('0.00');
      setNewCurrency('TRY');
      setFormError('');
      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.detail || 'Error creating product.');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (window.confirm(`Are you sure you want to delete SKU: ${code}?`)) {
      try {
        await productApi.delete(id);
        loadProducts();
      } catch (err) {
        console.error(err);
        alert('Failed to delete product.');
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalProducts = products.length;
  const eurProducts = products.filter(p => p.currency === 'EUR').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            {t('products')}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('products_desc')}</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Yeni Ürün Ekle / Add Product
        </button>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--info-bg)', padding: '0.75rem', borderRadius: '8px', color: 'var(--info-color)' }}>
            <Package size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Toplam Ürün / Total Products</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalProducts}</h3>
          </div>
        </div>
        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--success-bg)', padding: '0.75rem', borderRadius: '8px', color: 'var(--success-color)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Dövizli Ürünler / FX Components</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{eurProducts} EUR</h3>
          </div>
        </div>
      </div>

      {/* Product List Panel */}
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

        {error && (
          <div style={{ color: 'var(--danger-color)', padding: '1rem', background: 'var(--danger-bg)', borderRadius: '6px', border: '1px solid var(--danger-border)' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Yükleniyor / Loading...
          </div>
        ) : (
          <div className="table-container">
            <table className="banking-table">
              <thead>
                <tr>
                  <th>{t('sku')}</th>
                  <th>{t('products')}</th>
                  <th>{t('unit_price')}</th>
                  <th>{t('status')}</th>
                  <th style={{ textAlign: 'right' }}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td style={{ fontWeight: 600, color: 'var(--primary-color)', fontFamily: 'monospace' }}>{product.code}</td>
                      <td>{product.name}</td>
                      <td style={{ fontWeight: 500 }}>
                        {product.currency === 'EUR' ? '€' : product.currency === 'USD' ? '$' : '₺'}
                        {typeof product.list_price === 'string' ? parseFloat(product.list_price).toFixed(2) : product.list_price.toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge badge-${product.is_active ? 'success' : 'danger'}`}>
                          {product.is_active ? t('active') : 'PASSIVE'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: 'var(--danger-color)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                          onClick={() => handleDelete(product.id, product.code)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      {t('no_data')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation Modal (Banking Dialog Style) */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div className="card-panel" style={{
            width: '100%',
            maxWidth: '480px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            backgroundColor: '#0a0d14',
            border: '1px solid var(--surface-border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Yeni Ürün Girişi / New Product</h3>
              <button 
                onClick={() => { setIsModalOpen(false); setFormError(''); }} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ color: 'var(--danger-color)', padding: '0.75rem', background: 'var(--danger-bg)', borderRadius: '6px', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Ürün Kodu (SKU) / Part Number *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newSku} 
                  onChange={(e) => setNewSku(e.target.value)} 
                  placeholder="örn. 3VA1225-4EF32"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Ürün Tanımı / Product Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="örn. Şalter 3P 250A"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Birim Fiyat / Price *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-control" 
                    value={newPrice} 
                    onChange={(e) => setNewPrice(e.target.value)} 
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Para Birimi *</label>
                  <select 
                    className="form-control" 
                    value={newCurrency} 
                    onChange={(e) => setNewCurrency(e.target.value)}
                  >
                    <option value="TRY">TRY (₺)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ flex: 1 }} 
                  onClick={() => { setIsModalOpen(false); setFormError(''); }}
                >
                  İptal / Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Kaydet / Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
