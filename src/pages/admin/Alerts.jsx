import { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Alerts() {
const { anomalyLog, acknowledgeAlert, resolveAlert, resolveAllAlerts, incidents, triggerReroute, reroutedRoutes } = useSimulation();
const { t } = useLanguage();
const [filterStatus, setFilterStatus] = useState('all');
const [filterType, setFilterType] = useState('all');

const filtered = anomalyLog.filter(a => {
  if (filterStatus !== 'all' && a.status !== filterStatus) return false;
  if (filterType !== 'all' && a.type !== filterType) return false;
  return true;
});

const counts = {
  total: anomalyLog.length,
  new: anomalyLog.filter(a => a.status === 'new').length,
  acknowledged: anomalyLog.filter(a => a.status === 'acknowledged').length,
  resolved: anomalyLog.filter(a => a.status === 'resolved').length,
};

return (
  <div>
    <div className="flex flex--between flex--align-center mb-4">
      <h1 className="page-title" style={{ margin: 0 }}> {t('navAlerts')}</h1>
      <button className="btn btn--outline btn--sm" onClick={resolveAllAlerts}>
        Auto-Resolve All Alerts
      </button>
    </div>

    {/* Road Incident & Reroute Command Center */}
    <div className="card mb-6" style={{ padding: 'var(--space-4) var(--space-5)' }}>
      <h2 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)' }}>
        Live Road Hazards & Rerouting Control Command
      </h2>
      <div className="grid grid--3" style={{ gap: 'var(--space-4)' }}>
        {incidents.map(inc => {
          const isRerouted = inc.status === 'rerouted' || reroutedRoutes[inc.routeId]?.active;
          return (
            <div key={inc.id} style={{ background: 'var(--color-background-alt)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className={`badge ${inc.severity === 'critical' ? 'badge--danger' : 'badge--warning'}`} style={{ textTransform: 'uppercase' }}>
                  {inc.type} • {inc.severity}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{inc.reportedAt}</span>
              </div>
              <h4 style={{ margin: '8px 0 4px 0', fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>{inc.title}</h4>
              <p style={{ margin: '0 0 12px 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                {inc.description}
              </p>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                Location: <strong>{inc.location}</strong>
              </div>
              {isRerouted ? (
                <div className="badge badge--success" style={{ width: '100%', textAlign: 'center', display: 'block', padding: '6px' }}>
                  Reroute Issued: {inc.alternateRouteName}
                </div>
              ) : (
                <button
                  className="btn btn--primary btn--sm"
                  style={{ width: '100%' }}
                  onClick={() => triggerReroute(inc.id, inc.routeId, inc.alternateRouteName)}
                >
                  Issue Reroute & Update Timings
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>

    {/* Summary cards */}
    <div className="grid grid--4 mb-6">
      <div className="stat-card" onClick={() => setFilterStatus('all')} style={{ cursor: 'pointer' }}>
        <div className="stat-card__label">Total Alerts</div>
        <div className="stat-card__value">{counts.total}</div>
      </div>
      <div className="stat-card" onClick={() => setFilterStatus('new')} style={{ cursor: 'pointer' }}>
        <div className="stat-card__icon stat-card__icon--danger"></div>
        <div className="stat-card__label">{t('new')}</div>
        <div className="stat-card__value stat-card__value--danger">{counts.new}</div>
      </div>
      <div className="stat-card" onClick={() => setFilterStatus('acknowledged')} style={{ cursor: 'pointer' }}>
        <div className="stat-card__icon stat-card__icon--warning"></div>
        <div className="stat-card__label">{t('acknowledged')}</div>
        <div className="stat-card__value stat-card__value--warning">{counts.acknowledged}</div>
      </div>
      <div className="stat-card" onClick={() => setFilterStatus('resolved')} style={{ cursor: 'pointer' }}>
        <div className="stat-card__icon stat-card__icon--success"></div>
        <div className="stat-card__label">{t('resolved')}</div>
        <div className="stat-card__value stat-card__value--success">{counts.resolved}</div>
      </div>
    </div>

    {/* Filters */}
    <div className="filter-bar">
      <select className="filter-bar__select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} id="alert-filter-status">
        <option value="all">All Statuses</option>
        <option value="new">{t('new')}</option>
        <option value="acknowledged">{t('acknowledged')}</option>
        <option value="resolved">{t('resolved')}</option>
      </select>
      <select className="filter-bar__select" value={filterType} onChange={e => setFilterType(e.target.value)} id="alert-filter-type">
        <option value="all">All Types</option>
        <option value="breakdown">{t('breakdown')}</option>
        <option value="signal-lost">{t('signalLost')}</option>
        <option value="delay">{t('delayed')}</option>
      </select>
      <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginLeft: 'auto' }}>
        Showing {filtered.length} alerts
      </span>
    </div>

    {/* Alert list */}
    <div className="alert-list">
      {filtered.length === 0 ? (
        <div className="card">
          <div className="card__body text-center text-muted" style={{ padding: 'var(--space-8)' }}>
            No alerts match your filters.
          </div>
        </div>
      ) : (
        filtered.map(alert => (
          <div key={alert.id} className={`alert-item alert-item--${alert.status}`}>
            <span className="alert-item__icon">
              {alert.type === 'breakdown' ? '' : alert.type === 'signal-lost' ? '' : ''}
            </span>
            <div className="alert-item__content">
              <div className="alert-item__message">{alert.message}</div>
              <div className="alert-item__time">
                {new Date(alert.timestamp).toLocaleString()}
                <span className={`badge badge--${alert.status}`} style={{ marginLeft: 'var(--space-2)' }}>
                  {t(alert.status)}
                </span>
                <span className="badge" style={{ marginLeft: 'var(--space-1)', background: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
                  {alert.type}
                </span>
              </div>
              {alert.lat && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                   {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}
                </div>
              )}
            </div>
            <div className="alert-item__actions">
              {alert.status === 'new' && (
                <button
                  className="btn btn--outline btn--sm"
                  onClick={() => acknowledgeAlert(alert.id)}
                >
                  {t('acknowledge')}
                </button>
              )}
              {(alert.status === 'new' || alert.status === 'acknowledged') && (
                <button
                  className="btn btn--success btn--sm"
                  onClick={() => resolveAlert(alert.id)}
                >
                  {t('resolve')}
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);
}
