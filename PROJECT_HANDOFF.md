# HRTC Real-Time Vehicle Tracking System — Developer Handoff & Architecture Guide

## 1. Project Overview & Repository
- **GitHub Repository**: [https://github.com/manan2607-07/hrtc-realtime-vehicle-tracking](https://github.com/manan2607-07/hrtc-realtime-vehicle-tracking)
- **Live Vercel URL**: `https://manan2607-07-hrtc-realtime-vehicle.vercel.app/`
- **Staff Portal URL**: `https://manan2607-07-hrtc-realtime-vehicle.vercel.app/staff`
- **Tech Stack**: React 18, Vite 8, React Router v7, Leaflet 1.9, Vanilla CSS Design System, Context API.

---

## 2. Security & Role-Based Access Control (RBAC) Architecture

The application enforces strict separation between public passenger access and staff/admin controls.

### Public Passenger Portal (`/login` or `/`)
- **Public Entry Point**: Accessing `/login` or `/` defaults to **Passenger Mode**.
- **Privacy Hardened**: Driver phone numbers, license numbers, and conductor details are omitted from customer views.
- **No Staff Links**: Staff login forms are hidden from passenger-facing pages.

### Hidden Staff & Admin Portal (`/staff`)
- Access to Driver, Conductor, and Admin login is restricted to the `/staff` route.
- Unauthenticated staff access is blocked by `RequireRole` guards in `App.jsx`.

---

## 3. Staff & Admin Credentials Directory

### Admin Logins
| Role | Username | Passcode | Access Level |
|---|---|---|---|
| **System Admin** | `admin` | `HRTC@2025` | Full Fleet, Route Manager, Reports & Alerts |
| **General Manager** | `gm_hrtc` | `HRTC#GM2025` | Full Executive Overview |
| **Depot Manager** | `depot_shimla` | `SHIMLA@DEPOT` | Shimla Depot Oversight |

### Driver Logins
| Bus Number | Assigned Driver | Employee ID (Login) | License No | Phone |
|---|---|---|---|---|
| **Bus #101** | Prem Chand Sharma | `HRTC-DRV-1984` | HP01-2008-004921 | +91 98160-12341 |
| **Bus #102** | Rakesh Kumar Verma | `HRTC-DRV-2005` | HP01-2010-008219 | +91 98160-12342 |
| **Bus #201** | Vijay Singh Thakur | `HRTC-DRV-1892` | HP02-2005-003102 | +91 98160-12343 |

### Conductor Logins
| Bus Number | Assigned Conductor | Staff ID (Login) | Phone |
|---|---|---|---|
| **Bus #101** | Dhani Ram Rana | `HRTC-CND-3312` | +91 98160-55011 |
| **Bus #102** | Sunil Dutt Dogra | `HRTC-CND-4108` | +91 98160-55012 |
| **Bus #201** | Ramesh Chand Katoch | `HRTC-CND-2940` | +91 98160-55013 |

---

## 4. Key Directory & Code Base Structure

```
├── public/
│   ├── hrtc-logo.svg           # Official vector HRTC emblem logo
│   └── geo/                    # Official Survey of India boundaries JSON
├── src/
│   ├── components/
│   │   ├── MapView.jsx         # Leaflet map with vector bus pins & route polylines
│   │   ├── ETABadge.jsx        # Green (on-time) & Yellow (delayed) status badges
│   │   ├── SustainabilityBadge.jsx # Fuel & emission standards (Zero Emission EV, BS-VI)
│   │   ├── LanguageToggle.jsx  # English / Hindi switcher
│   │   └── ToastContainer.jsx  # Real-time alert notifications
│   ├── context/
│   │   ├── AuthContext.jsx     # Session storage & role validation engine
│   │   ├── SimulationContext.jsx # Real-time telemetry feed & vehicle status state
│   │   └── LanguageContext.jsx # i18n translation context
│   ├── pages/
│   │   ├── RoleLogin.jsx       # Public passenger entry page (/login)
│   │   ├── StaffLogin.jsx      # Hidden staff credential login (/staff)
│   │   ├── citizen/            # Passenger views (Home, LiveTrack, StopDetail, RouteDetail, SMSDemo)
│   │   ├── driver/             # Driver dashboard (GPS broadcast, SOS, route status)
│   │   ├── conductor/          # Conductor dashboard (Ticket counter, occupancy log)
│   │   └── admin/              # Admin panels (Dashboard, FleetMap, RouteManager, Reports, Alerts)
│   ├── simulation/
│   │   ├── routes.js           # Route definitions, GPS waypoints, signal loss zones
│   │   ├── vehicles.js         # HRTC vehicle directory & staff credentials database
│   │   ├── engine.js           # Real-time physics-based bus movement simulation
│   │   └── eta.js              # ETA calculation & time formatters
│   ├── i18n/
│   │   └── strings.js          # Translation strings (EN / HI)
│   ├── App.jsx                 # Main router & RequireRole route guards
│   └── index.css               # Institutional HRTC design system CSS
└── PROJECT_HANDOFF.md          # This developer handoff documentation
```

---

## 5. Local Setup & Commands

```bash
# 1. Clone repository
git clone https://github.com/manan2607-07/hrtc-realtime-vehicle-tracking.git
cd hrtc-realtime-vehicle-tracking

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Test production build
npm run build
```

---

## 6. Full Conversation Log & Transcript Location
If the incoming developer needs to review the exact step-by-step history of user requirements, decision rationale, or past conversation logs:
- **Conversation Transcript Log**:
  `/Users/mananpatel/.gemini/antigravity-ide/brain/f4637b29-b85c-42db-be17-2ee1299dcb30/.system_generated/logs/transcript_full.jsonl`
