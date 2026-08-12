/**
 * Real-Time Continuous GPS Simulation Engine
 * Generates smooth, realistic physics-based bus movement along HP routes:
 * - Continuous distance-based (meters per tick) GPS coordinate interpolation
 * - Smooth speed transitions based on terrain/gradient
 * - Signal loss in tunnels/valleys
 * - Persistent simulation state (does not reset on page navigation or re-render)
 */

import { ROUTES } from './routes.js';
import { VEHICLES, VEHICLE_STATUS } from './vehicles.js';
import { computeETAs } from './eta.js';

const TICK_INTERVAL_MS = 2000; // 2 seconds per tick

/**
 * Calculate distance in meters between two lat/lng points (Haversine formula)
 */
function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
  if (!route.signalLossZones) return false;
  for (const zone of route.signalLossZones) {
    if (wpIdx >= zone.startIdx && wpIdx <= zone.endIdx) {
      return true;
    }
  }
  return false;
}

/**
 * Initialize simulation state for all buses with fixed, realistic initial positions
 */
function initBusStates() {
  const states = {};

  VEHICLES.forEach((vehicle, idx) => {
    const route = ROUTES.find(r => r.id === vehicle.routeId);
    if (!route) return;

    // Stagger buses evenly along route
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
      speed: 25, // km/h
      heading: 0,
      lastPingTime: Date.now(),
      status: VEHICLE_STATUS.RUNNING,
      isSignalLost: false,
      signalLostSince: null,
      tripId: `trip-${vehicle.id}`,
      direction: 1, // 1 = forward, -1 = reverse
      stationaryTicks: 0,
      delayMinutes: 0,
      anomalyType: null,
      etas: [],
    };
  });

  return states;
}

/**
 * Advance one bus smoothly by exact meters traveled in tick
 */
