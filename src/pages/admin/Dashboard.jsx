import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../simulation/routes';
import { VEHICLES, getFleetEmissionsSummary, VEHICLE_STATUS } from '../../simulation/vehicles';
import MapView from '../../components/MapView';
import { BusIcon, OnTimeIcon, SignalLostIcon, CleanFleetIcon, MapIcon, AlertIcon, StaffIcon } from '../../components/Icon';

export default function Dashboard() {
const { busStates, anomalyLog, reportBreakdown, resolveAnomaly, resolveAllAlerts } = useSimulation();
const { t } = useLanguage();
const navigate = useNavigate();

const [activeFilter, setActiveFilter] = useState('all');

const stats = useMemo(() => {
  const all = Object.values(busStates);
  const total = all.length;
  const running = all.filter(b => b.status === VEHICLE_STATUS.RUNNING).length;
  const delayed = all.filter(b => b.status === VEHICLE_STATUS.DELAYED).length;
  const breakdown = all.filter(b => b.status === VEHICLE_STATUS.BREAKDOWN).length;
  const signalLost = all.filter(b => b.isSignalLost || b.status === VEHICLE_STATUS.SIGNAL_LOST).length;
  const activeBuses = total - breakdown;
  const onTime = activeBuses > 0 ? Math.round((running / activeBuses) * 100) : 0;
  return { total, activeBuses, running, delayed, breakdown, signalLost, onTime };
}, [busStates]);

const emissionsSummary = getFleetEmissionsSummary();
const activeAlerts = anomalyLog.filter(a => a.status !== 'resolved');
const recentAlerts = activeAlerts.length > 0 ? activeAlerts.slice(0, 5) : anomalyLog.slice(0, 5);

const busesForMap = useMemo(() =>
  Object.values(busStates).map(bs => {
    const vehicle = VEHICLES.find(v => v.id === bs.vehicleId);
    const route = ROUTES.find(r => r.id === bs.routeId);
    return {
      id: bs.vehicleId,
      lat: bs.lat,
      lng: bs.lng,
      heading: bs.heading,
      speed: bs.speed,
      status: bs.status,
      busNumber: vehicle?.busNumber,
      registrationNo: vehicle?.registrationNo,
      serviceClass: vehicle?.serviceClass,
      driverName: vehicle?.driver?.name,
      routeName: route?.name,
      routeColor: route?.color,
    };
  }), [busStates]);

const routesForMap = ROUTES.map(r => ({ id: r.id, waypoints: r.waypoints, color: r.color }));

// Live telemetry feed list
const liveTelemetryList = useMemo(() => {
  return Object.values(busStates)
    .filter(bs => {
      if (activeFilter === 'running') return bs.status === 'running';
      if (activeFilter === 'delayed') return bs.status === 'delayed';
      if (activeFilter === 'breakdown') return bs.status === 'breakdown';
      if (activeFilter === 'signal-lost') return bs.isSignalLost;
      return true;
    })
    .map(bs => {
      const vehicle = VEHICLES.find(v => v.id === bs.vehicleId);
      const route = ROUTES.find(r => r.id === bs.routeId);
      return {
        ...bs,
        vehicle,
        route,
      };
    });
}, [busStates, activeFilter]);

return (
  <div>
    <div className="mb-6">
      <h1 className="page-title" style={{ margin: 0 }}>HRTC Executive Operations & Live Telemetry Control</h1>
      <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
        Super Admin Override Hub — Real-Time Fleet Feed, Driver & Conductor Dispatch Oversight
      </p>
      <div className="flex flex--gap-2" style={{ marginTop: 'var(--space-3)' }}>
        <button className="btn btn--primary btn--sm flex flex--align-center flex--gap-2" onClick={() => navigate('/admin/staff')}>
          <StaffIcon size={16} />
          Staff Directory & Locations
        </button>
        <button className="btn btn--outline btn--sm flex flex--align-center flex--gap-2" onClick={() => navigate('/admin/fleet')}>
          <MapIcon size={16} />
          Fleet Map
        </button>
      </div>
    </div>

    {/* Stat cards */}
    <div className="grid grid--4 mb-6">
      <div className="stat-card">
        <div className="stat-card__icon stat-card__icon--info">
          <BusIcon size={20} color="var(--color-info)" />
        </div>
        <div className="stat-card__label">{t('totalBuses')}</div>
        <div className="stat-card__value stat-card__value--info">{stats.activeBuses}</div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          {stats.running} Running · {stats.delayed} Delayed ({stats.total} Total)
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-card__icon stat-card__icon--success">
          <OnTimeIcon size={20} color="var(--color-success)" />
        </div>
        <div className="stat-card__label">{t('onTimePerformance')}</div>
        <div className="stat-card__value stat-card__value--success">{stats.onTime}%</div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          {stats.running} of {stats.activeBuses} buses on schedule
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-card__icon stat-card__icon--warning">
          <SignalLostIcon size={20} color="var(--color-warning)" />
        </div>
        <div className="stat-card__label">{t('signalLostCount')}</div>
        <div className="stat-card__value stat-card__value--warning">{stats.signalLost}</div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          {stats.signalLost === 0 ? 'All GPS feeds online' : `${stats.signalLost} in mountain/tunnel zones`}
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-card__icon stat-card__icon--success">
          <CleanFleetIcon size={20} color="var(--color-success)" />
        </div>
        <div className="stat-card__label">{t('cleanFleetPercent')}</div>
        <div className="stat-card__value stat-card__value--success">{emissionsSummary.cleanPercentage}%</div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          {emissionsSummary.cleanCount} EV / CNG / BS-VI of {emissionsSummary.total} total
        </div>
      </div>
    </div>

    {/* Map & Recent Alerts */}
    <div className="grid grid--2 mb-6" style={{ gap: 'var(--space-6)' }}>
      {/* Mini fleet map */}
      <div className="card">
        <div className="card__header">
          <span className="card__title flex flex--align-center flex--gap-2">
            <MapIcon size={18} color="var(--color-accent)" />
            Live Fleet Tracking Map
          </span>
          <button className="btn btn--outline btn--sm" onClick={() => navigate('/admin/fleet')}>
            Full Screen Map →
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
          <span className="card__title flex flex--align-center flex--gap-2">
            <AlertIcon size={18} color="var(--color-warning)" />
            Real-Time Anomaly & Emergency Alerts
          </span>
          <div className="flex flex--gap-2">
            <button className="btn btn--outline btn--sm" onClick={resolveAllAlerts}>
              Auto-Resolve All
            </button>
            <button className="btn btn--outline btn--sm" onClick={() => navigate('/admin/alerts')}>
              View All Alerts →
            </button>
          </div>
        </div>
        <div className="card__body">
          {recentAlerts.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: 'var(--space-6)' }}>
               All systems normal — No active emergency alerts
            </div>
          ) : (
            <div className="alert-list">
              {recentAlerts.map(alert => (
                <div key={alert.id} className={`alert-item alert-item--${alert.status}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div className="alert-item__content">
                    <div className="alert-item__message">{alert.message}</div>
                    <div className="alert-item__time">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                      <span className={`badge badge--${alert.status}`} style={{ marginLeft: 'var(--space-2)' }}>
                        {t(alert.status)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn--success btn--sm"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', flexShrink: 0 }}
                    onClick={() => resolveAnomaly ? resolveAnomaly(alert.id) : resolveAlert(alert.id)}
                  >
                    Resolve & Fix
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* LIVE TELEMETRY STREAM CONSOLE */}
    <div className="card mb-6">
      <div className="card__header flex flex--between flex--align-center">
        <div>
          <span className="card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#2ECC71', animation: 'pulse-breakdown 1.5s infinite' }}></span>
            Live Telemetry Feed & Staff Operations Dispatch Console
          </span>
        </div>

        <div className="flex flex--gap-2">
          <button
            className={`btn btn--sm ${activeFilter === 'all' ? 'btn--primary' : 'btn--outline'}`}
            onClick={() => setActiveFilter('all')}
          >
            All ({stats.total})
          </button>
          <button
            className={`btn btn--sm ${activeFilter === 'running' ? 'btn--primary' : 'btn--outline'}`}
            onClick={() => setActiveFilter('running')}
          >
            Running ({stats.running})
          </button>
          <button
            className={`btn btn--sm ${activeFilter === 'delayed' ? 'btn--primary' : 'btn--outline'}`}
            onClick={() => setActiveFilter('delayed')}
          >
            Delayed ({stats.delayed})
          </button>
          <button
            className={`btn btn--sm ${activeFilter === 'breakdown' ? 'btn--primary' : 'btn--outline'}`}
            onClick={() => setActiveFilter('breakdown')}
          >
            Breakdown ({stats.breakdown})
          </button>
        </div>
      </div>

      <div className="card__body p-0" style={{ overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', fontSize: 'var(--font-size-xs)' }}>
          <thead>
            <tr>
              <th>Bus Number</th>
              <th>Route</th>
              <th>Driver Info</th>
              <th>Conductor Info</th>
              <th>Live Coordinates</th>
              <th>Speed & Heading</th>
              <th>Status</th>
              <th>Admin Actions</th>
            </tr>
          </thead>
          <tbody>
            {liveTelemetryList.map(item => (
              <tr key={item.vehicleId}>
                <td>
                  <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{item.vehicle?.busNumber}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>{item.vehicle?.registrationNo}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>Route {item.route?.routeNo}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>{item.route?.name}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>👨‍✈️ {item.vehicle?.driver?.name}</div>
                  <div style={{ fontFamily: 'monospace', color: 'var(--color-primary)', fontSize: '11px' }}>
                     {item.vehicle?.driver?.phone}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}> {item.vehicle?.conductor?.name}</div>
                  <div style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)', fontSize: '11px' }}>
                     {item.vehicle?.conductor?.phone}
                  </div>
                </td>
                <td>
                  <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {item.lat.toFixed(4)} N, {item.lng.toFixed(4)} E
                  </div>
                  <div style={{ color: item.isSignalLost ? 'var(--color-danger)' : 'var(--color-success)', fontSize: '11px' }}>
                    {item.isSignalLost ? '❌ Signal Lost' : ' Signal Strong'}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>{Math.round(item.speed || 0)} km/h</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Heading: {Math.round(item.heading || 0)}°</div>
                </td>
                <td>
                  <span className={`badge badge--${item.status}`}>
                    {t(item.status)}
                  </span>
                </td>
                <td>
                  <div className="flex flex--gap-1">
                    <button
                      className="btn btn--outline btn--sm"
                      style={{ padding: '2px 6px', fontSize: '11px' }}
                      onClick={() => navigate(`/track/${item.vehicleId}`)}
                    >
                      Track
                    </button>

                    {item.status === 'breakdown' ? (
                      <button
                        className="btn btn--sm"
                        style={{ padding: '2px 6px', fontSize: '11px', background: 'var(--color-success)', color: 'white', border: 'none' }}
                        onClick={() => resolveAnomaly(item.vehicleId)}
                      >
                        Resolve
                      </button>
                    ) : (
                      <button
                        className="btn btn--sm"
                        style={{ padding: '2px 6px', fontSize: '11px', background: 'var(--color-danger)', color: 'white', border: 'none' }}
                        onClick={() => reportBreakdown(item.vehicleId, `Admin simulated breakdown for ${item.vehicle?.busNumber}`)}
                      >
                        Breakdown
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Fleet breakdown by status and fuel */}
    <div className="grid grid--2" style={{ gap: 'var(--space-6)' }}>
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
