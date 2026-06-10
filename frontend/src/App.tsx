import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, Package, FileText, Settings as SettingsIcon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Crm from './pages/Crm';
import Products from './pages/Products';
import Quotations from './pages/Quotations';
import Settings from './pages/Settings';

function Sidebar() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', background: 'var(--primary-color)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>P</div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--text-primary)' }}>{t('app_name')}</h2>
      </div>

      <nav style={{ flex: 1 }}>
        <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <LayoutDashboard size={18} />
          <span>{t('dashboard')}</span>
        </NavLink>
        <NavLink to="/crm" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <Users size={18} />
          <span>{t('crm')}</span>
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <Package size={18} />
          <span>{t('products')}</span>
        </NavLink>
        <NavLink to="/quotations" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <FileText size={18} />
          <span>{t('quotations')}</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <SettingsIcon size={18} />
          <span>{t('settings')}</span>
        </NavLink>
      </nav>

      <div className="language-selector">
        <button 
          className={`lang-btn ${i18n.language === 'tr' ? 'active' : ''}`}
          onClick={() => changeLanguage('tr')}
        >
          TR
        </button>
        <button 
          className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
          onClick={() => changeLanguage('en')}
        >
          EN
        </button>
      </div>
    </aside>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/crm" element={<Crm />} />
            <Route path="/products" element={<Products />} />
            <Route path="/quotations" element={<Quotations />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

