import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSimulation } from '../../context/SimulationContext';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../simulation/routes';
import { VEHICLES } from '../../simulation/vehicles';
import { formatClockTime } from '../../simulation/eta';
import MapView from '../../components/MapView';
import ETABadge from '../../components/ETABadge';

export default function DriverDashboard() {
  const { session } = useAuth();
  const { busStates, activeGpsVehicleId, startDriverGpsBroadcast, stopDriverGpsBroadcast, routeGeometries } = useSimulation();
  const { t } = useLanguage();
  const [showSOS, setShowSOS] = useState(false);

  const vehicleId = session?.vehicleId;
  const vehicle = VEHICLES.find(v => v.id === vehicleId);
  const busState = busStates[vehicleId];
  const route = (busState ? ROUTES.find(r => r.id === busState.routeId) : null) || ROUTES.find(r => r.id === vehicle?.routeId) || ROUTES[0];
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

  // Calculate live accurate GPS-tracked speed
  const baseSpeed = busState?.speed;
  const currentSpeed = Math.round(
    typeof baseSpeed === 'number' && baseSpeed >= 0
      ? baseSpeed
      : (route?.segmentSpeeds?.normal?.[0] || 35)
  );

  // Speed Status Evaluation
  let speedColor = 'var(--color-success)';
  let speedStatusLabel = 'Normal Cruising Speed';
  if (currentSpeed === 0) {
    speedColor = 'var(--color-warning)';
    speedStatusLabel = 'Bus Stopped / Station Dwell';
  } else if (currentSpeed < 18) {
    speedColor = '#3498db';
    speedStatusLabel = 'Station Approach Speed';
  } else if (currentSpeed > 75) {
    speedColor = 'var(--color-danger)';
    speedStatusLabel = 'Express High Speed';
  }

  // Start Route & Open Google Maps with all route stops included
  const handleStartRoute = () => {
    if (!isBroadcasting) {
      startDriverGpsBroadcast(vehicleId);
    }

    if (!route) return;

    // Origin, Destination & Intermediate Stops
    const originStr = route.origin;
    const destinationStr = route.destination;

    const intermediateStops = route.stops
      ?.slice(1, -1)
      ?.map(s => s.name)
      ?.filter(Boolean) || [];

    const waypointsParam = intermediateStops.length > 0 ? `&waypoints=${encodeURIComponent(intermediateStops.join('|'))}` : '';
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destinationStr)}${waypointsParam}&travelmode=driving`;

    window.open(googleMapsUrl, '_blank');
  };

  const busForMap = [{
    id: vehicle.id, lat: busState.lat, lng: busState.lng,
    heading: busState.heading, speed: currentSpeed, status: busState.status,
    registrationNo: vehicle.registrationNo,
  }];
  const routeForMap = route ? [{ id: route.id, waypoints: routeGeometries[route.id] || route.waypoints, color: route.color }] : [];

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

      {/* GPS Telemetry & Live Speed cards */}
      <div className="grid grid--4 mb-4">
        
        {/* GPS TELEMETRY & START ROUTE CARD */}
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <div className="stat-card__label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>GPS Telemetry & Navigation</span>
            <span className={`badge ${isBroadcasting ? 'badge--live' : 'badge--running'}`} style={{ fontSize: '0.65rem' }}>
              {isBroadcasting ? '● Live Broadcast Active' : '● Live GPS Tracking'}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
            <button
              onClick={handleStartRoute}
              className="btn btn--primary"
              style={{
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: 'var(--font-size-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              ▶ Start Route & Open Google Maps
            </button>

            {isBroadcasting && (
              <button
                className="btn btn--danger btn--sm"
                onClick={() => stopDriverGpsBroadcast(vehicleId)}
              >
                Stop Broadcast
              </button>
            )}
          </div>
        </div>

        {/* GPS TRACKED SPEED CARD (READ ONLY) */}
        <div className="stat-card">
          <div className="stat-card__label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>GPS Tracked Speed</span>
            <span style={{ fontSize: '0.65rem', color: speedColor, fontWeight: 700 }}>
              {speedStatusLabel}
            </span>
          </div>
          <div className="stat-card__value" style={{ color: speedColor, display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            {currentSpeed}
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400, color: 'var(--color-text-muted)' }}>
              {t('kmh')}
            </span>
          </div>
        </div>

        {/* LAST PING CARD */}
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
                <button className="btn btn--danger btn--sm">Report Breakdown</button>
                <button className="btn btn--danger btn--sm">Emergency SOS</button>
                <button className="btn btn--danger btn--sm">Road Blockage</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live map */}
      <div className="card mb-4">
        <div className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="card__title">Your Live Location</span>
          <button
            onClick={handleStartRoute}
            style={{ fontSize: 'var(--font-size-xs)', background: 'transparent', border: 'none', color: 'var(--color-primary)', fontWeight: 700, cursor: 'cursor' }}
          >
            Open Google Maps Route (All Stops)
          </button>
        </div>
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
        <div className="card__header"><span className="card__title">Upcoming Stops ({route?.name})</span></div>
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
