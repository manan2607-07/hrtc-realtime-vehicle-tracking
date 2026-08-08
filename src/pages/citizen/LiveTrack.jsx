import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../simulation/routes';
import { VEHICLES } from '../../simulation/vehicles';
import { formatETA } from '../../simulation/eta';
import MapView from '../../components/MapView';
import SustainabilityBadge from '../../components/SustainabilityBadge';
import ETABadge from '../../components/ETABadge';

export default function LiveTrack() {
  const { busId } = useParams();
  const navigate = useNavigate();
  const { busStates, addNotification } = useSimulation();
  const { t } = useLanguage();
  const [notifySet, setNotifySet] = useState(false);
  const [autoPan, setAutoPan] = useState(true);

  const busState = busStates[busId];
  const vehicle = VEHICLES.find(v => v.id === busId);
  const route = ROUTES.find(r => r.id === busState?.routeId);

  // Ping age for display
  const pingAge = useMemo(() => {
    if (!busState?.lastPingTime) return null;
    const age = Math.round((Date.now() - busState.lastPingTime) / 1000);
    return age;
  }, [busState?.lastPingTime, busStates]); // Re-evaluate on each tick

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
    registrationNo: vehicle.registrationNo,
  }];

  const routeForMap = [{
    id: route.id,
    waypoints: route.waypoints,
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
      message: `${vehicle.registrationNo} — ${route.name}`,
    });
  };

  return (
    <div>
      {/* Signal lost banner */}
      {isSignalLost && (
        <div className="signal-lost-banner">
          <span>⚠️</span>
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
              {route.routeNo}
            </span>
            {vehicle.registrationNo}
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
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: nextEta.etaMinutes < 2 ? 'var(--color-success)' : 'var(--color-text)' }}>
                {formatETA(nextEta.etaMinutes)}
              </div>
              <ETABadge etaMinutes={nextEta.etaMinutes} confidence={nextEta.confidence} />
            </div>
          )}
          <div className="flex flex--gap-2 mt-4" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
            <button
              className={`btn ${notifySet ? 'btn--success' : 'btn--outline'} btn--sm`}
              onClick={handleNotify}
              disabled={notifySet}
            >
              🔔 {notifySet ? '✓ ' + t('notificationSet').split('!')[0] : t('notifyMe')}
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="card mb-4">
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

      {/* Speed & status bar */}
      <div className="grid grid--4 mb-6">
        <div className="stat-card">
          <div className="stat-card__label">Speed</div>
          <div className="stat-card__value">{Math.round(busState.speed)} <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400 }}>{t('kmh')}</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">{t('finalDestination')}</div>
          <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>{busState.direction > 0 ? route.destination : route.origin}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">{t('fuelType')}</div>
          <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>{vehicle.fuelType}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">{t('lastUpdated')}</div>
          <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: isSignalLost ? 'var(--color-warning)' : 'var(--color-success)' }}>
            {pingAge != null ? (pingAge < 60 ? `${pingAge}${t('secondsAgo')}` : `${Math.round(pingAge / 60)}${t('minutesAgo')}`) : '—'}
          </div>
        </div>
      </div>

      {/* Upcoming stops timeline */}
      <div className="card">
        <div className="card__header">
          <span className="card__title">{t('upcomingStops')}</span>
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
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/stop/${eta.stopId}`)}
              >
                <div className={`stop-timeline__dot ${idx === 0 ? 'stop-timeline__dot--next' : ''}`} />
                <span className="stop-timeline__name">
                  {eta.stopName}
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>
                    ({eta.stopCode})
                  </span>
                </span>
                <span className="stop-timeline__eta">
                  <ETABadge etaMinutes={eta.etaMinutes} confidence={eta.confidence} showLabel={false} />
                </span>
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
