import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSimulation } from '../../context/SimulationContext';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../simulation/routes';
import { VEHICLES } from '../../simulation/vehicles';
import { formatETA, formatClockTime } from '../../simulation/eta';
import ETABadge from '../../components/ETABadge';

export default function ConductorDashboard() {
  const { session } = useAuth();
  const { busStates } = useSimulation();
  const { t } = useLanguage();

  const [passengerCount, setPassengerCount] = useState(0);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [tripLog, setTripLog] = useState([]);

  const vehicleId = session?.vehicleId;
  const vehicle = VEHICLES.find(v => v.id === vehicleId);
  const busState = busStates[vehicleId];
  const route = busState ? ROUTES.find(r => r.id === busState.routeId) : null;

  const upcomingStops = useMemo(() => {
    return busState?.etas?.slice(0, 4) || [];
  }, [busState?.etas]);

  const currentStopName = upcomingStops[0]?.stopName || 'En Route';

  if (!vehicle || !busState) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <h2>Bus data not available</h2>
        <p>Your assigned bus ({session?.busNumber}) is not currently in the tracking system.</p>
      </div>
    );
  }

  const handleBoardPassenger = (ticketAmount) => {
    setPassengerCount(p => p + 1);
    setTicketsSold(t => t + 1);
    setRevenue(r => r + ticketAmount);
    setTripLog(log => [{
      type: 'board',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      stop: currentStopName,
      amount: ticketAmount,
    }, ...log].slice(0, 50));
  };

  const handleAlightPassenger = () => {
    if (passengerCount > 0) {
      setPassengerCount(p => p - 1);
      setTripLog(log => [{
        type: 'alight',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        stop: currentStopName,
        amount: 0,
      }, ...log].slice(0, 50));
    }
  };

  const occupancyPercent = Math.round((passengerCount / vehicle.capacity) * 100);
  const occupancyColor = occupancyPercent > 90 ? 'var(--color-danger)' : occupancyPercent > 70 ? 'var(--color-warning)' : 'var(--color-success)';

  return (
    <div>
      {/* Conductor identity banner */}
      <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #148F77, #1ABC9C)', color: 'white' }}>
        <div className="card__body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>On Duty — {vehicle.busNumber}</div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>🎫 {session?.name}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
              Conductor · Emp ID: {session?.empId} · Driver: {vehicle.driver?.name}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>Route {route?.routeNo}</div>
            <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>{route?.name}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>{route?.origin} → {route?.destination}</div>
          </div>
        </div>
      </div>

      {/* Occupancy & Revenue cards */}
      <div className="grid grid--4 mb-4">
        <div className="stat-card">
          <div className="stat-card__label">Passengers</div>
          <div className="stat-card__value" style={{ color: occupancyColor }}>{passengerCount}<span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400 }}>/{vehicle.capacity}</span></div>
          <div style={{ background: 'var(--color-background)', borderRadius: '4px', height: '8px', marginTop: 'var(--space-2)' }}>
            <div style={{ background: occupancyColor, width: `${Math.min(occupancyPercent, 100)}%`, height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {occupancyPercent}% Occupancy
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__label">Tickets Sold</div>
          <div className="stat-card__value">{ticketsSold}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__label">Revenue</div>
          <div className="stat-card__value">₹{revenue}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__label">Next Stop</div>
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{currentStopName}</div>
          {upcomingStops[0] && <ETABadge etaMinutes={upcomingStops[0].etaMinutes} confidence={upcomingStops[0].confidence} showLabel={false} />}
        </div>
      </div>

      {/* Quick ticket buttons */}
      <div className="card mb-4">
        <div className="card__header"><span className="card__title">🎫 Quick Ticket Counter</span></div>
        <div className="card__body">
          <div className="flex flex--gap-2 flex--wrap mb-3">
            <button className="btn btn--primary btn--sm" onClick={() => handleBoardPassenger(15)}>+ Board ₹15</button>
            <button className="btn btn--primary btn--sm" onClick={() => handleBoardPassenger(30)}>+ Board ₹30</button>
            <button className="btn btn--primary btn--sm" onClick={() => handleBoardPassenger(50)}>+ Board ₹50</button>
            <button className="btn btn--primary btn--sm" onClick={() => handleBoardPassenger(80)}>+ Board ₹80</button>
            <button className="btn btn--primary btn--sm" onClick={() => handleBoardPassenger(120)}>+ Board ₹120</button>
            <button className="btn btn--primary btn--sm" onClick={() => handleBoardPassenger(200)}>+ Board ₹200</button>
          </div>
          <button className="btn btn--outline btn--sm" onClick={handleAlightPassenger} disabled={passengerCount === 0}>
            − Passenger Alighted
          </button>
        </div>
      </div>

      {/* Upcoming stops */}
      <div className="card mb-4">
        <div className="card__header"><span className="card__title">Upcoming Stops</span></div>
        <div className="card__body">
          {upcomingStops.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: 'var(--space-4)' }}>No upcoming stops</div>
          ) : (
            <div className="stop-timeline">
              {upcomingStops.map((eta, i) => (
                <div key={eta.stopId} className="stop-timeline__item">
                  <div className="stop-timeline__dot" style={{ background: i === 0 ? 'var(--color-primary)' : 'var(--color-border)' }} />
                  <div className="stop-timeline__content" style={{ flex: 1 }}>
                    <span style={{ fontWeight: i === 0 ? 700 : 500 }}>{eta.stopName}</span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 'var(--font-size-xs)' }}>
                    <ETABadge etaMinutes={eta.etaMinutes} confidence={eta.confidence} showLabel={false} />
                    <div style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      Arr: {formatClockTime(eta.arrivalTime)} · Dep: {formatClockTime(eta.departureTime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trip Log */}
      <div className="card mb-4">
        <div className="card__header"><span className="card__title">📋 Trip Log ({tripLog.length} entries)</span></div>
        <div className="card__body">
          {tripLog.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: 'var(--space-4)' }}>No entries yet. Use the ticket counter above.</div>
          ) : (
            <div style={{ maxHeight: '250px', overflow: 'auto' }}>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Stop</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {tripLog.map((entry, i) => (
                    <tr key={i}>
                      <td>{entry.time}</td>
                      <td>
                        <span className={`badge badge--${entry.type === 'board' ? 'running' : 'delayed'}`} style={{ fontSize: 'var(--font-size-xs)' }}>
                          {entry.type === 'board' ? '↑ Board' : '↓ Alight'}
                        </span>
                      </td>
                      <td>{entry.stop}</td>
                      <td>{entry.amount > 0 ? `₹${entry.amount}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
