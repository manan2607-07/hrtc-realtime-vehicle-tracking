/**
 * HRTC Route Data — Real Himachal Pradesh routes
 * Coordinates sourced from OpenStreetMap for accuracy
 * Each route has: metadata, ordered stops with real lat/lng, and route polyline waypoints
 */

export const ROUTES = [
  {
    id: 'route-1',
    routeNo: '01',
    name: 'Shimla Local',
    origin: 'Shimla ISBT (Tutikandi)',
    destination: 'Kufri',
    distanceKm: 16,
    typicalDurationMin: 45,
    depotId: 'depot-shimla',
    stops: [
      { id: 'stop-101', name: 'Shimla ISBT (Tutikandi)', lat: 31.1048, lng: 77.1650, code: 'SML01', seqNo: 1, scheduledMin: 0, elevationMeters: 2080 },
      { id: 'stop-102', name: 'Victory Tunnel', lat: 31.1060, lng: 77.1710, code: 'SML02', seqNo: 2, scheduledMin: 5, elevationMeters: 2180 },
      { id: 'stop-103', name: 'Lakkar Bazaar', lat: 31.1065, lng: 77.1755, code: 'SML03', seqNo: 3, scheduledMin: 9, elevationMeters: 2200 },
      { id: 'stop-104', name: 'The Ridge', lat: 31.1048, lng: 77.1734, code: 'SML04', seqNo: 4, scheduledMin: 12, elevationMeters: 2240 },
      { id: 'stop-105', name: 'Scandal Point', lat: 31.1040, lng: 77.1720, code: 'SML05', seqNo: 5, scheduledMin: 14, elevationMeters: 2235 },
      { id: 'stop-106', name: 'Chhota Shimla', lat: 31.0985, lng: 77.1810, code: 'SML06', seqNo: 6, scheduledMin: 20, elevationMeters: 2150 },
      { id: 'stop-107', name: 'Sanjauli', lat: 31.0920, lng: 77.1895, code: 'SML07', seqNo: 7, scheduledMin: 26, elevationMeters: 2210 },
      { id: 'stop-108', name: 'Dhalli', lat: 31.0870, lng: 77.2050, code: 'SML08', seqNo: 8, scheduledMin: 33, elevationMeters: 2100 },
      { id: 'stop-109', name: 'Fagu', lat: 31.0810, lng: 77.2200, code: 'SML09', seqNo: 9, scheduledMin: 38, elevationMeters: 2450 },
      { id: 'stop-110', name: 'Kufri', lat: 31.0972, lng: 77.2641, code: 'SML10', seqNo: 10, scheduledMin: 45, elevationMeters: 2720 },
    ],
    waypoints: [
      [31.1048, 77.1650], [31.1050, 77.1665], [31.1053, 77.1680], [31.1057, 77.1695],
      [31.1060, 77.1710], [31.1062, 77.1725], [31.1063, 77.1738], [31.1065, 77.1755],
      [31.1060, 77.1748], [31.1055, 77.1740], [31.1048, 77.1734], [31.1044, 77.1727],
      [31.1040, 77.1720], [31.1030, 77.1735], [31.1020, 77.1760], [31.1008, 77.1780],
      [31.0985, 77.1810], [31.0970, 77.1835], [31.0955, 77.1860], [31.0940, 77.1878],
      [31.0920, 77.1895], [31.0908, 77.1930], [31.0895, 77.1965], [31.0883, 77.2010],
      [31.0870, 77.2050], [31.0855, 77.2090], [31.0842, 77.2130], [31.0828, 77.2168],
      [31.0810, 77.2200], [31.0815, 77.2250], [31.0830, 77.2300], [31.0860, 77.2360],
      [31.0900, 77.2430], [31.0930, 77.2510], [31.0950, 77.2570], [31.0972, 77.2641],
    ],
    signalLossZones: [],
    segmentSpeeds: {
      normal: [28, 25, 22, 20, 22, 25, 22, 20, 18, 22, 25, 28, 26, 24, 22, 25, 26, 28, 30, 26, 24, 22, 25, 26, 28, 26, 24, 22, 25, 26, 28, 30, 28, 26, 24],
      touristSeason: [18, 15, 14, 12, 14, 18, 15, 12, 10, 14, 18, 20, 18, 15, 12, 15, 18, 20, 22, 18, 15, 12, 15, 18, 20, 18, 15, 12, 15, 18, 20, 22, 20, 18, 15],
    },
    color: '#2980B9',
  },
  {
    id: 'route-2',
    routeNo: '02',
    name: 'Shimla–Manali Highway',
    origin: 'Shimla ISBT',
    destination: 'Manali Bus Stand',
    distanceKm: 260,
    typicalDurationMin: 540,
    depotId: 'depot-shimla',
    stops: [
      { id: 'stop-201', name: 'Shimla ISBT', lat: 31.1048, lng: 77.1650, code: 'SMN01', seqNo: 1, scheduledMin: 0, elevationMeters: 2080 },
      { id: 'stop-202', name: 'Shoghi', lat: 31.1280, lng: 77.1240, code: 'SMN02', seqNo: 2, scheduledMin: 30, elevationMeters: 1850 },
      { id: 'stop-203', name: 'Kandaghat', lat: 30.9648, lng: 77.1165, code: 'SMN03', seqNo: 3, scheduledMin: 60, elevationMeters: 1425 },
      { id: 'stop-204', name: 'Solan', lat: 30.9045, lng: 77.0967, code: 'SMN04', seqNo: 4, scheduledMin: 90, elevationMeters: 1502 },
      { id: 'stop-205', name: 'Bilaspur', lat: 31.3324, lng: 76.7574, code: 'SMN05', seqNo: 5, scheduledMin: 180, elevationMeters: 550 },
      { id: 'stop-206', name: 'Sundernagar', lat: 31.5280, lng: 76.8810, code: 'SMN06', seqNo: 6, scheduledMin: 270, elevationMeters: 860 },
      { id: 'stop-207', name: 'Mandi', lat: 31.7130, lng: 76.9320, code: 'SMN07', seqNo: 7, scheduledMin: 330, elevationMeters: 760 },
      { id: 'stop-208', name: 'Pandoh', lat: 31.7045, lng: 77.0510, code: 'SMN08', seqNo: 8, scheduledMin: 360, elevationMeters: 890 },
      { id: 'stop-209', name: 'Aut', lat: 31.7850, lng: 77.0700, code: 'SMN09', seqNo: 9, scheduledMin: 390, elevationMeters: 900 },
      { id: 'stop-210', name: 'Bhuntar', lat: 31.8776, lng: 77.1610, code: 'SMN10', seqNo: 10, scheduledMin: 420, elevationMeters: 1090 },
      { id: 'stop-211', name: 'Kullu', lat: 31.9592, lng: 77.1089, code: 'SMN11', seqNo: 11, scheduledMin: 450, elevationMeters: 1279 },
      { id: 'stop-212', name: 'Naggar', lat: 32.1147, lng: 77.1710, code: 'SMN12', seqNo: 12, scheduledMin: 490, elevationMeters: 1800 },
      { id: 'stop-213', name: 'Manali Bus Stand', lat: 32.2432, lng: 77.1892, code: 'SMN13', seqNo: 13, scheduledMin: 540, elevationMeters: 2050 },
    ],
    waypoints: [
      [31.1048, 77.1650], [31.1120, 77.1500], [31.1200, 77.1350], [31.1280, 77.1240],
      [31.0900, 77.1200], [31.0500, 77.1180], [30.9648, 77.1165], [30.9400, 77.1100],
      [30.9045, 77.0967], [30.9500, 77.0400], [31.0200, 76.9500], [31.1000, 76.8800],
      [31.2000, 76.8000], [31.3324, 76.7574], [31.4000, 76.8000], [31.4500, 76.8400],
      [31.5280, 76.8810], [31.5800, 76.9000], [31.6300, 76.9100], [31.6700, 76.9200],
      [31.7130, 76.9320], [31.7100, 76.9600], [31.7080, 76.9900], [31.7050, 77.0200],
      [31.7045, 77.0510], [31.7200, 77.0580], [31.7500, 77.0620], [31.7850, 77.0700],
      [31.8100, 77.0900], [31.8400, 77.1200], [31.8776, 77.1610], [31.9100, 77.1400],
      [31.9592, 77.1089], [32.0000, 77.1200], [32.0500, 77.1400], [32.1147, 77.1710],
      [32.1500, 77.1750], [32.1800, 77.1800], [32.2100, 77.1850], [32.2432, 77.1892],
    ],
    signalLossZones: [],
    segmentSpeeds: {
      normal: [36, 40, 35, 32, 36, 40, 36, 32, 36, 42, 48, 42, 36, 40, 42, 48, 42, 36, 35, 36, 40, 42, 36, 32, 36, 42, 48, 42, 36, 42, 48, 42, 36, 40, 42, 36, 35, 36, 40],
      touristSeason: [25, 28, 22, 20, 25, 28, 25, 20, 25, 30, 35, 30, 25, 28, 30, 35, 30, 25, 22, 25, 28, 30, 25, 20, 25, 30, 35, 30, 25, 30, 35, 30, 25, 28, 30, 25, 22, 25, 28],
    },
    color: '#E74C3C',
  },
  {
    id: 'route-3',
    routeNo: '03',
    name: 'Dharamshala–McLeod Ganj',
    origin: 'Dharamshala Bus Stand',
    destination: 'McLeod Ganj',
    distanceKm: 9,
    typicalDurationMin: 30,
    depotId: 'depot-dharamshala',
    stops: [
      { id: 'stop-301', name: 'Dharamshala Bus Stand', lat: 32.2190, lng: 76.3234, code: 'DHM01', seqNo: 1, scheduledMin: 0, elevationMeters: 1457 },
      { id: 'stop-302', name: 'Kotwali Bazaar', lat: 32.2200, lng: 76.3190, code: 'DHM02', seqNo: 2, scheduledMin: 4, elevationMeters: 1520 },
      { id: 'stop-303', name: 'Forsyth Ganj', lat: 32.2230, lng: 76.3210, code: 'DHM03', seqNo: 3, scheduledMin: 8, elevationMeters: 1750 },
      { id: 'stop-304', name: 'Gangchen Kyishong', lat: 32.2310, lng: 76.3230, code: 'DHM04', seqNo: 4, scheduledMin: 13, elevationMeters: 1840 },
      { id: 'stop-305', name: 'Jogiwara Road', lat: 32.2380, lng: 76.3200, code: 'DHM05', seqNo: 5, scheduledMin: 18, elevationMeters: 1960 },
      { id: 'stop-306', name: 'Bhagsu Nag Turn', lat: 32.2420, lng: 76.3210, code: 'DHM06', seqNo: 6, scheduledMin: 23, elevationMeters: 2040 },
      { id: 'stop-307', name: 'McLeod Ganj Square', lat: 32.2426, lng: 76.3188, code: 'DHM07', seqNo: 7, scheduledMin: 30, elevationMeters: 2082 },
    ],
    waypoints: [
      [32.2190, 76.3234], [32.2195, 76.3215], [32.2200, 76.3190], [32.2210, 76.3195],
      [32.2220, 76.3200], [32.2230, 76.3210], [32.2250, 76.3215], [32.2270, 76.3220],
      [32.2290, 76.3225], [32.2310, 76.3230], [32.2330, 76.3225], [32.2350, 76.3215],
      [32.2370, 76.3205], [32.2380, 76.3200], [32.2390, 76.3202], [32.2400, 76.3205],
      [32.2410, 76.3208], [32.2420, 76.3210], [32.2423, 76.3200], [32.2426, 76.3188],
    ],
    signalLossZones: [],
    segmentSpeeds: {
      normal: [22, 20, 20, 22, 20, 18, 20, 18, 20, 20, 18, 16, 18, 20, 18, 16, 18, 16, 16],
      touristSeason: [14, 12, 12, 14, 12, 10, 12, 10, 12, 12, 10, 8, 10, 12, 10, 8, 10, 8, 8],
    },
    color: '#27AE60',
  },
  {
    id: 'route-4',
    routeNo: '04',
    name: 'Shimla–Chandigarh Express',
    origin: 'Shimla ISBT (Tutikandi)',
    destination: 'Chandigarh Sector 43 ISBT',
    distanceKm: 112,
    typicalDurationMin: 210,
    depotId: 'depot-shimla',
    stops: [
      { id: 'stop-401', name: 'Shimla ISBT (Tutikandi)', lat: 31.1048, lng: 77.1650, code: 'SMC01', seqNo: 1, scheduledMin: 0, elevationMeters: 2080 },
      { id: 'stop-402', name: 'Shoghi', lat: 31.1280, lng: 77.1240, code: 'SMC02', seqNo: 2, scheduledMin: 25, elevationMeters: 1850 },
      { id: 'stop-403', name: 'Kandaghat', lat: 30.9648, lng: 77.1165, code: 'SMC03', seqNo: 3, scheduledMin: 55, elevationMeters: 1425 },
      { id: 'stop-404', name: 'Solan', lat: 30.9045, lng: 77.0967, code: 'SMC04', seqNo: 4, scheduledMin: 85, elevationMeters: 1502 },
      { id: 'stop-405', name: 'Dharampur', lat: 30.8920, lng: 77.0250, code: 'SMC05', seqNo: 5, scheduledMin: 115, elevationMeters: 1480 },
      { id: 'stop-406', name: 'Parwanoo', lat: 30.8350, lng: 76.9610, code: 'SMC06', seqNo: 6, scheduledMin: 145, elevationMeters: 600 },
      { id: 'stop-407', name: 'Kalka', lat: 30.8380, lng: 76.9350, code: 'SMC07', seqNo: 7, scheduledMin: 160, elevationMeters: 500 },
      { id: 'stop-408', name: 'Zirakpur', lat: 30.6420, lng: 76.8170, code: 'SMC08', seqNo: 8, scheduledMin: 190, elevationMeters: 330 },
      { id: 'stop-409', name: 'Chandigarh Sector 43 ISBT', lat: 30.7230, lng: 76.7450, code: 'SMC09', seqNo: 9, scheduledMin: 210, elevationMeters: 350 },
    ],
    waypoints: [
      [31.1048, 77.1650], [31.1200, 77.1350], [31.1280, 77.1240], [31.0500, 77.1180],
      [30.9648, 77.1165], [30.9300, 77.1050], [30.9045, 77.0967], [30.8980, 77.0600],
      [30.8920, 77.0250], [30.8600, 76.9900], [30.8350, 76.9610], [30.8380, 76.9350],
      [30.7500, 76.8700], [30.6420, 76.8170], [30.6800, 76.7800], [30.7230, 76.7450]
    ],
    signalLossZones: [],
    segmentSpeeds: {
      normal: [36, 42, 45, 48, 52, 58, 55, 48, 42, 38, 48, 55, 62, 55, 48],
      touristSeason: [25, 28, 30, 32, 35, 42, 38, 32, 28, 25, 32, 38, 45, 38, 30],
    },
    color: '#8E44AD',
  },
  {
    id: 'route-5',
    routeNo: '05',
    name: 'Dharamshala–Chandigarh Deluxe',
    origin: 'Dharamshala Bus Stand',
    destination: 'Chandigarh Sector 43 ISBT',
    distanceKm: 240,
    typicalDurationMin: 360,
    depotId: 'depot-dharamshala',
    stops: [
      { id: 'stop-501', name: 'Dharamshala Bus Stand', lat: 32.2190, lng: 76.3234, code: 'DHC01', seqNo: 1, scheduledMin: 0, elevationMeters: 1457 },
      { id: 'stop-502', name: 'Kangra', lat: 32.0998, lng: 76.2691, code: 'DHC02', seqNo: 2, scheduledMin: 40, elevationMeters: 733 },
      { id: 'stop-503', name: 'Ranital', lat: 31.9350, lng: 76.2250, code: 'DHC03', seqNo: 3, scheduledMin: 80, elevationMeters: 560 },
      { id: 'stop-504', name: 'Dehra', lat: 31.8790, lng: 76.2200, code: 'DHC04', seqNo: 4, scheduledMin: 110, elevationMeters: 450 },
      { id: 'stop-505', name: 'Amb', lat: 31.6850, lng: 76.1150, code: 'DHC05', seqNo: 5, scheduledMin: 160, elevationMeters: 380 },
      { id: 'stop-506', name: 'Una', lat: 31.4685, lng: 76.2708, code: 'DHC06', seqNo: 6, scheduledMin: 210, elevationMeters: 369 },
      { id: 'stop-507', name: 'Anandpur Sahib', lat: 31.2350, lng: 76.5020, code: 'DHC07', seqNo: 7, scheduledMin: 260, elevationMeters: 320 },
      { id: 'stop-508', name: 'Ropar', lat: 30.9660, lng: 76.5240, code: 'DHC08', seqNo: 8, scheduledMin: 310, elevationMeters: 275 },
      { id: 'stop-509', name: 'Chandigarh Sector 43 ISBT', lat: 30.7230, lng: 76.7450, code: 'DHC09', seqNo: 9, scheduledMin: 360, elevationMeters: 350 },
    ],
    waypoints: [
      [32.2190, 76.3234], [32.1600, 76.2900], [32.0998, 76.2691], [32.0200, 76.2400],
      [31.9350, 76.2250], [31.8790, 76.2200], [31.7800, 76.1600], [31.6850, 76.1150],
      [31.5700, 76.1800], [31.4685, 76.2708], [31.3500, 76.3800], [31.2350, 76.5020],
      [31.1000, 76.5100], [30.9660, 76.5240], [30.8400, 76.6300], [30.7230, 76.7450]
    ],
    signalLossZones: [],
    segmentSpeeds: {
      normal: [38, 42, 48, 45, 52, 58, 62, 60, 55, 58, 62, 65, 60, 55, 48],
      touristSeason: [25, 28, 32, 28, 35, 40, 45, 42, 35, 40, 45, 50, 42, 35, 28],
    },
    color: '#D35400',
  },
  {
    id: 'route-6',
    routeNo: '06',
    name: 'Manali–Delhi HIM-MANI Volvo',
    origin: 'Manali Bus Stand',
    destination: 'Delhi ISBT Kashmiri Gate',
    distanceKm: 530,
    typicalDurationMin: 720,
    depotId: 'depot-manali',
    stops: [
      { id: 'stop-601', name: 'Manali Bus Stand', lat: 32.2432, lng: 77.1892, code: 'MND01', seqNo: 1, scheduledMin: 0, elevationMeters: 2050 },
      { id: 'stop-602', name: 'Kullu', lat: 31.9592, lng: 77.1089, code: 'MND02', seqNo: 2, scheduledMin: 75, elevationMeters: 1279 },
      { id: 'stop-603', name: 'Bhuntar', lat: 31.8776, lng: 77.1610, code: 'MND03', seqNo: 3, scheduledMin: 100, elevationMeters: 1090 },
      { id: 'stop-604', name: 'Aut', lat: 31.7850, lng: 77.0700, code: 'MND04', seqNo: 4, scheduledMin: 130, elevationMeters: 900 },
      { id: 'stop-605', name: 'Mandi', lat: 31.7130, lng: 76.9320, code: 'MND05', seqNo: 5, scheduledMin: 180, elevationMeters: 760 },
      { id: 'stop-606', name: 'Sundernagar', lat: 31.5280, lng: 76.8810, code: 'MND06', seqNo: 6, scheduledMin: 220, elevationMeters: 860 },
      { id: 'stop-607', name: 'Bilaspur', lat: 31.3324, lng: 76.7574, code: 'MND07', seqNo: 7, scheduledMin: 280, elevationMeters: 550 },
      { id: 'stop-608', name: 'Swarghat', lat: 31.2330, lng: 76.5500, code: 'MND08', seqNo: 8, scheduledMin: 330, elevationMeters: 900 },
      { id: 'stop-609', name: 'Chandigarh Sector 43 ISBT', lat: 30.7230, lng: 76.7450, code: 'MND09', seqNo: 9, scheduledMin: 420, elevationMeters: 350 },
      { id: 'stop-610', name: 'Ambala', lat: 30.3780, lng: 76.7760, code: 'MND10', seqNo: 10, scheduledMin: 500, elevationMeters: 272 },
      { id: 'stop-611', name: 'Delhi ISBT Kashmiri Gate', lat: 28.6665, lng: 77.2333, code: 'MND11', seqNo: 11, scheduledMin: 720, elevationMeters: 216 },
    ],
    waypoints: [
      [32.2432, 77.1892], [32.1147, 77.1710], [31.9592, 77.1089], [31.8776, 77.1610],
      [31.7850, 77.0700], [31.7045, 77.0510], [31.7130, 76.9320], [31.5280, 76.8810],
      [31.3324, 76.7574], [31.2330, 76.5500], [30.9660, 76.5240], [30.7230, 76.7450],
      [30.3780, 76.7760], [29.9690, 76.8780], [29.3900, 76.9690], [28.6665, 77.2333]
    ],
    signalLossZones: [],
    segmentSpeeds: {
      normal: [42, 45, 42, 38, 45, 48, 45, 42, 58, 62, 65, 68, 65, 60, 58],
      touristSeason: [28, 30, 28, 25, 30, 35, 30, 28, 42, 48, 50, 52, 50, 45, 42],
    },
    color: '#16A085',
  },
  {
    id: 'route-7',
    routeNo: '07',
    name: 'Shimla–Dharamshala Super Fast',
    origin: 'Shimla ISBT (Tutikandi)',
    destination: 'Dharamshala Bus Stand',
    distanceKm: 235,
    typicalDurationMin: 420,
    depotId: 'depot-shimla',
    stops: [
      { id: 'stop-701', name: 'Shimla ISBT (Tutikandi)', lat: 31.1048, lng: 77.1650, code: 'SMD01', seqNo: 1, scheduledMin: 0, elevationMeters: 2080 },
      { id: 'stop-702', name: 'Shalaghat', lat: 31.2200, lng: 77.0100, code: 'SMD02', seqNo: 2, scheduledMin: 50, elevationMeters: 1450 },
      { id: 'stop-703', name: 'Bilaspur', lat: 31.3324, lng: 76.7574, code: 'SMD03', seqNo: 3, scheduledMin: 110, elevationMeters: 550 },
      { id: 'stop-704', name: 'Ghumarwin', lat: 31.4390, lng: 76.7110, code: 'SMD04', seqNo: 4, scheduledMin: 150, elevationMeters: 610 },
      { id: 'stop-705', name: 'Hamirpur', lat: 31.6862, lng: 76.5213, code: 'SMD05', seqNo: 5, scheduledMin: 210, elevationMeters: 785 },
      { id: 'stop-706', name: 'Nadaun', lat: 31.7820, lng: 76.3480, code: 'SMD06', seqNo: 6, scheduledMin: 250, elevationMeters: 508 },
      { id: 'stop-707', name: 'Jwalamukhi', lat: 31.8750, lng: 76.3240, code: 'SMD07', seqNo: 7, scheduledMin: 290, elevationMeters: 610 },
      { id: 'stop-708', name: 'Kangra', lat: 32.0998, lng: 76.2691, code: 'SMD08', seqNo: 8, scheduledMin: 360, elevationMeters: 733 },
      { id: 'stop-709', name: 'Dharamshala Bus Stand', lat: 32.2190, lng: 76.3234, code: 'SMD09', seqNo: 9, scheduledMin: 420, elevationMeters: 1457 },
    ],
    waypoints: [
      [31.1048, 77.1650], [31.1600, 77.0900], [31.2200, 77.0100], [31.2800, 76.8800],
      [31.3324, 76.7574], [31.4390, 76.7110], [31.5600, 76.6000], [31.6862, 76.5213],
      [31.7820, 76.3480], [31.8750, 76.3240], [31.9800, 76.2900], [32.0998, 76.2691],
      [32.1600, 76.2900], [32.2190, 76.3234]
    ],
    signalLossZones: [],
    segmentSpeeds: {
      normal: [36, 40, 36, 40, 45, 42, 48, 52, 45, 40, 45, 40, 36],
      touristSeason: [24, 28, 24, 28, 32, 30, 35, 38, 32, 28, 32, 28, 24],
    },
    color: '#2C3E50',
  },
  {
    id: 'route-8',
    routeNo: '08',
    name: 'Solan–Shimla Shuttle',
    origin: 'Solan',
    destination: 'Shimla ISBT (Tutikandi)',
    distanceKm: 48,
    typicalDurationMin: 90,
    depotId: 'depot-shimla',
    stops: [
      { id: 'stop-801', name: 'Solan', lat: 30.9045, lng: 77.0967, code: 'SLS01', seqNo: 1, scheduledMin: 0, elevationMeters: 1502 },
      { id: 'stop-802', name: 'Salogra', lat: 30.9320, lng: 77.1080, code: 'SLS02', seqNo: 2, scheduledMin: 15, elevationMeters: 1480 },
      { id: 'stop-803', name: 'Kandaghat', lat: 30.9648, lng: 77.1165, code: 'SLS03', seqNo: 3, scheduledMin: 30, elevationMeters: 1425 },
      { id: 'stop-804', name: 'Taradevi', lat: 31.0650, lng: 77.1350, code: 'SLS04', seqNo: 4, scheduledMin: 60, elevationMeters: 1850 },
      { id: 'stop-805', name: 'Shoghi', lat: 31.1280, lng: 77.1240, code: 'SLS05', seqNo: 5, scheduledMin: 75, elevationMeters: 1850 },
      { id: 'stop-806', name: 'Shimla ISBT (Tutikandi)', lat: 31.1048, lng: 77.1650, code: 'SLS06', seqNo: 6, scheduledMin: 90, elevationMeters: 2080 },
    ],
    waypoints: [
      [30.9045, 77.0967], [30.9320, 77.1080], [30.9648, 77.1165], [31.0200, 77.1250],
      [31.0650, 77.1350], [31.1280, 77.1240], [31.1048, 77.1650]
    ],
    signalLossZones: [],
    segmentSpeeds: {
      normal: [36, 38, 40, 36, 40, 36],
      touristSeason: [24, 26, 28, 24, 28, 24],
    },
    color: '#F39C12',
  },
];

