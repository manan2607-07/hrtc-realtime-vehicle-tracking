import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../simulation/routes';
import { VEHICLES } from '../../simulation/vehicles';
import MapView from '../../components/MapView';
import SustainabilityBadge from '../../components/SustainabilityBadge';
import ETABadge from '../../components/ETABadge';

export default function RouteDetail() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const { busStates } = useSimulation();
  const { t } = useLanguage();

  const route = ROUTES.find(r => r.id === routeId);
  const routeVehicles = VEHICLES.filter(v => v.routeId === routeId);

  const activeBuses = useMemo(() =>
    Object.values(busStates).filter(b => b.routeId === routeId),
    [busStates, routeId]
  );

  if (!route) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <h2>Route not found</h2>
        <button className="btn btn--primary mt-4" onClick={() => navigate('/')}>← Back to Home</button>
      </div>
    );
  }

  const busesForMap = activeBuses.map(bs => {
    const vehicle = VEHICLES.find(v => v.id === bs.vehicleId);
    return {
      id: bs.vehicleId,
      lat: bs.lat,
      lng: bs.lng,
      heading: bs.heading,
      speed: bs.speed,
      status: bs.status,
      registrationNo: vehicle?.registrationNo,
    };
  });

  const routeForMap = [{ id: route.id, waypoints: route.waypoints, color: route.color }];
  const stopsForMap = route.stops.map(s => ({ ...s }));

  return (
    <div>
      <button className="btn btn--ghost mb-4" onClick={() => navigate(-1)}>← Back</button>

      <div className="flex flex--between flex--center flex--wrap mb-4" style={{ gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ background: route.color, color: 'white', padding: '4px 14px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-md)' }}>
              {route.routeNo}
            </span>
            {route.name}
          </h1>
          <p className="text-muted" style={{ marginTop: 'var(--space-2)' }}>
            {route.origin} → {route.destination}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid--4 mb-6">
        <div className="stat-card">
          <div className="stat-card__label">{t('distance')}</div>
          <div className="stat-card__value">{route.distanceKm} <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400 }}>{t('km')}</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">{t('typicalDuration')}</div>
          <div className="stat-card__value">{route.typicalDurationMin} <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400 }}>{t('min')}</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">{t('stops')}</div>
          <div className="stat-card__value">{route.stops.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">{t('activeBusesOnRoute')}</div>
          <div className="stat-card__value stat-card__value--success">{activeBuses.length}</div>
        </div>
      </div>

      {/* Map */}
      <div className="card mb-6">
        <MapView
          center={[route.waypoints[Math.floor(route.waypoints.length / 2)][0], route.waypoints[Math.floor(route.waypoints.length / 2)][1]]}
          zoom={route.distanceKm > 100 ? 8 : route.distanceKm > 20 ? 11 : 13}
          buses={busesForMap}
          routes={routeForMap}
          stops={stopsForMap}
          className="map-container"
          onBusClick={(bus) => navigate(`/track/${bus.id}`)}
          onStopClick={(stop) => navigate(`/stop/${stop.id}`)}
        />
      </div>

      <div className="grid grid--2" style={{ gap: 'var(--space-6)' }}>
        {/* Stop list */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">📍 {t('stops')} & {t('schedule')}</span>
          </div>
          <div className="card__body">
            <div className="stop-timeline">
              {route.stops.map((stop, idx) => (
                <div
                  key={stop.id}
                  className="stop-timeline__item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/stop/${stop.id}`)}
                >
                  <div className={`stop-timeline__dot ${idx === 0 ? 'stop-timeline__dot--active' : idx === route.stops.length - 1 ? 'stop-timeline__dot--active' : ''}`} />
                  <span className="stop-timeline__name">
                    {stop.name}
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>
                      ({stop.code})
                    </span>
                  </span>
                  <span className="stop-timeline__eta" style={{ color: 'var(--color-text-muted)' }}>
                    +{stop.scheduledMin} {t('min')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active buses */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">🚌 {t('activeBusesOnRoute')}</span>
          </div>
          <div className="card__body">
            {activeBuses.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: 'var(--space-6)' }}>
                {t('noBuses')}
              </div>
            ) : (
              <div className="bus-list">
                {activeBuses.map(bs => {
                  const vehicle = VEHICLES.find(v => v.id === bs.vehicleId);
                  const nextEta = bs.etas?.[0];
                  return (
                    <div
                      key={bs.vehicleId}
                      className="bus-item"
                      onClick={() => navigate(`/track/${bs.vehicleId}`)}
                      style={{ padding: 'var(--space-3)' }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{vehicle?.registrationNo}</div>
                        <div className="flex flex--gap-2 flex--wrap" style={{ marginTop: 'var(--space-1)' }}>
                          <SustainabilityBadge fuelType={vehicle?.fuelType} emissionStandard={vehicle?.emissionStandard} />
                          <span className={`badge badge--${bs.status}`} style={{ fontSize: 'var(--font-size-xs)' }}>
                            {bs.status}
                          </span>
                        </div>
                      </div>
                      {nextEta && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{nextEta.stopName}</div>
                          <ETABadge etaMinutes={nextEta.etaMinutes} confidence={nextEta.confidence} showLabel={false} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Fleet sustainability overview */}
          <div className="card__footer">
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
              Fleet on this route:
            </div>
            <div className="flex flex--gap-2 flex--wrap">
              {routeVehicles.map(v => (
                <SustainabilityBadge key={v.id} fuelType={v.fuelType} emissionStandard={v.emissionStandard} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
