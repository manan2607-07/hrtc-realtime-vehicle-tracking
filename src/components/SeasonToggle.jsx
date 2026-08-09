import { useSimulation } from '../context/SimulationContext';
import { useLanguage } from '../context/LanguageContext';

/**
 * Tourist/Normal season toggle for demo purposes
 */
export default function SeasonToggle() {
const { isTouristSeason, toggleTouristSeason } = useSimulation();
const { t } = useLanguage();

return (
  <button className="season-toggle" onClick={toggleTouristSeason} title={t('seasonToggle')}>
    <span>{isTouristSeason ? '' : ''}</span>
    <span>{isTouristSeason ? t('touristSeason') : t('normalSeason')}</span>
    <div className={`season-toggle__indicator ${isTouristSeason ? 'active' : ''}`} />
  </button>
);
}
