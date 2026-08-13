import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../simulation/routes';
import { VEHICLES } from '../../simulation/vehicles';
import MapView from '../../components/MapView';
import SustainabilityBadge from '../../components/SustainabilityBadge';
import ETABadge from '../../components/ETABadge';

export default function Home() {
const { busStates, routeGeometries } = useSimulation();
const { t } = useLanguage();
const navigate = useNavigate();

const todayStr = new Date().toISOString().split('T')[0];
const [searchTab, setSearchTab] = useState('station'); // 'station' | 'universal'
const [searchQuery, setSearchQuery] = useState('');
const [fromLocation, setFromLocation] = useState('');
const [toLocation, setToLocation] = useState('');
const [journeyDate, setJourneyDate] = useState(todayStr);
const [hasSearched, setHasSearched] = useState(false);

// Origin & Destination Options
const locationOptions = useMemo(() => {
  const set = new Set();
  ROUTES.forEach(r => {
    set.add(r.origin);
    set.add(r.destination);
    r.stops.forEach(s => set.add(s.name));
  });
  return Array.from(set).sort();
}, []);

// Handle From Location Change
const handleFromChange = (val) => {
  setFromLocation(val);
  if (val && val === toLocation) {
    setToLocation('');
  }
};

// Handle To Location Change
const handleToChange = (val) => {
  setToLocation(val);
  if (val && val === fromLocation) {
    setFromLocation('');
  }
};

// Swap From & To
const handleSwap = () => {
  const temp = fromLocation;
  setFromLocation(toLocation);
  setToLocation(temp);
};

// Search Submit
const handleSearchSubmit = (e) => {
  e.preventDefault();
  setHasSearched(true);
};

// Filter available buses based on journey selection or bus # / route search
const availableBuses = useMemo(() => {
  if (searchTab === 'universal') {
    const q = searchQuery.toLowerCase().trim();
    if (!q && !hasSearched) return [];

    return VEHICLES.filter(vehicle => {
      if (!q) return true;
      const route = ROUTES.find(r => r.id === vehicle.routeId);

      // Bus Number & Registration Number
      const busNoMatch = vehicle.busNumber.toLowerCase().includes(q) || vehicle.registrationNo.toLowerCase().includes(q);

      // Route Name, Origin, Destination, Stops
      const routeMatch = route ? (
        route.name.toLowerCase().includes(q) ||
        route.origin.toLowerCase().includes(q) ||
        route.destination.toLowerCase().includes(q) ||
        route.stops.some(s => s.name.toLowerCase().includes(q))
      ) : false;

      // Service Class / Model
      const serviceMatch = vehicle.serviceClass?.toLowerCase().includes(q) || vehicle.model?.toLowerCase().includes(q);

      return busNoMatch || routeMatch || serviceMatch;
    }).map(vehicle => {
      const route = ROUTES.find(r => r.id === vehicle.routeId);
      const busState = busStates[vehicle.id];
      return { vehicle, route, busState };
    });
  }

  if (!hasSearched) return [];

  const fromQ = (fromLocation || '').toLowerCase().trim();
  const toQ = (toLocation || '').toLowerCase().trim();

  // Do not return any buses if no origin and destination stations are selected or if both are identical
  if ((!fromQ && !toQ) || (fromQ && toQ && fromQ === toQ)) {
    return [];
  }

  return VEHICLES.filter(vehicle => {
    const route = ROUTES.find(r => r.id === vehicle.routeId);
    if (!route) return false;

    const matchFrom = !fromQ || route.origin.toLowerCase().includes(fromQ) || route.stops.some(s => s.name.toLowerCase().includes(fromQ));
    const matchTo = !toQ || route.destination.toLowerCase().includes(toQ) || route.stops.some(s => s.name.toLowerCase().includes(toQ));

    return matchFrom && matchTo;
  }).map(vehicle => {
    const route = ROUTES.find(r => r.id === vehicle.routeId);
    const busState = busStates[vehicle.id];
    return { vehicle, route, busState };
  });
}, [searchTab, searchQuery, fromLocation, toLocation, journeyDate, hasSearched, busStates]);

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
  waypoints: routeGeometries[r.id] || r.waypoints,
  color: r.color,
}));

