import { BrowserRouter, Routes, Route, NavLink, Link, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SimulationProvider } from './context/SimulationContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth, verifySessionIntegrity } from './context/AuthContext';
import LanguageToggle from './components/LanguageToggle';
import ToastContainer from './components/ToastContainer';
import { DashboardIcon, MapIcon, RouteIcon, ReportIcon, AlertIcon, StaffIcon } from './components/Icon';

// Login
import RoleLogin from './pages/RoleLogin';
import StaffLogin from './pages/StaffLogin';
import AdminLogin from './pages/AdminLogin';

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
import StaffRoster from './pages/admin/StaffRoster';

// Driver & Conductor pages
import DriverDashboard from './pages/driver/DriverDashboard';
import ConductorDashboard from './pages/conductor/ConductorDashboard';

/* ================================================================
 ROUTE GUARD — redirects to appropriate portal if unauthenticated
 ================================================================ */
function RequireRole({ allowedRoles, fallbackPath = '/login', children }) {
  const { session } = useAuth();
  if (!session || !verifySessionIntegrity(session)) return <Navigate to={fallbackPath} replace />;
  if (!allowedRoles.includes(session.role)) return <Navigate to={fallbackPath} replace />;
  return children || <Outlet />;
}

/* ================================================================
 CITIZEN LAYOUT
 ================================================================ */
