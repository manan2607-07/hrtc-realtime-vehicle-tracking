import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSimulation } from '../../context/SimulationContext';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../simulation/routes';
import { VEHICLES } from '../../simulation/vehicles';
import { formatClockTime } from '../../simulation/eta';
import ETABadge from '../../components/ETABadge';

function haversineKm(lat1, lon1, lat2, lon2) {
const R = 6371;
const dLat = (lat2 - lat1) * (Math.PI / 180);
const dLon = (lon2 - lon1) * (Math.PI / 180);
const a =
  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
  Math.sin(dLon / 2) * Math.sin(dLon / 2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
return R * c;
}

function findClosestWaypointIdx(lat, lng, waypoints) {
let minDist = Infinity;
let minIdx = 0;
for (let i = 0; i < waypoints.length; i++) {
  const d = haversineKm(lat, lng, waypoints[i][0], waypoints[i][1]);
  if (d < minDist) {
    minDist = d;
    minIdx = i;
  }
}
return minIdx;
}

function getStopInfoByName(stopName) {
for (const r of ROUTES) {
  if (r.origin === stopName) {
    const firstStop = r.stops[0];
    return { lat: firstStop?.lat || 31.1048, lng: firstStop?.lng || 77.165, name: stopName };
  }
  if (r.destination === stopName) {
    const lastStop = r.stops[r.stops.length - 1];
    return { lat: lastStop?.lat || 31.1048, lng: lastStop?.lng || 77.165, name: stopName };
  }
  const found = r.stops.find(s => s.name === stopName);
  if (found) return found;
}
return null;
}

function calculateFareByDistance(originStopName, destStopName, currentRoute) {
if (!destStopName) return { fare: '', distanceKm: 0 };

let distKm = 0;

// 1. Calculate exact waypoint road distance if stops are on current route
if (currentRoute && currentRoute.waypoints && currentRoute.waypoints.length >= 2) {
  const stopA = currentRoute.stops?.find(s => s.name === originStopName) || { lat: currentRoute.waypoints[0][0], lng: currentRoute.waypoints[0][1] };
  const stopB = currentRoute.stops?.find(s => s.name === destStopName);

  if (stopB) {
    const idxA = findClosestWaypointIdx(stopA.lat, stopA.lng, currentRoute.waypoints);
    const idxB = findClosestWaypointIdx(stopB.lat, stopB.lng, currentRoute.waypoints);

    const start = Math.min(idxA, idxB);
    const end = Math.max(idxA, idxB);

    let roadSum = 0;
    for (let i = start; i < end && i < currentRoute.waypoints.length - 1; i++) {
      roadSum += haversineKm(
        currentRoute.waypoints[i][0], currentRoute.waypoints[i][1],
        currentRoute.waypoints[i + 1][0], currentRoute.waypoints[i + 1][1]
      );
    }
    distKm = Math.round(roadSum * 1.25); // Account for mountain road curves
  }
}

// 2. Fallback to exact geographic road distance for network stations
if (!distKm || distKm <= 0) {
  const stopA = getStopInfoByName(originStopName);
  const stopB = getStopInfoByName(destStopName);
  if (stopA && stopB) {
    const straightKm = haversineKm(stopA.lat, stopA.lng, stopB.lat, stopB.lng);
    distKm = Math.round(straightKm * 1.35); // Mountain road multiplier
  }
}

if (!distKm || distKm < 1) distKm = 3;

// 3. HRTC Distance Tariff Tiers
let fare = 15;
if (distKm <= 5) fare = 15;
else if (distKm <= 15) fare = 30;
else if (distKm <= 35) fare = 50;
else if (distKm <= 70) fare = 80;
else if (distKm <= 140) fare = 120;
else fare = 200;

return { fare, distanceKm: distKm };
}

export default function ConductorDashboard() {
const { session } = useAuth();
const { busStates, addNotification, incidents, reroutedRoutes } = useSimulation();
const { t } = useLanguage();

const vehicleId = session?.vehicleId;
const vehicle = VEHICLES.find(v => v.id === vehicleId);
const busState = busStates[vehicleId];
const route = (busState ? ROUTES.find(r => r.id === busState.routeId) : null) || ROUTES.find(r => r.id === vehicle?.routeId) || ROUTES[0];

const originName = route?.origin || 'Shimla ISBT (Tutikandi)';
const destName = route?.destination || route?.stops?.[route?.stops?.length - 1]?.name || 'Kufri';
const midStopName = route?.stops?.[Math.floor((route?.stops?.length || 2) / 2)]?.name || route?.stops?.[1]?.name || 'Sanjauli';

// Initialize seat state (Seats 1 to vehicle capacity)
const capacity = vehicle?.capacity || 40;
const [seats, setSeats] = useState(() => {
  const initialSeats = {};
  for (let i = 1; i <= capacity; i++) {
    initialSeats[i] = { occupied: false, passengerName: '', destination: '', ticketNo: '', fare: 0, boardedAt: '', time: '' };
  }
  // Initial sample passengers on board with real station names
  initialSeats[1] = {
    occupied: true,
    passengerName: 'Rohan Sharma',
    destination: destName,
    ticketNo: 'TKT-1001',
    fare: 50,
    boardedAt: originName,
    time: '09:15 AM',
  };
  initialSeats[2] = {
    occupied: true,
    passengerName: 'Pooja Verma',
    destination: midStopName,
    ticketNo: 'TKT-1002',
    fare: 30,
    boardedAt: originName,
    time: '09:20 AM',
  };
  initialSeats[5] = {
    occupied: true,
    passengerName: 'Vikram Thakur',
    destination: destName,
    ticketNo: 'TKT-1003',
    fare: 80,
    boardedAt: originName,
    time: '09:25 AM',
  };
  return initialSeats;
});

// Ticket Form States
const [passengerName, setPassengerName] = useState('');
const [selectedSeatNo, setSelectedSeatNo] = useState('');
const [destinationStop, setDestinationStop] = useState('');
const [fareAmount, setFareAmount] = useState('');
const [calculatedDistance, setCalculatedDistance] = useState(0);

// Financial & Stats
const [ticketsSold, setTicketsSold] = useState(3);
const [revenue, setRevenue] = useState(160);
const [tripLog, setTripLog] = useState([
  { type: 'board', time: '09:25 AM', stop: originName, amount: 80, detail: `Seat #05 — Vikram Thakur (To: ${destName})` },
  { type: 'board', time: '09:20 AM', stop: originName, amount: 30, detail: `Seat #02 — Pooja Verma (To: ${midStopName})` },
  { type: 'board', time: '09:15 AM', stop: originName, amount: 50, detail: `Seat #01 — Rohan Sharma (To: ${destName})` },
]);

const upcomingStops = useMemo(() => {
  return busState?.etas?.slice(0, 10) || [];
}, [busState?.etas]);

const currentStopName = upcomingStops[0]?.stopName || route?.origin || 'En Route';

// Find sequence number of current next stop to determine crossed/passed stops
const currentNextStopSeq = useMemo(() => {
  if (!route || !upcomingStops[0]) return 1;
  const found = route.stops?.find(s => s.name === upcomingStops[0].stopName || s.id === upcomingStops[0].stopId);
  return found ? found.seqNo : 1;
}, [route, upcomingStops]);

// Map of passed stop names for fast lookup
const passedStopsSet = useMemo(() => {
  const passed = new Set();
  if (route && route.stops && currentNextStopSeq > 1) {
    route.stops.forEach(s => {
      if (s.seqNo < currentNextStopSeq) {
        passed.add(s.name);
      }
    });
  }
  return passed;
}, [route, currentNextStopSeq]);

// Handle Destination change & auto calculate fare
const handleDestinationChange = (selectedDest) => {
  setDestinationStop(selectedDest);
  if (selectedDest) {
    const calc = calculateFareByDistance(currentStopName || originName, selectedDest, route);
    setFareAmount(calc.fare);
    setCalculatedDistance(calc.distanceKm);
  } else {
    setFareAmount('');
    setCalculatedDistance(0);
  }
};

// Count active occupied seats
const occupiedSeatsList = useMemo(() => {
  return Object.entries(seats)
    .filter(([_, data]) => data.occupied)
    .map(([seatNo, data]) => ({ seatNo: Number(seatNo), ...data }));
}, [seats]);

const passengerCount = occupiedSeatsList.length;

// Get all HRTC station stops across all routes for destination dropdown
const allNetworkStops = useMemo(() => {
  const routeStopNames = new Set(route?.stops?.map(s => s.name) || []);
  const set = new Set();
  ROUTES.forEach(r => {
    set.add(r.origin);
    set.add(r.destination);
    r.stops.forEach(s => set.add(s.name));
  });
  const all = Array.from(set).sort();
  return {
    currentRouteStops: route?.stops?.map(s => s.name) || [],
    otherNetworkStops: all.filter(s => !routeStopNames.has(s)),
  };
}, [route]);

// Available seats list
const availableSeatNumbers = useMemo(() => {
  const available = [];
  for (let i = 1; i <= capacity; i++) {
    if (!seats[i]?.occupied) available.push(i);
  }
  return available;
}, [seats, capacity]);

if (!vehicle || !busState) {
  return (
    <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
      <h2>Bus data not available</h2>
      <p>Your assigned bus ({session?.busNumber}) is not currently in the tracking system.</p>
    </div>
  );
}

// Issue Ticket & Allot Seat
const handleIssueTicket = (e) => {
  e.preventDefault();

  if (!destinationStop) {
    alert('Please select a Destination Stop before issuing a ticket!');
    return;
  }
  if (passedStopsSet.has(destinationStop)) {
    alert(`The bus has already crossed ${destinationStop}! Tickets cannot be issued to passed stops until the bus returns.`);
    return;
  }
  if (!fareAmount) {
    alert('Please select a Ticket Fare Amount before issuing a ticket!');
    return;
  }

  const nameToAssign = passengerName.trim() || `Passenger ${ticketsSold + 1}`;
  const targetSeat = selectedSeatNo ? Number(selectedSeatNo) : availableSeatNumbers[0];

  if (!targetSeat) {
    alert('Bus is fully occupied! No seats available.');
    return;
  }

  const tktNo = `TKT-${1000 + ticketsSold + 1}`;
  const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const targetDest = destinationStop;
  const amount = Number(fareAmount);

  // Update Seat
  setSeats(prev => ({
    ...prev,
    [targetSeat]: {
      occupied: true,
      passengerName: nameToAssign,
      destination: targetDest,
      ticketNo: tktNo,
      fare: amount,
      boardedAt: currentStopName,
      time: timeStr,
    },
  }));

  // Stats & Log
  setTicketsSold(t => t + 1);
  setRevenue(r => r + amount);
  setTripLog(log => [
    {
      type: 'board',
      time: timeStr,
      stop: currentStopName,
      amount: amount,
      detail: `Seat #${targetSeat.toString().padStart(2, '0')} — ${nameToAssign} (To: ${targetDest})`,
    },
    ...log,
  ].slice(0, 50));

  addNotification?.({
    type: 'success',
    title: 'Ticket Issued & Seat Allotted',
    message: `Seat #${targetSeat} assigned to ${nameToAssign} (Ticket #${tktNo})`,
  });

  // Reset Form
  setPassengerName('');
  setSelectedSeatNo('');
  setDestinationStop('');
  setFareAmount('');
};

// Depart / Vacate Passenger from Seat
const handleDepartPassenger = (seatNo) => {
  const seatData = seats[seatNo];
  if (!seatData || !seatData.occupied) return;

  const name = seatData.passengerName;
  const dest = seatData.destination;
  const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // Clear Seat
  setSeats(prev => ({
    ...prev,
    [seatNo]: { occupied: false, passengerName: '', destination: '', ticketNo: '', fare: 0, boardedAt: '', time: '' },
  }));

  // Log Departure
  setTripLog(log => [
    {
      type: 'alight',
      time: timeStr,
      stop: currentStopName,
      amount: 0,
      detail: `Seat #${seatNo.toString().padStart(2, '0')} vacated by ${name} (Alighted at ${dest || currentStopName})`,
    },
    ...log,
  ].slice(0, 50));

  addNotification?.({
    type: 'info',
    title: 'Passenger Departed',
    message: `${name} has departed the bus. Seat #${seatNo} is now vacant & available.`,
  });
};

const occupancyPercent = Math.round((passengerCount / vehicle.capacity) * 100);
const occupancyColor = occupancyPercent > 90 ? 'var(--color-danger)' : occupancyPercent > 70 ? 'var(--color-warning)' : 'var(--color-success)';

return (
  <div>
    {/* Conductor identity banner */}
    <div className="card mb-4">
      <div className="card__body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>On Duty — {vehicle.busNumber}</div>
          <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{session?.name}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
            Conductor · Emp ID: {session?.empId} · Driver: {vehicle.driver?.name}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>Route {route?.routeNo}</div>
          <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>{route?.name}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>{route?.origin} → {route?.destination}</div>
        </div>
      </div>
    </div>

    {/* Conductor Reroute & Incident Notice Banner */}
    {(() => {
      const rerouteInfo = reroutedRoutes[route?.id];
      const activeIncident = (incidents || []).find(inc => inc.routeId === route?.id && inc.status !== 'resolved');
      if (!rerouteInfo?.active && !activeIncident) return null;

      return (
        <div className="card mb-4" style={{ background: '#fff7ed', border: '2px solid #ea580c', padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span className="badge badge--warning" style={{ fontWeight: 800, textTransform: 'uppercase' }}>
                COMMAND NOTICE: ROUTE DETOUR & TIMING UPDATE ISSUED
              </span>
              <h4 style={{ margin: '6px 0 2px 0', fontSize: 'var(--font-size-md)', color: '#9a3412', fontWeight: 800 }}>
                {rerouteInfo?.active ? `Route Alteration: ${rerouteInfo.detourName}` : activeIncident.title}
              </h4>
              <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: '#c2410c' }}>
                {rerouteInfo?.active
                  ? `HRTC Central Control issued a detour. Fare calculation & intermediate station stop schedule auto-adjusted.`
                  : activeIncident.description}
              </p>
            </div>
          </div>
        </div>
      );
    })()}

    {/* Occupancy & Revenue cards */}
    <div className="grid grid--4 mb-4">
      <div className="stat-card">
        <div className="stat-card__label">Passengers Onboard</div>
        <div className="stat-card__value" style={{ color: occupancyColor }}>
          {passengerCount}
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400 }}>/{vehicle.capacity}</span>
        </div>
        <div style={{ background: 'var(--color-background)', borderRadius: '4px', height: '8px', marginTop: 'var(--space-2)' }}>
          <div style={{ background: occupancyColor, width: `${Math.min(occupancyPercent, 100)}%`, height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' }} />
        </div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          {occupancyPercent}% Occupancy ({availableSeatNumbers.length} seats free)
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card__label">Tickets Issued</div>
        <div className="stat-card__value">{ticketsSold}</div>
      </div>

      <div className="stat-card">
        <div className="stat-card__label">Revenue Collected</div>
        <div className="stat-card__value">₹{revenue}</div>
      </div>

      <div className="stat-card">
        <div className="stat-card__label">Next Stop</div>
        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{currentStopName}</div>
        {upcomingStops[0] && <ETABadge etaMinutes={upcomingStops[0].etaMinutes} confidence={upcomingStops[0].confidence} showLabel={false} />}
      </div>
    </div>

    {/* ISSUE TICKET & SEAT ALLOTMENT FORM */}
    <div className="card mb-4">
      <div className="card__header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
        <h2 className="card__title" style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, margin: 0 }}>
          Issue Ticket & Seat Allotment
        </h2>
      </div>
      <div className="card__body">
        <form onSubmit={handleIssueTicket}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', alignItems: 'flex-end' }}>
              
            {/* PASSENGER NAME */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '6px' }}>
                Passenger Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rohan Sharma"
                value={passengerName}
                onChange={e => setPassengerName(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)',
                }}
                required
              />
            </div>

            {/* SEAT ALLOTMENT */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '6px' }}>
                Seat Allotment
              </label>
              <select
                value={selectedSeatNo}
                onChange={e => setSelectedSeatNo(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <option value="">Auto-Assign Next Free Seat (#{availableSeatNumbers[0] || 'Full'})</option>
                {Array.from({ length: capacity }, (_, i) => i + 1).map(sNum => (
                  <option key={sNum} value={sNum} disabled={seats[sNum]?.occupied}>
                    Seat #{sNum.toString().padStart(2, '0')} {seats[sNum]?.occupied ? `(Occupied - ${seats[sNum].passengerName})` : '(Available)'}
                  </option>
                ))}
              </select>
            </div>

            {/* DESTINATION STOP */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '6px' }}>
                Destination Stop
              </label>
              <select
                value={destinationStop}
                onChange={e => handleDestinationChange(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <option value="" disabled>Select Destination Stop</option>
                <optgroup label={`Route ${route?.routeNo || ''} Stops (${route?.name || 'Current Route'})`}>
                  {route?.stops?.map(stop => {
                    const isPassed = stop.seqNo < currentNextStopSeq;
                    return (
                      <option key={`current-${stop.id}`} value={stop.name} disabled={isPassed}>
                        {stop.name} {isPassed ? '— Passed' : ''}
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label="Other HRTC Network Stations">
                  {allNetworkStops.otherNetworkStops.map(stopName => (
                    <option key={`other-${stopName}`} value={stopName}>
                      {stopName}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* FARE AMOUNT */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '6px' }}>
                Ticket Fare (₹)
              </label>
              <select
                value={fareAmount}
                onChange={e => setFareAmount(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <option value="" disabled>Select Ticket Fare</option>
                <option value={15}>₹15 (Local Stop ≤ 5km)</option>
                <option value={30}>₹30 (Suburban 6-15km)</option>
                <option value={50}>₹50 (Standard Hill 16-35km)</option>
                <option value={80}>₹80 (Express Distance 36-70km)</option>
                <option value={120}>₹120 (Long Distance 71-140km)</option>
                <option value={200}>₹200 (Interstate/Volvo &gt;140km)</option>
              </select>
            </div>

            {/* SUBMIT BUTTON */}
            <div>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={availableSeatNumbers.length === 0}
                style={{
                  width: '100%',
                  height: '42px',
                  fontWeight: 700,
                  fontSize: 'var(--font-size-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                + Issue Ticket & Allot Seat
              </button>
            </div>

          </div>

          {calculatedDistance > 0 && fareAmount && (
            <div
              style={{
                marginTop: '12px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-background-alt)',
                border: '1px dashed var(--color-primary)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--color-text)',
              }}
            >
              <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>Distance Tariff:</span>
              From <strong>{currentStopName}</strong> to <strong>{destinationStop}</strong> is <strong>~{calculatedDistance} km</strong> ➔ Auto-Calculated HRTC Fare: <strong style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)' }}>₹{fareAmount}</strong>
            </div>
          )}
        </form>
      </div>
    </div>

    {/* SEAT GRID & BUS MAP */}
    <div className="card mb-4">
      <div className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
        <h2 className="card__title" style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, margin: 0 }}>
          Live Bus Seat Map & Allotment Grid ({vehicle.capacity} Seats)
        </h2>
        <div style={{ display: 'flex', gap: '12px', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--color-success)', display: 'inline-block' }}></span>
            Available ({availableSeatNumbers.length})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--color-primary)', display: 'inline-block' }}></span>
            Occupied ({passengerCount})
          </span>
        </div>
      </div>

      <div className="card__body">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '10px',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '4px',
          }}
        >
          {Array.from({ length: capacity }, (_, i) => i + 1).map(sNum => {
            const seatInfo = seats[sNum];
            const isOccupied = seatInfo?.occupied;

            return (
              <div
                key={sNum}
                style={{
                  border: `1.5px solid ${isOccupied ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: isOccupied ? 'var(--color-background-alt)' : 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 10px',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, fontSize: 'var(--font-size-xs)', color: isOccupied ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                    Seat #{sNum.toString().padStart(2, '0')}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      background: isOccupied ? 'var(--color-primary)' : 'var(--color-background-alt)',
                      color: isOccupied ? '#FFF' : 'var(--color-success)',
                    }}
                  >
                    {isOccupied ? 'Occupied' : 'Free'}
                  </span>
                </div>

                {isOccupied ? (
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={seatInfo.passengerName}>
                       {seatInfo.passengerName}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      To: <strong>{seatInfo.destination}</strong>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                      #{seatInfo.ticketNo} · ₹{seatInfo.fare}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDepartPassenger(sNum)}
                      style={{
                        marginTop: '6px',
                        width: '100%',
                        padding: '3px 6px',
                        background: 'var(--color-danger)',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Depart / Vacate
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: '8px 0' }}>
                      Unassigned
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSeatNo(sNum.toString());
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      style={{
                        width: '100%',
                        padding: '3px 6px',
                        background: 'var(--color-background-alt)',
                        color: 'var(--color-primary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Select Seat
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* CURRENT PASSENGER ROSTER TABLE */}
    <div className="card mb-4">
      <div className="card__header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
        <h2 className="card__title" style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, margin: 0 }}>
          Current Passengers Onboard ({passengerCount})
        </h2>
      </div>
      <div className="card__body">
        {occupiedSeatsList.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: 'var(--space-4)' }}>
            No passengers currently onboard. Issue tickets above to allot seats.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Seat #</th>
                  <th>Passenger Name</th>
                  <th>Ticket #</th>
                  <th>Boarded At</th>
                  <th>Destination Stop</th>
                  <th>Fare Paid</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {occupiedSeatsList.map(p => (
                  <tr key={p.seatNo}>
                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>Seat #{p.seatNo.toString().padStart(2, '0')}</strong>
                    </td>
                    <td style={{ fontWeight: 700 }}>{p.passengerName}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}>{p.ticketNo}</td>
                    <td>{p.boardedAt} ({p.time})</td>
                    <td>
                      <strong style={{ color: 'var(--color-text)' }}>{p.destination}</strong>
                    </td>
                    <td>₹{p.fare}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => handleDepartPassenger(p.seatNo)}
                        style={{ padding: '2px 10px', fontSize: 'var(--font-size-xs)' }}
                      >
                        Depart / Vacate Seat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

    {/* Upcoming stops */}
    <div className="card mb-4">
      <div className="card__header"><span className="card__title">Upcoming Stops</span></div>
      <div className="card__body">
        {upcomingStops.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: 'var(--space-4)' }}>No upcoming stops</div>
        ) : (
          <div className="stop-timeline">
            {upcomingStops.map((eta, i) => (
              <div key={eta.stopId} className="stop-timeline__item">
                <div className="stop-timeline__dot" style={{ background: i === 0 ? 'var(--color-primary)' : 'var(--color-border)' }} />
                <div className="stop-timeline__content" style={{ flex: 1 }}>
                  <span style={{ fontWeight: i === 0 ? 700 : 500 }}>{eta.stopName}</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: 'var(--font-size-xs)' }}>
                  <ETABadge etaMinutes={eta.etaMinutes} confidence={eta.confidence} showLabel={false} />
                  <div style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Arr: {formatClockTime(eta.arrivalTime)} · Dep: {formatClockTime(eta.departureTime)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Trip Log */}
    <div className="card mb-4">
      <div className="card__header"><span className="card__title">Trip Log ({tripLog.length} entries)</span></div>
      <div className="card__body">
        {tripLog.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: 'var(--space-4)' }}>No entries yet. Use the ticket counter above.</div>
        ) : (
          <div style={{ maxHeight: '250px', overflow: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Stop</th>
                  <th>Detail / Passenger</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {tripLog.map((entry, i) => (
                  <tr key={i}>
                    <td>{entry.time}</td>
                    <td>
                      <span className={`badge badge--${entry.type === 'board' ? 'running' : 'delayed'}`} style={{ fontSize: 'var(--font-size-xs)' }}>
                        {entry.type === 'board' ? '↑ Board' : '↓ Alight'}
                      </span>
                    </td>
                    <td>{entry.stop}</td>
                    <td style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>{entry.detail || '—'}</td>
                    <td>{entry.amount > 0 ? `₹${entry.amount}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
