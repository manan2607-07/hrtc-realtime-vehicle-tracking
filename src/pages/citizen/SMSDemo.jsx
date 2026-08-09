import { useState, useRef, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { useLanguage } from '../../context/LanguageContext';
import { findStopByCode, ROUTES } from '../../simulation/routes';
import { VEHICLES, findBusByDriverPhone, findBusByNumber } from '../../simulation/vehicles';
import { formatETA, formatClockTime } from '../../simulation/eta';

export default function SMSDemo() {
const { busStates } = useSimulation();
const { t } = useLanguage();
const [input, setInput] = useState('');
const [messages, setMessages] = useState([
  { type: 'received', text: 'Welcome to HRTC Bus Info.\nSend a stop code to get next buses.\n\nExample: SML04 (The Ridge)\nOr: DHM01 (Dharamshala Bus Stand)' },
]);
const messagesEndRef = useRef(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

const handleSend = () => {
  const code = input.trim().toUpperCase();
  if (!code) return;

  // Add sent message
  setMessages(prev => [...prev, { type: 'sent', text: code }]);
  setInput('');

  // Look up stop, driver phone, or bus number
  setTimeout(() => {
    // Check driver phone or bus number first
    const busByPhone = findBusByDriverPhone(code);
    const busByNum = findBusByNumber(code);
    const targetBus = busByPhone || busByNum;

    if (targetBus) {
      const bs = busStates[targetBus.id];
      const route = ROUTES.find(r => r.id === targetBus.routeId);
      const nextEta = bs?.etas?.[0];

      let response = `HRTC Live Telemetry Feed\n`;
      response += `Bus: ${targetBus.busNumber} (${targetBus.registrationNo})\n`;
      response += `Driver: ${targetBus.driver?.name} (${targetBus.driver?.phone})\n`;
      response += `Route: Rte ${route?.routeNo} - ${route?.name}\n`;
      response += `Status: ${bs?.status?.toUpperCase()} (${Math.round(bs?.speed || 0)} km/h)\n`;
      if (nextEta) {
        response += `Next Stop: ${nextEta.stopName}\n`;
        response += `ETA: ${formatETA(nextEta.etaMinutes)} | Halt: ${nextEta.haltMinutes}m\n`;
        response += `Arr: ${formatClockTime(nextEta.arrivalTime)} | Dep: ${formatClockTime(nextEta.departureTime)}\n`;
      }
      response += `\n[Live] Live Driver Telemetry Feed Active`;
      setMessages(prev => [...prev, { type: 'received', text: response }]);
      return;
    }

    const stop = findStopByCode(code);

    if (!stop) {
      setMessages(prev => [...prev, {
        type: 'received',
        text: `HRTC Info: No stop code, bus number, or driver phone found for "${code}".\n\nTry:\n- Stop Code: SML04\n- Bus No: 101\n- Driver Phone: 98160-12341`,
      }]);
      return;
    }

    // Find upcoming buses at this stop
    const upcoming = [];
    Object.values(busStates).forEach(bs => {
      const eta = bs.etas?.find(e => e.stopId === stop.id);
      if (eta) {
        const vehicle = VEHICLES.find(v => v.id === bs.vehicleId);
        const route = ROUTES.find(r => r.id === bs.routeId);
        upcoming.push({ vehicle, route, eta, busState: bs });
      }
    });

    upcoming.sort((a, b) => a.eta.etaMinutes - b.eta.etaMinutes);
    const top3 = upcoming.slice(0, 3);

    if (top3.length === 0) {
      setMessages(prev => [...prev, {
        type: 'received',
        text: `HRTC Info - ${stop.name} (${stop.code})\n\nNo buses approaching this stop currently.\nPlease try again later.`,
      }]);
      return;
    }

    let response = `HRTC Info - ${stop.name}\nStop Code: ${stop.code}\n\n`;
    top3.forEach((b, i) => {
      const conf = b.eta.confidence === 'live' ? '[Live]' : '[Est]';
      response += `${i + 1}. ${b.vehicle.busNumber} (${b.vehicle.registrationNo}) · Rte ${b.route.routeNo}\n`;
      response += ` Driver: ${b.vehicle.driver?.name || 'Assigned'}\n`;
      response += ` ETA: ${formatETA(b.eta.etaMinutes)} ${conf} | Halt: ${b.eta.haltMinutes}m\n`;
      response += ` Arr: ${formatClockTime(b.eta.arrivalTime)} | Dep: ${formatClockTime(b.eta.departureTime)}\n`;
      response += ` ${b.vehicle.fuelType === 'Electric' ? 'Electric' : b.vehicle.emissionStandard + ' ' + b.vehicle.fuelType}\n`;
      if (i < top3.length - 1) response += '\n';
    });
    response += `\n${conf_legend()}`;

    setMessages(prev => [...prev, { type: 'received', text: response }]);
  }, 500); // Simulate network delay
};

const handleKeyDown = (e) => {
  if (e.key === 'Enter') handleSend();
};

return (
  <div>
    <h1 className="page-title">{t('smsDemo')}</h1>
    <p className="text-muted mb-6" style={{ maxWidth: '500px' }}>
      {t('smsInstructions')}. This demonstrates the SMS query channel (FR-20) for non-smartphone users.
      Real deployment would use a DoT-approved SMS gateway shortcode.
    </p>

    <div className="flex" style={{ gap: 'var(--space-6)', flexWrap: 'wrap' }}>
      {/* Phone mockup */}
      <div className="sms-phone">
        <div className="sms-phone__header">
           HRTC SMS — 56161
        </div>
        <div className="sms-phone__messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`sms-bubble sms-bubble--${msg.type}`}>
              {msg.text.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="sms-phone__input-area">
          <input
            className="sms-phone__input"
            type="text"
            placeholder={t('smsPlaceholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            id="sms-input"
          />
          <button className="btn btn--primary btn--sm" onClick={handleSend} id="sms-send-btn">
            {t('smsSend')}
          </button>
        </div>
      </div>

      {/* Stop codes reference */}
      <div className="card" style={{ flex: 1, minWidth: '280px' }}>
        <div className="card__header">
          <span className="card__title"> Available Stop Codes</span>
        </div>
        <div className="card__body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {ROUTES.map(route => (
            <div key={route.id} style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{
                fontWeight: 600,
                fontSize: 'var(--font-size-sm)',
                color: route.color,
                marginBottom: 'var(--space-2)',
              }}>
                Route {route.routeNo}: {route.name}
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Stop Name</th>
                  </tr>
                </thead>
                <tbody>
                  {route.stops.map(stop => (
                    <tr key={stop.id}>
                      <td><code style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{stop.code}</code></td>
                      <td>{stop.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
}

function conf_legend() {
return '[Live] = Live GPS | [Est] = Estimated';
}
