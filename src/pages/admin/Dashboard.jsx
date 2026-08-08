import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../simulation/routes';
import { VEHICLES, getFleetEmissionsSummary, VEHICLE_STATUS } from '../../simulation/vehicles';
import MapView from '../../components/MapView';

export default function Dashboard() {
  const { busStates, anomalyLog } = useSimulation();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const all = Object.values(busStates);
    const running = all.filter(b => b.status === VEHICLE_STATUS.RUNNING).length;
    const delayed = all.filter(b => b.status === VEHICLE_STATUS.DELAYED).length;
    const breakdown = all.filter(b => b.status === VEHICLE_STATUS.BREAKDOWN).length;
    const signalLost = all.filter(b => b.isSignalLost).length;
    const onTime = all.length > 0 ? Math.round(((running) / all.length) * 100) : 0;
    return { total: all.length, running, delayed, breakdown, signalLost, onTime };
  }, [busStates]);

  const emissionsSummary = getFleetEmissionsSummary();

  const recentAlerts = anomalyLog.filter(a => a.status !== 'resolved').slice(0, 5);

  const busesForMap = useMemo(() =>
    Object.values(busStates).map(bs => {
      const vehicle = VEHICLES.find(v => v.id === bs.vehicleId);
      return {
        id: bs.vehicleId, lat: bs.lat, lng: bs.lng,
        heading: bs.heading, speed: bs.speed, status: bs.status,
        registrationNo: vehicle?.registrationNo,
      };
    }), [busStates]);

  const routesForMap = ROUTES.map(r => ({ id: r.id, waypoints: r.waypoints, color: r.color }));

  return (
    <div>
      <h1 className="page-title">{t('dashboard')}</h1>

      {/* Stat cards */}
      <div className="grid grid--4 mb-6">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--info">🚌</div>
          <div className="stat-card__label">{t('totalBuses')}</div>
          <div className="stat-card__value stat-card__value--info">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--success">📊</div>
          <div className="stat-card__label">{t('onTimePerformance')}</div>
          <div className="stat-card__value stat-card__value--success">{stats.onTime}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--warning">📡</div>
          <div className="stat-card__label">{t('signalLostCount')}</div>
          <div className="stat-card__value stat-card__value--warning">{stats.signalLost}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--success">🌿</div>
          <div className="stat-card__label">{t('cleanFleetPercent')}</div>
          <div className="stat-card__value stat-card__value--success">{emissionsSummary.cleanPercentage}%</div>
        </div>
      </div>

      <div className="grid grid--2" style={{ gap: 'var(--space-6)' }}>
        {/* Mini fleet map */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">🗺️ {t('fleetOverview')}</span>
            <button className="btn btn--outline btn--sm" onClick={() => navigate('/admin/fleet')}>
              Full Map →
            </button>
          </div>
          <MapView
            center={[31.5, 77.0]}
            zoom={8}
            buses={busesForMap}
            routes={routesForMap}
            className="map-container"
            onBusClick={(bus) => navigate(`/track/${bus.id}`)}
          />
        </div>

        {/* Recent alerts */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">🔔 {t('recentAlerts')}</span>
            <button className="btn btn--outline btn--sm" onClick={() => navigate('/admin/alerts')}>
              View All →
            </button>
          </div>
          <div className="card__body">
            {recentAlerts.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: 'var(--space-6)' }}>
                No active alerts
              </div>
            ) : (
              <div className="alert-list">
                {recentAlerts.map(alert => (
                  <div key={alert.id} className={`alert-item alert-item--${alert.status}`}>
                    <span className="alert-item__icon">
                      {alert.type === 'breakdown' ? '🛑' : alert.type === 'signal-lost' ? '📡' : '⏱️'}
                    </span>
                    <div className="alert-item__content">
                      <div className="alert-item__message">{alert.message}</div>
                      <div className="alert-item__time">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                        <span className={`badge badge--${alert.status}`} style={{ marginLeft: 'var(--space-2)' }}>
                          {t(alert.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fleet breakdown by status and fuel */}
      <div className="grid grid--2 mt-6" style={{ gap: 'var(--space-6)' }}>
        {/* Status breakdown */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">Bus Status Breakdown</span>
          </div>
          <div className="card__body">
            <div className="chart-bar-group">
              <div className="chart-bar">
                <span className="chart-bar__label">{t('running')}</span>
                <div className="chart-bar__track">
                  <div className="chart-bar__fill" style={{ width: `${(stats.running / stats.total) * 100}%`, background: 'var(--color-success)' }}>
                    {stats.running}
                  </div>
                </div>
              </div>
              <div className="chart-bar">
                <span className="chart-bar__label">{t('delayed')}</span>
                <div className="chart-bar__track">
                  <div className="chart-bar__fill" style={{ width: `${(stats.delayed / stats.total) * 100}%`, background: 'var(--color-warning)' }}>
                    {stats.delayed}
                  </div>
                </div>
              </div>
              <div className="chart-bar">
                <span className="chart-bar__label">{t('breakdown')}</span>
                <div className="chart-bar__track">
                  <div className="chart-bar__fill" style={{ width: `${(stats.breakdown / stats.total) * 100}%`, background: 'var(--color-danger)' }}>
                    {stats.breakdown}
                  </div>
                </div>
              </div>
              <div className="chart-bar">
                <span className="chart-bar__label">{t('signalLost')}</span>
                <div className="chart-bar__track">
                  <div className="chart-bar__fill" style={{ width: `${(stats.signalLost / stats.total) * 100}%`, background: 'var(--color-text-muted)' }}>
                    {stats.signalLost}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fuel type breakdown */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">Fleet by Fuel Type</span>
          </div>
          <div className="card__body">
            <div className="chart-bar-group">
              {Object.entries(emissionsSummary.byFuel).map(([fuel, count]) => (
                <div className="chart-bar" key={fuel}>
                  <span className="chart-bar__label">{fuel}</span>
                  <div className="chart-bar__track">
                    <div className="chart-bar__fill" style={{
                      width: `${(count / emissionsSummary.total) * 100}%`,
                      background: fuel === 'Electric' ? 'var(--color-electric)' :
                                  fuel === 'CNG' ? 'var(--color-cng)' :
                                  'var(--color-accent-light)',
                    }}>
                      {count} ({Math.round((count / emissionsSummary.total) * 100)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
