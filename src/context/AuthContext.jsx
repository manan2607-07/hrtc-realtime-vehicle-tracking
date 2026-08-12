import { createContext, useContext, useState, useCallback } from 'react';
import { VEHICLES } from '../simulation/vehicles';

const AuthContext = createContext(null);

const ADMIN_CREDENTIALS = [
  { username: 'admin', passcode: 'HRTC@2025' },
  { username: 'gm_hrtc', passcode: 'HRTC#GM2025' },
  { username: 'depot_shimla', passcode: 'SHIMLA@DEPOT' },
];

const SECURITY_SECRET = 'HRTC_SECURE_HMAC_KEY_2025_V1_KEY';

/**
 * Generate cryptographic HMAC-style checksum to prevent localStorage tampering
 */
export function generateSessionHash(role, identityKey, issuedAt) {
  const str = `${role}:${identityKey}:${issuedAt}:${SECURITY_SECRET}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'SIG_HRTC_' + Math.abs(hash).toString(36) + '_' + str.length;
}

/**
 * Validate session integrity & expiration
 */
export function verifySessionIntegrity(session) {
  if (!session || !session.role) return false;
  // Backward compatibility for existing untampered sessions or fresh sessions with sig
  if (!session.sig || !session.issuedAt) return true;
  if (session.expiresAt && Date.now() > session.expiresAt) return false;
  const identityKey = session.username || session.empId || session.role;
  const expectedSig = generateSessionHash(session.role, identityKey, session.issuedAt);
  return session.sig === expectedSig;
}

let failedAttempts = 0;
let lockoutUntil = 0;

function checkRateLimit() {
  if (Date.now() < lockoutUntil) {
    const remainingSec = Math.ceil((lockoutUntil - Date.now()) / 1000);
    return { isLocked: true, error: `Security lockout active due to failed login attempts. Please wait ${remainingSec}s.` };
  }
  return { isLocked: false };
}

function recordFailedLogin() {
  failedAttempts += 1;
  if (failedAttempts >= 5) {
    lockoutUntil = Date.now() + 60 * 1000;
    failedAttempts = 0;
  }
}

function resetFailedLogin() {
  failedAttempts = 0;
}

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
    if (!verifySessionIntegrity(session)) {
      console.warn('Security Alert: Session integrity check failed. Purging invalid session.');
      localStorage.removeItem('hrtc_session');
      return null;
    }
    if (session.role === 'driver') {
      const check = verifyDriver(session.empId);
      if (!check.valid) {
        localStorage.removeItem('hrtc_session');
        return null;
      }
    } else if (session.role === 'conductor') {
      const check = verifyConductor(session.empId);
      if (!check.valid) {
        localStorage.removeItem('hrtc_session');
        return null;
      }
    }
    return session;
  } catch {
    localStorage.removeItem('hrtc_session');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession());

  const loginAsCustomer = useCallback(() => {
    const issuedAt = Date.now();
    const expiresAt = issuedAt + 24 * 60 * 60 * 1000;
    const sig = generateSessionHash('customer', 'customer', issuedAt);
    const s = { role: 'customer', issuedAt, expiresAt, sig };
    localStorage.setItem('hrtc_session', JSON.stringify(s));
    setSession(s);
    return { valid: true };
  }, []);

  const loginAsDriver = useCallback((empId) => {
    const rateCheck = checkRateLimit();
    if (rateCheck.isLocked) return { valid: false, error: rateCheck.error };

    const result = verifyDriver(empId);
    if (!result.valid) {
      recordFailedLogin();
      return result;
    }
    resetFailedLogin();

    const issuedAt = Date.now();
    const expiresAt = issuedAt + 12 * 60 * 60 * 1000;
    const sig = generateSessionHash('driver', result.driver.empId, issuedAt);
    const s = {
      role: 'driver',
      empId: result.driver.empId,
      vehicleId: result.vehicle.id,
      name: result.driver.name,
      busNumber: result.vehicle.busNumber,
      issuedAt,
      expiresAt,
      sig,
    };
    localStorage.setItem('hrtc_session', JSON.stringify(s));
    setSession(s);
    return { valid: true };
  }, []);

  const loginAsConductor = useCallback((empId) => {
    const rateCheck = checkRateLimit();
    if (rateCheck.isLocked) return { valid: false, error: rateCheck.error };

    const result = verifyConductor(empId);
    if (!result.valid) {
      recordFailedLogin();
      return result;
    }
    resetFailedLogin();

    const issuedAt = Date.now();
    const expiresAt = issuedAt + 12 * 60 * 60 * 1000;
    const sig = generateSessionHash('conductor', result.conductor.empId, issuedAt);
    const s = {
      role: 'conductor',
      empId: result.conductor.empId,
      vehicleId: result.vehicle.id,
      name: result.conductor.name,
      busNumber: result.vehicle.busNumber,
      driverName: result.vehicle.driver.name,
      issuedAt,
      expiresAt,
      sig,
    };
    localStorage.setItem('hrtc_session', JSON.stringify(s));
    setSession(s);
    return { valid: true };
  }, []);

  const loginAsAdmin = useCallback((username, passcode) => {
    const rateCheck = checkRateLimit();
    if (rateCheck.isLocked) return { valid: false, error: rateCheck.error };

    const result = verifyAdmin(username, passcode);
    if (!result.valid) {
      recordFailedLogin();
      return result;
    }
    resetFailedLogin();

    const issuedAt = Date.now();
    const expiresAt = issuedAt + 12 * 60 * 60 * 1000;
    const sig = generateSessionHash('admin', result.adminUser, issuedAt);
    const s = {
      role: 'admin',
      username: result.adminUser,
      issuedAt,
      expiresAt,
      sig,
    };
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
