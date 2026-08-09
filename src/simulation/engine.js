/**
 * GPS Simulation Engine
 * Generates realistic bus movement along HP routes:
 * - Variable speed based on terrain/gradient
 * - Signal loss in tunnels/valleys
 * - Random perturbation for realism
 * - Anomaly events (breakdowns, delays)
 */

import { ROUTES } from './routes.js';
import { VEHICLES, VEHICLE_STATUS } from './vehicles.js';
import { computeETAs } from './eta.js';

const TICK_INTERVAL_MS = 2000; // Simulation tick every 2 seconds

/**
 * Initialize simulation state for all buses
 */
function initBusStates() {
  const states = {};

  VEHICLES.forEach((vehicle, idx) => {
    const route = ROUTES.find(r => r.id === vehicle.routeId);
    if (!route) return;

    // Stagger buses along the route so they're not all at the start
    const totalWaypoints = route.waypoints.length;
    const busesOnRoute = VEHICLES.filter(v => v.routeId === vehicle.routeId);
    const positionInGroup = busesOnRoute.indexOf(vehicle);
    const spacing = Math.floor(totalWaypoints / (busesOnRoute.length + 1));
    const startIdx = Math.min((positionInGroup + 1) * spacing, totalWaypoints - 2);

    states[vehicle.id] = {
      vehicleId: vehicle.id,
      routeId: vehicle.routeId,
      waypointIdx: startIdx,
      lat: route.waypoints[startIdx][0],
      lng: route.waypoints[startIdx][1],
      speed: 20 + Math.random() * 15, // km/h
      heading: 0,
      lastPingTime: Date.now(),
      status: VEHICLE_STATUS.RUNNING,
      isSignalLost: false,
      signalLostSince: null,
      tripId: `trip-${vehicle.id}-${Date.now()}`,
      direction: 1, // 1 = forward, -1 = reverse (for looping)
      stationaryTicks: 0,
      delayMinutes: 0,
      anomalyType: null,
      etas: [],
    };
  });

  return states;
}

/**
 * Calculate heading between two points
 */
