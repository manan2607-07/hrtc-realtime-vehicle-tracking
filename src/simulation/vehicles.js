/**
 * HRTC Fleet Data — Simulated vehicles with fuel/emission info
 * Represents HRTC's real mixed fleet: old diesel, newer BS-VI, CNG, and electric
 */

export const FUEL_TYPES = {
  DIESEL: 'Diesel',
  CNG: 'CNG',
  ELECTRIC: 'Electric',
  HYBRID: 'Hybrid',
};

export const EMISSION_STANDARDS = {
  BS3: 'BS-III',
  BS4: 'BS-IV',
  BS6: 'BS-VI',
  ZERO: 'Zero Emission',
  NA: 'N/A',
};

export const VEHICLE_STATUS = {
  RUNNING: 'running',
  DELAYED: 'delayed',
  BREAKDOWN: 'breakdown',
  SIGNAL_LOST: 'signal-lost',
  AT_DEPOT: 'at-depot',
};

export const VEHICLES = [
  // Route 1 — Shimla Local (5 buses)
  {
    id: 'bus-001',
    registrationNo: 'HP-01-A-1234',
    depotId: 'depot-shimla',
    routeId: 'route-1',
    capacity: 40,
    fuelType: FUEL_TYPES.ELECTRIC,
    emissionStandard: EMISSION_STANDARDS.ZERO,
    model: 'Tata Starbus EV',
    brandName: 'HIM TARANG',
    yearOfMfg: 2024,
  },
  {
    id: 'bus-002',
    registrationNo: 'HP-01-B-5678',
    depotId: 'depot-shimla',
    routeId: 'route-1',
    capacity: 52,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Ashok Leyland Viking',
    brandName: null,
    yearOfMfg: 2023,
  },
  {
    id: 'bus-003',
    registrationNo: 'HP-01-C-9012',
    depotId: 'depot-shimla',
    routeId: 'route-1',
    capacity: 36,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS4,
    model: 'Tata LP 712',
    brandName: null,
    yearOfMfg: 2018,
  },
  {
    id: 'bus-004',
    registrationNo: 'HP-01-D-3456',
    depotId: 'depot-shimla',
    routeId: 'route-1',
    capacity: 25,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Force Traveller (Mini Bus)',
    brandName: null,
    yearOfMfg: 2025,
  },
  {
    id: 'bus-005',
    registrationNo: 'HP-01-E-7890',
    depotId: 'depot-shimla',
    routeId: 'route-1',
    capacity: 40,
    fuelType: FUEL_TYPES.ELECTRIC,
    emissionStandard: EMISSION_STANDARDS.ZERO,
    model: 'BYD K7',
    brandName: 'HIM TARANG',
    yearOfMfg: 2025,
  },

  // Route 2 — Shimla–Manali (6 buses)
  {
    id: 'bus-006',
    registrationNo: 'HP-01-F-2345',
    depotId: 'depot-shimla',
    routeId: 'route-2',
    capacity: 52,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Volvo B7R',
    brandName: 'HIMSUTA',
    yearOfMfg: 2022,
  },
  {
    id: 'bus-007',
    registrationNo: 'HP-01-G-6789',
    depotId: 'depot-shimla',
    routeId: 'route-2',
    capacity: 45,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS4,
    model: 'Ashok Leyland Viking',
    brandName: null,
    yearOfMfg: 2019,
  },
  {
    id: 'bus-008',
    registrationNo: 'HP-05-A-1122',
    depotId: 'depot-kullu',
    routeId: 'route-2',
    capacity: 52,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Tata Starbus',
    brandName: null,
    yearOfMfg: 2024,
  },
  {
    id: 'bus-009',
    registrationNo: 'HP-05-B-3344',
    depotId: 'depot-kullu',
    routeId: 'route-2',
    capacity: 40,
    fuelType: FUEL_TYPES.CNG,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Tata Starbus CNG',
    brandName: null,
    yearOfMfg: 2024,
  },
  {
    id: 'bus-010',
    registrationNo: 'HP-26-A-5566',
    depotId: 'depot-manali',
    routeId: 'route-2',
    capacity: 45,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS3,
    model: 'Tata LP 1512',
    brandName: null,
    yearOfMfg: 2014,
  },
  {
    id: 'bus-011',
    registrationNo: 'HP-26-B-7788',
    depotId: 'depot-manali',
    routeId: 'route-2',
    capacity: 52,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Volvo B7R',
    brandName: 'HIMSUTA',
    yearOfMfg: 2023,
  },

  // Route 3 — Dharamshala–McLeod Ganj (4 buses)
  {
    id: 'bus-012',
    registrationNo: 'HP-18-A-2233',
    depotId: 'depot-dharamshala',
    routeId: 'route-3',
    capacity: 40,
    fuelType: FUEL_TYPES.ELECTRIC,
    emissionStandard: EMISSION_STANDARDS.ZERO,
    model: 'Tata Starbus EV',
    brandName: 'HIM TARANG',
    yearOfMfg: 2025,
  },
  {
    id: 'bus-013',
    registrationNo: 'HP-18-B-4455',
    depotId: 'depot-dharamshala',
    routeId: 'route-3',
    capacity: 25,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Force Traveller (Mini Bus)',
    brandName: null,
    yearOfMfg: 2025,
  },
  {
    id: 'bus-014',
    registrationNo: 'HP-18-C-6677',
    depotId: 'depot-dharamshala',
    routeId: 'route-3',
    capacity: 36,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS4,
    model: 'Tata LP 712',
    brandName: null,
    yearOfMfg: 2017,
  },
  {
    id: 'bus-015',
    registrationNo: 'HP-18-D-8899',
    depotId: 'depot-dharamshala',
    routeId: 'route-3',
    capacity: 40,
    fuelType: FUEL_TYPES.CNG,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Ashok Leyland CNG',
    brandName: null,
    yearOfMfg: 2024,
  },
];

/**
 * Get vehicles for a specific route
 */
export function getVehiclesForRoute(routeId) {
  return VEHICLES.filter(v => v.routeId === routeId);
}

/**
 * Get vehicles for a specific depot
 */
export function getVehiclesForDepot(depotId) {
  return VEHICLES.filter(v => v.depotId === depotId);
}

/**
 * Fleet emissions summary for admin reports
 */
export function getFleetEmissionsSummary() {
  const total = VEHICLES.length;
  const byFuel = {};
  const byEmission = {};

  VEHICLES.forEach(v => {
    byFuel[v.fuelType] = (byFuel[v.fuelType] || 0) + 1;
    byEmission[v.emissionStandard] = (byEmission[v.emissionStandard] || 0) + 1;
  });

  const cleanCount = VEHICLES.filter(v =>
    v.fuelType === FUEL_TYPES.ELECTRIC ||
    v.fuelType === FUEL_TYPES.CNG ||
    v.emissionStandard === EMISSION_STANDARDS.BS6
  ).length;

  return {
    total,
    byFuel,
    byEmission,
    cleanPercentage: Math.round((cleanCount / total) * 100),
  };
}
