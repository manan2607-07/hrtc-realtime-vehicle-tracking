import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { createSimulation } from '../simulation/engine.js';

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  const simRef = useRef(null);
  const [busStates, setBusStates] = useState({});
  const [anomalyLog, setAnomalyLog] = useState([]);
  const [tickCount, setTickCount] = useState(0);
  const [isTouristSeason, setIsTouristSeason] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const sim = createSimulation();
    simRef.current = sim;

    const unsubscribe = sim.subscribe(({ busStates: bs, anomalyLog: al, tickCount: tc }) => {
      setBusStates(bs);
      setAnomalyLog(al);
      setTickCount(tc);
    });

    sim.start();

    return () => {
      unsubscribe();
      sim.stop();
    };
  }, []);

  const toggleTouristSeason = useCallback(() => {
    setIsTouristSeason(prev => {
      const next = !prev;
      simRef.current?.setTouristSeason(next);
      return next;
    });
  }, []);

  const acknowledgeAlert = useCallback((alertId) => {
    simRef.current?.acknowledgeAlert(alertId);
  }, []);

  const resolveAlert = useCallback((alertId) => {
    simRef.current?.resolveAlert(alertId);
  }, []);

  const addNotification = useCallback((notification) => {
    const id = `notif-${Date.now()}`;
    const notif = { id, ...notification, timestamp: Date.now() };
    setNotifications(prev => [notif, ...prev].slice(0, 20));
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
    return id;
  }, []);

  const dismissNotification = useCallback((notifId) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  }, []);

  return (
    <SimulationContext.Provider value={{
      busStates,
      anomalyLog,
      tickCount,
      isTouristSeason,
      toggleTouristSeason,
      acknowledgeAlert,
      resolveAlert,
      notifications,
      addNotification,
      dismissNotification,
    }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used inside SimulationProvider');
  return ctx;
}
