import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Dedicated Admin Portal Login Page — /admin-portal or /admin/login
 * Exclusive portal for HRTC Departmental Officers, Depot Managers, and Administrators.
 */
export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginAsAdmin } = useAuth();

  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="login-page">
      <div className="login-page__header">
        <img src="/hrtc-logo.svg" alt="HRTC Logo" className="login-page__logo-img" />
        <h1 className="login-page__title" style={{ color: '#B22234' }}>
          HRTC Executive Admin Portal
        </h1>
        <p className="login-page__subtitle">
          Departmental Oversight, Fleet Command & Telemetry Management — Authorized Personnel Only
        </p>
      </div>

      <div className="login-page__form-container" style={{ display: 'block', maxWidth: '440px', margin: '0 auto' }}>
        <div className="login-form" style={{ '--role-color': '#B22234' }}>
          <div className="login-form__header">
            <h2 className="login-form__title" style={{ marginTop: '8px' }}>Admin Credential Verification</h2>
            <p className="login-form__desc">Enter your administrative username and secure passcode</p>
          </div>

          {error && (
            <div className="login-form__error">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLogin}>
            <div className="login-form__field">
              <label htmlFor="admin-username">Admin Username</label>
              <input
                id="admin-username"
                type="text"
                placeholder="e.g. admin"
                value={adminUser}
                onChange={e => setAdminUser(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="login-form__field">
              <label htmlFor="admin-passcode">Admin Passcode</label>
              <input
                id="admin-passcode"
                type="password"
                placeholder="Enter passcode (default: hrtc@2025)"
                value={adminPass}
                onChange={e => setAdminPass(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-form__submit" disabled={loading} style={{ background: '#B22234', color: '#FFF' }}>
              {loading ? 'Authenticating Admin Credentials...' : 'Authenticate & Access Fleet Control →'}
            </button>
          </form>

          <div style={{ marginTop: 'var(--space-4)', textAlign: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
            <button
              type="button"
              onClick={() => navigate('/staff')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ← Back to HRTC Bus Staff Portal (Drivers & Conductors)
            </button>
          </div>
        </div>
      </div>

      <div className="login-page__footer">
        <p>© 2025 Himachal Road Transport Corporation (HRTC). All Rights Reserved.</p>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Government of Himachal Pradesh — Restricted Administrative Access
        </p>
      </div>
    </div>
  );
}
