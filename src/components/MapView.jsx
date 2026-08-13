// HRTC Live Map View Component
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const INDIA_BOUNDS = L.latLngBounds(
L.latLng(6.0, 68.0), // South-West corner of India
L.latLng(37.5, 97.5) // North-East corner of India
);

/**
 * Reusable Leaflet map component
 * Restricted to India geographic boundaries
 */
export default function MapView({
center = [31.1048, 77.1650], // Default: Shimla, HP
zoom = 13,
buses = [], // Array of { id, lat, lng, heading, status, registrationNo, routeColor }
routes = [], // Array of { id, waypoints, color }
stops = [], // Array of { id, name, lat, lng, isNext }
selectedBusId = null,
onBusClick = null,
onStopClick = null,
className = 'map-container',
trackBus = false, // Auto-pan to selected bus
}) {
const mapRef = useRef(null);
const mapInstanceRef = useRef(null);
const busMarkersRef = useRef({});
const routeLayersRef = useRef({});
const stopMarkersRef = useRef({});

// Initialize map
useEffect(() => {
  if (mapInstanceRef.current) return;

  const map = L.map(mapRef.current, {
    zoomControl: false,
    attributionControl: true,
    maxBounds: INDIA_BOUNDS,
    maxBoundsViscosity: 1.0,
    minZoom: 5,
    maxZoom: 18,
  }).setView(center, Math.max(zoom, 5));

  // Add zoom control at bottomright to prevent overlapping place names or stop titles
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Official India Boundaries (Survey of India) · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    minZoom: 5,
    maxZoom: 18,
    bounds: INDIA_BOUNDS,
  }).addTo(map);

  // Overlay official Survey of India national boundary
  fetch('/geo/india-official-boundary.json')
    .then(res => res.json())
    .then(data => {
      if (!mapInstanceRef.current) return;
      L.geoJSON(data, {
        style: {
          color: '#B22234',
          weight: 2.5,
          opacity: 0.85,
          dashArray: '6, 4',
          fillColor: '#1A5276',
          fillOpacity: 0.02,
        }
      }).addTo(mapInstanceRef.current);
    })
    .catch(err => console.warn('Could not load official India boundary overlay:', err));

  // Trigger map resize check to prevent Leaflet grey tile rendering bugs
  const resizeTimer = setTimeout(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  }, 250);

  const resizeObserver = new ResizeObserver(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  });

  if (mapRef.current) {
    resizeObserver.observe(mapRef.current);
  }

  mapInstanceRef.current = map;

  return () => {
    clearTimeout(resizeTimer);
    resizeObserver.disconnect();
    map.remove();
    mapInstanceRef.current = null;
  };
}, []);

// Update route polylines
useEffect(() => {
  const map = mapInstanceRef.current;
  if (!map) return;

  // Remove old route layers
  Object.values(routeLayersRef.current).forEach(layer => map.removeLayer(layer));
  routeLayersRef.current = {};

  routes.forEach(route => {
    if (!route.waypoints || route.waypoints.length < 2) return;
    const polyline = L.polyline(route.waypoints, {
      color: route.color || '#2980B9',
      weight: 4,
      opacity: 0.75,
      smoothFactor: 1,
    }).addTo(map);
    routeLayersRef.current[route.id] = polyline;
  });
}, [routes]);

