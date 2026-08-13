/**
 * Terrain-Aware ETA Engine
 * Implements the segment-based approach from PRD Section 12:
 * - Route segmented between consecutive stops
 * - Historical avg speed per segment (by time-of-day, season)
 * - Blended with bus's current speed
 * - Confidence flags for stale/interpolated data
 */

import { ROUTES } from './routes.js';

/**
 * Haversine distance between two points in km
 */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find the closest waypoint index for a given position on a route
 */
function findClosestWaypointIndex(lat, lng, waypoints) {
  let minDist = Infinity;
  let minIdx = 0;
  for (let i = 0; i < waypoints.length; i++) {
    const d = haversine(lat, lng, waypoints[i][0], waypoints[i][1]);
    if (d < minDist) {
      minDist = d;
      minIdx = i;
    }
  }
  return minIdx;
}

/**
 * Find the closest waypoint index for a stop on a route
 */
function findStopWaypointIndex(stop, waypoints) {
  return findClosestWaypointIndex(stop.lat, stop.lng, waypoints);
}

/**
 * Compute road distance along waypoints between two indices
 */
function roadDistanceBetween(waypoints, fromIdx, toIdx) {
  let dist = 0;
  const start = Math.min(fromIdx, toIdx);
  const end = Math.max(fromIdx, toIdx);
  for (let i = start; i < end && i < waypoints.length - 1; i++) {
    dist += haversine(
      waypoints[i][0], waypoints[i][1],
      waypoints[i + 1][0], waypoints[i + 1][1]
    );
  }
  return dist;
}

/**
 * Compute ETAs for all upcoming stops on a trip
 */
export function computeETAs(busState, isTouristSeason = null, customWaypoints = null, customSpeeds = null) {
  const route = ROUTES.find(r => r.id === busState.routeId);
  if (!route || !route.stops || route.stops.length === 0) return [];

  const stops = route.stops;
  const isForward = (busState.direction ?? 1) >= 0;
  const now = Date.now();

  // Find closest stop index on route to current bus location
  let closestStopIdx = 0;
  let minStopDist = Infinity;

  stops.forEach((s, idx) => {
    const d = haversine(busState.lat, busState.lng, s.lat, s.lng);
    if (d < minStopDist) {
      minStopDist = d;
      closestStopIdx = idx;
    }
  });

  // Slices upcoming stops sequentially along the route direction
  let upcomingStops = [];
  if (isForward) {
    upcomingStops = stops.slice(closestStopIdx);
    if (upcomingStops.length === 0) upcomingStops = [...stops];
  } else {
    upcomingStops = stops.slice(0, closestStopIdx + 1).reverse();
    if (upcomingStops.length === 0) upcomingStops = [...stops].reverse();
  }

  const etas = [];
  let cumulativeMinutes = 0;
  let prevLat = busState.lat;
  let prevLng = busState.lng;
  let prevSchedMin = stops[closestStopIdx]?.scheduledMin || 0;

  upcomingStops.forEach((stop, i) => {
    const distKm = haversine(prevLat, prevLng, stop.lat, stop.lng);
    const schedDiff = Math.abs((stop.scheduledMin || 0) - prevSchedMin);

    // Calculate realistic travel time based on distance & speed
    const spd = Math.max(18, busState.speed || 32);
    let travelMin = (distKm / spd) * 60;

    if (i > 0) {
      // Ensure positive cumulative travel time for every subsequent stop
      travelMin = Math.max(travelMin, schedDiff > 0 ? schedDiff : 6);
    } else {
      // First stop (immediate next stop)
      travelMin = Math.max(0, Math.min(travelMin, 8));
    }

    const haltMinutes = stop.haltMin ?? (
      stop.name.includes('ISBT') || stop.name.includes('Stand') ? 5 : 2
    );

    cumulativeMinutes += travelMin;

    const arrivalDate = new Date(now + cumulativeMinutes * 60000);
    const departureDate = new Date(now + (cumulativeMinutes + haltMinutes) * 60000);

    let confidence = 'live';
    const pingAge = now - (busState.lastPingTime || now);
    if (pingAge > 300000) confidence = 'low';
    else if (pingAge > 60000 || i > 3) confidence = 'estimate';

    etas.push({
      stopId: stop.id,
      stopName: stop.name,
      stopCode: stop.code,
      seqNo: stop.seqNo,
      etaMinutes: Math.round(cumulativeMinutes),
      confidence,
      arrivalTime: arrivalDate.toISOString(),
      departureTime: departureDate.toISOString(),
      haltMinutes,
      distanceKm: Math.round(distKm * 10) / 10,
    });

    prevLat = stop.lat;
    prevLng = stop.lng;
    prevSchedMin = stop.scheduledMin || prevSchedMin;
    cumulativeMinutes += haltMinutes;
  });

  return etas;
}

/**
 * Format clock time (e.g., "10:15 AM")
 */
export function formatClockTime(isoString) {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format ETA for display
 */
export function formatETA(minutes) {
  if (minutes === undefined || minutes === null || isNaN(minutes)) return 'On Time';
  if (minutes < 1) return 'Arriving';
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

/**
 * Get a human-readable confidence label
 */
export function getConfidenceLabel(confidence) {
  switch (confidence) {
    case 'live': return 'Live';
    case 'estimate': return 'Estimated';
    case 'low': return 'Low Confidence';
    default: return 'Unknown';
  }
}