return (
  <div>
    {/* Hero title */}
    <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)', paddingTop: 'var(--space-4)' }}>
      <h1 className="page-title" style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>
        {t('tagline')}
      </h1>
      <p className="text-muted" style={{ maxWidth: '560px', margin: '0 auto var(--space-6)' }}>
        Search HRTC buses by stations, bus numbers, routes, or destinations.
      </p>

      {/* Journey & Universal Search Widget */}
      <div className="journey-search-box">
        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: 'var(--space-5)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)', justifyContent: 'center' }}>
          <button
            type="button"
            className={`btn btn--sm ${searchTab === 'station' ? 'btn--primary' : 'btn--outline'}`}
            onClick={() => { setSearchTab('station'); setHasSearched(false); }}
            style={{ borderRadius: 'var(--radius-full)', fontWeight: 600 }}
          >
            Station to Station
          </button>
          <button
            type="button"
            className={`btn btn--sm ${searchTab === 'universal' ? 'btn--primary' : 'btn--outline'}`}
            onClick={() => { setSearchTab('universal'); setHasSearched(true); }}
            style={{ borderRadius: 'var(--radius-full)', fontWeight: 600 }}
          >
            Search Bus Number / Route
          </button>
        </div>

        {searchTab === 'station' ? (
          <form onSubmit={handleSearchSubmit}>
            <div className="journey-search-grid">
                
              {/* FROM Location */}
              <div className="journey-field">
                <label htmlFor="from-location">From (Origin)</label>
                <select
                  id="from-location"
                  value={fromLocation}
                  onChange={(e) => handleFromChange(e.target.value)}
                >
                  <option value="">-- Select Origin Station --</option>
                  {locationOptions.map(loc => (
                    <option
                      key={`from-${loc}`}
                      value={loc}
                      disabled={loc === toLocation}
                    >
                      {loc}{loc === toLocation ? ' (Selected as Destination)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <button
                type="button"
                className="journey-swap-btn"
                onClick={handleSwap}
                title="Swap Origin and Destination"
                aria-label="Swap"
              >
                ⇄
              </button>

              {/* TO Location */}
              <div className="journey-field">
                <label htmlFor="to-location">To (Destination)</label>
                <select
                  id="to-location"
                  value={toLocation}
                  onChange={(e) => handleToChange(e.target.value)}
                >
                  <option value="">-- Select Destination --</option>
                  {locationOptions.map(loc => (
                    <option
                      key={`to-${loc}`}
                      value={loc}
                      disabled={loc === fromLocation}
                    >
                      {loc}{loc === fromLocation ? ' (Selected as Origin)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* CALENDAR DATE PICKER */}
              <div className="journey-field">
                <label htmlFor="journey-date">Date of Journey</label>
                <input
                  type="date"
                  id="journey-date"
                  value={journeyDate}
                  min={todayStr}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  required
                />
              </div>

              {/* SEARCH BUTTON */}
              <button type="submit" className="journey-search-btn">
                Search Buses
              </button>

            </div>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setHasSearched(true); }}>
            <div className="journey-field">
              <label htmlFor="universal-search" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase' }}>
                Search by Bus Number or Route
              </label>
              <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  id="universal-search"
                  value={searchQuery}
                  placeholder="Type Bus # (e.g., '101', '102', '501'), Route, or Station (e.g., 'Shimla', 'Kufri')..."
                  onChange={(e) => { setSearchQuery(e.target.value); setHasSearched(true); }}
                  style={{
                    height: '46px',
                    paddingLeft: '38px',
                    fontSize: 'var(--font-size-sm)',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    width: '100%',
                  }}
                  autoFocus
                />
                <span style={{ position: 'absolute', left: '12px', fontSize: '1.1rem', pointerEvents: 'none', opacity: 0.6 }}>
                    
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                    }}
                    title="Clear Search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

          </form>
        )}
      </div>
    </div>

    {/* SEARCH RESULTS SECTION */}
    {hasSearched && (
      <div className="mb-8">
        <div className="flex flex--between flex--align-center mb-4">
          <h2 className="section-title" style={{ margin: 0 }}>
            {searchTab === 'universal'
              ? searchQuery ? `Search Results for "${searchQuery}" (${availableBuses.length})` : `All Active HRTC Buses (${availableBuses.length})`
              : `Available HRTC Buses (${availableBuses.length})`}
          </h2>
          {searchTab === 'station' && (
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              Journey Date: <strong>{new Date(journeyDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </span>
          )}
        </div>

        {availableBuses.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>
              {searchTab === 'station' && fromLocation && toLocation && fromLocation === toLocation ? '' : searchTab === 'station' && !fromLocation && !toLocation ? '' : ''}
            </div>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>
              {searchTab === 'station' && fromLocation && toLocation && fromLocation === toLocation
                ? 'Origin & Destination Cannot Be The Same'
                : searchTab === 'station' && !fromLocation && !toLocation
                  ? 'Please Select Origin & Destination Stations'
                  : 'No HRTC Buses Found'}
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
              {searchTab === 'universal'
                ? `No buses found matching "${searchQuery}". Try searching by bus number (e.g., 101, 102), route (e.g., Shimla), or station (e.g., Kufri).`
                : (fromLocation && toLocation && fromLocation === toLocation)
                  ? 'Your origin (From) and destination (To) station cannot be identical. Please select a different station for your journey.'
                  : (!fromLocation && !toLocation)
                    ? 'Please select your departure (From) and arrival (To) station from the dropdown menus above before clicking Search Buses.'
                    : `No active buses found running directly between ${fromLocation || 'selected origin'} and ${toLocation || 'selected destination'} on ${journeyDate}. Try selecting another route station or date.`}
            </p>
          </div>
        ) : (
          <div className="grid grid--2 gap-4">
            {availableBuses.map(({ vehicle, route, busState }) => (
              <div key={vehicle.id} className="card" style={{ borderLeft: `4px solid ${route?.color || 'var(--color-primary)'}` }}>
                <div className="card__header flex flex--between flex--align-center">
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', color: 'var(--color-primary)' }}>
                      {vehicle.registrationNo}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                      ({vehicle.busNumber})
                    </span>
                  </div>
                  {busState?.status && (
                    <ETABadge etaMinutes={busState?.etas?.[0]?.etaMinutes} confidence={busState?.etas?.[0]?.confidence} busStatus={busState.status} delayMinutes={busState.delayMinutes || 0} />
                  )}
                </div>
                  
                <div className="card__body">
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)' }}>
                    Route {route?.routeNo}: {route?.name}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
                    {route?.origin} → {route?.destination} · {route?.distanceKm} km (~{route?.typicalDurationMin} min)
                  </div>

                  <div className="flex flex--between flex--align-center p-3" style={{ background: 'var(--color-background-alt)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-3)' }}>
                    <div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Assigned Driver</div>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{vehicle.driver?.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Driver Phone</div>
                      <a
                        href={`tel:${vehicle.driver?.phone?.replace(/[^0-9+]/g, '')}`}
                        style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' }}
                        title="Click to call driver"
                      >
                         {vehicle.driver?.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex flex--between flex--align-center">
                    <SustainabilityBadge fuelType={vehicle.fuelType} emissionStandard={vehicle.emissionStandard} />
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => navigate(`/track/${vehicle.id}`)}
                    >
                      Track Live Bus →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

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
              <span>{route.distanceKm} {t('km')}</span>
              <span>~{route.typicalDurationMin} {t('min')}</span>
              <span>{route.stops.length} {t('stops')}</span>
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
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: route?.color || 'var(--color-primary)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>
                  {vehicle?.registrationNo} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>({vehicle?.busNumber})</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  Route {route?.routeNo}: {route?.name}
                </div>
              </div>
              {vehicle && (
                <SustainabilityBadge fuelType={vehicle.fuelType} emissionStandard={vehicle.emissionStandard} />
              )}
              {nextEta && (
                <div style={{ textAlign: 'right', fontSize: 'var(--font-size-xs)' }}>
                  <div style={{ color: 'var(--color-text-muted)' }}>Next: {nextEta.stopName}</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-accent)' }}>~{nextEta.etaMinutes} min</div>
                </div>
              )}
              <ETABadge etaMinutes={nextEta?.etaMinutes} confidence={nextEta?.confidence} busStatus={bs.status} delayMinutes={bs.delayMinutes} />
            </div>
          );
        })}
    </div>
  </div>
);
}
