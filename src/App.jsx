import { BrowserRouter, Routes, Route, NavLink, Link, useLocation, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { SimulationProvider } from './context/SimulationContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import LanguageToggle from './components/LanguageToggle';
import ToastContainer from './components/ToastContainer';

// Citizen pages
import Home from './pages/citizen/Home';
import LiveTrack from './pages/citizen/LiveTrack';
import StopDetail from './pages/citizen/StopDetail';
import RouteDetail from './pages/citizen/RouteDetail';
import SMSDemo from './pages/citizen/SMSDemo';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import FleetMap from './pages/admin/FleetMap';
import RouteManager from './pages/admin/RouteManager';
import Reports from './pages/admin/Reports';
import Alerts from './pages/admin/Alerts';

/* ================================================================
   CITIZEN LAYOUT
   ================================================================ */
function CitizenLayout() {
  const { t } = useLanguage();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="app-layout">
      <header className="app-header">
        <Link to="/" className="app-header__logo">
          <div className="app-header__emblem">🚌</div>
          <div>
            <div className="app-header__title">{t('appName')}</div>
            <div className="app-header__subtitle">{t('appSubtitle')}</div>
          </div>
        </Link>

        <nav className="app-header__nav">
          <NavLink to="/" end className={({isActive}) => `app-header__nav-link ${isActive ? 'active' : ''}`}>
            {t('navHome')}
          </NavLink>
          <NavLink to="/sms" className={({isActive}) => `app-header__nav-link ${isActive ? 'active' : ''}`}>
            {t('navSMS')}
          </NavLink>
          <NavLink to="/admin" className={({isActive}) => `app-header__nav-link ${isActive ? 'active' : ''}`}>
            {t('navAdmin')}
          </NavLink>
        </nav>

        <div className="app-header__actions">
          <LanguageToggle />
        </div>

        {/* Mobile hamburger */}
        <button className="mobile-nav-toggle" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Menu">
          {mobileNavOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <>
          <div className="mobile-nav-overlay" onClick={() => setMobileNavOpen(false)} />
          <div className="mobile-nav-panel">
            <NavLink to="/" end className="app-header__nav-link" onClick={() => setMobileNavOpen(false)}>
              🏠 {t('navHome')}
            </NavLink>
            <NavLink to="/sms" className="app-header__nav-link" onClick={() => setMobileNavOpen(false)}>
              💬 {t('navSMS')}
            </NavLink>
            <NavLink to="/admin" className="app-header__nav-link" onClick={() => setMobileNavOpen(false)}>
              ⚙️ {t('navAdmin')}
            </NavLink>
            <div style={{ marginTop: 'auto', padding: 'var(--space-3)' }}>
              <LanguageToggle />
            </div>
          </div>
        </>
      )}

      <main className="app-main">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
}

/* ================================================================
   ADMIN LAYOUT
   ================================================================ */
function AdminLayout() {
  const { t } = useLanguage();

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <Link to="/admin" className="app-header__logo" style={{ textDecoration: 'none' }}>
          <div className="app-header__emblem" style={{ background: 'rgba(255,255,255,0.2)' }}>⚙️</div>
          <div>
            <div className="app-header__title">HRTC {t('navAdmin')}</div>
            <div className="app-header__subtitle">{t('appSubtitle')}</div>
          </div>
        </Link>

        <nav className="app-header__nav">
          <NavLink to="/" className="app-header__nav-link">
            ← {t('navHome')}
          </NavLink>
        </nav>

        <div className="app-header__actions">
          <LanguageToggle />
        </div>

        <button className="mobile-nav-toggle" aria-label="Menu">☰</button>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <NavLink to="/admin" end className={({isActive}) => `admin-sidebar__link ${isActive ? 'active' : ''}`}>
            <span className="admin-sidebar__link-icon">📊</span>
            {t('dashboard')}
          </NavLink>
          <NavLink to="/admin/fleet" className={({isActive}) => `admin-sidebar__link ${isActive ? 'active' : ''}`}>
            <span className="admin-sidebar__link-icon">🗺️</span>
            {t('navFleetMap')}
          </NavLink>
          <NavLink to="/admin/routes" className={({isActive}) => `admin-sidebar__link ${isActive ? 'active' : ''}`}>
            <span className="admin-sidebar__link-icon">🛣️</span>
            {t('navRouteManager')}
          </NavLink>
          <NavLink to="/admin/reports" className={({isActive}) => `admin-sidebar__link ${isActive ? 'active' : ''}`}>
            <span className="admin-sidebar__link-icon">📈</span>
            {t('navReports')}
          </NavLink>
          <NavLink to="/admin/alerts" className={({isActive}) => `admin-sidebar__link ${isActive ? 'active' : ''}`}>
            <span className="admin-sidebar__link-icon">🔔</span>
            {t('navAlerts')}
          </NavLink>
        </aside>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}

/* ================================================================
   APP ROOT
   ================================================================ */
export default function App() {
  return (
    <LanguageProvider>
      <SimulationProvider>
        <BrowserRouter>
          <Routes>
            {/* Citizen routes */}
            <Route element={<CitizenLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/track/:busId" element={<LiveTrack />} />
              <Route path="/stop/:stopId" element={<StopDetail />} />
              <Route path="/route/:routeId" element={<RouteDetail />} />
              <Route path="/sms" element={<SMSDemo />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="fleet" element={<FleetMap />} />
              <Route path="routes" element={<RouteManager />} />
              <Route path="reports" element={<Reports />} />
              <Route path="alerts" element={<Alerts />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SimulationProvider>
    </LanguageProvider>
  );
}
