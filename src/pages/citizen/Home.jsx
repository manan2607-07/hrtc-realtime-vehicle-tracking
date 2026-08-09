import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../simulation/routes';
import { VEHICLES } from '../../simulation/vehicles';
import MapView from '../../components/MapView';
import SustainabilityBadge from '../../components/SustainabilityBadge';
import ETABadge from '../../components/ETABadge';
import SeasonToggle from '../../components/SeasonToggle';

export default function Home() {
  const { busStates } = useSimulation();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Search logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const cleanDigits = searchQuery.replace(/\D/g, '');
    const results = [];

    // Search buses by Bus Number, Registration, Driver Name, or Driver Phone
    VEHICLES.forEach(vehicle => {
      const busNumMatch = vehicle.busNumber.toLowerCase().includes(q) || (cleanDigits && vehicle.busNumber.includes(cleanDigits));
      const regMatch = vehicle.registrationNo.toLowerCase().includes(q);
      const driverNameMatch = vehicle.driver?.name?.toLowerCase().includes(q);
      const cleanPhone = vehicle.driver?.phone ? vehicle.driver.phone.replace(/\D/g, '') : '';
      const driverPhoneMatch = cleanDigits && cleanDigits.length >= 3 && cleanPhone.includes(cleanDigits);

      if (busNumMatch || regMatch || driverNameMatch || driverPhoneMatch) {
        const route = ROUTES.find(r => r.id === vehicle.routeId);
        results.push({
          type: 'bus',
          data: {
            ...vehicle,
            routeNo: route?.routeNo,
            routeName: route?.name,
            matchedBy: driverPhoneMatch ? `Driver Phone: ${vehicle.driver?.phone}`
                     : driverNameMatch ? `Driver: ${vehicle.driver?.name}`
                     : busNumMatch ? `Bus Number: ${vehicle.busNumber}`
                     : `Reg: ${vehicle.registrationNo}`,
          }
        });
      }
    });

    // Search routes
    ROUTES.forEach(route => {
      if (
        route.name.toLowerCase().includes(q) ||
        route.routeNo.includes(q) ||
        route.origin.toLowerCase().includes(q) ||
        route.destination.toLowerCase().includes(q)
      ) {
        results.push({ type: 'route', data: route });
      }
    });

    // Search stops
    ROUTES.forEach(route => {
      route.stops.forEach(stop => {
        if (
          stop.name.toLowerCase().includes(q) ||
          stop.code.toLowerCase().includes(q)
        ) {
          if (!results.find(r => r.type === 'stop' && r.data.id === stop.id)) {
            results.push({ type: 'stop', data: { ...stop, routeId: route.id, routeNo: route.routeNo } });
          }
        }
      });
    });

    return results.slice(0, 8);
  }, [searchQuery]);

  // Active buses count per route
  const activeBusesByRoute = useMemo(() => {
    const counts = {};
    ROUTES.forEach(r => {
      counts[r.id] = Object.values(busStates).filter(b => b.routeId === r.id && b.status !== 'at-depot').length;
    });
    return counts;
  }, [busStates]);

  // Map data: all buses
  const allBusesForMap = useMemo(() =>
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
        registrationNo: vehicle?.registrationNo,
        routeColor: route?.color,
      };
    }), [busStates]);

  const allRoutesForMap = ROUTES.map(r => ({
    id: r.id,
    waypoints: r.waypoints,
    color: r.color,
  }));

  const handleResultClick = (result) => {
    if (result.type === 'bus') {
      navigate(`/track/${result.data.id}`);
    } else if (result.type === 'route') {
      navigate(`/route/${result.data.id}`);
    } else if (result.type === 'stop') {
      navigate(`/stop/${result.data.id}`);
    }
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <div>
      {/* Hero search */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)', paddingTop: 'var(--space-4)' }}>
        <h1 className="page-title" style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>
          {t('tagline')}
        </h1>
        <p className="text-muted mb-6" style={{ maxWidth: '500px', margin: '0 auto var(--space-6)' }}>
          {t('appSubtitle')}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ margin: 0 }}>
            <span className="search-bar__icon">🔍</span>
            <input
              className="search-bar__input"
              type="text"
              placeholder="Search by Bus # (e.g. 101), Driver Phone, Driver Name, Route..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              id="home-search-input"
            />
            {showResults && searchResults.length > 0 && (
              <div className="search-bar__results">
                {searchResults.map((result, i) => (
                  <div
                    key={`${result.type}-${result.data.id}-${i}`}
                    className="search-bar__result-item"
                    onClick={() => handleResultClick(result)}
                  >
                    <span>{result.type === 'bus' ? '📡' : result.type === 'route' ? '🚌' : '📍'}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                        {result.type === 'bus'
                          ? `${result.data.busNumber} (${result.data.registrationNo})`
                          : result.type === 'route'
                          ? `Route ${result.data.routeNo}: ${result.data.name}`
                          : result.data.name
                        }
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {result.type === 'bus'
                          ? `${result.data.matchedBy} · Rte ${result.data.routeNo}`
                          : result.type === 'route'
                          ? `${result.data.origin} → ${result.data.destination}`
                          : `Stop Code: ${result.data.code} · Route ${result.data.routeNo}`
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <SeasonToggle />
        </div>
      </div>

      {/* Overview map */}
      <div className="card mb-6">
        <MapView
          center={[31.5, 77.0]}
          zoom={8}
          buses={allBusesForMap}
          routes={allRoutesForMap}
          className="map-container"
          onBusClick={(bus) => navigate(`/track/${bus.id}`)}
        />
      </div>

      {/* Routes grid */}
      <h2 className="section-title">{t('allRoutes')}</h2>
      <div className="grid grid--3 mb-6">
        {ROUTES.map(route => (
          <div
            key={route.id}
            className="card card--clickable"
            onClick={() => navigate(`/route/${route.id}`)}
            id={`route-card-${route.id}`}
          >
            <div className="card__header" style={{ background: route.color, color: 'white' }}>
              <span style={{ fontWeight: 700 }}>Route {route.routeNo}</span>
              <span className="badge badge--running" style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}>
                {activeBusesByRoute[route.id] || 0} {t('activeBuses')}
              </span>
            </div>
            <div className="card__body">
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                {route.name}
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
                {route.origin} → {route.destination}
              </p>
              <div className="flex flex--gap-3" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                <span>📏 {route.distanceKm} {t('km')}</span>
                <span>🕐 ~{route.typicalDurationMin} {t('min')}</span>
                <span>📍 {route.stops.length} {t('stops')}</span>
              </div>
            </div>
            <div className="card__footer">
              <div className="flex flex--gap-2 flex--wrap">
                {VEHICLES.filter(v => v.routeId === route.id).slice(0, 3).map(v => (
                  <SustainabilityBadge key={v.id} fuelType={v.fuelType} emissionStandard={v.emissionStandard} />
                ))}
                {VEHICLES.filter(v => v.routeId === route.id).length > 3 && (
                  <span className="badge" style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
                    +{VEHICLES.filter(v => v.routeId === route.id).length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active buses list */}
      <h2 className="section-title">{t('activeBuses')}</h2>
      <div className="bus-list">
        {Object.values(busStates)
          .filter(bs => bs.status !== 'at-depot')
          .sort((a, b) => a.vehicleId.localeCompare(b.vehicleId))
          .slice(0, 8)
          .map(bs => {
            const vehicle = VEHICLES.find(v => v.id === bs.vehicleId);
            const route = ROUTES.find(r => r.id === bs.routeId);
            const nextEta = bs.etas?.[0];
            return (
              <div
                key={bs.vehicleId}
                className="bus-item"
                onClick={() => navigate(`/track/${bs.vehicleId}`)}
                id={`bus-item-${bs.vehicleId}`}
              >
                <div className="bus-item__route-badge" style={{ background: route?.color || '#888' }}>
                  {route?.routeNo || '?'}
                </div>
                <div className="bus-item__info">
                  <div className="bus-item__reg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{vehicle?.busNumber}</span>
                    <span>({vehicle?.registrationNo})</span>
                    {vehicle?.driver?.name && (
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                        👤 {vehicle.driver.name}
                      </span>
                    )}
                  </div>
                  <div className="bus-item__route-name">
                    {route?.name} · {route?.origin} → {route?.destination}
                  </div>
                  <div className="bus-item__badges">
                    <SustainabilityBadge fuelType={vehicle?.fuelType} emissionStandard={vehicle?.emissionStandard} />
                    <span className={`badge badge--${bs.status}`}>
                      {bs.status === 'running' ? '● ' + t('running') :
                       bs.status === 'delayed' ? '◐ ' + t('delayed') :
                       bs.status === 'breakdown' ? '⊘ ' + t('breakdown') :
                       '◌ ' + t('signalLost')}
                    </span>
                  </div>
                </div>
                <div className="bus-item__eta">
                  {nextEta ? (
                    <>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
                        {t('nextStop')}: {nextEta.stopName}
                      </div>
                      <ETABadge etaMinutes={nextEta.etaMinutes} confidence={nextEta.confidence} showLabel={false} />
                    </>
                  ) : (
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>—</span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
