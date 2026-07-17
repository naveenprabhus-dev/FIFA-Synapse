# FIFA Synapse: Engineering & Architectural Blueprint

Welcome to the official engineering manual for **FIFA Synapse: The AI Decision Intelligence Platform for Smart Stadiums**. 

This document serves as the absolute source of truth for the project's codebase structure, naming conventions, architectural design patterns, and quality standards.

---

## 1. Core Philosophy: "Don't recommend the nearest option. Recommend the smartest option."

The platform continuously runs the **Synapse Intelligence Loop**:
$$\text{Observe} \longrightarrow \text{Understand} \longrightarrow \text{Reason} \longrightarrow \text{Predict} \longrightarrow \text{Recommend} \longrightarrow \text{Explain} \longrightarrow \text{Proactively Assist}$$

Every AI recommendation must be **explainable, contextual, and role-specific**.

---

## 2. Target Roles (Multi-Tenant RBAC)

1. **Fan**: Smart routing, concession planning, smart queue recommendations, predictive navigation.
2. **Organizer**: Stadium congestion heatmap, resource allocation, emergency routing overrides, high-level intelligence reports.
3. **Operations (Volunteer + Security)**: Proactive crowding alerts, localized incident management, incident task queue.
4. **Venue Staff**: Real-time inventory tracking, smart replenishment predictions, concession speed-of-service optimization.

---

## 3. High-Level Project Architecture

We employ a **Feature-Based clean architecture** separating the user interface from business logic, data persistence, and AI orchestration.

```
+-------------------------------------------------------------------+
|                            UI Layer                               |
|               (React Components, Tailwind, Motion)                |
+-------------------------------------------------------------------+
                                 |
                                 v
+-------------------------------------------------------------------+
|                        Feature Hooks / Contexts                   |
|                  (Role Dashboards, Queue Trackers)                |
+-------------------------------------------------------------------+
                                 |
                                 v
+-------------------------------------------------------------------+
|                         Services Layer                            |
|        (Firebase, Maps Core, Synapse AI Orchestration Core)       |
+-------------------------------------------------------------------+
                                 |
                                 v
+-------------------------------------------------------------------+
|                        Repositories Layer                         |
|         (Firestore Schema, State Stores, Cache Controllers)       |
+-------------------------------------------------------------------+
```

---

## 4. Complete Folder & File Structure

We follow a strict, nested architecture designed to easily support enterprise expansion.

```
/
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── AGENTS.md (This manual)
├── ARCHITECTURE.md (Deep-dive architectural layout)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   │
│   ├── app/                    # App initialization, main routes, providers
│   │   ├── AppProviders.tsx    # Firebase, Auth, Theme & Router wrappers
│   │   └── AppRoutes.tsx       # Main routing declarations
│   │
│   ├── ai/                     # Synapse AI Orchestration Core
│   │   ├── orchestrator/
│   │   │   └── SynapseCore.ts  # Central intelligence gateway (no direct Gemini calls from UI)
│   │   ├── agents/
│   │   │   ├── CrowdAgent.ts   # Concurrency / Crowd forecasting prompt worker
│   │   │   └── RouteAgent.ts   # Smart multi-modal navigation prompt worker
│   │   └── prompts/
│   │       ├── crowdAnalysis.ts
│   │       └── smartRouting.ts
│   │
│   ├── components/             # Reusable, design-system level presentation elements
│   │   ├── ui/                 # Atomic design tokens (Buttons, Inputs, Cards, Badges)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Badge.tsx
│   │   ├── map/                # Shared Maps wrappers
│   │   │   ├── SmartStadiumMap.tsx
│   │   │   └── AdvancedMarker.tsx
│   │   └── feedback/           # Accessible modals, loaders, explanations
│   │       ├── ExplainabilityCard.tsx
│   │       └── LoadingSpinner.tsx
│   │
│   ├── features/               # Cohesive vertical slices containing custom logic
│   │   ├── auth/               # Role-based sign-in and RBAC guards
│   │   ├── fan/                # Fan dashboards, queue predictors, route selectors
│   │   ├── organizer/          # Control room, heatmaps, security dispatchers
│   │   ├── operations/         # Volunteer incident reporting, push alerts
│   │   └── staff/              # Concessions management, stock alert systems
│   │
│   ├── layouts/                # Shared layout shells
│   │   ├── RoleLayout.tsx      # Sidebar/navigation adapted per role
│   │   └── MainLayout.tsx      # Base container layout
│   │
│   ├── pages/                  # Route-level screens (each importable directly by routes)
│   │   ├── DashboardPage.tsx   # Adaptive routing destination page
│   │   ├── LandingPage.tsx     # Hero entrance page
│   │   └── UnauthorizedPage.tsx
│   │
│   ├── routes/                 # Routing config and guards
│   │   ├── ProtectedRoute.tsx  # Dynamic Role-Based Route Guard
│   │   └── index.ts
│   │
│   ├── hooks/                  # Global, stateless React hooks
│   │   ├── useGeolocation.ts   # Safe GPS tracking
│   │   └── useInterval.ts
│   │
│   ├── contexts/               # Stateful React Contexts
│   │   └── SynapseContext.tsx  # Core engine context
│   │
│   ├── services/               # Infrastructure abstraction layers
│   │   ├── firebase/           # Native Firebase initializers
│   │   │   ├── authService.ts
│   │   │   └── dbService.ts
│   │   └── maps/               # Routes compute and location search wrapper
│   │       └── mapsService.ts
│   │
│   ├── repositories/           # Abstract data getters & set cache
│   │   ├── UserRepository.ts
│   │   └── StadiumRepository.ts
│   │
│   ├── config/                 # Static configs
│   │   ├── firebase.config.ts
│   │   └── maps.config.ts
│   │
│   ├── constants/              # Immutable static constants
│   │   ├── geoJson.ts          # Stadium layouts / sector boundaries
│   │   └── theme.ts            # Palette, shadows, typographic metrics
│   │
│   ├── store/                  # Lightweight state sync engines
│   │   └── notificationStore.ts
│   │
│   ├── types/                  # Central TypeScript Interfaces (Strict Type Safety)
│   │   ├── index.ts
│   │   ├── synapse.ts          # AI inference and reasoning contracts
│   │   └── user.ts             # User profiles, permission matrices, roles
│   │
│   ├── utils/                  # Domain-independent pure helper functions
│   │   ├── date.ts
│   │   └── validators.ts       # Input safety, string checks
│   │
│   └── tests/                  # Structure-matching test suites
│       └── ai/
│           └── synapseCore.test.ts
```

