/**
 * Authentic Himachal Pradesh Road Incidents & Destination Weather Data
 */

export const DESTINATION_WEATHER = {
  'Shimla': { temp: 18, condition: 'Clear Skies', humidity: '55%' },
  'Manali': { temp: 14, condition: 'Light Mountain Mist', humidity: '72%' },
  'Dharamshala': { temp: 21, condition: 'Partly Cloudy', humidity: '60%' },
  'Mandi': { temp: 24, condition: 'Sunny & Pleasant', humidity: '50%' },
  'Kullu': { temp: 19, condition: 'Clear Mountain Air', humidity: '58%' },
  'Solan': { temp: 22, condition: 'Mild Breeze', humidity: '48%' },
  'Chamba': { temp: 16, condition: 'Overcast & Cool', humidity: '68%' },
  'Ambala': { temp: 31, condition: 'Warm & Clear', humidity: '40%' },
  'Delhi': { temp: 33, condition: 'Hazy Sun', humidity: '45%' },
};

export const INITIAL_INCIDENTS = [
  {
    id: 'inc-101',
    routeId: 'route-2', // Shimla - Manali
    title: 'Landslide Warning at Pandoh Dam (NH-21)',
    type: 'landslide',
    severity: 'critical',
    location: 'Pandoh Bypass, Mandi',
    lat: 31.6700,
    lng: 76.9800,
    description: 'Boulders fallen on NH-21 near Pandoh. Traffic diverted via Kamand Valley route (+25 min).',
    reportedAt: '10 mins ago',
    status: 'active', // active, rerouted, resolved
    detourRecommended: true,
    alternateRouteName: 'Via Kamand - Kataula Bypass',
  },
  {
    id: 'inc-102',
    routeId: 'route-5', // Shimla - Kufri - Narkanda
    title: 'Dense Mountain Fog & Low Visibility',
    type: 'weather',
    severity: 'warning',
    location: 'Kufri Pass (2,720m)',
    lat: 31.0980,
    lng: 77.2650,
    description: 'Visibility drops below 15m near Kufri Pass. Terrain speed cap reduced to 18 km/h.',
    reportedAt: '25 mins ago',
    status: 'active',
    detourRecommended: false,
    alternateRouteName: 'Proceed with caution (Fog Lamps On)',
  },
  {
    id: 'inc-103',
    routeId: 'route-6', // Manali - Delhi (Night Superfast)
    title: 'Four-Lane Construction & Single Lane Bottleneck',
    type: 'roadwork',
    severity: 'moderate',
    location: 'Aut Tunnel North Portal',
    lat: 31.7850,
    lng: 77.0700,
    description: 'Single-lane crawling traffic near Aut Tunnel. Expected delay +15 mins.',
    reportedAt: '1 hour ago',
    status: 'active',
    detourRecommended: true,
    alternateRouteName: 'Via Larji Tunnel Bypass',
  },
];

export function getWeatherForStop(stopName) {
  if (!stopName) return DESTINATION_WEATHER['Shimla'];
  for (const city of Object.keys(DESTINATION_WEATHER)) {
    if (stopName.toLowerCase().includes(city.toLowerCase())) {
      return DESTINATION_WEATHER[city];
    }
  }
  return { temp: 20, condition: 'Pleasant Mountain Weather', humidity: '55%' };
}
