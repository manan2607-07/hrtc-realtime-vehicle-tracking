import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSimulation } from '../../context/SimulationContext';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../simulation/routes';
import { VEHICLES } from '../../simulation/vehicles';
import { formatETA, formatClockTime } from '../../simulation/eta';
import MapView from '../../components/MapView';
import ETABadge from '../../components/ETABadge';

export default function DriverDashboard() {
const { session } = useAuth();
const { busStates, activeGpsVehicleId, startDriverGpsBroadcast, stopDriverGpsBroadcast } = useSimulation();
const { t } = useLanguage();
const [showSOS, setShowSOS] = useState(false);

const vehicleId = session?.vehicleId;
const vehicle = VEHICLES.find(v => v.id === vehicleId);
const busState = busStates[vehicleId];
const route = busState ? ROUTES.find(r => r.id === busState.routeId) : null;
const isBroadcasting = activeGpsVehicleId === vehicleId;

const upcomingStops = useMemo(() => {
  return busState?.etas?.slice(0, 5) || [];
}, [busState?.etas]);

const pingAge = useMemo(() => {
  if (!busState?.lastPingTime) return null;
  return Math.round((Date.now() - busState.lastPingTime) / 1000);
}, [busState?.lastPingTime, busStates]);

if (!vehicle || !busState) {
  return (
    <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
      <h2>Bus data not available</h2>
      <p>Your assigned bus ({session?.busNumber}) is not currently in the tracking system.</p>
    </div>
  );
}

const busForMap = [{
  id: vehicle.id, lat: busState.lat, lng: busState.lng,
  heading: busState.heading, speed: busState.speed, status: busState.status,
  registrationNo: vehicle.registrationNo,
}];
const routeForMap = route ? [{ id: route.id, waypoints: route.waypoints, color: route.color }] : [];

return (
  <div>
    {/* Driver identity banner */}
    <div className="card mb-4">
      <div className="card__body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>On Duty — {vehicle.busNumber}</div>
          <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{vehicle.driver?.name}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
            {vehicle.serviceClass} · {vehicle.registrationNo} · License: {vehicle.driver?.licenseNo}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>Route {route?.routeNo}</div>
          <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>{route?.name}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>{route?.origin} → {route?.destination}</div>
        </div>
      </div>
    </div>

    {/* GPS & Speed cards */}
    <div className="grid grid--4 mb-4">
      <div className="stat-card" style={{ gridColumn: 'span 2' }}>
        <div className="stat-card__label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span> GPS Telemetry</span>
          <span className={`badge ${isBroadcasting ? 'badge--live' : 'badge--running'}`} style={{ fontSize: '0.65rem' }}>
            {isBroadcasting ? '● Phone GPS Active' : '● AIS-140 Hardware'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            className={`btn ${isBroadcasting ? 'btn--danger' : 'btn--primary'}`}
            onClick={() => {
              if (isBroadcasting) stopDriverGpsBroadcast(vehicleId);
              else startDriverGpsBroadcast(vehicleId);
            }}
          >
             {isBroadcasting ? 'Stop Phone GPS Broadcast' : 'Start Phone GPS Broadcast'}
          </button>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Device: {vehicle.ais140DeviceId}
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card__label">Speed</div>
        <div className="stat-card__value">{Math.round(busState.speed)} <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400 }}>{t('kmh')}</span></div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: busState.status === 'delayed' ? 'var(--color-warning)' : 'var(--color-success)' }}>
          {busState.status === 'running' ? 'On Schedule' : busState.status === 'delayed' ? `Delayed ~${busState.delayMinutes}m` : busState.status.toUpperCase()}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card__label">Last Ping</div>
        <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: busState.isSignalLost ? 'var(--color-warning)' : 'var(--color-success)' }}>
          {pingAge != null ? (pingAge < 60 ? `${pingAge}s ago` : `${Math.round(pingAge / 60)}m ago`) : '—'}
        </div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {busState.isSignalLost ? 'Signal Lost' : 'Connected'}
        </div>
      </div>
    </div>

    {/* Emergency SOS */}
    <div className="mb-4">
      <button
        className="btn btn--danger"
        style={{ width: '100%', padding: 'var(--space-3)', fontSize: 'var(--font-size-md)', fontWeight: 700 }}
        onClick={() => setShowSOS(!showSOS)}
      >
         {showSOS ? 'Cancel SOS' : 'Emergency SOS / Report Breakdown'}
      </button>
      {showSOS && (
        <div className="card mt-2" style={{ borderColor: 'var(--color-danger)' }}>
          <div className="card__body">
            <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>
              This will alert the HRTC Control Room with your current GPS location.
            </p>
            <div className="flex flex--gap-2">
              <button className="btn btn--danger btn--sm"> Report Breakdown</button>
              <button className="btn btn--danger btn--sm"> Emergency SOS</button>
              <button className="btn btn--danger btn--sm"> Road Blockage</button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Live map */}
    <div className="card mb-4">
      <div className="card__header"><span className="card__title"> Your Live Location</span></div>
      <div className="card__body" style={{ padding: 0 }}>
        <MapView
          buses={busForMap}
          routes={routeForMap}
          center={[busState.lat, busState.lng]}
          zoom={13}
          className="map-container"
        />
      </div>
    </div>

    {/* Upcoming stops timeline */}
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
  </div>
);
}
