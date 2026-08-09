import { createContext, useContext, useState, useCallback } from 'react';
import { VEHICLES } from '../simulation/vehicles';

const AuthContext = createContext(null);

const ADMIN_CREDENTIALS = [
  { username: 'admin', passcode: 'HRTC@2025' },
  { username: 'gm_hrtc', passcode: 'HRTC#GM2025' },
  { username: 'depot_shimla', passcode: 'SHIMLA@DEPOT' },
];

/**
 * Verify driver credentials against the VEHICLES database
 * Returns { valid, vehicle, error }
 */
function verifyDriver(empId) {
  if (!empId) return { valid: false, error: 'Employee ID is required.' };
  const clean = empId.trim().toUpperCase();
  const vehicle = VEHICLES.find(v =>
    v.driver?.empId?.toUpperCase() === clean
  );
  if (!vehicle) {
    return { valid: false, error: `No driver found with Employee ID "${empId}". Please check your credentials.` };
  }
  return { valid: true, vehicle, driver: vehicle.driver };
}

/**
 * Verify conductor credentials against the VEHICLES database
 * Returns { valid, vehicle, error }
 */
function verifyConductor(empId) {
  if (!empId) return { valid: false, error: 'Employee ID is required.' };
  const clean = empId.trim().toUpperCase();
  const vehicle = VEHICLES.find(v =>
    v.driver?.conductor?.empId?.toUpperCase() === clean
  );
  if (!vehicle) {
    return { valid: false, error: `No conductor found with Employee ID "${empId}". Please verify your HRTC Staff ID.` };
  }
  return { valid: true, vehicle, conductor: vehicle.driver.conductor };
}

/**
 * Verify admin credentials
 */
function verifyAdmin(username, passcode) {
  if (!username || !passcode) return { valid: false, error: 'Username and passcode are required.' };
  const match = ADMIN_CREDENTIALS.find(
    c => c.username.toLowerCase() === username.trim().toLowerCase() && c.passcode === passcode
  );
  if (!match) {
    return { valid: false, error: 'Invalid admin credentials. Access denied.' };
  }
  return { valid: true, adminUser: match.username };
}

/**
 * Load saved session from localStorage
 */
function loadSession() {
  try {
    const raw = localStorage.getItem('hrtc_session');
    if (!raw) return null;
    const session = JSON.parse(raw);
    // Verify session is still valid against current VEHICLES data
    if (session.role === 'driver') {
      const check = verifyDriver(session.empId);
      if (!check.valid) return null;
    } else if (session.role === 'conductor') {
      const check = verifyConductor(session.empId);
      if (!check.valid) return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession());

  const loginAsCustomer = useCallback(() => {
    const s = { role: 'customer' };
    localStorage.setItem('hrtc_session', JSON.stringify(s));
    setSession(s);
    return { valid: true };
  }, []);

  const loginAsDriver = useCallback((empId) => {
    const result = verifyDriver(empId);
    if (!result.valid) return result;
    const s = {
      role: 'driver',
      empId: result.driver.empId,
      vehicleId: result.vehicle.id,
      name: result.driver.name,
      busNumber: result.vehicle.busNumber,
    };
    localStorage.setItem('hrtc_session', JSON.stringify(s));
    setSession(s);
    return { valid: true };
  }, []);

  const loginAsConductor = useCallback((empId) => {
    const result = verifyConductor(empId);
    if (!result.valid) return result;
    const s = {
      role: 'conductor',
      empId: result.conductor.empId,
      vehicleId: result.vehicle.id,
      name: result.conductor.name,
      busNumber: result.vehicle.busNumber,
      driverName: result.vehicle.driver.name,
    };
    localStorage.setItem('hrtc_session', JSON.stringify(s));
    setSession(s);
    return { valid: true };
  }, []);

  const loginAsAdmin = useCallback((username, passcode) => {
    const result = verifyAdmin(username, passcode);
    if (!result.valid) return result;
    const s = { role: 'admin', username: result.adminUser };
    localStorage.setItem('hrtc_session', JSON.stringify(s));
    setSession(s);
    return { valid: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hrtc_session');
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      session,
      isAuthenticated: !!session,
      role: session?.role || null,
      loginAsCustomer,
      loginAsDriver,
      loginAsConductor,
      loginAsAdmin,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
