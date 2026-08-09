/**
 * Hindi/English i18n strings
 */

export const STRINGS = {
  en: {
    // App
    appName: 'HRTC Bus Tracker',
    appSubtitle: 'Himachal Road Transport Corporation',
    tagline: 'Real-Time Vehicle Tracking System',

    // Navigation
    navHome: 'Home',
    navTrack: 'Track Bus',
    navRoutes: 'Routes',
    navSMS: 'SMS Bus Tracker',
    navAdmin: 'Admin Dashboard',
    navAlerts: 'Alerts',
    navReports: 'Reports',
    navFleetMap: 'Fleet Map',
    navRouteManager: 'Manage Routes',

    // Home
    searchPlaceholder: 'Search route, stop, or destination...',
    nearbyStops: 'Nearby Stops',
    popularRoutes: 'Popular Routes',
    allRoutes: 'All Routes',
    activeBuses: 'Active Buses',
    busesNearMe: 'Buses Near Me',
    viewRoute: 'View Route',
    trackBus: 'Track Bus',

    // Live tracking
    liveTracking: 'Live Tracking',
    nextStop: 'Next Stop',
    finalDestination: 'Destination',
    etaLabel: 'ETA',
    arriving: 'Arriving',
    signalLost: 'Signal Lost',
    lastUpdated: 'Last updated',
    secondsAgo: 's ago',
    minutesAgo: 'm ago',
    estimateWarning: 'Showing estimate — GPS signal unavailable',
    notifyMe: 'Notify me when 5 min away',
    notificationSet: 'Alert set! We\'ll notify you.',
    upcomingStops: 'Upcoming Stops',
    confidence: 'Confidence',
    live: 'Live',
    estimated: 'Estimated',
    lowConfidence: 'Low Confidence',

    // Stop detail
    upcomingBuses: 'Upcoming Buses',
    noBuses: 'No buses scheduled at this time',
    stopCode: 'Stop Code',

    // Route detail
    routeDetails: 'Route Details',
    stops: 'Stops',
    schedule: 'Schedule',
    distance: 'Distance',
    typicalDuration: 'Typical Duration',
    activeBusesOnRoute: 'Active Buses on Route',

    // Sustainability
    fuelType: 'Fuel Type',
    emissionStandard: 'Emission Standard',
    electric: 'Electric',
    diesel: 'Diesel',
    cng: 'CNG',
    hybrid: 'Hybrid',
    zeroEmission: 'Zero Emission',
    cleanFuel: 'Clean Fuel',

    // SMS Demo
    smsDemo: 'SMS Bus Tracker',
    smsInstructions: 'Text a stop code to see the next buses',
    smsPlaceholder: 'Enter stop code (e.g., SML04)',
    smsSend: 'Send',
    smsResponse: 'SMS Response',
    smsNoStop: 'Stop code not found. Try: SML01-SML10, SMN01-SMN13, DHM01-DHM07',

    // Admin
    dashboard: 'Dashboard',
    totalBuses: 'Total Buses Active',
    onTimePerformance: 'On-Time Performance',
    signalLostCount: 'Signal Lost',
    cleanFleetPercent: 'Clean Fleet %',
    recentAlerts: 'Recent Alerts',
    fleetOverview: 'Fleet Overview',
    filterByDepot: 'Filter by Depot',
    filterByRoute: 'Filter by Route',
    filterByFuel: 'Filter by Fuel Type',
    filterByStatus: 'Filter by Status',
    allDepots: 'All Depots',
    allRoutes: 'All Routes',
    allFuelTypes: 'All Fuel Types',
    allStatuses: 'All Statuses',
    punctualityReport: 'Punctuality Report',
    emissionsReport: 'Fleet Emissions Report',
    fleetUtilization: 'Fleet Utilization',
    breakdown: 'Breakdown',
    delayed: 'Delayed',
    running: 'Running',
    acknowledge: 'Acknowledge',
    resolve: 'Resolve',
    new: 'New',
    acknowledged: 'Acknowledged',
    resolved: 'Resolved',

    // Season toggle
    normalSeason: 'Normal Season',
    touristSeason: 'Tourist Season',
    seasonToggle: 'Season Mode',

    // General
    min: 'min',
    km: 'km',
    kmh: 'km/h',
    language: 'Language',
    hindi: 'हिन्दी',
    english: 'English',
    hinglish: 'Hinglish',
  },

  hi: {
    // App
    appName: 'एचआरटीसी बस ट्रैकर',
    appSubtitle: 'हिमाचल सड़क परिवहन निगम',
    tagline: 'रियल-टाइम वाहन ट्रैकिंग प्रणाली',

    // Navigation
    navHome: 'मुख्य पृष्ठ',
    navTrack: 'बस ट्रैक करें',
    navRoutes: 'मार्ग (Routes)',
    navSMS: 'एसएमएस बस ट्रैकर',
    navAdmin: 'एडमिन डैशबोर्ड',
    navAlerts: 'अलर्ट (Alerts)',
    navReports: 'रिपोर्ट्स',
    navFleetMap: 'फ्लीट मैप',
    navRouteManager: 'मार्ग प्रबंधन',

    // Home
    searchPlaceholder: 'मार्ग, स्टॉप या गंतव्य खोजें...',
    nearbyStops: 'निकटतम बस स्टॉप',
    popularRoutes: 'प्रमुख मार्ग',
    allRoutes: 'सभी मार्ग',
    activeBuses: 'सक्रिय बसें',
    busesNearMe: 'मेरे पास की बसें',
    viewRoute: 'मार्ग देखें',
    trackBus: 'लाइव बस ट्रैक करें',

    // Live tracking
    liveTracking: 'लाइव बस ट्रैकिंग',
    nextStop: 'अगला स्टॉप',
    finalDestination: 'अंतिम गंतव्य',
    etaLabel: 'अनुमानित समय (ETA)',
    arriving: 'पहुंचने वाली है',
    signalLost: 'जीपीएस सिग्नल नहीं है',
    lastUpdated: 'अंतिम अपडेट',
    secondsAgo: 'सेकंड पहले',
    minutesAgo: 'मिनट पहले',
    estimateWarning: 'अनुमानित समय दिखाया जा रहा है — जीपीएस सिग्नल उपलब्ध नहीं',
    notifyMe: '5 मिनट पहले अलर्ट करें',
    notificationSet: 'अलर्ट सेट हो गया! हम आपको सूचित करेंगे।',
    upcomingStops: 'आगामी स्टॉप्स',
    confidence: 'सटीकता',
    live: 'लाइव जीपीएस',
    estimated: 'अनुमानित',
    lowConfidence: 'कम सटीक',

    // Stop detail
    upcomingBuses: 'आने वाली बसें',
    noBuses: 'इस समय कोई बस निर्धारित नहीं है',
    stopCode: 'स्टॉप कोड',

    // Route detail
    routeDetails: 'मार्ग का संपूर्ण विवरण',
    stops: 'स्टॉप्स',
    schedule: 'समय सारणी',
    distance: 'कुल दूरी',
    typicalDuration: 'सामान्य समय',
    activeBusesOnRoute: 'मार्ग पर चल रही सक्रिय बसें',

    // Sustainability
    fuelType: 'ईंधन का प्रकार',
    emissionStandard: 'उत्सर्जन मानक',
    electric: 'इलेक्ट्रिक',
    diesel: 'डीजल',
    cng: 'सीएनजी',
    hybrid: 'हाइब्रिड',
    zeroEmission: 'शून्य उत्सर्जन (EV)',
    cleanFuel: 'स्वच्छ ईंधन',

    // SMS Demo
    smsDemo: 'एसएमएस बस ट्रैकर',
    smsInstructions: 'बस की स्थिति देखने के लिए स्टॉप कोड टेक्स्ट करें',
    smsPlaceholder: 'स्टॉप कोड दर्ज करें (उदा. SML04)',
    smsSend: 'भेजें',
    smsResponse: 'एसएमएस उत्तर',
    smsNoStop: 'स्टॉप कोड नहीं मिला। कृपया प्रयोग करें: SML01-SML10, SMN01-SMN13, DHM01-DHM07',

    // Admin
    dashboard: 'डैशबोर्ड',
    totalBuses: 'कुल सक्रिय बसें',
    onTimePerformance: 'समय-पाबंदी प्रदर्शन',
    signalLostCount: 'सिग्नल बंद बसें',
    cleanFleetPercent: 'स्वच्छ वाहन %',
    recentAlerts: 'हाल की चेतावनियां',
    fleetOverview: 'फ्लीट ओवरव्यू',
    filterByDepot: 'डिपो अनुसार फिल्टर',
    filterByRoute: 'मार्ग अनुसार फिल्टर',
    filterByFuel: 'ईंधन अनुसार फिल्टर',
    filterByStatus: 'स्थिति अनुसार फिल्टर',
    allDepots: 'सभी डिपो',
    allRoutes: 'सभी मार्ग',
    allFuelTypes: 'सभी ईंधन प्रकार',
    allStatuses: 'सभी स्थितियां',
    punctualityReport: 'समय-पाबंदी रिपोर्ट',
    emissionsReport: 'उत्सर्जन रिपोर्ट',
    fleetUtilization: 'वाहन उपयोग',
    breakdown: 'ब्रेकडाउन',
    delayed: 'विलंबित (Late)',
    running: 'चल रही है (On Time)',
    acknowledge: 'स्वीकार करें',
    resolve: 'समाधान करें',
    new: 'नया',
    acknowledged: 'स्वीकृत',
    resolved: 'समाधानित',

    // Season toggle
    normalSeason: 'सामान्य मौसम',
    touristSeason: 'पर्यटन सीजन',
    seasonToggle: 'सीजन मोड',

    // General
    min: 'मिनट',
    km: 'किमी',
    kmh: 'किमी/घंटा',
    language: 'भाषा',
    hindi: 'हिन्दी',
    english: 'English',
  },
};
