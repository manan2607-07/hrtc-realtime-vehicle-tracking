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
  for (let i = fromIdx; i < toIdx && i < waypoints.length - 1; i++) {
    dist += haversine(
      waypoints[i][0], waypoints[i][1],
      waypoints[i + 1][0], waypoints[i + 1][1]
    );
  }
  return dist;
}

/**
 * Get the season factor for speed adjustment
 */
function getSeasonKey() {
  const month = new Date().getMonth(); // 0-11
  // Tourist season: May-July (summer), Oct (post-monsoon)
  if (month >= 4 && month <= 6) return 'touristSeason';
  if (month === 9) return 'touristSeason';
  return 'normal';
}

/**
 * Get time-of-day speed multiplier
 */
function getTimeOfDayMultiplier() {
  const hour = new Date().getHours();
  // Rush hours: 8-10 AM, 5-7 PM
  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) return 0.75;
  // Night: slower
  if (hour >= 21 || hour <= 5) return 0.6;
  return 1.0;
}

/**
 * Compute ETAs for all upcoming stops on a trip
 *
 * @param {Object} busState - Current bus state { lat, lng, speed, heading, lastPingTime, routeId, waypointIdx }
 * @param {boolean} isTouristSeason - Override season for demo toggle
 * @returns {Array} ETAs for each upcoming stop: { stopId, stopName, etaMinutes, confidence, arrivalTime }
 */
export function computeETAs(busState, isTouristSeason = null) {
  const route = ROUTES.find(r => r.id === busState.routeId);
  if (!route) return [];

  const { waypoints, stops, segmentSpeeds } = route;
  const seasonKey = isTouristSeason !== null
    ? (isTouristSeason ? 'touristSeason' : 'normal')
    : getSeasonKey();

  const speeds = segmentSpeeds[seasonKey];
  const timeMultiplier = getTimeOfDayMultiplier();

  // Find where the bus is on the route
  const busWpIdx = busState.waypointIdx ?? findClosestWaypointIndex(busState.lat, busState.lng, waypoints);

  // Determine ping freshness for confidence
  const now = Date.now();
  const pingAge = now - (busState.lastPingTime || now);
  const isStale = pingAge > 60000; // > 1 minute since last ping
  const isVeryStale = pingAge > 300000; // > 5 minutes

  const isForward = (busState.direction ?? 1) >= 0;

  // Filter and sort stops in trip direction
  const upcomingStops = stops
    .map(s => ({ ...s, wpIdx: findStopWaypointIndex(s, waypoints) }))
    .filter(s => isForward ? s.wpIdx > busWpIdx : s.wpIdx < busWpIdx)
    .sort((a, b) => isForward ? a.wpIdx - b.wpIdx : b.wpIdx - a.wpIdx);

  const etas = [];
  let cumulativeMinutes = 0;

  for (let i = 0; i < upcomingStops.length; i++) {
    const stop = upcomingStops[i];
    const stopWpIdx = stop.wpIdx;

    // Calculate distance from current position (or last upcoming stop) to this stop
    const fromIdx = etas.length === 0 ? busWpIdx : upcomingStops[i - 1].wpIdx;
    const toIdx = stopWpIdx;
    const segmentDist = roadDistanceBetween(waypoints, fromIdx, toIdx);

    // Get average speed for segments between fromIdx and toIdx
    const minWp = Math.min(fromIdx, toIdx);
    const maxWp = Math.max(fromIdx, toIdx);
    let avgSpeed = 0;
    let segCount = 0;
    for (let j = minWp; j < maxWp && j < speeds.length; j++) {
      avgSpeed += speeds[j];
      segCount++;
    }
    avgSpeed = segCount > 0 ? avgSpeed / segCount : 20;

    // Apply time-of-day multiplier
    avgSpeed *= timeMultiplier;

    // Blend with current bus speed for the immediate next segment
    if (etas.length === 0 && busState.speed > 0) {
      avgSpeed = avgSpeed * 0.4 + busState.speed * 0.6;
    }

    // Prevent unreasonably low speeds
    avgSpeed = Math.max(avgSpeed, 8);

    const segmentTimeMin = (segmentDist / avgSpeed) * 60;
    cumulativeMinutes += segmentTimeMin;

    // Determine confidence
    let confidence = 'live';
    if (isVeryStale) confidence = 'low';
    else if (isStale) confidence = 'estimate';
    else if (etas.length > 3) confidence = 'estimate';

    const haltMinutes = stop.haltMin ?? (
      stop.name.includes('ISBT') || stop.name.includes('Stand') ? 5 : 2
    );

    const arrivalDate = new Date(now + cumulativeMinutes * 60000);
    const departureDate = new Date(now + (cumulativeMinutes + haltMinutes) * 60000);

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
      distanceKm: Math.round(segmentDist * 10) / 10,
    });
  }

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
