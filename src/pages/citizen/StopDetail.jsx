import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES, findRoutesForStop } from '../../simulation/routes';
import { VEHICLES } from '../../simulation/vehicles';
import MapView from '../../components/MapView';
import SustainabilityBadge from '../../components/SustainabilityBadge';
import ETABadge from '../../components/ETABadge';

export default function StopDetail() {
const { stopId } = useParams();
const navigate = useNavigate();
const { busStates } = useSimulation();
const { t } = useLanguage();

// Find the stop across all routes
const stop = useMemo(() => {
  for (const route of ROUTES) {
    const found = route.stops.find(s => s.id === stopId);
    if (found) return found;
  }
  return null;
}, [stopId]);

// Routes that pass through this stop
const routesThroughStop = useMemo(() => findRoutesForStop(stopId), [stopId]);

// Upcoming buses at this stop
const upcomingBuses = useMemo(() => {
  const buses = [];
  Object.values(busStates).forEach(bs => {
    const eta = bs.etas?.find(e => e.stopId === stopId);
    if (eta) {
      const vehicle = VEHICLES.find(v => v.id === bs.vehicleId);
      const route = ROUTES.find(r => r.id === bs.routeId);
      buses.push({
        ...bs,
        vehicle,
        route,
        eta,
      });
    }
  });
  // Sort by ETA
  buses.sort((a, b) => a.eta.etaMinutes - b.eta.etaMinutes);
  return buses;
}, [busStates, stopId]);

if (!stop) {
  return (
    <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
      <h2>Stop not found</h2>
      <button className="btn btn--primary mt-4" onClick={() => navigate('/')}>← Back to Home</button>
    </div>
  );
}

return (
  <div>
    <button className="btn btn--ghost mb-4" onClick={() => navigate(-1)}>← Back</button>

    <div className="flex flex--between flex--center flex--wrap mb-4" style={{ gap: 'var(--space-4)' }}>
      <div>
        <h1 className="page-title" style={{ marginBottom: 'var(--space-1)' }}> {stop.name}</h1>
        <p className="text-muted">
          {t('stopCode')}: <strong>{stop.code}</strong>
          {routesThroughStop.length > 0 && (
            <> · Routes: {routesThroughStop.map(r => r.routeNo).join(', ')}</>
          )}
        </p>
      </div>
      <div className="flex flex--gap-2">
        {routesThroughStop.map(r => (
          <button
            key={r.id}
            className="btn btn--outline btn--sm"
            onClick={() => navigate(`/route/${r.id}`)}
            style={{ borderColor: r.color, color: r.color }}
          >
            Route {r.routeNo}
          </button>
        ))}
      </div>
    </div>

    {/* Map showing stop */}
    <div className="card mb-6">
      <MapView
        center={[stop.lat, stop.lng]}
        zoom={15}
        stops={[{ ...stop, isNext: true }]}
        buses={upcomingBuses.map(b => ({
          id: b.vehicleId,
          lat: b.lat,
          lng: b.lng,
          heading: b.heading,
          speed: b.speed,
          status: b.status,
          registrationNo: b.vehicle?.registrationNo,
        }))}
        routes={routesThroughStop.map(r => ({ id: r.id, waypoints: r.waypoints, color: r.color }))}
        className="map-container"
        onBusClick={(bus) => navigate(`/track/${bus.id}`)}
      />
    </div>

    {/* Upcoming buses */}
    <h2 className="section-title">{t('upcomingBuses')}</h2>
    {upcomingBuses.length === 0 ? (
      <div className="card">
        <div className="card__body text-center text-muted" style={{ padding: 'var(--space-8)' }}>
          {t('noBuses')}
        </div>
      </div>
    ) : (
      <div className="bus-list">
        {upcomingBuses.map(bus => (
          <div
            key={bus.vehicleId}
            className="bus-item"
            onClick={() => navigate(`/track/${bus.vehicleId}`)}
          >
            <div className="bus-item__route-badge" style={{ background: bus.route?.color || '#888' }}>
              {bus.route?.routeNo || '?'}
            </div>
            <div className="bus-item__info">
              <div className="bus-item__reg">{bus.vehicle?.registrationNo}</div>
              <div className="bus-item__route-name">
                {bus.route?.name} — {bus.direction > 0 ? bus.route?.destination : bus.route?.origin}
              </div>
              <div className="bus-item__badges">
                <SustainabilityBadge fuelType={bus.vehicle?.fuelType} emissionStandard={bus.vehicle?.emissionStandard} />
                <span className={`badge badge--${bus.status}`}>
                  {bus.status === 'running' ? '●' : bus.status === 'delayed' ? '◐' : bus.status === 'breakdown' ? '⊘' : '◌'} {t(bus.status === 'signal-lost' ? 'signalLost' : bus.status)}
                </span>
              </div>
            </div>
            <div className="bus-item__eta">
              <ETABadge etaMinutes={bus.eta.etaMinutes} confidence={bus.eta.confidence} />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
}
