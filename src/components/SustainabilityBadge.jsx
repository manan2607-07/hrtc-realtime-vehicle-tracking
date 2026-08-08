import { useLanguage } from '../context/LanguageContext';
import { FUEL_TYPES, EMISSION_STANDARDS } from '../simulation/vehicles';

/**
 * Sustainability badge showing fuel type and emission standard
 */
export default function SustainabilityBadge({ fuelType, emissionStandard, size = 'sm' }) {
  const { t } = useLanguage();

  const getBadgeClass = () => {
    if (fuelType === FUEL_TYPES.ELECTRIC) return 'badge--electric';
    if (fuelType === FUEL_TYPES.CNG) return 'badge--cng';
    if (emissionStandard === EMISSION_STANDARDS.BS6) return 'badge--bs6';
    if (emissionStandard === EMISSION_STANDARDS.BS4) return 'badge--bs4';
    if (emissionStandard === EMISSION_STANDARDS.BS3) return 'badge--bs3';
    return 'badge--bs4';
  };

  const getLabel = () => {
    const parts = [];
    if (fuelType === FUEL_TYPES.ELECTRIC) {
      parts.push(t('zeroEmission'));
      parts.push('·');
      parts.push(t('electric'));
    } else {
      parts.push(emissionStandard);
      parts.push('·');
      parts.push(t(fuelType.toLowerCase()));
    }
    return parts.join(' ');
  };

  return (
    <span className={`badge ${getBadgeClass()}`} title={`${t('fuelType')}: ${fuelType}, ${t('emissionStandard')}: ${emissionStandard}`}>
      {getLabel()}
    </span>
  );
}
