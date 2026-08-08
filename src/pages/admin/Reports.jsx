import { useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSimulation } from '../../context/SimulationContext';
import { ROUTES } from '../../simulation/routes';
import { VEHICLES, getFleetEmissionsSummary, FUEL_TYPES, EMISSION_STANDARDS } from '../../simulation/vehicles';
import SustainabilityBadge from '../../components/SustainabilityBadge';

export default function Reports() {
  const { t } = useLanguage();
  const { busStates } = useSimulation();

  const emissionsSummary = getFleetEmissionsSummary();

  // Simulated punctuality data per route
  const punctualityData = useMemo(() => {
    return ROUTES.map(route => {
      const busesOnRoute = Object.values(busStates).filter(b => b.routeId === route.id);
      const running = busesOnRoute.filter(b => b.status === 'running').length;
      const total = busesOnRoute.length;
      const onTimePercent = total > 0 ? Math.round((running / total) * 100) : 0;
      // Add some simulated historical variation
      const historicalOnTime = Math.min(95, Math.max(60, onTimePercent + Math.round((Math.random() - 0.3) * 20)));
      return {
        routeId: route.id,
        routeNo: route.routeNo,
        routeName: route.name,
        origin: route.origin,
        destination: route.destination,
        totalBuses: total,
        onTimePercent: historicalOnTime,
        avgDelay: Math.round(3 + Math.random() * 12),
        tripsToday: Math.round(total * (2 + Math.random() * 4)),
      };
    });
  }, [busStates]);

  // Emission colors for the bar chart
  const emissionColors = {
    [EMISSION_STANDARDS.ZERO]: 'var(--color-electric)',
    [EMISSION_STANDARDS.BS6]: 'var(--color-bs6)',
    [EMISSION_STANDARDS.BS4]: 'var(--color-bs4)',
    [EMISSION_STANDARDS.BS3]: 'var(--color-bs3)',
  };

  const fuelColors = {
    [FUEL_TYPES.ELECTRIC]: 'var(--color-electric)',
    [FUEL_TYPES.CNG]: 'var(--color-cng)',
    [FUEL_TYPES.DIESEL]: 'var(--color-accent-light)',
    [FUEL_TYPES.HYBRID]: '#8E44AD',
  };

  return (
    <div>
      <h1 className="page-title">📊 {t('navReports')}</h1>

      {/* Punctuality Report */}
      <div className="card mb-6">
        <div className="card__header">
          <span className="card__title">⏱️ {t('punctualityReport')}</span>
          <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
            Based on simulated real-time and historical data
          </span>
        </div>
        <div className="card__body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Corridor</th>
                <th>Buses</th>
                <th>Trips Today</th>
                <th>On-Time %</th>
                <th>Avg. Delay</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {punctualityData.map(row => (
                <tr key={row.routeId}>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: ROUTES.find(r => r.id === row.routeId)?.color,
                    }}>
                      {row.routeNo}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{row.routeName}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      {row.origin} → {row.destination}
                    </div>
                  </td>
                  <td>{row.totalBuses}</td>
                  <td>{row.tripsToday}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: row.onTimePercent >= 85 ? 'var(--color-success)' :
                             row.onTimePercent >= 70 ? 'var(--color-warning)' :
                             'var(--color-danger)',
                    }}>
                      {row.onTimePercent}%
                    </span>
                  </td>
                  <td>{row.avgDelay} min</td>
                  <td>
                    <div style={{ width: '100px', height: '8px', background: 'var(--color-background)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${row.onTimePercent}%`,
                        borderRadius: 'var(--radius-full)',
                        background: row.onTimePercent >= 85 ? 'var(--color-success)' :
                                   row.onTimePercent >= 70 ? 'var(--color-warning)' :
                                   'var(--color-danger)',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emissions Report */}
      <div className="grid grid--2" style={{ gap: 'var(--space-6)' }}>
        <div className="card">
          <div className="card__header">
            <span className="card__title">🌿 {t('emissionsReport')}</span>
          </div>
          <div className="card__body">
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-success)' }}>
                {emissionsSummary.cleanPercentage}%
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Clean Fleet (BS-VI, CNG, or Electric)
              </div>
            </div>

            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              By Emission Standard
            </h4>
            <div className="chart-bar-group mb-4">
              {Object.entries(emissionsSummary.byEmission).map(([std, count]) => (
                <div className="chart-bar" key={std}>
                  <span className="chart-bar__label">{std}</span>
                  <div className="chart-bar__track">
                    <div className="chart-bar__fill" style={{
                      width: `${(count / emissionsSummary.total) * 100}%`,
                      background: emissionColors[std] || 'var(--color-accent-light)',
                    }}>
                      {count} ({Math.round((count / emissionsSummary.total) * 100)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              By Fuel Type
            </h4>
            <div className="chart-bar-group">
              {Object.entries(emissionsSummary.byFuel).map(([fuel, count]) => (
                <div className="chart-bar" key={fuel}>
                  <span className="chart-bar__label">
                    {fuel}
                  </span>
                  <div className="chart-bar__track">
                    <div className="chart-bar__fill" style={{
                      width: `${(count / emissionsSummary.total) * 100}%`,
                      background: fuelColors[fuel] || 'var(--color-accent-light)',
                    }}>
                      {count} ({Math.round((count / emissionsSummary.total) * 100)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fleet details */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">🚌 Fleet Inventory Detail</span>
          </div>
          <div className="card__body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reg. No.</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>Fuel / Emission</th>
                </tr>
              </thead>
              <tbody>
                {VEHICLES.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)' }}>{v.registrationNo}</td>
                    <td style={{ fontSize: 'var(--font-size-xs)' }}>
                      {v.model}
                      {v.brandName && <span style={{ color: 'var(--color-accent)', marginLeft: 4 }}>({v.brandName})</span>}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-xs)' }}>{v.yearOfMfg}</td>
                    <td>
                      <SustainabilityBadge fuelType={v.fuelType} emissionStandard={v.emissionStandard} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
