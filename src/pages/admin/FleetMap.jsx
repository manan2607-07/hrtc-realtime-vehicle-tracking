import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES, DEPOTS } from '../../simulation/routes';
import { VEHICLES, FUEL_TYPES } from '../../simulation/vehicles';
import MapView from '../../components/MapView';
import SustainabilityBadge from '../../components/SustainabilityBadge';
import { formatETA } from '../../simulation/eta';

export default function FleetMap() {
  const { busStates } = useSimulation();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [filterDepot, setFilterDepot] = useState('all');
  const [filterRoute, setFilterRoute] = useState('all');
  const [filterFuel, setFilterFuel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBus, setSelectedBus] = useState(null);

  const filteredBuses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const cleanDigits = searchQuery.replace(/\D/g, '');

    return Object.values(busStates).filter(bs => {
      const vehicle = VEHICLES.find(v => v.id === bs.vehicleId);
      if (!vehicle) return false;
      if (filterDepot !== 'all' && vehicle.depotId !== filterDepot) return false;
      if (filterRoute !== 'all' && bs.routeId !== filterRoute) return false;
      if (filterFuel !== 'all' && vehicle.fuelType !== filterFuel) return false;
      if (filterStatus !== 'all' && bs.status !== filterStatus) return false;

      if (q) {
        const busNoMatch = vehicle.busNumber.toLowerCase().includes(q) || (cleanDigits && vehicle.busNumber.includes(cleanDigits));
        const regMatch = vehicle.registrationNo.toLowerCase().includes(q);
        const driverNameMatch = vehicle.driver?.name?.toLowerCase().includes(q);
        const cleanPhone = vehicle.driver?.phone ? vehicle.driver.phone.replace(/\D/g, '') : '';
        const driverPhoneMatch = cleanDigits && cleanDigits.length >= 3 && cleanPhone.includes(cleanDigits);
        if (!busNoMatch && !regMatch && !driverNameMatch && !driverPhoneMatch) return false;
      }

      return true;
    });
  }, [busStates, filterDepot, filterRoute, filterFuel, filterStatus, searchQuery]);

  const busesForMap = filteredBuses.map(bs => {
    const vehicle = VEHICLES.find(v => v.id === bs.vehicleId);
    return {
      id: bs.vehicleId, lat: bs.lat, lng: bs.lng,
      heading: bs.heading, speed: bs.speed, status: bs.status,
      registrationNo: vehicle?.registrationNo,
    };
  });

  const routesForMap = ROUTES.map(r => ({ id: r.id, waypoints: r.waypoints, color: r.color }));

  const selectedBusState = selectedBus ? busStates[selectedBus] : null;
  const selectedVehicle = selectedBus ? VEHICLES.find(v => v.id === selectedBus) : null;
  const selectedRoute = selectedBusState ? ROUTES.find(r => r.id === selectedBusState.routeId) : null;

  return (
    <div>
      <h1 className="page-title">🗺️ {t('fleetOverview')}</h1>

      {/* Filters */}
      <div className="filter-bar">
        <input
          type="text"
          className="search-bar__input"
          style={{ width: '260px', padding: '6px 12px', fontSize: 'var(--font-size-xs)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
          placeholder="Filter by Bus #, Driver Name or Phone..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select className="filter-bar__select" value={filterDepot} onChange={e => setFilterDepot(e.target.value)} id="filter-depot">
          <option value="all">{t('allDepots')}</option>
          {DEPOTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="filter-bar__select" value={filterRoute} onChange={e => setFilterRoute(e.target.value)} id="filter-route">
          <option value="all">{t('allRoutes')}</option>
          {ROUTES.map(r => <option key={r.id} value={r.id}>Route {r.routeNo}: {r.name}</option>)}
        </select>
        <select className="filter-bar__select" value={filterFuel} onChange={e => setFilterFuel(e.target.value)} id="filter-fuel">
          <option value="all">{t('allFuelTypes')}</option>
          {Object.values(FUEL_TYPES).map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select className="filter-bar__select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} id="filter-status">
          <option value="all">{t('allStatuses')}</option>
          <option value="running">{t('running')}</option>
          <option value="delayed">{t('delayed')}</option>
          <option value="breakdown">{t('breakdown')}</option>
          <option value="signal-lost">{t('signalLost')}</option>
        </select>
        <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginLeft: 'auto' }}>
          Showing {filteredBuses.length} of {Object.keys(busStates).length} buses
        </span>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
        {/* Map */}
        <div style={{ flex: 1 }}>
          <MapView
            center={[31.5, 77.0]}
            zoom={8}
            buses={busesForMap}
            routes={routesForMap}
            selectedBusId={selectedBus}
            className="map-container map-container--admin"
            onBusClick={(bus) => setSelectedBus(bus.id)}
          />
        </div>

        {/* Selected bus info panel */}
        {selectedBusState && selectedVehicle && selectedRoute && (
          <div className="card" style={{ width: '320px', flexShrink: 0, alignSelf: 'flex-start' }}>
            <div className="card__header" style={{ background: selectedRoute.color, color: 'white' }}>
              <span style={{ fontWeight: 700 }}>
                {selectedVehicle.busNumber} ({selectedVehicle.registrationNo})
              </span>
              <span className={`badge badge--${selectedBusState.status}`}>
                {selectedBusState.status}
              </span>
            </div>
            <div className="card__body">
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Route</div>
                <div style={{ fontWeight: 600 }}>Route {selectedRoute.routeNo}: {selectedRoute.name}</div>
              </div>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Driver & Crew Credentials</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>👤 {selectedVehicle.driver?.name}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  License: {selectedVehicle.driver?.licenseNo}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  Emp ID: {selectedVehicle.driver?.empId} · 📞 {selectedVehicle.driver?.phone}
                </div>
                {selectedVehicle.driver?.conductor && (
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Conductor: 🎫 {selectedVehicle.driver.conductor.name} (📞 {selectedVehicle.driver.conductor.phone})
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Vehicle & AIS-140 GPS Unit</div>
                <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{selectedVehicle.model}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>{selectedVehicle.serviceClass}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>AIS-140 ID: {selectedVehicle.ais140DeviceId}</div>
              </div>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Sustainability</div>
                <SustainabilityBadge fuelType={selectedVehicle.fuelType} emissionStandard={selectedVehicle.emissionStandard} />
              </div>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Speed & Depot</div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)' }}>
                  {Math.round(selectedBusState.speed)} {t('kmh')} · <span style={{ fontWeight: 400, fontSize: 'var(--font-size-xs)' }}>{DEPOTS.find(d => d.id === selectedVehicle.depotId)?.name}</span>
                </div>
              </div>
              {selectedBusState.etas?.[0] && (
                <div style={{ marginBottom: 'var(--space-3)', background: 'var(--color-background)', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Next Stop & Timings</div>
                  <div style={{ fontWeight: 600 }}>{selectedBusState.etas[0].stopName}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-accent)', marginTop: '2px' }}>
                    ETA: <strong>{formatETA(selectedBusState.etas[0].etaMinutes)}</strong>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Arr: <strong>{new Date(selectedBusState.etas[0].arrivalTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</strong> | Halt: <strong>{selectedBusState.etas[0].haltMinutes}m</strong> | Dep: <strong>{new Date(selectedBusState.etas[0].departureTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</strong>
                  </div>
                </div>
              )}
              {selectedBusState.isSignalLost && (
                <div className="signal-lost-banner" style={{ marginBottom: 0 }}>
                  <span>⚠️</span> Signal Lost
                </div>
              )}
            </div>
            <div className="card__footer">
              <button
                className="btn btn--accent btn--sm"
                onClick={() => navigate(`/track/${selectedBus}`)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                🚌 Track This Bus
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