function calcHeading(lat1, lng1, lat2, lng2) {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * Check if a waypoint index is in a signal loss zone
 */
function checkSignalLoss(route, wpIdx) {
  for (const zone of route.signalLossZones) {
    if (wpIdx >= zone.startIdx && wpIdx <= zone.endIdx) {
      return Math.random() < zone.probability;
    }
  }
  return false;
}

/**
 * Advance one bus by one tick
 */
function tickBus(busState, isTouristSeason) {
  const route = ROUTES.find(r => r.id === busState.routeId);
  if (!route) return busState;

  const newState = { ...busState };
  const waypoints = route.waypoints;

  // Handle breakdown state — bus stays stationary
  if (newState.status === VEHICLE_STATUS.BREAKDOWN) {
    newState.stationaryTicks += 1;
    // Auto-resolve after ~60 ticks (2 minutes)
    if (newState.stationaryTicks > 60) {
      newState.status = VEHICLE_STATUS.RUNNING;
      newState.anomalyType = null;
      newState.stationaryTicks = 0;
    }
    return newState;
  }

  // Random chance of breakdown (very low)
  if (Math.random() < 0.0005 && newState.status === VEHICLE_STATUS.RUNNING) {
    newState.status = VEHICLE_STATUS.BREAKDOWN;
    newState.anomalyType = 'breakdown';
    newState.stationaryTicks = 0;
    return newState;
  }

  // Determine speed for this segment with smooth transitions
  const seasonKey = isTouristSeason ? 'touristSeason' : 'normal';
  const speeds = route.segmentSpeeds[seasonKey];
  const segIdx = Math.min(newState.waypointIdx, speeds.length - 1);
  const targetSpeed = speeds[segIdx] || 20;

  // Smooth speed transitions (EMA) with subtle realistic variation (±5%)
  let baseSpeed = (busState.speed || targetSpeed) * 0.85 + targetSpeed * 0.15;
  baseSpeed *= 0.95 + Math.random() * 0.1;

  // Simulate stop dwell time — slow down near stops
  const nearStop = route.stops.some(s => {
    const d = Math.sqrt(
      (s.lat - newState.lat) ** 2 + (s.lng - newState.lng) ** 2
    );
    return d < 0.002; // ~200m
  });
  if (nearStop && Math.random() < 0.3) {
    baseSpeed = 2 + Math.random() * 3; // Nearly stopped at stop
    newState.stationaryTicks += 1;
  } else {
    newState.stationaryTicks = 0;
  }

  newState.speed = Math.round(baseSpeed * 10) / 10;

  // Move along waypoints
  // Speed is in km/h, tick is 2 seconds — but we advance by waypoint indices for simplicity
  // Higher speed = advance more waypoints per tick
  const advanceRate = Math.max(1, Math.round(baseSpeed / 15));

  let nextIdx = newState.waypointIdx + newState.direction * advanceRate;

  // Bounce at route ends (loop back)
  if (nextIdx >= waypoints.length) {
    newState.direction = -1;
    nextIdx = waypoints.length - 2;
    newState.tripId = `trip-${newState.vehicleId}-${Date.now()}`;
  } else if (nextIdx < 0) {
    newState.direction = 1;
    nextIdx = 1;
    newState.tripId = `trip-${newState.vehicleId}-${Date.now()}`;
  }

  newState.waypointIdx = nextIdx;
  const newPos = waypoints[nextIdx];
  
  // Calculate heading
  newState.heading = calcHeading(newState.lat, newState.lng, newPos[0], newPos[1]);
  
  newState.lat = newPos[0];
  newState.lng = newPos[1];

  // Check signal loss
  const signalLost = checkSignalLoss(route, nextIdx);
  if (signalLost && !newState.isSignalLost) {
    newState.isSignalLost = true;
    newState.signalLostSince = Date.now();
    newState.status = VEHICLE_STATUS.SIGNAL_LOST;
  } else if (!signalLost && newState.isSignalLost) {
    newState.isSignalLost = false;
    newState.signalLostSince = null;
    newState.status = VEHICLE_STATUS.RUNNING;
  }

  // Update ping time only if signal is not lost
  if (!newState.isSignalLost) {
    newState.lastPingTime = Date.now();
  }

  // Check if delayed (speed significantly below normal)
  if (newState.speed < 8 && newState.status === VEHICLE_STATUS.RUNNING) {
    newState.status = VEHICLE_STATUS.DELAYED;
    newState.delayMinutes = Math.round(5 + Math.random() * 15);
  } else if (newState.speed >= 8 && newState.status === VEHICLE_STATUS.DELAYED) {
    newState.status = VEHICLE_STATUS.RUNNING;
    newState.delayMinutes = 0;
  }

  // Compute ETAs
  newState.etas = computeETAs(newState, isTouristSeason);

  return newState;
}

/**
 * Generate anomaly events for the admin dashboard
 */
function generateAnomalyEvents(prevStates, newStates) {
  const events = [];
  const now = new Date();

  for (const id of Object.keys(newStates)) {
    const prev = prevStates[id];
    const curr = newStates[id];
    if (!prev) continue;

    // New breakdown
    if (prev.status !== VEHICLE_STATUS.BREAKDOWN && curr.status === VEHICLE_STATUS.BREAKDOWN) {
      const vehicle = VEHICLES.find(v => v.id === id);
      events.push({
        id: `alert-${Date.now()}-${id}`,
        type: 'breakdown',
        vehicleId: id,
        registrationNo: vehicle?.registrationNo,
        routeId: curr.routeId,
        message: `Bus ${vehicle?.registrationNo} stationary — suspected breakdown near waypoint ${curr.waypointIdx}`,
        lat: curr.lat,
        lng: curr.lng,
        timestamp: now.toISOString(),
        status: 'new',
      });
    }

    // New signal loss
    if (!prev.isSignalLost && curr.isSignalLost) {
      const vehicle = VEHICLES.find(v => v.id === id);
      const route = ROUTES.find(r => r.id === curr.routeId);
      const zone = route?.signalLossZones.find(z => curr.waypointIdx >= z.startIdx && curr.waypointIdx <= z.endIdx);
      events.push({
        id: `alert-${Date.now()}-${id}-signal`,
        type: 'signal-lost',
        vehicleId: id,
        registrationNo: vehicle?.registrationNo,
        routeId: curr.routeId,
        message: `Bus ${vehicle?.registrationNo} signal lost${zone ? ` (${zone.label})` : ''}`,
        lat: curr.lat,
        lng: curr.lng,
        timestamp: now.toISOString(),
        status: 'new',
      });
    }

    // New delay
    if (prev.status !== VEHICLE_STATUS.DELAYED && curr.status === VEHICLE_STATUS.DELAYED) {
      const vehicle = VEHICLES.find(v => v.id === id);
      events.push({
        id: `alert-${Date.now()}-${id}-delay`,
        type: 'delay',
        vehicleId: id,
        registrationNo: vehicle?.registrationNo,
        routeId: curr.routeId,
        message: `Bus ${vehicle?.registrationNo} running ~${curr.delayMinutes} min behind schedule`,
        lat: curr.lat,
        lng: curr.lng,
        timestamp: now.toISOString(),
        status: 'new',
      });
    }
  }

  return events;
}

/**
 * Create and return the simulation controller
 */
export function createSimulation() {
  let busStates = initBusStates();
  let anomalyLog = [];
  let listeners = [];
  let tickTimer = null;
  let isTouristSeason = false;
  let tickCount = 0;

  // Pre-seed some historical anomalies for the admin dashboard
  const seedAnomalies = [
    {
      id: 'alert-seed-1',
      type: 'breakdown',
      vehicleId: 'bus-010',
      registrationNo: 'HP-26-A-5566',
      routeId: 'route-2',
      message: 'Bus HP-26-A-5566 stationary for 18 min at km 145 (suspected breakdown)',
      lat: 31.4500, lng: 76.8400,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'resolved',
    },
    {
      id: 'alert-seed-2',
      type: 'signal-lost',
      vehicleId: 'bus-007',
      registrationNo: 'HP-01-G-6789',
      routeId: 'route-2',
      message: 'Bus HP-01-G-6789 signal lost for 12 min (Pandoh tunnel zone)',
      lat: 31.7045, lng: 77.0510,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'resolved',
    },
    {
      id: 'alert-seed-3',
      type: 'delay',
      vehicleId: 'bus-003',
      registrationNo: 'HP-01-C-9012',
      routeId: 'route-1',
      message: 'Bus HP-01-C-9012 running ~22 min behind schedule on Shimla Local',
      lat: 31.0920, lng: 77.1895,
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      status: 'acknowledged',
    },
  ];
  anomalyLog = [...seedAnomalies];

  function tick() {
    tickCount++;
    const prevStates = { ...busStates };
    const newStates = {};

    for (const id of Object.keys(busStates)) {
      newStates[id] = tickBus(busStates[id], isTouristSeason);
    }

    // Generate anomaly events
    const newEvents = generateAnomalyEvents(prevStates, newStates);
    if (newEvents.length > 0) {
      anomalyLog = [...newEvents, ...anomalyLog].slice(0, 100); // Keep last 100
    }

    busStates = newStates;

    // Notify listeners
    listeners.forEach(fn => fn({
      busStates: { ...busStates },
      anomalyLog: [...anomalyLog],
      tickCount,
    }));
  }

  return {
    start() {
      if (tickTimer) return;
      // Initial tick
      tick();
      tickTimer = setInterval(tick, TICK_INTERVAL_MS);
    },

    stop() {
      if (tickTimer) {
        clearInterval(tickTimer);
        tickTimer = null;
      }
    },

    subscribe(fn) {
      listeners.push(fn);
      // Immediately notify with current state
      fn({
        busStates: { ...busStates },
        anomalyLog: [...anomalyLog],
        tickCount,
      });
      return () => {
        listeners = listeners.filter(l => l !== fn);
      };
    },

    getState() {
      return {
        busStates: { ...busStates },
        anomalyLog: [...anomalyLog],
        tickCount,
      };
    },

    setTouristSeason(val) {
      isTouristSeason = val;
    },

    getTouristSeason() {
      return isTouristSeason;
    },

    acknowledgeAlert(alertId) {
      anomalyLog = anomalyLog.map(a =>
        a.id === alertId ? { ...a, status: 'acknowledged' } : a
      );
    },

    resolveAlert(alertId) {
      anomalyLog = anomalyLog.map(a =>
        a.id === alertId ? { ...a, status: 'resolved' } : a
      );
    },
  };
}
