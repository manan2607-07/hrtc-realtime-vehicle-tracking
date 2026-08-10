import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import { VEHICLES } from '../../simulation/vehicles';
import { ROUTES } from '../../simulation/routes';
import MapView from '../../components/MapView';

export default function StaffRoster() {
  const { busStates } = useSimulation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Combined staff roster with live location telemetry
  const staffList = useMemo(() => {
    return VEHICLES.map(vehicle => {
      const route = ROUTES.find(r => r.id === vehicle.routeId);
      const busState = busStates[vehicle.id];
      const nextEta = busState?.etas?.[0];

      return {
        vehicle,
        route,
        busState,
        nextEta,
      };
    }).filter(item => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const drvName = item.vehicle.driver?.name?.toLowerCase() || '';
      const drvPhone = item.vehicle.driver?.phone || '';
      const cndName = item.vehicle.conductor?.name?.toLowerCase() || '';
      const cndPhone = item.vehicle.conductor?.phone || '';
      const busNum = item.vehicle.busNumber?.toLowerCase() || '';

      return drvName.includes(q) || drvPhone.includes(q) || cndName.includes(q) || cndPhone.includes(q) || busNum.includes(q);
    });
  }, [busStates, searchQuery]);

  // Buses for map view
  const mapBuses = useMemo(() => {
    return Object.values(busStates).map(bs => {
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
  }, [busStates]);

  const mapRoutes = ROUTES.map(r => ({ id: r.id, waypoints: r.waypoints, color: r.color }));

  return (
    <div>
      <div className="flex flex--between flex--align-center mb-6">
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>HRTC Staff Directory & Real-Time Driver Locations</h1>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
            Complete roster of all assigned HRTC Drivers & Conductors with real-time GPS tracking telemetry
          </p>
        </div>
        <div style={{ width: '320px' }}>
          <input
            className="search-bar__input"
            type="text"
            placeholder="Search by driver name, phone, bus #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 'var(--space-4)' }}
          />
        </div>
      </div>

      {/* Staff Location Overview Map */}
      <div className="card mb-6">
        <div className="card__header">
          <span className="card__title">📡 Live Driver & Vehicle Location Map</span>
        </div>
        <MapView
          center={[31.5, 77.0]}
          zoom={8}
          buses={mapBuses}
          routes={mapRoutes}
          className="map-container"
          onBusClick={(bus) => navigate(`/track/${bus.id}`)}
        />
      </div>

      {/* Staff Roster Cards */}
      <div className="grid grid--2 gap-4 mb-6">
        {staffList.map(({ vehicle, route, busState, nextEta }) => (
          <div key={vehicle.id} className="card" style={{ borderLeft: `4px solid ${route?.color || 'var(--color-primary)'}` }}>
            <div className="card__header flex flex--between flex--align-center">
              <div>
                <span style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', color: 'var(--color-primary)' }}>
                  {vehicle.busNumber}
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                  ({vehicle.registrationNo})
                </span>
              </div>
              <span className={`badge badge--${busState?.status || 'running'}`}>
                {busState?.status || 'Active'}
              </span>
            </div>

            <div className="card__body">
              {/* Route */}
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
                Route {route?.routeNo}: {route?.name} ({route?.origin} → {route?.destination})
              </div>

              <div className="grid grid--2 gap-3 mb-4">
                {/* DRIVER INFO */}
                <div style={{ background: 'var(--color-background)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    👨‍✈️ Driver Information
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{vehicle.driver?.name}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    Emp ID: <strong style={{ color: 'var(--color-text)' }}>{vehicle.driver?.empId}</strong>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    License: <strong style={{ color: 'var(--color-text)' }}>{vehicle.driver?.licenseNo}</strong>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 700, marginTop: '4px', fontFamily: 'monospace' }}>
                    <a
                      href={`tel:${vehicle.driver?.phone?.replace(/[^0-9+]/g, '')}`}
                      style={{ color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' }}
                      title="Click to call driver"
                    >
                      📞 {vehicle.driver?.phone}
                    </a>
                  </div>
                </div>

                {/* CONDUCTOR INFO */}
                <div style={{ background: 'var(--color-background)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    🎫 Conductor Information
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{vehicle.conductor?.name}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    Staff ID: <strong style={{ color: 'var(--color-text)' }}>{vehicle.conductor?.staffId}</strong>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    Duty Status: <strong style={{ color: 'var(--color-success)' }}>On Duty</strong>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 700, marginTop: '4px', fontFamily: 'monospace' }}>
                    <a
                      href={`tel:${vehicle.conductor?.phone?.replace(/[^0-9+]/g, '')}`}
                      style={{ color: 'var(--color-accent)', textDecoration: 'underline', cursor: 'pointer' }}
                      title="Click to call conductor"
                    >
                      📞 {vehicle.conductor?.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* LIVE LOCATION TELEMETRY */}
              <div style={{ background: 'var(--color-background-alt)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }} className="flex flex--between flex--align-center">
                <div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Current Live GPS Location</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--color-text)' }}>
                    📍 {busState?.lat?.toFixed(4) || '31.1048'}° N, {busState?.lng?.toFixed(4) || '77.1650'}° E ({Math.round(busState?.speed || 0)} km/h)
                  </div>
                  {nextEta && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Approaching: <strong>{nextEta.stopName}</strong> (~{nextEta.etaMinutes} min)
                    </div>
                  )}
                </div>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => navigate(`/track/${vehicle.id}`)}
                >
                  View Live Map →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