function tickBus(busState, isTouristSeason) {
  const route = ROUTES.find(r => r.id === busState.routeId);
  if (!route) return busState;

  const newState = { ...busState };

  // If bus is being controlled by real driver device GPS stream, compute ETAs and return
  if (newState.isRealDeviceGps) {
    newState.etas = computeETAs(newState, isTouristSeason);
    return newState;
  }

  const waypoints = route.waypoints;
  const totalWp = waypoints.length;

  // Handle breakdown state — bus stays stationary
  if (newState.status === VEHICLE_STATUS.BREAKDOWN) {
    newState.stationaryTicks += 1;
    if (newState.stationaryTicks > 40) { // ~80s breakdown
      newState.status = VEHICLE_STATUS.RUNNING;
      newState.anomalyType = null;
      newState.stationaryTicks = 0;
    }
    return newState;
  }

  // Determine target segment speed based on authentic route physics
  const seasonKey = isTouristSeason ? 'touristSeason' : 'normal';
  const speeds = route.segmentSpeeds[seasonKey];
  const segIdx = Math.min(newState.waypointIdx, speeds.length - 1);
  const targetSpeed = speeds[segIdx] || 40;

  // Check near stop for actual dwell time (within ~50m)
  const nearStop = route.stops.some(s => {
    const d = Math.sqrt((s.lat - newState.lat) ** 2 + (s.lng - newState.lng) ** 2);
    return d < 0.0005; // ~50m
  });

  let currentSpeed;
  if (nearStop && newState.stationaryTicks < 2) {
    currentSpeed = 0; // Bus at stop / passenger dwell
    newState.stationaryTicks += 1;
  } else {
    if (newState.stationaryTicks >= 2) {
      newState.stationaryTicks = 0;
    }
    // Smooth, realistic speed interpolation with gentle natural variation (±3 km/h)
    const base = newState.speed > 10 ? newState.speed : targetSpeed;
    const variation = Math.sin(newState.waypointIdx + Date.now() / 8000) * 3;
    currentSpeed = base * 0.7 + (targetSpeed + variation) * 0.3;
  }

  newState.speed = Math.max(0, Math.round(currentSpeed * 10) / 10);

  // Calculate physical distance traveled in this 2s tick (meters)
  const metersPerSec = (newState.speed * 1000) / 3600;
  const stepMeters = metersPerSec * (TICK_INTERVAL_MS / 1000);

  // Next target waypoint index along route direction
  let targetIdx = newState.waypointIdx + newState.direction;

  // Terminus handling (looping back at route ends)
  if (targetIdx >= totalWp) {
    newState.direction = -1;
    targetIdx = totalWp - 2;
  } else if (targetIdx < 0) {
    newState.direction = 1;
    targetIdx = 1;
  }

  const targetWp = waypoints[targetIdx];
  const distToTarget = haversineMeters(newState.lat, newState.lng, targetWp[0], targetWp[1]);

  if (stepMeters >= distToTarget || distToTarget < 5) {
    // Reached target waypoint -> update index & coordinates
    newState.waypointIdx = targetIdx;
    newState.lat = targetWp[0];
    newState.lng = targetWp[1];
  } else {
    // Smoothly interpolate position towards target waypoint
    const ratio = stepMeters / distToTarget;
    newState.lat = newState.lat + (targetWp[0] - newState.lat) * ratio;
    newState.lng = newState.lng + (targetWp[1] - newState.lng) * ratio;
  }

  // Calculate heading towards target waypoint
  newState.heading = calcHeading(newState.lat, newState.lng, targetWp[0], targetWp[1]);

  // Check signal loss
  const signalLost = checkSignalLoss(route, newState.waypointIdx);
  if (signalLost && !newState.isSignalLost) {
    newState.isSignalLost = true;
    newState.signalLostSince = Date.now();
    newState.status = VEHICLE_STATUS.SIGNAL_LOST;
  } else if (!signalLost && newState.isSignalLost) {
    newState.isSignalLost = false;
    newState.signalLostSince = null;
    newState.status = VEHICLE_STATUS.RUNNING;
  }

  // Update ping time if signal is fine
  if (!newState.isSignalLost) {
    newState.lastPingTime = Date.now();
  }

  // Check delay status
  if (newState.speed < 10 && newState.status === VEHICLE_STATUS.RUNNING) {
    newState.status = VEHICLE_STATUS.DELAYED;
    newState.delayMinutes = Math.round(5 + Math.random() * 10);
  } else if (newState.speed >= 10 && newState.status === VEHICLE_STATUS.DELAYED) {
    newState.status = VEHICLE_STATUS.RUNNING;
    newState.delayMinutes = 0;
  }

  // Compute smooth ETAs for upcoming stops
  newState.etas = computeETAs(newState, isTouristSeason);

  return newState;
}

/**
 * Generate anomaly events for admin dashboard
 */
function generateAnomalyEvents(prevStates, newStates) {
  const events = [];
  const now = new Date();

  for (const id of Object.keys(newStates)) {
    const prev = prevStates[id];
    const curr = newStates[id];
    if (!prev || !curr) continue;

    const vehicle = VEHICLES.find(v => v.id === id);
    const route = ROUTES.find(r => r.id === curr.routeId);

    // Breakdown event
    if (prev.status !== VEHICLE_STATUS.BREAKDOWN && curr.status === VEHICLE_STATUS.BREAKDOWN) {
      events.push({
        id: `alert-${Date.now()}-${id}-bd`,
        type: 'breakdown',
        vehicleId: id,
        registrationNo: vehicle?.registrationNo,
        routeId: curr.routeId,
        message: `${vehicle?.busNumber} (${vehicle?.registrationNo}) stationary (suspected breakdown)`,
        lat: curr.lat,
        lng: curr.lng,
        timestamp: now.toISOString(),
        status: 'new',
      });
    }

    // Signal lost event
    if (!prev.isSignalLost && curr.isSignalLost) {
      const zoneLabel = route?.signalLossZones?.find(z => curr.waypointIdx >= z.startIdx && curr.waypointIdx <= z.endIdx)?.label || 'tunnel/valley zone';
      events.push({
        id: `alert-${Date.now()}-${id}-sig`,
        type: 'signal-lost',
        vehicleId: id,
        registrationNo: vehicle?.registrationNo,
        routeId: curr.routeId,
        message: `Signal lost for ${vehicle?.busNumber} (${vehicle?.registrationNo}) in ${zoneLabel}`,
        lat: curr.lat,
        lng: curr.lng,
        timestamp: now.toISOString(),
        status: 'new',
      });
    }
  }

  return events;
}

