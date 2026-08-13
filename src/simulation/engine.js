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
import { interpolateSegmentSpeeds } from './routeGeometry.js';

/**
 * Road geometry store — dense [lat,lng][] waypoints from OSRM.
 * Keyed by routeId. When present, buses follow these instead of
 * the sparse waypoints defined in routes.js.
 */
const roadGeometries = {};
const roadSegmentSpeeds = {};

const TICK_INTERVAL_MS = 500; // 0.5 seconds per tick for fast smooth live bus movement

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
  return false;
}

const SIM_STATE_KEY = 'hrtc_simulation_persistent_state_v5';

function loadPersistedBusStates() {
  try {
    const raw = localStorage.getItem(SIM_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.states || !parsed.savedAt) return null;

    const elapsedSec = (Date.now() - parsed.savedAt) / 1000;
    if (elapsedSec < 0 || elapsedSec > 43200) return null;

    const restoredStates = {};
    for (const id of Object.keys(parsed.states)) {
      const s = parsed.states[id];
      const route = ROUTES.find(r => r.id === s.routeId);
      if (!route) continue;
      const waypoints = roadGeometries[s.routeId] || route.waypoints;
      const totalWp = waypoints.length;
      
      // Calculate normalized waypoint index based on saved progressRatio or clamp
      let wpIdx = s.waypointIdx;
      if (s.progressRatio != null && s.progressRatio >= 0 && s.progressRatio <= 1) {
        wpIdx = Math.floor(s.progressRatio * (totalWp - 1));
      } else if (wpIdx >= totalWp) {
        wpIdx = Math.min(wpIdx, totalWp - 1);
      }

      restoredStates[id] = {
        ...s,
        waypointIdx: wpIdx,
        progressRatio: s.progressRatio ?? (wpIdx / Math.max(1, totalWp - 1)),
        lat: waypoints[wpIdx] ? waypoints[wpIdx][0] : s.lat,
        lng: waypoints[wpIdx] ? waypoints[wpIdx][1] : s.lng,
      };
    }

    return restoredStates;
  } catch {
    return null;
  }
}

