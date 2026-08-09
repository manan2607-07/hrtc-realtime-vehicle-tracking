import { BrowserRouter, Routes, Route, NavLink, Link, Navigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { SimulationProvider } from './context/SimulationContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LanguageToggle from './components/LanguageToggle';
import ToastContainer from './components/ToastContainer';

// Login
import RoleLogin from './pages/RoleLogin';
import StaffLogin from './pages/StaffLogin';

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

// Driver & Conductor pages
import DriverDashboard from './pages/driver/DriverDashboard';
import ConductorDashboard from './pages/conductor/ConductorDashboard';

/* ================================================================
 ROUTE GUARD — redirects to /login if role doesn't match
 ================================================================ */
function RequireRole({ allowedRoles, children }) {
const { session } = useAuth();
if (!session) return <Navigate to="/login" replace />;
if (!allowedRoles.includes(session.role)) return <Navigate to="/login" replace />;
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
        <div className="app-header__emblem"></div>
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
        <button className="app-header__nav-link" onClick={logout} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit' }}>
           Switch Role
        </button>
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
          <button className="app-header__nav-link" onClick={() => { setMobileNavOpen(false); logout(); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%' }}>
             Switch Role
          </button>
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
const { logout, session } = useAuth();

return (
  <div className="admin-layout">
    <header className="admin-header">
      <Link to="/admin" className="app-header__logo" style={{ textDecoration: 'none' }}>
        <div className="app-header__emblem" style={{ background: 'rgba(255,255,255,0.2)' }}></div>
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
          <span className="admin-sidebar__link-icon"></span>
          {t('dashboard')}
        </NavLink>
        <NavLink to="/admin/fleet" className={({isActive}) => `admin-sidebar__link ${isActive ? 'active' : ''}`}>
          <span className="admin-sidebar__link-icon"></span>
          {t('navFleetMap')}
        </NavLink>
        <NavLink to="/admin/routes" className={({isActive}) => `admin-sidebar__link ${isActive ? 'active' : ''}`}>
          <span className="admin-sidebar__link-icon"></span>
          {t('navRouteManager')}
        </NavLink>
        <NavLink to="/admin/reports" className={({isActive}) => `admin-sidebar__link ${isActive ? 'active' : ''}`}>
          <span className="admin-sidebar__link-icon"></span>
          {t('navReports')}
        </NavLink>
        <NavLink to="/admin/alerts" className={({isActive}) => `admin-sidebar__link ${isActive ? 'active' : ''}`}>
          <span className="admin-sidebar__link-icon"></span>
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
 DRIVER LAYOUT
 ================================================================ */
function DriverLayout() {
const { logout, session } = useAuth();

return (
  <div className="app-layout">
    <header className="app-header">
      <Link to="/driver" className="app-header__logo">
        <div className="app-header__emblem"></div>
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
        <div className="app-header__emblem"></div>
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
return (
  <LanguageProvider>
    <SimulationProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public passenger entry */}
            <Route path="/login" element={<RoleLogin />} />
            {/* Staff-only login — not linked from passenger page */}
            <Route path="/staff" element={<StaffLogin />} />

            {/* Customer routes — restricted to 'customer' role */}
            <Route element={<RequireRole allowedRoles={['customer']} />}>
              <Route element={<CitizenLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/track/:busId" element={<LiveTrack />} />
                <Route path="/stop/:stopId" element={<StopDetail />} />
                <Route path="/route/:routeId" element={<RouteDetail />} />
                <Route path="/sms" element={<SMSDemo />} />
              </Route>
            </Route>

            {/* Driver routes — restricted to 'driver' role */}
            <Route element={<RequireRole allowedRoles={['driver']} />}>
              <Route path="/driver" element={<DriverLayout />}>
                <Route index element={<DriverDashboard />} />
              </Route>
            </Route>

            {/* Conductor routes — restricted to 'conductor' role */}
            <Route element={<RequireRole allowedRoles={['conductor']} />}>
              <Route path="/conductor" element={<ConductorLayout />}>
                <Route index element={<ConductorDashboard />} />
              </Route>
            </Route>

            {/* Admin routes — restricted to 'admin' role */}
            <Route element={<RequireRole allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="fleet" element={<FleetMap />} />
                <Route path="routes" element={<RouteManager />} />
                <Route path="reports" element={<Reports />} />
                <Route path="alerts" element={<Alerts />} />
              </Route>
            </Route>

            {/* Catch-all: redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SimulationProvider>
  </LanguageProvider>
);
}
