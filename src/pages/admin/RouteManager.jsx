import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../simulation/routes';
import { VEHICLES } from '../../simulation/vehicles';
import SustainabilityBadge from '../../components/SustainabilityBadge';

export default function RouteManager() {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="page-title">🛣️ {t('navRouteManager')}</h1>
      <p className="text-muted mb-6">
        View and manage route, stop, and vehicle-to-route assignments. In production, this would support full CRUD operations (FR-23).
      </p>

      {ROUTES.map(route => {
        const routeVehicles = VEHICLES.filter(v => v.routeId === route.id);
        return (
          <div key={route.id} className="card mb-6">
            <div className="card__header" style={{ background: route.color, color: 'white' }}>
              <span style={{ fontWeight: 700 }}>Route {route.routeNo}: {route.name}</span>
              <span style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9 }}>
                {route.origin} → {route.destination} · {route.distanceKm} km · ~{route.typicalDurationMin} min
              </span>
            </div>
            <div className="card__body">
              {/* Stops table */}
              <h3 className="section-title" style={{ fontSize: 'var(--font-size-sm)' }}>
                📍 Stops ({route.stops.length})
              </h3>
              <table className="data-table mb-4">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Stop Name</th>
                    <th>Code</th>
                    <th>Lat</th>
                    <th>Lng</th>
                    <th>Sched. Time</th>
                  </tr>
                </thead>
                <tbody>
                  {route.stops.map(stop => (
                    <tr key={stop.id}>
                      <td>{stop.seqNo}</td>
                      <td style={{ fontWeight: 500 }}>{stop.name}</td>
                      <td><code style={{ color: 'var(--color-accent)' }}>{stop.code}</code></td>
                      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{stop.lat.toFixed(4)}</td>
                      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{stop.lng.toFixed(4)}</td>
                      <td>+{stop.scheduledMin} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Assigned vehicles */}
              <h3 className="section-title" style={{ fontSize: 'var(--font-size-sm)' }}>
                🚌 Assigned Vehicles & Drivers ({routeVehicles.length})
              </h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bus No.</th>
                    <th>Registration</th>
                    <th>Driver Name & Contact</th>
                    <th>Model</th>
                    <th>Capacity</th>
                    <th>Fuel/Emission</th>
                  </tr>
                </thead>
                <tbody>
                  {routeVehicles.map(v => (
                    <tr key={v.id}>
                      <td><strong style={{ color: 'var(--color-primary)' }}>{v.busNumber}</strong></td>
                      <td style={{ fontWeight: 600 }}>{v.registrationNo}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>👤 {v.driver?.name}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          ID: {v.driver?.empId} · 📞 {v.driver?.phone}
                        </div>
                      </td>
                      <td>
                        {v.model}
                        {v.brandName && <span style={{ marginLeft: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-accent)' }}>({v.brandName})</span>}
                      </td>
                      <td>{v.capacity} seats</td>
                      <td><SustainabilityBadge fuelType={v.fuelType} emissionStandard={v.emissionStandard} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