---

## 5. Naming Conventions

### File Naming Rules
1. **React Components**: PascalCase (e.g., `ConcessionCard.tsx`, `SmartStadiumMap.tsx`).
2. **Hooks**: camelCase starting with `use` (e.g., `useStadiumQueue.ts`, `useGeolocation.ts`).
3. **Pure TypeScript Files (Services, Types, Configs, Utils)**: camelCase (e.g., `synapseCore.ts`, `mapsService.ts`, `user.ts`).
4. **Style Sheets / CSS**: lowercase hyphenated (e.g., `index.css`).
5. **No abbreviations**: Use `concessionRepository.ts` instead of `concRepo.ts`.

### TypeScript Variables & Types
- **Interfaces**: Capitalized, PascalCase (e.g., `interface UserProfile`). Do NOT prefix with `I`.
- **Enums**: Capitalized PascalCase (e.g., `enum UserRole`). Enum keys should be UPPER_SNAKE_CASE.
- **Variables / Functions**: camelCase (e.g., `const getSmartRoute = async () => {}`).
- **Strictly No `any`**: If a dynamic type is needed, use generics (`T`) or `unknown` combined with type guard narrowing.

---

## 6. Synapse Core (Central AI Orchestration Layer)

To prevent fragmented AI calls and prompt leakage:
1. **Direct UI Calls Prohibited**: Components must *never* invoke Google Gemini directly. They must ask `SynapseCore` for recommendation objects.
2. **Inference Flow**:
   - UI Component → `useSynapse()` Hook → `SynapseCore.getRecommendation(context)` → Gemini API (Server Proxy) → Component state.
3. **Contracts**:
   - Inputs to `SynapseCore` are strictly typed schemas.
   - Outputs from `SynapseCore` must adhere to an explainable format:
     ```typescript
     export interface SynapseRecommendation<T> {
       action: T;                 // The smart recommendation
       alternative: T;            // The alternative option
       reasoning: string[];       // Mathematical/logical justification
       expectedOutcome: string;   // Expected wait-time/distance reduction
       confidence: number;        // Float between 0.0 and 1.0
     }
     ```

---

## 7. Development Standards

### A. Accessibility (A11y) first
- All visual inputs, controls, and triggers must be keyboard navigable with visible focus states.
- Color palettes must meet WCAG AA contrast standards (minimum 4.5:1 for normal text).
- Use semantic HTML tags (`<main>`, `<header>`, `<nav>`, `<section>`, `<article>`) with precise `aria-*` attributes.
- Touch elements must have a minimum interactive target size of **44x44px**.

### B. Security Architecture
- Use **Role-Based Access Control (RBAC)** at the Routing, Component, and Firestore rules levels.
- Strictly validate user inputs at the UI level, hook level, and Firestore Rules level.
- Ensure that `firestore.rules` blocks unauthorized updates using `affectedKeys().hasOnly()` gates.
- All server-side GenAI interactions must run behind Express server-side proxies, hiding keys entirely from the browser.

### C. UI Polish and Aesthetic Guidelines
- **Modern Minimalist Theme**: Default to a high-contrast Slate slate-colored dark theme with soft off-white canvas elements, vibrant blue indicators (`#3B82F6`), and crisp amber warning states (`#F59E0B`).
- **No Telemetry / Mock Log Noise**: Do not clutter page margins with fake terminal outputs or mock connectivity logs (e.g., "SYSTEM STATUS: SECURE", "PORT: 3000"). The dashboard must look professional, clean, and real.
- **Micro-Animations**: All page shifts, drawer expansions, and layout pivots should feel fluid, utilizing `motion/react` with consistent easing profiles.

---

## 8. Development Verification Gate

To maintain pristine build health, we run a multi-step compile/lint pipeline after changes:
1. **Lint Phase**: `npm run lint` (`tsc --noEmit`) to verify static types.
2. **Build Phase**: `npm run build` to confirm package bundles successfully.
3. **Audit**: Validate that files remain under the ~250 line threshold.

---
*FIFA Synapse: Smart Stadium Intelligence, Designed for Scale.*
