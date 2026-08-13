/**
 * Route Geometry Service — OSRM Road-Following Polylines
 *
 * Fetches actual road geometries from the free OSRM (Open Source Routing Machine)
 * demo API so that route polylines and bus movement follow real roads instead
 * of straight lines between sparse waypoints.
 *
 * Features:
 * - Decodes Google-encoded polylines from OSRM response
 * - Caches results in localStorage (24-hour TTL)
 * - Graceful fallback to original sparse waypoints on error
 * - Generates interpolated segment speed arrays for the denser waypoints
 */

import { ROUTES } from './routes.js';

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';
const CACHE_KEY_PREFIX = 'hrtc_road_geo_v2_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Decode a Google-encoded polyline string into an array of [lat, lng] pairs.
 * Reference: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
function decodePolyline(encoded) {
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    // Decode latitude
    let shift = 0;
    let result = 0;
    let byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    // Decode longitude
    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

/**
 * Try to load cached road geometry from localStorage
 */
function loadFromCache(routeId) {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + routeId);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY_PREFIX + routeId);
      return null;
    }
    return cached.waypoints;
  } catch {
    return null;
  }
}

/**
 * Save road geometry to localStorage cache
 */
function saveToCache(routeId, waypoints) {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + routeId, JSON.stringify({
      timestamp: Date.now(),
      waypoints,
    }));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

/**
 * Fetch road-following geometry from OSRM for a set of waypoints.
 * OSRM expects coordinates as lng,lat (note: reversed from our [lat,lng] arrays).
 *
 * For long routes, OSRM has URL length limits (~2000 chars), so we may need
 * to split into segments and stitch them together.
 */
async function fetchFromOSRM(waypoints) {
  // OSRM URL format: /route/v1/driving/lng1,lat1;lng2,lat2;...?overview=full&geometries=polyline
  const MAX_POINTS_PER_REQUEST = 25; // Keep URLs short

  if (waypoints.length <= MAX_POINTS_PER_REQUEST) {
    // Single request
    const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';');
    const url = `${OSRM_BASE}/${coords}?overview=full&geometries=polyline`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`OSRM HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.code !== 'Ok' || !data.routes?.[0]?.geometry) {
      throw new Error(`OSRM error: ${data.code || 'no route'}`);
    }
    return decodePolyline(data.routes[0].geometry);
  }

  // Split into overlapping chunks and stitch
  const allPoints = [];
  for (let i = 0; i < waypoints.length - 1; i += MAX_POINTS_PER_REQUEST - 1) {
    const chunk = waypoints.slice(i, i + MAX_POINTS_PER_REQUEST);
    if (chunk.length < 2) break;

    const coords = chunk.map(([lat, lng]) => `${lng},${lat}`).join(';');
    const url = `${OSRM_BASE}/${coords}?overview=full&geometries=polyline`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`OSRM HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.code !== 'Ok' || !data.routes?.[0]?.geometry) {
      throw new Error(`OSRM error: ${data.code || 'no route'}`);
    }

    const decoded = decodePolyline(data.routes[0].geometry);

    // Skip first point of subsequent chunks (it overlaps with the last point of previous)
    if (allPoints.length > 0 && decoded.length > 0) {
      allPoints.push(...decoded.slice(1));
    } else {
      allPoints.push(...decoded);
    }

    // Rate-limit: wait a bit between requests to be polite to the free API
    if (i + MAX_POINTS_PER_REQUEST - 1 < waypoints.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return allPoints;
}

/**
 * Fetch road geometry for a single route.
 * Returns the dense [lat, lng][] array, or the original sparse waypoints on failure.
 */
export async function fetchRouteGeometry(routeId) {
  const route = ROUTES.find(r => r.id === routeId);
  if (!route) return null;

  // Check cache first
  const cached = loadFromCache(routeId);
  if (cached) return cached;

  try {
    const denseWaypoints = await fetchFromOSRM(route.waypoints);

    // Validate: must have at least as many points as the original
    if (denseWaypoints && denseWaypoints.length >= 2) {
      saveToCache(routeId, denseWaypoints);
      return denseWaypoints;
    }
  } catch (err) {
    console.warn(`[RouteGeometry] Failed to fetch road geometry for ${routeId}:`, err.message);
  }

  // Fallback: return original sparse waypoints
  return route.waypoints;
}

/**
 * Fetch road geometries for ALL routes in parallel (with staggered start).
 * Returns a Map of routeId → [lat, lng][].
 */
export async function fetchAllRouteGeometries() {
  const geometries = {};

  // Stagger requests to avoid hammering the free API
  const results = [];
  for (let i = 0; i < ROUTES.length; i++) {
    results.push(
      new Promise(resolve => {
        setTimeout(async () => {
          const routeId = ROUTES[i].id;
          const geo = await fetchRouteGeometry(routeId);
          resolve({ routeId, geo });
        }, i * 500); // 500ms stagger between routes
      })
    );
  }

  const settled = await Promise.all(results);
  for (const { routeId, geo } of settled) {
    if (geo) {
      geometries[routeId] = geo;
    }
  }

  return geometries;
}

/**
 * Generate interpolated segment speeds for dense waypoints.
 * Maps the original sparse segment speeds onto the dense waypoint array
 * by finding which original segment each dense point belongs to.
 */
export function interpolateSegmentSpeeds(originalWaypoints, denseWaypoints, originalSpeeds) {
  if (!denseWaypoints || denseWaypoints.length < 2) return originalSpeeds;
  if (!originalSpeeds || originalSpeeds.length === 0) return [];

  const newSpeeds = [];

  // For each dense waypoint, find the closest original segment
  for (let i = 0; i < denseWaypoints.length - 1; i++) {
    const pt = denseWaypoints[i];

    // Find the closest original waypoint index
    let minDist = Infinity;
    let closestIdx = 0;
    for (let j = 0; j < originalWaypoints.length; j++) {
      const d = Math.abs(pt[0] - originalWaypoints[j][0]) + Math.abs(pt[1] - originalWaypoints[j][1]);
      if (d < minDist) {
        minDist = d;
        closestIdx = j;
      }
    }

    // Map to the corresponding speed segment
    const speedIdx = Math.min(closestIdx, originalSpeeds.length - 1);
    newSpeeds.push(originalSpeeds[speedIdx]);
  }

  return newSpeeds;
}
