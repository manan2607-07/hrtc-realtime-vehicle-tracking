import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../simulation/routes';
import { VEHICLES, getVehicleCondition } from '../../simulation/vehicles';
import { formatETA, formatClockTime } from '../../simulation/eta';
import MapView from '../../components/MapView';
import SustainabilityBadge from '../../components/SustainabilityBadge';
import ETABadge from '../../components/ETABadge';

export default function LiveTrack() {
const { busId } = useParams();
const navigate = useNavigate();
const { busStates, addNotification, routeGeometries } = useSimulation();
const { t } = useLanguage();
const [notifySet, setNotifySet] = useState(false);
const [autoPan, setAutoPan] = useState(true);
const [showSensorInfo, setShowSensorInfo] = useState(false);

const busState = busStates[busId];
const vehicle = VEHICLES.find(v => v.id === busId);
const route = ROUTES.find(r => r.id === busState?.routeId);

// Ping age for display
const pingAge = useMemo(() => {
  if (!busState?.lastPingTime) return null;
  const age = Math.round((Date.now() - busState.lastPingTime) / 1000);
  return age;
}, [busState?.lastPingTime, busStates]);

if (!busState || !vehicle || !route) {
  return (
    <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
      <h2>Bus not found</h2>
      <p className="text-muted">This bus may not be active right now.</p>
      <button className="btn btn--primary mt-4" onClick={() => navigate('/')}>← Back to Home</button>
    </div>
  );
}

const nextEta = busState.etas?.[0];
const isSignalLost = busState.isSignalLost;

// Map data
const busForMap = [{
  id: busState.vehicleId,
  lat: busState.lat,
  lng: busState.lng,
  heading: busState.heading,
  speed: busState.speed,
  status: busState.status,
  busNumber: vehicle.busNumber,
  registrationNo: vehicle.registrationNo,
  serviceClass: vehicle.serviceClass,
  driverName: vehicle.driver?.name,
  routeName: route.name,
  routeColor: route.color,
}];

const routeForMap = [{
  id: route.id,
  waypoints: routeGeometries[route.id] || route.waypoints,
  color: route.color,
}];

const stopsForMap = route.stops.map(s => ({
  ...s,
  isNext: s.id === nextEta?.stopId,
}));

const handleNotify = () => {
  setNotifySet(true);
  addNotification({
    type: 'success',
    title: t('notificationSet'),
    message: `${vehicle.busNumber} (${vehicle.registrationNo}) — ${route.name}`,
  });
};

return (
  <div>
    {/* Signal lost banner */}
    {isSignalLost && (
      <div className="signal-lost-banner">
        <span></span>
        <span>{t('estimateWarning')}</span>
        <span style={{ marginLeft: 'auto', fontSize: 'var(--font-size-xs)' }}>
          {t('lastUpdated')}: {pingAge != null ? (pingAge < 60 ? `${pingAge}${t('secondsAgo')}` : `${Math.round(pingAge / 60)}${t('minutesAgo')}`) : '—'}
        </span>
      </div>
    )}

    {/* Bus info header */}
    <div className="flex flex--between flex--center flex--wrap mb-4" style={{ gap: 'var(--space-4)' }}>
      <div>
        <button className="btn btn--ghost" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-2)' }}>
          ← Back
        </button>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{
            background: route.color,
            color: 'white',
            padding: '4px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-md)',
            fontWeight: 700,
          }}>
            Route {route.routeNo}
          </span>
          <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>{vehicle.registrationNo}</span>
          <span style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            ({vehicle.busNumber})
          </span>
        </h1>
        <div className="flex flex--gap-2 flex--wrap mt-4" style={{ marginTop: 'var(--space-2)' }}>
          <SustainabilityBadge fuelType={vehicle.fuelType} emissionStandard={vehicle.emissionStandard} />
          <span className={`badge badge--${busState.status}`}>
            {busState.status === 'running' ? '● ' + t('running') :
             busState.status === 'delayed' ? '◐ ' + t('delayed') :
             busState.status === 'breakdown' ? '⊘ ' + t('breakdown') :
             '◌ ' + t('signalLost')}
          </span>
          {vehicle.brandName && (
            <span className="badge" style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}>
              {vehicle.brandName}
            </span>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        {nextEta && (
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{t('nextStop')}</div>
            <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: '4px' }}>{nextEta.stopName}</div>
            <div style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 800,
              color: busState.status === 'delayed' ? '#D4A017' : 'var(--color-success)'
            }}>
              {formatETA(nextEta.etaMinutes)}
            </div>
            <ETABadge etaMinutes={nextEta.etaMinutes} confidence={nextEta.confidence} busStatus={busState.status} />
          </div>
        )}
        <div className="flex flex--gap-2 mt-4" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
          <button
            className={`btn ${notifySet ? 'btn--success' : 'btn--outline'} btn--sm`}
            onClick={handleNotify}
            disabled={notifySet}
          >
             {notifySet ? t('notificationSet').split('!')[0] : t('notifyMe')}
          </button>
        </div>
      </div>
    </div>

    {/* Driver, Crew & Terrain Telemetry */}
    <div className="grid grid--4 mb-4">
      <div className="stat-card">
        <div className="stat-card__label">Driver & Conductor Details</div>
        <div className="mt-1">
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
            Driver: {vehicle.driver?.name}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Phone:{' '}
            <a
              href={`tel:${vehicle.driver?.phone?.replace(/[^0-9+]/g, '')}`}
              style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline' }}
            >
              {vehicle.driver?.phone}
            </a>
          </div>
          {vehicle.driver?.conductor && (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Cond: {vehicle.driver.conductor.name} ({vehicle.driver.conductor.phone})
            </div>
          )}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card__label">Speed & Terrain Cap</div>
        <div className="stat-card__value">{Math.round(busState.speed || 0)} <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400 }}>{t('kmh')}</span></div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          {vehicle.serviceClass || 'HRTC Service'}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card__label">Altitude</div>
        <div className="stat-card__value" style={{ color: '#0d9488', fontSize: 'var(--font-size-xl)' }}>
          {busState.elevationMeters || 1500} <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>meters</span>
        </div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          Height Above Sea Level
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card__label">{t('lastUpdated')}</div>
        <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: isSignalLost ? 'var(--color-warning)' : 'var(--color-success)' }}>
          {pingAge != null ? (pingAge < 60 ? `${pingAge}${t('secondsAgo')}` : `${Math.round(pingAge / 60)}${t('minutesAgo')}`) : '—'}
        </div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          Real GPS Telemetry
        </div>
      </div>
    </div>

    {/* Vehicle Condition & Mechanical Health Telemetry */}
    {(() => {
      const condition = getVehicleCondition(vehicle, busState);
      if (!condition) return null;
      return (
        <div className="card mb-4" style={{ padding: 'var(--space-4) var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border-light)', paddingBottom: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🔧</span>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-text)' }}>
                Vehicle Condition & Health Telemetry
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn btn--outline btn--sm"
                style={{ fontSize: 'var(--font-size-xs)', padding: '2px 8px' }}
                onClick={() => setShowSensorInfo(!showSensorInfo)}
              >
                📡 How Sensors Work
              </button>
              <span className="badge" style={{ background: condition.healthScore > 90 ? '#e8f5e9' : condition.healthScore > 75 ? '#fff3e0' : '#ffebee', color: condition.healthScore > 90 ? '#2e7d32' : condition.healthScore > 75 ? '#e65100' : '#c62828', fontWeight: 700 }}>
                ● {condition.healthLabel} ({condition.healthScore}%)
              </span>
            </div>
          </div>

          {showSensorInfo && (
            <div style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-info-bg)', border: '1px solid var(--color-info)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text)' }}>
              <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--color-info)' }}>📡 Live Telemetry & Sensor Architecture (AIS-140 Standard):</div>
              <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: 1.5 }}>
                <li><strong>CAN-Bus (SAE J1939 OBD-II)</strong>: Plugs into engine ECU to stream Coolant Temp (°C), RPM, Fuel/Battery %, and Brake Diagnostics.</li>
                <li><strong>Wireless TPMS Sensors</strong>: Bluetooth/RF pressure sensors mounted inside all 6 tyres send live PSI readings.</li>
                <li><strong>Dual 4G M2M Cellular Gateway</strong>: AIS-140 GPS module transmits diagnostic packets every 2s to HRTC Cloud.</li>
                <li><strong>Depot Morning Inspection</strong>: Pre-trip mechanical checks certified by Depot Engineers before dispatch.</li>
              </ul>
            </div>
          )}

          <div className="grid grid--4" style={{ gap: 'var(--space-3)' }}>
            <div style={{ background: 'var(--color-background-alt)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{condition.isEV ? 'Battery Charge' : 'Fuel Level'}</div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>{condition.fuelLevel}</div>
              <div style={{ width: '100%', height: '6px', background: '#cbd5e1', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${condition.fuelPercent}%`, height: '100%', background: condition.isEV ? '#10b981' : '#3b82f6', borderRadius: '3px' }}></div>
              </div>
            </div>

            <div style={{ background: 'var(--color-background-alt)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Engine / Motor Temp</div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: '#0d9488', marginTop: '2px' }}>{condition.engineTemp}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Brakes: {condition.brakeHealth}</div>
            </div>

            <div style={{ background: 'var(--color-background-alt)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Cabin & Tyres</div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>AC Temp: {condition.cabinTemp}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Tyre Pressure: {condition.tyrePressure}</div>
            </div>

            <div style={{ background: 'var(--color-background-alt)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Depot Inspection & RTO</div>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: '#15803d', marginTop: '2px' }}>{condition.lastInspection}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Fitness Cert: {condition.fitnessValidUntil}</div>
            </div>
          </div>
        </div>
      );
    })()}

    {/* Map */}
    <div className="card mb-6">
      <MapView
        center={[busState.lat, busState.lng]}
        zoom={14}
        buses={busForMap}
        routes={routeForMap}
        stops={stopsForMap}
        selectedBusId={busId}
        trackBus={autoPan}
        className="map-container"
      />
    </div>

    {/* Upcoming stops timeline with Arrival, Halt & Departure Times */}
    <div className="card">
      <div className="card__header">
        <span className="card__title"> {t('upcomingStops')} — Schedule & Live Arrival Times</span>
        <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
          {route.origin} → {route.destination}
        </span>
      </div>
      <div className="card__body">
        <div className="stop-timeline">
          {busState.etas?.map((eta, idx) => (
            <div
              key={eta.stopId}
              className="stop-timeline__item"
              style={{ cursor: 'pointer', padding: 'var(--space-3) 0' }}
              onClick={() => navigate(`/stop/${eta.stopId}`)}
            >
              <div className={`stop-timeline__dot ${idx === 0 ? 'stop-timeline__dot--next' : ''}`} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                  {eta.stopName}
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>
                    ({eta.stopCode})
                  </span>
                </div>
                {/* Arrival, Halt & Departure details */}
                <div className="flex flex--gap-4 mt-1" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  <span>Arrival: <strong>{formatClockTime(eta.arrivalTime)}</strong></span>
                  <span>Halt: <strong>{eta.haltMinutes} min</strong></span>
                  <span>Departure: <strong>{formatClockTime(eta.departureTime)}</strong></span>
                </div>
              </div>
              <div className="stop-timeline__eta" style={{ textAlign: 'right' }}>
                <ETABadge etaMinutes={eta.etaMinutes} confidence={eta.confidence} showLabel={false} />
              </div>
            </div>
          ))}
          {(!busState.etas || busState.etas.length === 0) && (
            <div className="text-muted text-center" style={{ padding: 'var(--space-6)' }}>
              No upcoming stops — bus may be at the terminus
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
}