/* ================================================================
   PERSISTENT SINGLETON SIMULATION MANAGER
   ================================================================ */
let globalSimulationInstance = null;

export function createSimulation() {
  if (globalSimulationInstance) {
    return globalSimulationInstance;
  }

  let busStates = initBusStates();
  let anomalyLog = [];
  let listeners = [];
  let tickTimer = null;
  let isTouristSeason = false;
  let tickCount = 0;

  function tick() {
    tickCount++;
    const prevStates = { ...busStates };
    const newStates = {};

    for (const id of Object.keys(busStates)) {
      newStates[id] = tickBus(busStates[id], isTouristSeason);
    }

    const newEvents = generateAnomalyEvents(prevStates, newStates);
    if (newEvents.length > 0) {
      anomalyLog = [...newEvents, ...anomalyLog].slice(0, 100);
    }

    // Auto-resolve alerts when buses leave tunnel or recover from breakdown
    for (const id of Object.keys(newStates)) {
      const prev = prevStates[id];
      const curr = newStates[id];
      if (!prev || !curr) continue;

      if (prev.isSignalLost && !curr.isSignalLost) {
        anomalyLog = anomalyLog.map(a =>
          a.vehicleId === id && a.type === 'signal-lost' && a.status !== 'resolved'
            ? { ...a, status: 'resolved' }
            : a
        );
      }
      if (prev.status === VEHICLE_STATUS.BREAKDOWN && curr.status !== VEHICLE_STATUS.BREAKDOWN) {
        anomalyLog = anomalyLog.map(a =>
          a.vehicleId === id && a.type === 'breakdown' && a.status !== 'resolved'
            ? { ...a, status: 'resolved' }
            : a
        );
      }
    }

    // Auto-resolve any active alert older than 15 seconds
    const AUTO_RESOLVE_MS = 15000;
    const nowMs = Date.now();
    anomalyLog = anomalyLog.map(a => {
      if (a.status !== 'resolved' && a.timestamp) {
        const age = nowMs - new Date(a.timestamp).getTime();
        if (age > AUTO_RESOLVE_MS) {
          return { ...a, status: 'resolved' };
        }
      }
      return a;
    });

    busStates = newStates;

    listeners.forEach(fn => fn({
      busStates: { ...busStates },
      anomalyLog: [...anomalyLog],
      tickCount,
    }));
  }

  globalSimulationInstance = {
    start() {
      if (tickTimer) return;
      tick();
      tickTimer = setInterval(tick, TICK_INTERVAL_MS);
    },

    stop() {
      // Keep running in singleton mode to preserve real time tracking
    },

    subscribe(fn) {
      listeners.push(fn);
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

    resolveAllAlerts() {
      anomalyLog = anomalyLog.map(a => ({ ...a, status: 'resolved' }));
    },

    updateRealGps(vehicleId, { lat, lng, speed, heading }) {
      if (busStates[vehicleId]) {
        busStates[vehicleId] = {
          ...busStates[vehicleId],
          lat,
          lng,
          speed: speed != null ? Math.round(speed * 3.6) : busStates[vehicleId].speed, // m/s to km/h if from Geolocation API
          heading: heading ?? busStates[vehicleId].heading,
          isRealDeviceGps: true,
          lastPingTime: Date.now(),
          status: VEHICLE_STATUS.RUNNING,
          isSignalLost: false,
        };
        busStates[vehicleId].etas = computeETAs(busStates[vehicleId], isTouristSeason);
      }
    },

    stopRealGps(vehicleId) {
      if (busStates[vehicleId]) {
        busStates[vehicleId].isRealDeviceGps = false;
      }
    },
  };

  globalSimulationInstance.start();
  return globalSimulationInstance;
}
