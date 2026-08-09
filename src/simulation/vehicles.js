/**
 * HRTC Official Fleet & Staff Directory
 * Authentic HRTC bus service classes, RTO registrations, driver credentials, and conductors
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
    serviceClass: 'HIM TARANG EV (Zero Emission)',
    registrationNo: 'HP-63-EV-1001',
    depotId: 'depot-shimla',
    depotName: 'Shimla Dhalli Depot',
    routeId: 'route-1',
    capacity: 40,
    fuelType: FUEL_TYPES.ELECTRIC,
    emissionStandard: EMISSION_STANDARDS.ZERO,
    model: 'Tata Starbus Urban EV 9m',
    brandName: 'HIM TARANG',
    yearOfMfg: 2024,
    ais140DeviceId: 'AIS140-HP01-884901',
    driver: {
      name: 'Prem Chand Sharma',
      phone: '+91 98160-12341',
      empId: 'HRTC-DRV-1984',
      licenseNo: 'HP01-2008-004921',
      badge: 'Certified EV Hill Master',
      experienceYears: 18,
      conductor: {
        name: 'Dhani Ram Rana',
        empId: 'HRTC-CND-3312',
        phone: '+91 98160-55011',
      },
    },
  },
  {
    id: 'bus-002',
    busNumber: 'Bus #102',
    serviceClass: 'SHIMLA CITY ORDINARY',
    registrationNo: 'HP-01-A-5678',
    depotId: 'depot-shimla',
    depotName: 'Shimla Dhalli Depot',
    routeId: 'route-1',
    capacity: 52,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Ashok Leyland Viking BS-VI',
    brandName: null,
    yearOfMfg: 2023,
    ais140DeviceId: 'AIS140-HP01-884902',
    driver: {
      name: 'Desh Raj Thakur',
      phone: '+91 98160-12342',
      empId: 'HRTC-DRV-2104',
      licenseNo: 'HP65-2012-008122',
      badge: 'Senior Mountain Driver',
      experienceYears: 14,
      conductor: {
        name: 'Kuldeep Singh Chandel',
        empId: 'HRTC-CND-3490',
        phone: '+91 98160-55012',
      },
    },
  },
  {
    id: 'bus-003',
    busNumber: 'Bus #103',
    serviceClass: 'EXPRESS ORDINARY',
    registrationNo: 'HP-12-C-9012',
    depotId: 'depot-shimla',
    depotName: 'Shimla ISBT Depot',
    routeId: 'route-1',
    capacity: 36,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS4,
    model: 'Tata LP 712/38 BS-IV',
    brandName: null,
    yearOfMfg: 2018,
    ais140DeviceId: 'AIS140-HP01-884903',
    driver: {
      name: 'Subhash Chand Verma',
      phone: '+91 98160-12343',
      empId: 'HRTC-DRV-2401',
      licenseNo: 'HP01-2015-001049',
      badge: 'Hill Route Driver',
      experienceYears: 12,
      conductor: {
        name: 'Rajesh Kumar Sharma',
        empId: 'HRTC-CND-3810',
        phone: '+91 98160-55013',
      },
    },
  },
  {
    id: 'bus-004',
    busNumber: 'Bus #104',
    serviceClass: 'RURAL SHUTTLE',
    registrationNo: 'HP-63-B-3456',
    depotId: 'depot-shimla',
    depotName: 'Shimla Dhalli Depot',
    routeId: 'route-1',
    capacity: 25,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Force Traveller Mini Bus',
    brandName: null,
    yearOfMfg: 2025,
    ais140DeviceId: 'AIS140-HP01-884904',
    driver: {
      name: 'Manoj Kumar Thakur',
      phone: '+91 98160-12344',
      empId: 'HRTC-DRV-4102',
      licenseNo: 'HP24-2018-005611',
      badge: 'Narrow Gauge Shuttle Specialist',
      experienceYears: 8,
      conductor: {
        name: 'Sunil Kumar',
        empId: 'HRTC-CND-4210',
        phone: '+91 98160-55014',
      },
    },
  },
  {
    id: 'bus-005',
    busNumber: 'Bus #105',
    serviceClass: 'HIM TARANG EV (Zero Emission)',
    registrationNo: 'HP-63-EV-1005',
    depotId: 'depot-shimla',
    depotName: 'Shimla Dhalli Depot',
    routeId: 'route-1',
    capacity: 40,
    fuelType: FUEL_TYPES.ELECTRIC,
    emissionStandard: EMISSION_STANDARDS.ZERO,
    model: 'BYD K7 eBus 9m',
    brandName: 'HIM TARANG',
    yearOfMfg: 2025,
    ais140DeviceId: 'AIS140-HP01-884905',
    driver: {
      name: 'Sanjeev Kumar Negi',
      phone: '+91 98160-12345',
      empId: 'HRTC-DRV-2890',
      licenseNo: 'HP26-2010-002340',
      badge: 'Certified Zero-Emission Pilot',
      experienceYears: 15,
      conductor: {
        name: 'Virender Pal',
        empId: 'HRTC-CND-3602',
        phone: '+91 98160-55015',
      },
    },
  },

  // Route 2 — Shimla–Manali (6 buses)
  {
    id: 'bus-006',
    busNumber: 'Bus #201',
    serviceClass: 'HIMSUTA AC VOLVO SUPER LUXURY',
    registrationNo: 'HP-63-V-2001',
    depotId: 'depot-shimla',
    depotName: 'Shimla ISBT Depot',
    routeId: 'route-2',
    capacity: 45,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Volvo B11R 9400 AC Multi-Axle',
    brandName: 'HIMSUTA',
    yearOfMfg: 2023,
    ais140DeviceId: 'AIS140-HP01-884906',
    driver: {
      name: 'Surender Pal Kaushal',
      phone: '+91 98160-23451',
      empId: 'HRTC-DRV-1890',
      licenseNo: 'HP68-2006-003412',
      badge: 'Master Volvo Hill Pilot (22 Yrs)',
      experienceYears: 22,
      conductor: {
        name: 'Mahender Singh Jamwal',
        empId: 'HRTC-CND-2910',
        phone: '+91 98160-55021',
      },
    },
  },
  {
    id: 'bus-007',
    busNumber: 'Bus #202',
    serviceClass: 'HIM GAURAV AC DELUXE',
    registrationNo: 'HP-65-A-6789',
    depotId: 'depot-shimla',
    depotName: 'Shimla ISBT Depot',
    routeId: 'route-2',
    capacity: 45,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS4,
    model: 'Ashok Leyland Viking AC Deluxe',
    brandName: 'HIM GAURAV',
    yearOfMfg: 2020,
    ais140DeviceId: 'AIS140-HP01-884907',
    driver: {
      name: 'Gurdeep Singh Sandhu',
      phone: '+91 98160-23452',
      empId: 'HRTC-DRV-3120',
      licenseNo: 'HP33-2011-009941',
      badge: 'Senior Highway Driver',
      experienceYears: 13,
      conductor: {
        name: 'Ramesh Chand Katoch',
        empId: 'HRTC-CND-3510',
        phone: '+91 98160-55022',
      },
    },
  },
  {
    id: 'bus-008',
    busNumber: 'Bus #203',
    serviceClass: 'KULLU EXPRESS ORDINARY',
    registrationNo: 'HP-34-A-1122',
    depotId: 'depot-kullu',
    depotName: 'Kullu Depot',
    routeId: 'route-2',
    capacity: 52,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Tata Starbus BS-VI 52 Seater',
    brandName: null,
    yearOfMfg: 2024,
    ais140DeviceId: 'AIS140-HP34-884908',
    driver: {
      name: 'Kewal Krishan Sharma',
      phone: '+91 98160-23453',
      empId: 'HRTC-DRV-3450',
      licenseNo: 'HP34-2014-001290',
      badge: 'Beas Valley Route Expert',
      experienceYears: 11,
      conductor: {
        name: 'Dharmender Verma',
        empId: 'HRTC-CND-3780',
        phone: '+91 98160-55023',
      },
    },
  },
  {
    id: 'bus-009',
    busNumber: 'Bus #204',
    serviceClass: 'GREEN CORRIDOR CNG',
    registrationNo: 'HP-34-B-3344',
    depotId: 'depot-kullu',
    depotName: 'Kullu Depot',
    routeId: 'route-2',
    capacity: 40,
    fuelType: FUEL_TYPES.CNG,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Tata Starbus CNG Green Line',
    brandName: 'GREEN HIMACHAL',
    yearOfMfg: 2024,
    ais140DeviceId: 'AIS140-HP34-884909',
    driver: {
      name: 'Devinder Kumar Bodh',
      phone: '+91 98160-23454',
      empId: 'HRTC-DRV-3910',
      licenseNo: 'HP34-2017-004419',
      badge: 'Clean Energy Highway Pilot',
      experienceYears: 9,
      conductor: {
        name: 'Tek Chand Negi',
        empId: 'HRTC-CND-4001',
        phone: '+91 98160-55024',
      },
    },
  },
  {
    id: 'bus-010',
    busNumber: 'Bus #205',
    serviceClass: 'KINNAUR MOUNTAIN EXPRESS',
    registrationNo: 'HP-26-A-5566',
    depotId: 'depot-manali',
    depotName: 'Manali Depot',
    routeId: 'route-2',
    capacity: 45,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS3,
    model: 'Tata LP 1512 Mountain Heavy',
    brandName: null,
    yearOfMfg: 2015,
    ais140DeviceId: 'AIS140-HP26-884910',
    driver: {
      name: 'Hemraj Sharma (Pandoh Pass Specialist)',
      phone: '+91 98160-23455',
      empId: 'HRTC-DRV-1520',
      licenseNo: 'HP26-2002-000841',
      badge: 'Tribal Terrain Legend (24 Yrs)',
      experienceYears: 24,
      conductor: {
        name: 'Piar Chand Thakur',
        empId: 'HRTC-CND-2100',
        phone: '+91 98160-55025',
      },
    },
  },
  {
    id: 'bus-011',
    busNumber: 'Bus #206',
    serviceClass: 'HIMSUTA AC VOLVO SUPER LUXURY',
    registrationNo: 'HP-34-V-2006',
    depotId: 'depot-manali',
    depotName: 'Manali Depot',
    routeId: 'route-2',
    capacity: 45,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Scania Metrolink HD AC 13.7m',
    brandName: 'HIMSUTA',
    yearOfMfg: 2024,
    ais140DeviceId: 'AIS140-HP34-884911',
    driver: {
      name: 'Ashwani Kumar Chandel',
      phone: '+91 98160-23456',
      empId: 'HRTC-DRV-2610',
      licenseNo: 'HP65-2009-003310',
      badge: 'Certified Volvo Highway Captain',
      experienceYears: 16,
      conductor: {
        name: 'Brij Bhushan Sharma',
        empId: 'HRTC-CND-3140',
        phone: '+91 98160-55026',
      },
    },
  },

  // Route 3 — Dharamshala–McLeod Ganj (4 buses)
  {
    id: 'bus-012',
    busNumber: 'Bus #301',
    serviceClass: 'HIM TARANG EV (Zero Emission)',
    registrationNo: 'HP-68-EV-3001',
    depotId: 'depot-dharamshala',
    depotName: 'Dharamshala Depot',
    routeId: 'route-3',
    capacity: 40,
    fuelType: FUEL_TYPES.ELECTRIC,
    emissionStandard: EMISSION_STANDARDS.ZERO,
    model: 'Tata Starbus EV Hill Climber',
    brandName: 'HIM TARANG',
    yearOfMfg: 2025,
    ais140DeviceId: 'AIS140-HP68-884912',
    driver: {
      name: 'Jagdish Chand Katoch',
      phone: '+91 98160-34561',
      empId: 'HRTC-DRV-2510',
      licenseNo: 'HP39-2010-009182',
      badge: 'Kangra Valley Eco Specialist',
      experienceYears: 15,
      conductor: {
        name: 'Gian Chand Bodh',
        empId: 'HRTC-CND-3201',
        phone: '+91 98160-55031',
      },
    },
  },
  {
    id: 'bus-013',
    busNumber: 'Bus #302',
    serviceClass: 'MCLEOD SHUTTLE MINI',
    registrationNo: 'HP-68-A-4455',
    depotId: 'depot-dharamshala',
    depotName: 'Dharamshala Depot',
    routeId: 'route-3',
    capacity: 25,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Force Traveller Monobus',
    brandName: null,
    yearOfMfg: 2025,
    ais140DeviceId: 'AIS140-HP68-884913',
    driver: {
      name: 'Surinder Pal Singh',
      phone: '+91 98160-34562',
      empId: 'HRTC-DRV-3890',
      licenseNo: 'HP68-2016-004410',
      badge: 'Hill Gradient Specialist',
      experienceYears: 9,
      conductor: {
        name: 'Rakesh Kumar Guleria',
        empId: 'HRTC-CND-3920',
        phone: '+91 98160-55032',
      },
    },
  },
  {
    id: 'bus-014',
    busNumber: 'Bus #303',
    serviceClass: 'KANGRA VALLEY ORDINARY',
    registrationNo: 'HP-39-B-6677',
    depotId: 'depot-dharamshala',
    depotName: 'Dharamshala Depot',
    routeId: 'route-3',
    capacity: 36,
    fuelType: FUEL_TYPES.DIESEL,
    emissionStandard: EMISSION_STANDARDS.BS4,
    model: 'Tata LP 712/38 BS-IV',
    brandName: null,
    yearOfMfg: 2018,
    ais140DeviceId: 'AIS140-HP68-884914',
    driver: {
      name: 'Vijay Kumar Sharma',
      phone: '+91 98160-34563',
      empId: 'HRTC-DRV-3410',
      licenseNo: 'HP39-2013-007712',
      badge: 'Regional Transit Driver',
      experienceYears: 12,
      conductor: {
        name: 'Ashok Kumar',
        empId: 'HRTC-CND-3610',
        phone: '+91 98160-55033',
      },
    },
  },
  {
    id: 'bus-015',
    busNumber: 'Bus #304',
    serviceClass: 'GREEN KANGRA CNG',
    registrationNo: 'HP-68-CNG-3004',
    depotId: 'depot-dharamshala',
    depotName: 'Dharamshala Depot',
    routeId: 'route-3',
    capacity: 40,
    fuelType: FUEL_TYPES.CNG,
    emissionStandard: EMISSION_STANDARDS.BS6,
    model: 'Ashok Leyland CNG Smart Bus',
    brandName: 'GREEN HIMACHAL',
    yearOfMfg: 2024,
    ais140DeviceId: 'AIS140-HP68-884915',
    driver: {
      name: 'Mohan Lal Verma',
      phone: '+91 98160-34564',
      empId: 'HRTC-DRV-3301',
      licenseNo: 'HP39-2012-005510',
      badge: 'CNG Green Express Specialist',
      experienceYears: 13,
      conductor: {
        name: 'Satish Kumar',
        empId: 'HRTC-CND-3540',
        phone: '+91 98160-55034',
      },
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