function CitizenLayout() {
const { t } = useLanguage();
const { logout, role } = useAuth();
const [mobileNavOpen, setMobileNavOpen] = useState(false);

return (
<div className="app-layout">
  <header className="app-header">
    <Link to="/" className="app-header__logo">
      <img src="/hrtc-logo.svg" alt="HRTC Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
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
    </nav>

    <div className="app-header__actions">
      <LanguageToggle />
    </div>

    <button className="mobile-nav-toggle" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Menu">
      {mobileNavOpen ? 'X' : 'Menu'}
    </button>
  </header>

  {mobileNavOpen && (
    <>
      <div className="mobile-nav-overlay" onClick={() => setMobileNavOpen(false)} />
      <div className="mobile-nav-panel">
        <NavLink to="/" end className="app-header__nav-link" onClick={() => setMobileNavOpen(false)}>
           {t('navHome')}
        </NavLink>
        <NavLink to="/sms" className="app-header__nav-link" onClick={() => setMobileNavOpen(false)}>
           {t('navSMS')}
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

  <footer style={{
    marginTop: 'var(--space-8)',
    padding: 'var(--space-6) var(--space-4)',
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    textAlign: 'center',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-secondary)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
      <img src="/hrtc-logo.svg" alt="HRTC Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Himachal Road Transport Corporation</span>
    </div>
    <div>© 2025 Himachal Road Transport Corporation (HRTC). All Rights Reserved.</div>
    <div style={{ margin: '8px 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
      <span>Role Access Portals: </span>
      <Link to="/" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Passenger</Link> &nbsp;|&nbsp; 
      <Link to="/driver" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Driver</Link> &nbsp;|&nbsp; 
      <Link to="/conductor" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Conductor</Link> &nbsp;|&nbsp; 
      <Link to="/admin" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Executive Command</Link>
    </div>
    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
      Official Real-Time Passenger Telemetry & Vehicle Tracking System · Government of Himachal Pradesh
    </div>
  </footer>

  <ToastContainer />
</div>
);
}

/* ================================================================
 ADMIN LAYOUT
 ================================================================ */
function AdminLayout() {
const { t } = useLanguage();
const { logout, session } = useAuth();

return (
<div className="admin-layout">
  <header className="admin-header">
    <Link to="/admin" className="app-header__logo" style={{ textDecoration: 'none' }}>
      <img src="/hrtc-logo.svg" alt="HRTC Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
      <div>
        <div className="app-header__title">HRTC {t('navAdmin')}</div>
        <div className="app-header__subtitle">Logged in as: {session?.username}</div>
      </div>
    </Link>

    <nav className="app-header__nav">
      <button className="app-header__nav-link" onClick={logout} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit' }}>
         Logout
      </button>
    </nav>

    <div className="app-header__actions">
      <LanguageToggle />
    </div>

    <button className="mobile-nav-toggle" aria-label="Menu">Menu</button>
  </header>

  <div className="admin-body">
    <aside className="admin-sidebar">
      <NavLink to="/admin" end className={({isActive}) => `admin-sidebar__link ${isActive ? 'active' : ''}`}>
        <DashboardIcon size={18} />
        {t('dashboard')}
      </NavLink>
      <NavLink to="/admin/fleet" className={({isActive}) => `admin-sidebar__link ${isActive ? 'active' : ''}`}>
        <MapIcon size={18} />
        {t('navFleetMap')}
      </NavLink>
      <NavLink to="/admin/routes" className={({isActive}) => `admin-sidebar__link ${isActive ? 'active' : ''}`}>
        <RouteIcon size={18} />
        {t('navRouteManager')}
      </NavLink>
      <NavLink to="/admin/reports" className={({isActive}) => `admin-sidebar__link ${isActive ? 'active' : ''}`}>
        <ReportIcon size={18} />
        {t('navReports')}
      </NavLink>
      <NavLink to="/admin/alerts" className={({isActive}) => `admin-sidebar__link ${isActive ? 'active' : ''}`}>
        <AlertIcon size={18} />
        {t('navAlerts')}
      </NavLink>
      <NavLink to="/admin/staff" className={({isActive}) => `admin-sidebar__link ${isActive ? 'active' : ''}`}>
        <StaffIcon size={18} />
        Staff Directory & Locations
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
 DRIVER LAYOUT
 ================================================================ */
function DriverLayout() {
const { logout, session } = useAuth();

return (
<div className="app-layout">
  <header className="app-header">
    <Link to="/driver" className="app-header__logo">
      <img src="/hrtc-logo.svg" alt="HRTC Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
      <div>
        <div className="app-header__title">HRTC Driver Panel</div>
        <div className="app-header__subtitle">{session?.name} — {session?.busNumber}</div>
      </div>
    </Link>
    <nav className="app-header__nav">
      <button className="app-header__nav-link" onClick={logout} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit' }}>
         Logout
      </button>
    </nav>
  </header>
  <main className="app-main">
    <Outlet />
  </main>
  <ToastContainer />
</div>
);
}

/* ================================================================
 CONDUCTOR LAYOUT
 ================================================================ */
function ConductorLayout() {
const { logout, session } = useAuth();

return (
<div className="app-layout">
  <header className="app-header">
    <Link to="/conductor" className="app-header__logo">
      <img src="/hrtc-logo.svg" alt="HRTC Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
      <div>
        <div className="app-header__title">HRTC Conductor Panel</div>
        <div className="app-header__subtitle">{session?.name} — {session?.busNumber}</div>
      </div>
    </Link>
    <nav className="app-header__nav">
      <button className="app-header__nav-link" onClick={logout} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit' }}>
         Logout
      </button>
    </nav>
  </header>
  <main className="app-main">
    <Outlet />
  </main>
  <ToastContainer />
</div>
);
}

/* ================================================================
 APP ROOT
 ================================================================ */
export default function App() {
useEffect(() => {
  let link = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = '/hrtc-logo.svg';
}, []);

return (
<LanguageProvider>
  <SimulationProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public passenger routes — accessible to all passengers & citizens */}
          <Route element={<CitizenLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/track/:busId" element={<LiveTrack />} />
            <Route path="/stop/:stopId" element={<StopDetail />} />
            <Route path="/route/:routeId" element={<RouteDetail />} />
            <Route path="/sms" element={<SMSDemo />} />
          </Route>

          {/* Dedicated Login Pages */}
          <Route path="/login" element={<RoleLogin />} />
          <Route path="/staff" element={<StaffLogin />} />
          <Route path="/admin-portal" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Driver routes — restricted to 'driver' role (fallback to /staff) */}
          <Route element={<RequireRole allowedRoles={['driver']} fallbackPath="/staff" />}>
            <Route path="/driver" element={<DriverLayout />}>
              <Route index element={<DriverDashboard />} />
            </Route>
          </Route>

          {/* Conductor routes — restricted to 'conductor' role (fallback to /staff) */}
          <Route element={<RequireRole allowedRoles={['conductor']} fallbackPath="/staff" />}>
            <Route path="/conductor" element={<ConductorLayout />}>
              <Route index element={<ConductorDashboard />} />
            </Route>
          </Route>

          {/* Admin routes — restricted to 'admin' role (fallback to /admin-portal) */}
          <Route element={<RequireRole allowedRoles={['admin']} fallbackPath="/admin-portal" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="fleet" element={<FleetMap />} />
              <Route path="routes" element={<RouteManager />} />
              <Route path="reports" element={<Reports />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="staff" element={<StaffRoster />} />
            </Route>
          </Route>

          {/* Catch-all: redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </SimulationProvider>
</LanguageProvider>
);
}
