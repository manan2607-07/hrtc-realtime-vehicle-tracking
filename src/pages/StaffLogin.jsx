import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Staff-only login page — /staff
 * Only accessible via direct URL. NOT linked from the passenger page.
 * Handles Driver, Conductor, and Admin login with credential verification.
 */
export default function StaffLogin() {
  const navigate = useNavigate();
  const { loginAsDriver, loginAsConductor, loginAsAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState(null);
  const [empId, setEmpId] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDriverLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = loginAsDriver(empId);
      setLoading(false);
      if (result.valid) {
        navigate('/driver');
      } else {
        setError(result.error);
      }
    }, 600);
  };

  const handleConductorLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = loginAsConductor(empId);
      setLoading(false);
      if (result.valid) {
        navigate('/conductor');
      } else {
        setError(result.error);
      }
    }, 600);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = loginAsAdmin(adminUser, adminPass);
      setLoading(false);
      if (result.valid) {
        navigate('/admin');
      } else {
        setError(result.error);
      }
    }, 600);
  };

  const staffRoles = [
    {
      id: 'driver',
      icon: '🚌',
      title: 'HRTC Driver',
      subtitle: 'Access your assigned bus, GPS broadcast & trip status',
      color: '#2E86C1',
    },
    {
      id: 'conductor',
      icon: '🎫',
      title: 'HRTC Conductor',
      subtitle: 'Manage tickets, passenger count & trip log',
      color: '#148F77',
    },
    {
      id: 'admin',
      icon: '⚙️',
      title: 'HRTC Admin',
      subtitle: 'Fleet management, reports, alerts & full oversight',
      color: '#B22234',
    },
  ];

  return (
    <div className="login-page">
      <div className="login-page__header">
        <div className="login-page__emblem">🔒</div>
        <h1 className="login-page__title">HRTC Staff Portal</h1>
        <p className="login-page__subtitle">Authorized HRTC Personnel Only — Credential Verification Required</p>
      </div>

      {!activeTab ? (
        <div className="login-page__roles" style={{ maxWidth: '720px' }}>
          {staffRoles.map(card => (
            <button
              key={card.id}
              className="role-card"
              style={{ '--role-color': card.color }}
              onClick={() => {
                setActiveTab(card.id);
                setError('');
                setEmpId('');
                setAdminUser('');
                setAdminPass('');
              }}
            >
              <div className="role-card__icon">{card.icon}</div>
              <div className="role-card__title">{card.title}</div>
              <div className="role-card__subtitle">{card.subtitle}</div>
              <div className="role-card__action">Secure Login →</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="login-page__form-container">
          <button className="login-page__back" onClick={() => { setActiveTab(null); setError(''); }}>
            ← Back to role selection
          </button>

          <div className="login-form" style={{ '--role-color': staffRoles.find(r => r.id === activeTab)?.color }}>
            <div className="login-form__header">
              <span className="login-form__icon">{staffRoles.find(r => r.id === activeTab)?.icon}</span>
              <h2 className="login-form__title">{staffRoles.find(r => r.id === activeTab)?.title} Login</h2>
              <p className="login-form__desc">Credentials are verified against the HRTC Staff Database</p>
            </div>

            {error && (
              <div className="login-form__error">
                <span>⚠️</span> {error}
              </div>
            )}

            {activeTab === 'driver' && (
              <form onSubmit={handleDriverLogin}>
                <div className="login-form__field">
                  <label>HRTC Driver Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. HRTC-DRV-1984"
                    value={empId}
                    onChange={e => setEmpId(e.target.value)}
                    autoFocus
                    required
                  />
                  <span className="login-form__hint">Your ID is printed on your HRTC staff badge</span>
                </div>
                <button type="submit" className="login-form__submit" disabled={loading}>
                  {loading ? 'Verifying with HRTC Database...' : 'Verify & Login as Driver'}
                </button>
              </form>
            )}

            {activeTab === 'conductor' && (
              <form onSubmit={handleConductorLogin}>
                <div className="login-form__field">
                  <label>HRTC Conductor Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. HRTC-CND-3312"
                    value={empId}
                    onChange={e => setEmpId(e.target.value)}
                    autoFocus
                    required
                  />
                  <span className="login-form__hint">Your ID is printed on your HRTC staff badge</span>
                </div>
                <button type="submit" className="login-form__submit" disabled={loading}>
                  {loading ? 'Verifying with HRTC Database...' : 'Verify & Login as Conductor'}
                </button>
              </form>
            )}

            {activeTab === 'admin' && (
              <form onSubmit={handleAdminLogin}>
                <div className="login-form__field">
                  <label>Admin Username</label>
                  <input
                    type="text"
                    placeholder="e.g. admin"
                    value={adminUser}
                    onChange={e => setAdminUser(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <div className="login-form__field">
                  <label>Admin Passcode</label>
                  <input
                    type="password"
                    placeholder="Enter admin passcode"
                    value={adminPass}
                    onChange={e => setAdminPass(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="login-form__submit" disabled={loading}>
                  {loading ? 'Verifying Admin Access...' : 'Verify & Login as Admin'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="login-page__footer">
        <p>© 2025 HRTC — Himachal Road Transport Corporation. All rights reserved.</p>
        <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>Unauthorized access is a punishable offence under IT Act 2000</p>
      </div>
    </div>
  );
}
