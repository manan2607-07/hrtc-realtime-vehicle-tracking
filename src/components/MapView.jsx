import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Reusable Leaflet map component
 * Supports: single bus tracking, fleet view, route display, stop markers
 */
export default function MapView({
  center = [31.1048, 77.1650], // Default: Shimla
  zoom = 13,
  buses = [],          // Array of { id, lat, lng, heading, status, registrationNo, routeColor }
  routes = [],         // Array of { id, waypoints, color }
  stops = [],          // Array of { id, name, lat, lng, isNext }
  selectedBusId = null,
  onBusClick = null,
  onStopClick = null,
  className = 'map-container',
  trackBus = false,    // Auto-pan to selected bus
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
      preferCanvas: true,
      zoomControl: true,
      attributionControl: true,
    }).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
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
        opacity: 0.7,
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
        html: `<div class="stop-marker-icon" style="${stop.isNext ? 'border-color:#E74C3C;background:#E74C3C;width:16px;height:16px;' : ''}"></div>`,
        iconSize: [stop.isNext ? 16 : 12, stop.isNext ? 16 : 12],
        iconAnchor: [stop.isNext ? 8 : 6, stop.isNext ? 8 : 6],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon })
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
      const size = isSelected ? 40 : 32;

      const icon = L.divIcon({
        className: 'bus-marker-wrapper',
        html: `<div class="bus-marker-icon ${statusClass}" style="width:${size}px;height:${size}px;transform:rotate(${Math.round(bus.heading || 0)}deg);${isSelected ? 'border-width:3px;' : ''}">🚌</div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
      });

      if (busMarkersRef.current[bus.id]) {
        // Update existing marker position smoothly
        const marker = busMarkersRef.current[bus.id];
        marker.setLatLng([bus.lat, bus.lng]);
        marker.setIcon(icon);
      } else {
        // Create new marker
        const marker = L.marker([bus.lat, bus.lng], { icon, zIndexOffset: isSelected ? 1000 : 0 })
          .addTo(map);

        marker.bindPopup(`
          <strong>${bus.registrationNo || bus.id}</strong>
          <br/>Speed: ${Math.round(bus.speed || 0)} km/h
          <br/>Status: ${bus.status}
        `);

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
