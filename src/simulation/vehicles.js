/**
 * HRTC Fleet Data — Simulated vehicles with fuel/emission info, bus numbers & driver details
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
    busNumber: 'Bus #101',
    registrationNo: 'HP-01-A-1234',
    depotId: 'depot-shimla',
    routeId: 'route-1',
    capacity: 40,
    fuelType: FUEL_TYPES.ELECTRIC,
    emissionStandard: EMISSION_STANDARDS.ZERO,
    model: 'Tata Starbus EV',
    brandName: 'HIM TARANG',
    yearOfMfg: 2024,
    driver: {
      name: 'Ramesh Sharma',
      phone: '+91 98160-12341',
      empId: 'HRTC-D-4012',
      experienceYears: 12,
    },
  },
  {
    id: 'bus-002',
    busNumber: 'Bus #102',
    registrationNo: 'HP-01-B-5678',
    depotId: 'depot-shimla',
    routeId: 'route-1',
    capacity: 52,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Ashok Leyland Viking',
    brandName: null,
    yearOfMfg: 2023,
    driver: {
      name: 'Vikram Singh',
      phone: '+91 98160-12342',
      empId: 'HRTC-D-4015',
      experienceYears: 9,
    },
  },
  {
    id: 'bus-003',
    busNumber: 'Bus #103',
    registrationNo: 'HP-01-C-9012',
    depotId: 'depot-shimla',
    routeId: 'route-1',
    capacity: 36,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS4,
    model: 'Tata LP 712',
    brandName: null,
    yearOfMfg: 2018,
    driver: {
      name: 'Sunil Verma',
      phone: '+91 98160-12343',
      empId: 'HRTC-D-3890',
      experienceYears: 15,
    },
  },
  {
    id: 'bus-004',
    busNumber: 'Bus #104',
    registrationNo: 'HP-01-D-3456',
    depotId: 'depot-shimla',
    routeId: 'route-1',
    capacity: 25,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Force Traveller (Mini Bus)',
    brandName: null,
    yearOfMfg: 2025,
    driver: {
      name: 'Manoj Thakur',
      phone: '+91 98160-12344',
      empId: 'HRTC-D-4102',
      experienceYears: 6,
    },
  },
  {
    id: 'bus-005',
    busNumber: 'Bus #105',
    registrationNo: 'HP-01-E-7890',
    depotId: 'depot-shimla',
    routeId: 'route-1',
    capacity: 40,
    fuelType: FUEL_TYPES.ELECTRIC,
    emissionStandard: EMISSION_STANDARDS.ZERO,
    model: 'BYD K7',
    brandName: 'HIM TARANG',
    yearOfMfg: 2025,
    driver: {
      name: 'Sanjeev Kumar',
      phone: '+91 98160-12345',
      empId: 'HRTC-D-4201',
      experienceYears: 10,
    },
  },

  // Route 2 — Shimla–Manali (6 buses)
  {
    id: 'bus-006',
    busNumber: 'Bus #201',
    registrationNo: 'HP-01-F-2345',
    depotId: 'depot-shimla',
    routeId: 'route-2',
    capacity: 52,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Volvo B7R',
    brandName: 'HIMSUTA',
    yearOfMfg: 2022,
    driver: {
      name: 'Dharam Pal',
      phone: '+91 98160-23451',
      empId: 'HRTC-D-3510',
      experienceYears: 18,
    },
  },
  {
    id: 'bus-007',
    busNumber: 'Bus #202',
    registrationNo: 'HP-01-G-6789',
    depotId: 'depot-shimla',
    routeId: 'route-2',
    capacity: 45,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS4,
    model: 'Ashok Leyland Viking',
    brandName: null,
    yearOfMfg: 2019,
    driver: {
      name: 'Gurdeep Singh',
      phone: '+91 98160-23452',
      empId: 'HRTC-D-3620',
      experienceYears: 11,
    },
  },
  {
    id: 'bus-008',
    busNumber: 'Bus #203',
    registrationNo: 'HP-05-A-1122',
    depotId: 'depot-kullu',
    routeId: 'route-2',
    capacity: 52,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Tata Starbus',
    brandName: null,
    yearOfMfg: 2024,
    driver: {
      name: 'Kewal Krishan',
      phone: '+91 98160-23453',
      empId: 'HRTC-D-4155',
      experienceYears: 7,
    },
  },
  {
    id: 'bus-009',
    busNumber: 'Bus #204',
    registrationNo: 'HP-05-B-3344',
    depotId: 'depot-kullu',
    routeId: 'route-2',
    capacity: 40,
    fuelType: FUEL_TYPES.CNG,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Tata Starbus CNG',
    brandName: null,
    yearOfMfg: 2024,
    driver: {
      name: 'Devinder Kumar',
      phone: '+91 98160-23454',
      empId: 'HRTC-D-4190',
      experienceYears: 8,
    },
  },
  {
    id: 'bus-010',
    busNumber: 'Bus #205',
    registrationNo: 'HP-26-A-5566',
    depotId: 'depot-manali',
    routeId: 'route-2',
    capacity: 45,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS3,
    model: 'Tata LP 1512',
    brandName: null,
    yearOfMfg: 2014,
    driver: {
      name: 'Hemraj Sharma',
      phone: '+91 98160-23455',
      empId: 'HRTC-D-2980',
      experienceYears: 20,
    },
  },
  {
    id: 'bus-011',
    busNumber: 'Bus #206',
    registrationNo: 'HP-26-B-7788',
    depotId: 'depot-manali',
    routeId: 'route-2',
    capacity: 52,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Volvo B7R',
    brandName: 'HIMSUTA',
    yearOfMfg: 2023,
    driver: {
      name: 'Ashwani Kumar',
      phone: '+91 98160-23456',
      empId: 'HRTC-D-3744',
      experienceYears: 14,
    },
  },

  // Route 3 — Dharamshala–McLeod Ganj (4 buses)
  {
    id: 'bus-012',
    busNumber: 'Bus #301',
    registrationNo: 'HP-18-A-2233',
    depotId: 'depot-dharamshala',
    routeId: 'route-3',
    capacity: 40,
    fuelType: FUEL_TYPES.ELECTRIC,
    emissionStandard: EMISSION_STANDARDS.ZERO,
    model: 'Tata Starbus EV',
    brandName: 'HIM TARANG',
    yearOfMfg: 2025,
    driver: {
      name: 'Pankaj Guleria',
      phone: '+91 98160-34561',
      empId: 'HRTC-D-4230',
      experienceYears: 9,
    },
  },
  {
    id: 'bus-013',
    busNumber: 'Bus #302',
    registrationNo: 'HP-18-B-4455',
    depotId: 'depot-dharamshala',
    routeId: 'route-3',
    capacity: 25,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Force Traveller (Mini Bus)',
    brandName: null,
    yearOfMfg: 2025,
    driver: {
      name: 'Surinder Pal',
      phone: '+91 98160-34562',
      empId: 'HRTC-D-4250',
      experienceYears: 5,
    },
  },
  {
    id: 'bus-014',
    busNumber: 'Bus #303',
    registrationNo: 'HP-18-C-6677',
    depotId: 'depot-dharamshala',
    routeId: 'route-3',
    capacity: 36,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS4,
    model: 'Tata LP 712',
    brandName: null,
    yearOfMfg: 2017,
    driver: {
      name: 'Vijay Kumar',
      phone: '+91 98160-34563',
      empId: 'HRTC-D-3810',
      experienceYears: 13,
    },
  },
  {
    id: 'bus-015',
    busNumber: 'Bus #304',
    registrationNo: 'HP-18-D-8899',
    depotId: 'depot-dharamshala',
    routeId: 'route-3',
    capacity: 40,
    fuelType: FUEL_TYPES.CNG,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Ashok Leyland CNG',
    brandName: null,
    yearOfMfg: 2024,
    driver: {
      name: 'Mohan Lal',
      phone: '+91 98160-34564',
      empId: 'HRTC-D-4112',
      experienceYears: 10,
    },
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

/**
 * Find a bus by driver's phone number (handles formatted or unformatted inputs)
 */
export function findBusByDriverPhone(phoneQuery) {
  if (!phoneQuery) return null;
  const cleanQuery = phoneQuery.replace(/\D/g, ''); // strip non-digits
  if (!cleanQuery) return null;

  return VEHICLES.find(v => {
    if (!v.driver?.phone) return false;
    const cleanPhone = v.driver.phone.replace(/\D/g, '');
    return cleanPhone.includes(cleanQuery) || cleanQuery.includes(cleanPhone.slice(-10));
  });
}

/**
 * Find a bus by bus number (e.g. "101", "Bus #101", "Bus 101")
 */
export function findBusByNumber(busNoQuery) {
  if (!busNoQuery) return null;
  const q = busNoQuery.trim().toLowerCase().replace(/bus\s*#?/g, '');
  return VEHICLES.find(v => {
    const busNum = v.busNumber.toLowerCase().replace(/bus\s*#?/g, '');
    return busNum === q || v.busNumber.toLowerCase().includes(q);
  });
}

/**
 * Find buses matching a driver's name
 */
export function findBusesByDriverName(nameQuery) {
  if (!nameQuery) return [];
  const q = nameQuery.trim().toLowerCase();
  return VEHICLES.filter(v => v.driver?.name?.toLowerCase().includes(q));
}
