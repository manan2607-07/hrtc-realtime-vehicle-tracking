import { formatETA, getConfidenceLabel } from '../simulation/eta';
import { useLanguage } from '../context/LanguageContext';

/**
 * ETA badge with confidence indicator
 * Green border = Live, Dashed amber = Estimate, Dashed red = Low Confidence
 */
export default function ETABadge({ etaMinutes, confidence, showLabel = true }) {
  const { t } = useLanguage();

  const badgeClass = confidence === 'live' ? 'badge--live'
    : confidence === 'estimate' ? 'badge--estimate'
    : 'badge--low-conf';

  const isArriving = etaMinutes < 1;

  return (
    <div className={`eta-display ${isArriving ? 'eta-display--arriving' : ''}`}>
      <span className={`badge ${badgeClass}`}>
        {isArriving ? '🟢' : '🕐'}{' '}
        {formatETA(etaMinutes)}
        {showLabel && (
          <span style={{ marginLeft: '4px', opacity: 0.8, fontSize: '0.65rem' }}>
            ({confidence === 'live' ? t('live') : confidence === 'estimate' ? t('estimated') : t('lowConfidence')})
          </span>
        )}
      </span>
    </div>
  );
}
