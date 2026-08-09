import { formatETA } from '../simulation/eta';
import { useLanguage } from '../context/LanguageContext';

/**
 * ETA badge with status color indicator
 * On-time / Running / Live = Green (#1E8449 / var(--color-success))
 * Delayed / Estimate = Yellow (#D4A017 / var(--color-warning))
 */
export default function ETABadge({ etaMinutes, confidence, busStatus, showLabel = true }) {
  const { t } = useLanguage();

  const isDelayed = busStatus === 'delayed' || confidence === 'estimate' || confidence === 'low';
  const isArriving = etaMinutes < 1;

  const textColor = isDelayed ? '#B7950B' : 'var(--color-success)';
  const bgColor = isDelayed ? 'var(--color-warning-bg)' : 'var(--color-success-bg)';
  const borderColor = isDelayed ? '#D4A017' : 'var(--color-success)';
  const dotColor = isDelayed ? '#D4A017' : 'var(--color-success)';

  return (
    <div className={`eta-display ${isArriving ? 'eta-display--arriving' : ''}`}>
      <span
        className="badge"
        style={{
          background: bgColor,
          color: textColor,
          border: `1.5px solid ${borderColor}`,
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: dotColor,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <span style={{ color: textColor }}>{formatETA(etaMinutes)}</span>
        {showLabel && (
          <span style={{ opacity: 0.85, fontSize: '0.65rem', color: textColor }}>
            ({isDelayed ? (busStatus === 'delayed' ? 'Delayed' : t('estimated')) : t('live')})
          </span>
        )}
      </span>
    </div>
  );
}