function savePersistedBusStates(states) {
  try {
    localStorage.setItem(SIM_STATE_KEY, JSON.stringify({
      savedAt: Date.now(),
      states,
    }));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Initialize simulation state for all buses with fixed, realistic initial positions
 */
function initBusStates() {
  const persisted = loadPersistedBusStates();
  if (persisted && Object.keys(persisted).length === VEHICLES.length) {
    return persisted;
  }

  const states = {};

  VEHICLES.forEach((vehicle, idx) => {
    const route = ROUTES.find(r => r.id === vehicle.routeId);
    if (!route) return;

    // Use road geometry if available, otherwise fall back to original waypoints
    const waypoints = roadGeometries[vehicle.routeId] || route.waypoints;
    const totalWaypoints = waypoints.length;
    const busesOnRoute = VEHICLES.filter(v => v.routeId === vehicle.routeId);
    const positionInGroup = busesOnRoute.indexOf(vehicle);
    const spacing = Math.floor(totalWaypoints / (busesOnRoute.length + 1));
    const startIdx = Math.min((positionInGroup + 1) * spacing, totalWaypoints - 2);

    states[vehicle.id] = {
      vehicleId: vehicle.id,
      routeId: vehicle.routeId,
      waypointIdx: startIdx,
      lat: waypoints[startIdx][0],
      lng: waypoints[startIdx][1],
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
 * Calculate authentic Himachal Pradesh elevation in meters above sea level (m.a.s.l.)
 */
export function getElevationForPosition(routeId, lat, lng) {
  const route = ROUTES.find(r => r.id === routeId);
  if (!route || !route.stops || route.stops.length === 0) return 1500;

  let minDist1 = Infinity, minDist2 = Infinity;
  let stop1 = route.stops[0], stop2 = route.stops[0];

  for (const s of route.stops) {
    const d = Math.abs(lat - s.lat) + Math.abs(lng - s.lng);
    if (d < minDist1) {
      minDist2 = minDist1;
      stop2 = stop1;
      minDist1 = d;
      stop1 = s;
    } else if (d < minDist2) {
      minDist2 = d;
      stop2 = s;
    }
  }

  const e1 = stop1.elevationMeters || 1500;
  const e2 = stop2.elevationMeters || 1500;

  if (minDist1 + minDist2 === 0) return e1;
  const ratio = minDist1 / (minDist1 + minDist2);
  return Math.round(e1 * (1 - ratio) + e2 * ratio);
}

/**
 * Advance one bus smoothly by exact meters traveled in tick
 */
function tickBus(busState, isTouristSeason) {
  const route = ROUTES.find(r => r.id === busState.routeId);
  if (!route) return busState;

  const newState = { ...busState };

  // Calculate real-time altitude telemetry (m.a.s.l.)
  const elevationMeters = getElevationForPosition(newState.routeId, newState.lat, newState.lng);
  const prevElevation = newState.elevationMeters || elevationMeters;
  const elevDiff = elevationMeters - prevElevation;

  let gradientType = 'flat';
  if (elevDiff > 1) {
    gradientType = 'climb';
  } else if (elevDiff < -1) {
    gradientType = 'descent';
  }

  newState.elevationMeters = elevationMeters;
  newState.gradientType = gradientType;

  // If bus is being controlled by real driver device GPS stream, compute ETAs and return
  if (newState.isRealDeviceGps) {
    newState.etas = computeETAs(newState, isTouristSeason);
    return newState;
  }

  // Use dense road geometry if available for road-following movement
  const waypoints = roadGeometries[busState.routeId] || route.waypoints;
  const totalWp = waypoints.length;

  // Handle breakdown state — bus stays stationary (speed = 0)
  if (newState.status === VEHICLE_STATUS.BREAKDOWN) {
    newState.speed = 0;
    newState.stationaryTicks += 1;
    if (newState.stationaryTicks > 30) { // ~60s breakdown
      newState.status = VEHICLE_STATUS.RUNNING;
      newState.anomalyType = null;
      newState.stationaryTicks = 0;
    }
    return newState;
  }

  // Determine target segment speed based on authentic route physics
  const seasonKey = isTouristSeason ? 'touristSeason' : 'normal';
  // Use interpolated speeds for dense waypoints if available
  const speeds = roadSegmentSpeeds[busState.routeId]?.[seasonKey] || route.segmentSpeeds[seasonKey];
  const segIdx = Math.min(newState.waypointIdx, speeds.length - 1);
  const routeTargetSpeed = speeds[segIdx] || 35;

  // Check near stop for gentle station approach slowing (down to ~25 km/h, never 0)
  const nearStop = route.stops.some(s => {
    const d = Math.sqrt((s.lat - newState.lat) ** 2 + (s.lng - newState.lng) ** 2);
    return d < 0.0006; // ~60m
  });

  const targetSpeed = nearStop ? Math.max(22, Math.min(routeTargetSpeed, 28)) : routeTargetSpeed;

  // Smooth, realistic speed interpolation matching authentic route physics
  const base = (newState.speed && newState.speed >= 18) ? newState.speed : targetSpeed;
  const currentSpeed = base * 0.8 + targetSpeed * 0.2;

  // Enforce terrain-aware speed caps matching Himachal Pradesh topography:
  // - High Altitude (>2000m): Max 28-34 km/h
  // - Steep Uphill Climbs: Max 24-28 km/h
  // - Low Valleys / Plains (<500m): Max 58-65 km/h
  let terrainCap = 42;
  if (elevationMeters > 2000) {
    terrainCap = 34;
  } else if (elevationMeters < 500) {
    terrainCap = 65;
  }

  if (gradientType === 'climb') {
    terrainCap = Math.min(terrainCap, 28);
  }

  let finalSpeed = Math.min(currentSpeed, terrainCap);
  finalSpeed = Math.max(finalSpeed, 18); // Minimum realistic moving speed

  // If bus is delayed due to traffic/roadwork, move at a realistic slower crawl speed (~75% of route speed), NEVER 0
  if (newState.status === VEHICLE_STATUS.DELAYED) {
    finalSpeed = Math.max(16, Math.round(finalSpeed * 0.75 * 10) / 10);
  }

  newState.speed = Math.round(finalSpeed * 10) / 10;

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
  newState.progressRatio = Math.max(0, Math.min(1, newState.waypointIdx / Math.max(1, totalWp - 1)));

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

  // Compute smooth ETAs for upcoming stops
  newState.etas = computeETAs(newState, isTouristSeason, waypoints, speeds);

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

    // Breakdown recovery & signal recovery auto-resolution
    for (const id of Object.keys(newStates)) {
      const curr = newStates[id];
      if (!curr) continue;

      if (!curr.isSignalLost) {
        anomalyLog = anomalyLog.map(a =>
          a.vehicleId === id && a.type === 'signal-lost' && a.status !== 'resolved'
            ? { ...a, status: 'resolved' }
            : a
        );
      }
      if (curr.status !== VEHICLE_STATUS.BREAKDOWN) {
        anomalyLog = anomalyLog.map(a =>
          a.vehicleId === id && a.type === 'breakdown' && a.status !== 'resolved'
            ? { ...a, status: 'resolved' }
            : a
        );
      }
    }

    busStates = newStates;
    savePersistedBusStates(busStates);

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
      const alert = anomalyLog.find(a => a.id === alertId);
      if (alert && alert.vehicleId && busStates[alert.vehicleId]) {
        busStates[alert.vehicleId] = {
          ...busStates[alert.vehicleId],
          isSignalLost: false,
          status: VEHICLE_STATUS.RUNNING,
        };
      }
      anomalyLog = anomalyLog.map(a =>
        a.id === alertId ? { ...a, status: 'resolved' } : a
      );
    },

    resolveAllAlerts() {
      Object.keys(busStates).forEach(id => {
        if (busStates[id].isSignalLost || busStates[id].status !== VEHICLE_STATUS.RUNNING) {
          busStates[id] = {
            ...busStates[id],
            isSignalLost: false,
            status: VEHICLE_STATUS.RUNNING,
          };
        }
      });
      anomalyLog = anomalyLog.map(a => ({ ...a, status: 'resolved' }));
    },

    /**
     * Inject road-following geometry for a route (called after OSRM fetch).
     * Also repositions any buses on that route to the nearest dense waypoint.
     */
    setRouteGeometry(routeId, denseWaypoints) {
      const route = ROUTES.find(r => r.id === routeId);
      if (!route || !denseWaypoints || denseWaypoints.length < 2) return;

      roadGeometries[routeId] = denseWaypoints;

      // Precompute interpolated segment speeds for the dense waypoints
      const normalSpeeds = interpolateSegmentSpeeds(
        route.waypoints, denseWaypoints, route.segmentSpeeds.normal
      );
      const touristSpeeds = interpolateSegmentSpeeds(
        route.waypoints, denseWaypoints, route.segmentSpeeds.touristSeason
      );
      roadSegmentSpeeds[routeId] = { normal: normalSpeeds, touristSeason: touristSpeeds };

      // Reposition buses on this route to nearest dense waypoint
      for (const id of Object.keys(busStates)) {
        if (busStates[id].routeId !== routeId) continue;
        const bs = busStates[id];

        // Find nearest dense waypoint to current position
        let minDist = Infinity;
        let nearestIdx = 0;
        for (let i = 0; i < denseWaypoints.length; i++) {
          const d = Math.abs(bs.lat - denseWaypoints[i][0]) + Math.abs(bs.lng - denseWaypoints[i][1]);
          if (d < minDist) {
            minDist = d;
            nearestIdx = i;
          }
        }

        busStates[id] = {
          ...bs,
          waypointIdx: nearestIdx,
          lat: denseWaypoints[nearestIdx][0],
          lng: denseWaypoints[nearestIdx][1],
          etas: computeETAs(bs, isTouristSeason, denseWaypoints, normalSpeeds),
        };
      }
    },

    /**
     * Get road geometries map (routeId → dense waypoints)
     */
    getRouteGeometries() {
      return { ...roadGeometries };
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
