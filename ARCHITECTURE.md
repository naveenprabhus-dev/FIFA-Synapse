# FIFA Synapse: System Architecture & Design Specification

This document provides a comprehensive, production-grade architectural deep-dive for **FIFA Synapse: The AI Decision Intelligence Platform for Smart Stadiums**.

---

## 1. Architectural Philosophy

FIFA Synapse is engineered around **Explainable Decision Intelligence (DI)**. Traditional smart stadium systems recommend the *geographically nearest* option (e.g., nearest concession stand or exit gates). Synapse observes multiple inputs, predicts future conditions, and recommends the *smartest, context-aware option* (e.g., advising a fan to walk to a concession stand 150 meters away because it has a 2-minute wait time, whereas the nearest one 20 meters away is bottlenecked with a 25-minute wait time).

### The Decision Intelligence Stack

```
   +-------------------------------------------------------------+
   |   1. OBSERVE   | Real-time IoT data, crowd flows, inventory |
   +-------------------------------------------------------------+
                                 |
                                 v
   +-------------------------------------------------------------+
   |  2. UNDERSTAND | Collate sensor metrics, determine state    |
   +-------------------------------------------------------------+
                                 |
                                 v
   +-------------------------------------------------------------+
   |   3. REASON    | Analyze alternative paths, safety policies |
   +-------------------------------------------------------------+
                                 |
                                 v
   +-------------------------------------------------------------+
   |   4. PREDICT   | Forecast queue depletion, crowd movements  |
   +-------------------------------------------------------------+
                                 |
                                 v
   +-------------------------------------------------------------+
   |  5. RECOMMEND  | Select optimal route/concession/action     |
   +-------------------------------------------------------------+
                                 |
                                 v
   +-------------------------------------------------------------+
   |   6. EXPLAIN   | Render natural language justification      |
   +-------------------------------------------------------------+
```

---

## 2. Multi-Tenant Role-Based Access Control (RBAC)

The system supports a dynamic, role-adaptive UI layout. Upon authentication, a user's role dictates the visual dashboard, available actions, and data access level:

| Role | Core Needs | Primary Actions | Visual Presentation |
|---|---|---|---|
| **Fan** | Seamless navigation, wait-time updates, food orders, crowd avoidance. | Navigate to Seat, Locate Restroom, Order Food, View Smart Queues. | High-contrast, clean dark interface with interactive maps and intuitive step-by-step guidance. |
| **Organizer** | Macro stadium status, emergency routing, mass alerts, staff deployments. | Broadcast Alert, View Congestion Heatmap, Toggle Section Overrides. | Enterprise command-center dashboard with bento-style graphs, charts, and maps. |
| **Operations** | Task queue management, rapid incident reporting, dispatching. | Report Incident, Update Task Status, View Local Alerts. | Highly dense, action-oriented task lists, large touch targets for mobile/tablet use. |
| **Venue Staff** | Concession inventory, order speeds, replenishment cues. | Track Stock, Update speed-of-service, Log Concession Status. | High-density stock trackers, smart alerts, and visual replenishment gauges. |

---

## 3. Synapse Core (AI Orchestration Layer)

The intelligence backbone of FIFA Synapse is **Synapse Core**. In order to meet enterprise compliance, prevent prompt injections, and enforce strict type safety:

1. **Server-Side Execution**: All Gemini API logic runs strictly inside server-side proxies (`/api/synapse/*`) using the modern `@google/genai` TypeScript SDK. The client-side application communicates with the backend via REST endpoints.
2. **Standardized Communication Contracts**: The backend translates raw LLM outputs into structured JSON conforming to strict TypeScript schemas.
3. **No Direct UI Coupling**: No visual component possesses direct logic dependencies on the LLM. If the AI model needs tuning or gets replaced, only the server-side agents are modified.

### Example Contract: Queue Forecasting Request
```json
{
  "requestType": "CONCESSION_ROUTING",
  "concessions": [
    { "id": "sec_104_burgers", "displayName": "Gate 4 Burger Bistro", "distanceMeters": 45, "currentQueueLength": 28, "serviceRateSeconds": 45 },
    { "id": "sec_108_pizza", "displayName": "Gate 8 Pizza Plaza", "distanceMeters": 140, "currentQueueLength": 4, "serviceRateSeconds": 60 }
  ],
  "userPreferences": { "maxWalkingDistance": 200, "itemPreference": "any" }
}
```

### Example Contract: Synapse Recommendation Output
```json
{
  "recommendedId": "sec_108_pizza",
  "expectedWaitSeconds": 240,
  "confidenceScore": 0.94,
  "justification": "While Pizza Plaza is 95m further, it has only 4 people in queue. Your predicted total time (walk + wait) is 5 minutes, compared to 21 minutes at Burger Bistro.",
  "alternatives": [
    { "id": "sec_104_burgers", "expectedWaitSeconds": 1260, "justification": "Nearest option but experiencing peak congestion due to nearby block gate egress." }
  ]
}
```

---

## 4. Google Maps & Location Core

The spatial engine of FIFA Synapse uses the new **Google Maps Web Components** and `@vis.gl/react-google-maps`.

- **Map Rendering**: Multi-modal navigation paths are rendered using the `Routes API` (`Route.computeRoutes`) rather than legacy Directions renderers.
- **Advanced Markers**: Highly optimized `AdvancedMarkerElement` pins represent concessions, queues, and operations staff.
- **Spatial Grid Bounds**: Stadium seating and pathways are defined via local GeoJSON sectors, facilitating precise distance calculations and crowd-movement visualizers.
- **CORS Mitigation**: Since direct client-side fetch calls to `googleapis.com` are blocked, routing requests are proxied or resolved safely via the Google Maps JavaScript SDK classes loaded through the `weekly` version tag.

---

## 5. Security & Isolation Architecture

- **Auth Integration**: Firebase Auth securely handles user session state.
- **Split Collections (PII Isolation)**: Customer profile data (such as emails or transaction records) is separated into a private subcollection (`/users/{uid}/private/info`) to isolate PII, while general metadata is stored in `/users/{uid}/public/info` for lightweight display.
- **Firestore Rules Security Rules**: Under catch-all default-deny matching, write access to resources is guarded by `isValidId()` and specific transactional helpers. For example, status updates are validated with custom schema structures:
  ```javascript
  allow update: if (isSignedIn() && isValidIncident(incoming()) && (
    incoming().diff(existing()).affectedKeys().hasOnly(['status', 'assignedTo'])
  ));
  ```

---

## 6. Coding Standards & Component Slicing

FIFA Synapse is constructed under strict modularity:
1. **Vertical Isolation**: Everything related to a specific feature slice (e.g., concession tracking) is housed in `features/staff/`.
2. **Stateless UI Components**: Components located in `components/ui/` do not handle state or query external services; they receive handlers and values strictly through props.
3. **Reactive State**: Central business states reside in lightweight state sync engines or React Contexts (`contexts/SynapseContext.tsx`), exposing readable reactive hooks (`useSynapse()`).
4. **File Size Budget**: Individual source files are capped around 250 lines to prevent unmanageable spaghetti files and ensure rapid builds.

---
*Created by the FIFA Synapse Core Engineering Team. Under Active Specification.*