export const DEPOTS = [
  { id: 'depot-shimla', name: 'Shimla Depot', lat: 31.1048, lng: 77.1650 },
  { id: 'depot-dharamshala', name: 'Dharamshala Depot', lat: 32.2190, lng: 76.3234 },
  { id: 'depot-manali', name: 'Manali Depot', lat: 32.2432, lng: 77.1892 },
  { id: 'depot-kullu', name: 'Kullu Depot', lat: 31.9592, lng: 77.1089 },
];

/**
 * Get all stops across all routes (deduplicated by ID)
 */
export function getAllStops() {
  const seen = new Set();
  const stops = [];
  for (const route of ROUTES) {
    for (const stop of route.stops) {
      if (!seen.has(stop.id)) {
        seen.add(stop.id);
        stops.push({ ...stop, routeId: route.id, routeNo: route.routeNo, routeName: route.name });
      }
    }
  }
  return stops;
}

/**
 * Find a stop by its short code (for SMS queries)
 */
export function findStopByCode(code) {
  for (const route of ROUTES) {
    for (const stop of route.stops) {
      if (stop.code.toUpperCase() === code.toUpperCase()) {
        return { ...stop, routeId: route.id, routeNo: route.routeNo, routeName: route.name };
      }
    }
  }
  return null;
}

/**
 * Find routes that pass through a given stop
 */
export function findRoutesForStop(stopId) {
  return ROUTES.filter(r => r.stops.some(s => s.id === stopId));
}