// Update stop markers
useEffect(() => {
  const map = mapInstanceRef.current;
  if (!map) return;

  // Remove old stop markers
  Object.values(stopMarkersRef.current).forEach(marker => map.removeLayer(marker));
  stopMarkersRef.current = {};

  stops.forEach(stop => {
    const icon = L.divIcon({
      className: 'stop-marker-wrapper',
      html: `<div class="stop-marker-icon"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    const marker = L.marker([stop.lat, stop.lng], { icon, zIndexOffset: 500 })
      .addTo(map)
      .bindPopup(`<strong>${stop.name}</strong>${stop.code ? `<br/>Code: ${stop.code}` : ''}`);

    if (onStopClick) {
      marker.on('click', () => onStopClick(stop));
    }

    stopMarkersRef.current[stop.id] = marker;
  });
}, [stops, onStopClick]);

// Update bus markers
useEffect(() => {
  const map = mapInstanceRef.current;
  if (!map) return;

  const currentIds = new Set(buses.map(b => b.id));

  // Remove markers for buses no longer in the list
  Object.keys(busMarkersRef.current).forEach(id => {
    if (!currentIds.has(id)) {
      map.removeLayer(busMarkersRef.current[id]);
      delete busMarkersRef.current[id];
    }
  });

  buses.forEach(bus => {
    const statusClass = bus.status === 'breakdown' ? 'bus-marker-icon--breakdown'
      : bus.status === 'delayed' ? 'bus-marker-icon--delayed'
      : bus.status === 'signal-lost' ? 'bus-marker-icon--signal-lost'
      : 'bus-marker-icon--running';

    const isSelected = bus.id === selectedBusId;
    const busNum = bus.registrationNo || (bus.busNumber ? bus.busNumber.replace('Bus #', '') : (bus.id ? bus.id.replace('bus-', '') : ''));
    const heading = bus.heading != null ? Math.round(bus.heading) : 0;
    const badgeStyle = (bus.status === 'running' && bus.routeColor) ? `background:${bus.routeColor};` : '';

    const iconHtml = `
      <div class="bus-marker-container ${statusClass} ${isSelected ? 'bus-marker-container--selected' : ''}">
        <div class="bus-marker-heading-wrapper">
          ${bus.status === 'running' || bus.status === 'delayed' ? '<div class="bus-marker-pulse"></div>' : ''}
          <div class="bus-marker-badge" style="${badgeStyle}">
            <svg class="bus-marker-svg" viewBox="0 0 24 24" width="20" height="20" fill="white">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
            </svg>
          </div>
        </div>
        ${busNum ? `<span class="bus-marker-number">${busNum}</span>` : ''}
      </div>
    `;

    const icon = L.divIcon({
      className: 'bus-marker-wrapper',
      html: iconHtml,
      iconSize: [90, 52],
      iconAnchor: [45, 24],
    });

    const popupHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; padding: 2px 4px; min-width: 170px;">
        <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
          ${bus.busNumber || bus.id} ${bus.registrationNo ? `<span style="color: #64748b; font-weight: 500;">(${bus.registrationNo})</span>` : ''}
        </div>
        ${bus.routeName ? `<div style="font-size: 11px; color: #2563eb; font-weight: 600; margin-bottom: 4px;">${bus.routeName}</div>` : ''}
        <div style="font-size: 11px; color: #334155; margin-bottom: 2px;">
          <strong>Speed:</strong> ${Math.round(bus.speed || 0)} km/h &nbsp;|&nbsp; <strong>Status:</strong> <span style="text-transform: capitalize; color: ${bus.status === 'running' ? '#16a34a' : bus.status === 'delayed' ? '#d97706' : '#dc2626'}; font-weight: 600;">${bus.status || 'running'}</span>
        </div>
        ${bus.driverName ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">Driver: ${bus.driverName}</div>` : ''}
      </div>
    `;

    if (busMarkersRef.current[bus.id]) {
      // Update existing marker position smoothly without destroying DOM node
      const marker = busMarkersRef.current[bus.id];
      marker.setLatLng([bus.lat, bus.lng]);

      // Only re-set full icon if status or selection state changed
      const statusKey = `${bus.status}-${isSelected}-${busNum}`;
      if (marker._lastStatusKey !== statusKey) {
        marker.setIcon(icon);
        marker._lastStatusKey = statusKey;
      }

      marker.setPopupContent(popupHtml);
    } else {
      // Create new marker
      const marker = L.marker([bus.lat, bus.lng], { icon, zIndexOffset: isSelected ? 2000 : 1000 })
        .addTo(map);

      marker._lastStatusKey = `${bus.status}-${isSelected}-${busNum}`;
      marker.bindPopup(popupHtml);

      if (onBusClick) {
        marker.on('click', () => onBusClick(bus));
      }

      busMarkersRef.current[bus.id] = marker;
    }
  });

  // Auto-pan to selected bus
  if (trackBus && selectedBusId) {
    const selectedBus = buses.find(b => b.id === selectedBusId);
    if (selectedBus) {
      map.panTo([selectedBus.lat, selectedBus.lng], { animate: true, duration: 0.5 });
    }
  }
}, [buses, selectedBusId, trackBus, onBusClick]);

// Update center/zoom when they change significantly
useEffect(() => {
  const map = mapInstanceRef.current;
  if (!map || trackBus) return;
  map.setView(center, zoom, { animate: true });
}, [center[0], center[1], zoom]);

return <div ref={mapRef} className={className} />;
}
