import { useSimulation } from '../context/SimulationContext';

/**
 * Toast notification container — shows real-time alerts
 */
export default function ToastContainer() {
  const { notifications, dismissNotification } = useSimulation();

  if (notifications.length === 0) return null;

  return (
    <div className="toast-container">
      {notifications.map(notif => (
        <div key={notif.id} className={`toast toast--${notif.type || 'info'}`}>
          <span className="toast__icon">
            {notif.type === 'success' ? '✅' :
             notif.type === 'warning' ? '⚠️' :
             notif.type === 'danger' ? '🚨' : 'ℹ️'}
          </span>
          <div className="toast__content">
            <div className="toast__title">{notif.title}</div>
            <div className="toast__message">{notif.message}</div>
          </div>
          <button className="toast__close" onClick={() => dismissNotification(notif.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}
