import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Public passenger landing page — /login
 * Only shows the "Enter as Passenger" option.
 * Driver/Conductor/Admin login is at /staff (not linked here).
 */
export default function RoleLogin() {
  const navigate = useNavigate();
  const { loginAsCustomer } = useAuth();

  const handleCustomer = () => {
    loginAsCustomer();
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-page__header">
        <div className="login-page__emblem">🏔️</div>
        <h1 className="login-page__title">HRTC Real-Time Vehicle Tracking</h1>
        <p className="login-page__subtitle">Himachal Road Transport Corporation</p>
      </div>

      <div className="login-page__roles" style={{ maxWidth: '400px' }}>
        <button
          className="role-card"
          style={{ '--role-color': '#1A5276' }}
          onClick={handleCustomer}
        >
          <div className="role-card__icon">👤</div>
          <div className="role-card__title">Passenger / Citizen</div>
          <div className="role-card__subtitle">Track buses, view ETAs, and plan your journey across Himachal Pradesh</div>
          <div className="role-card__action">Enter Bus Tracker →</div>
        </button>
      </div>

      <div className="login-page__footer">
        <p>© 2025 HRTC — Himachal Road Transport Corporation. All rights reserved.</p>
      </div>
    </div>
  );
}
