# CSE3MAD Project — Design Document

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Navigation Structure](#4-navigation-structure)
5. [Authentication & User Flow](#5-authentication--user-flow)
6. [Database Schema](#6-database-schema)
7. [Screens & Features](#7-screens--features)
8. [Components & Hooks](#8-components--hooks)
9. [State Management](#9-state-management)
10. [Activity System](#10-activity-system)
11. [Design System](#11-design-system)
12. [Known Issues & TODOs](#12-known-issues--todos)

---

## 1. Project Overview

**CSE3MAD** is a team-based STEM education mobile app built with React Native (Expo). Students work in teams to complete science and engineering challenges that use the phone's hardware — camera, accelerometer, microphone — to collect real experiment data.

**Core concept:**
- Students form or join teams before participating
- Teams earn points by completing 7 STEM activities across Engineering and Health & Medical Science domains
- A live leaderboard ranks all teams by accumulated points
- Each activity follows a guided flow: instructions → interactive experiment → results

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React Native (Expo managed) | RN 0.81.5 / Expo 54 |
| Language | TypeScript | 5.9.2 |
| Routing | Expo Router (file-based) | 6.0.23 |
| Auth | Firebase Authentication | @react-native-firebase/auth 24 |
| Database | Cloud Firestore | @react-native-firebase/firestore 24 |
| State | Zustand | 5.0.12 |
| Camera | react-native-vision-camera + expo-camera | 4.7.3 / 17 |
| Video | expo-video + react-native-video | 3 / 6.19 |
| Sensors | expo-sensors (accelerometer) + expo-audio | 15 / 1.1 |
| Animation | react-native-reanimated | 4.1.1 |
| Forms | react-hook-form + yup | 7.73 / 1.7 |
| Icons | @expo/vector-icons | 15 |
| SVG | react-native-svg | 15.12 |

---

## 3. Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    Expo React Native App                  │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │   Screens   │  │  Components  │  │    Features    │  │
│  │  (Routing)  │  │  (Reusable)  │  │  (Activity     │  │
│  │             │  │              │  │   logic/UI)    │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬────────┘  │
│         │                │                   │           │
│  ┌──────▼────────────────▼───────────────────▼────────┐  │
│  │               Services Layer                       │  │
│  │   auth.js | firestore.js | firebase.js             │  │
│  └──────────────────────┬──────────────────────────── ┘  │
│                         │                                 │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │               Zustand Store                        │  │
│  │           team-store.ts (global teamId)            │  │
│  └─────────────────────────────────────────────────── ┘  │
└──────────────────────────┬───────────────────────────────┘
                           │
         ┌─────────────────▼──────────────────┐
         │            Firebase                │
         │   Auth  │  Firestore              │
         └────────────────────────────────────┘
```

### File layout

```
frontend/
├── src/
│   ├── app/                    # Expo Router pages
│   │   ├── _layout.tsx         # Root auth guard + Firebase init
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── onboarding.tsx
│   │   ├── pickAvatar.tsx
│   │   ├── changeProfile.tsx
│   │   ├── JourneyComponent.tsx
│   │   └── (tabs)/             # Main tab group
│   │       ├── _layout.tsx
│   │       ├── index.tsx       # Home / activity grid
│   │       ├── leaderboard.tsx
│   │       ├── team.tsx
│   │       ├── setting.tsx
│   │       └── screens/        # Per-activity screens
│   │           ├── parachute/
│   │           ├── soundPollutionHunter/
│   │           ├── handFanChallenge/
│   │           ├── earthquake/
│   │           ├── humanPerformanceLab/
│   │           ├── reactionBoardChallenge/
│   │           └── breathingPaceTrainer/
│   ├── components/             # Shared UI components
│   ├── features/               # Activity-scoped hooks + components
│   │   ├── breathTracker/
│   │   ├── parachute/
│   │   └── reactionBoard/
│   ├── services/               # Firebase wrappers
│   ├── store/                  # Zustand stores
│   ├── constants/              # avatars.ts, shapes.ts
│   ├── lib/                    # Pure logic (activityData.ts, parachute.ts)
│   └── theme.ts                # Design tokens
├── hooks/
│   └── user/useGetUserAvatar.ts
└── assets/
    └── images/ (avatars, backgrounds)
```

---

## 4. Navigation Structure

### Route map

```
/login           ──→  /register
/login           ──→  /onboarding   (first login, no profile yet)
/onboarding      ──→  /pickAvatar
/pickAvatar      ──→  /(tabs)       (main app)

/(tabs)
  ├── /           Home (activity grid)
  ├── /leaderboard
  ├── /team
  └── /setting
        └── /changeProfile

/(tabs)/screens/{activity}/InstructionScreen
  └── /JourneyComponent
        └── /(tabs)/screens/{activity}/[experimentScreen]
```

### Auth guard (`_layout.tsx`)

| State | Redirect |
|---|---|
| Not authenticated | `/login` |
| Authenticated, no Firestore profile | `/onboarding` |
| Authenticated + profile | `/(tabs)` |

---

## 5. Authentication & User Flow

### Registration

1. User fills email + password on `/register`
2. `createUserWithEmailAndPassword()` creates Firebase Auth account
3. Redirects to `/onboarding`

### Onboarding (first-time only)

1. Collects **name**, **grade** (Year 5–12)
2. User either:
   - **Creates a team**: enters team name → generates a 5-char alphanumeric team ID (collision-checked in Firestore)
   - **Joins a team**: enters an existing team ID
3. Saves `users/{uid}` document to Firestore
4. Redirects to `/pickAvatar`

### Avatar selection

1. User picks from 40 avatars (20 "adventurer" style, 20 "neutral" style)
2. Avatar ID written to `users/{uid}.avatarId`
3. Redirects to `/(tabs)`

### Login

1. `signInWithEmailAndPassword()` → `onAuthStateChanged` fires
2. Fetches `users/{uid}` to check profile exists
3. Loads `teamId` from profile into Zustand store
4. Navigates to `/(tabs)`

### Sign out

1. Settings screen shows confirmation alert
2. `signOut()` called → `onAuthStateChanged` fires → redirects to `/login`
3. Zustand teamId cleared

---

## 6. Database Schema

### `users/{uid}`

```typescript
{
  name:      string,           // Display name
  email:     string,           // From Firebase Auth
  grade:     string,           // "5" – "12"
  teamId:    string,           // FK → teams/{teamId}
  avatarId:  string,           // e.g. "adv_1", "neu_12"
  createdAt: Timestamp
}
```

### `teams/{teamId}`

teamId is a 5-character alphanumeric string (auto-generated, collision-checked).

```typescript
{
  name:      string,           // Team display name
  points:    number,           // Cumulative score
  members:   string[],         // Member emails (initial)
  createdAt: Timestamp
}
```

### `activities/{docId}`

One document per activity completion.

```typescript
{
  teamId:          string,
  experimentData:  object,     // Raw sensor/experiment data
  userAnswers:     object,     // User-submitted answers
  validation:      object,     // Grading result
  totalScore:      number,
  createdAt:       Timestamp,
  completedAt:     Timestamp
}
```

### Firestore query patterns

| Operation | Query |
|---|---|
| Get team | `doc("teams", teamId)` |
| Get team members | `collection("users").where("teamId", "==", id)` |
| Leaderboard | `collection("teams")` → sort by points client-side |
| User profile | `doc("users", uid)` |
| Add points | `updateDoc` with `increment(pts)` |
| Save activity | `addDoc("activities", data)` |

---

## 7. Screens & Features

### Home Screen — `(tabs)/index.tsx`

- Displays 7 activities in two sections:
  - **Engineering Challenges** (4 activities): 2×2 grid
  - **Health & Medical Science** (3 activities): 2-col + 1 full-width
- Each card shows: icon, name, brief description, difficulty level
- **TeamInfoCard** at top: team name, ID, member count, grade

### Leaderboard — `(tabs)/leaderboard.tsx`

- Podium for top 3 teams (gold/silver/bronze pedestals)
- Ranked list for rank 4+
- Sky-image background with color overlay
- Data: `getAllTeams()` fetched from Firestore, sorted by `points` descending

### Team — `(tabs)/team.tsx`

- Team name, team ID, team icon
- Member list: each member shows name, grade, email
- Data: `getTeam(teamId)` + `getTeamMembers(teamId)`

### Settings — `(tabs)/setting.tsx`

- Profile card: avatar, name, grade, email, team ID
- Menu: **Change Profile** (active) · Preferences / Help / Feedback (stubs)
- Sign Out with confirmation dialog

### Change Profile — `changeProfile.tsx`

- Edit name and grade only (email immutable)
- Saves via `saveUserProfile(uid, { name, grade })`

### Pick Avatar — `pickAvatar.tsx`

- Scrollable grid of 40 avatars
- Confirm selection → saves `avatarId` to Firestore

### Journey Component — `JourneyComponent.tsx`

- Duolingo-style learning path with 10 nodes connected by SVG bezier curves
- Completed nodes: green; locked nodes: gray
- Tapping a node opens a modal with description and a **Start** button
- **Start** navigates to the activity's experiment screen via `router.push(pathID)`

---

## 8. Components & Hooks

### Shared Components

| Component | Purpose |
|---|---|
| `InstructionTemplate` | Reusable instruction layout: header, tools list, diagram/legend, formulas, start button |
| `JourneyComponent` | SVG learning path, node modal, navigation |
| `TeamInfoCard` | Compact team status display |
| `ActivityCard` | Activity grid item with icon, title, description |
| `AvatarPicker` | Scrollable avatar grid with selection state |
| `header.tsx` | Top header showing user's name |

### Feature Components

| Component | Activity | Purpose |
|---|---|---|
| `BaseCamera` | Parachute | Video recording with stop/preview controls |
| `BaseVideoPreview` | Parachute | Review recorded video, mark timestamp |
| `TapReactionGame` | Reaction Board | Tap-based reaction time measurement |
| `TracingGame` | Reaction Board | Draw-on-screen tracing with scoring engine |
| `BreathTracker` | Breathing Trainer | Accelerometer-based breath phase display |
| `Accelerometer` | Breathing Trainer | Raw accelerometer data visualization |

### Hooks

| Hook | Description |
|---|---|
| `useGetUserAvatar()` | Fetches current user's avatarId from Firestore, maps to image source |
| `useBreathTracker()` | Accelerometer → EMA filter → peak detection → BPM calculation |
| `useTracingGame()` | Tracing game state: drawn paths, score, round timer |
| `useTracingInput()` | PanResponder for touch input → path coordinates |

---

## 9. State Management

### Global state — Zustand (`store/team-store.ts`)

```typescript
interface TeamStore {
  teamId: string | null;
  setTeamId: (id: string) => void;
}
```

Set once at login; read anywhere with `useTeamStore(s => s.teamId)`.

### Local state — `useState`

All other state is local to each screen/component:
- Form inputs (name, grade, team fields)
- Loading / error flags
- Activity game state (current phase, scores, sensor readings)

---

## 10. Activity System

### Activity definitions (`lib/activityData.ts`)

Each activity entry provides:
- `id`, `title`, `description`
- `icon` (MaterialCommunityIcons name)
- `category` ("Engineering" | "Health")
- Route paths to InstructionScreen and experiment screens

### Shared activity flow

```
Home grid card
  → InstructionScreen  (InstructionTemplate: tools, diagram, formulas)
      → JourneyComponent  (learning path nodes)
          → Experiment screen(s)
              → Results / score save
```

### Activity details

#### 1. Parachute Drop Challenge
- **Concept**: Measure drag force via video analysis
- **Data collected**: Video recording → user marks fall timestamp
- **Calculation**: velocity = distance/time → acceleration → net force → drag force
- **Physics lib**: `lib/parachute.ts`
- **Screens**: InstructionScreen → VideoRecorderScreen → CalculationScreen

#### 2. Sound Pollution Hunter
- **Concept**: Measure ambient decibel levels
- **Data collected**: Microphone amplitude → dB conversion
- **Screens**: InstructionScreen → soundMeasureTracking

#### 3. Hand Fan Challenge
- **Concept**: Vision-based fan tracking (force/velocity analysis)
- **Screens**: InstructionScreen → handFanTracking → HandFanVideoPreview

#### 4. Earthquake Structure Challenge
- **Concept**: Engineering design challenge (build structure to survive simulated earthquake)
- **Screens**: InstructionScreen only (experiment is physical, app records result)

#### 5. Human Performance Lab
- **Concept**: Physical performance benchmarking
- **Screens**: InstructionScreen only

#### 6. Reaction Board Challenge
- **Concept**: Measure reaction time + motor tracing accuracy
- **Phases**:
  1. Dominant hand — tap reaction test
  2. Non-dominant hand — tap reaction test
  3. Tracing — draw path on screen
- **Algorithm**: Tracing engine scores path accuracy against reference shape
- **Screens**: InstructionScreen → ReactionBoardGameScreen

#### 7. Breathing Pace Trainer
- **Concept**: Monitor breathing rate using accelerometer
- **Algorithm**:
  1. Read accelerometer at 50ms intervals
  2. Compute magnitude = √(x² + y² + z²)
  3. Apply EMA low-pass filter (α = 0.15)
  4. Detect local peaks (slope sign change from + to –)
  5. Reject peaks < 1.5 s apart (noise filter)
  6. Compute BPM from rolling 3-interval window
  7. Ignore motion < 0.002 magnitude threshold
- **Screens**: InstructionScreen → BreathTrackerScreen

---

## 11. Design System

### Colors (`theme.ts`)

| Token | Value | Usage |
|---|---|---|
| Background | `#F8F9FA` | Cards, surfaces |
| Surface | `#FFFFFF` | Modals, inputs |
| Text primary | `#1A1A1A` | Headlines, body |
| Accent | `#F39C12` | CTAs, highlights |

### Screen backgrounds

| Screen | Background |
|---|---|
| Home / Team / Settings | `#F8F4EF` (warm beige) |
| Login / Register / Onboarding | `#E6F4FE` (light blue) |
| Leaderboard | Sky image + color overlay |
| Journey | `#EAF4EA` (sage green) |

### Spacing scale

| Token | Value |
|---|---|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| xxl | 48px |

### Border radius

| Usage | Value |
|---|---|
| Cards | 16px |
| Inputs | 12px |
| Tags / chips | 8px |

### Shadows

| Level | Elevation |
|---|---|
| Light | 2 |
| Medium | 4 |

### Icon library

- **MaterialCommunityIcons** — primary (parachute, fan, volume-high, home-alert, lungs, etc.)
- **Ionicons** — secondary (some navigation icons)

### Avatars

40 total avatars in two styles:
- `adv_1` … `adv_20` — "adventurer" style
- `neu_1` … `neu_20` — "neutral" style
- Stored as PNGs in `assets/images/avatars/`

---

## 12. Known Issues & TODOs

| # | Issue | Severity |
|---|---|---|
| 1 | `setActivity1()` in `firestore.js` calls `addDoc()` but the import is missing | Bug (activity save broken) |
| 2 | TeamInfoCard on Home screen shows static "450 pts, rank 12" instead of live data | Data gap |
| 3 | Only the Parachute activity saves data; other 6 have no persistence wired | Feature gap |
| 4 | Settings options "Preferences", "Help Center", "Feedback" are non-functional stubs | Incomplete |
| 5 | Change Profile only allows name/grade edit; email and avatar cannot be updated here | UX gap |
| 6 | JourneyComponent node descriptions are placeholder text | Content gap |
| 7 | `getAllTeams()` sorts client-side; will slow down as team count grows | Performance |
| 8 | `teams.members` stores only the creator's email; joining members are not tracked | Data model gap |

---

## Environment Variables

```env
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
```

All variables are prefixed `EXPO_PUBLIC_` so they are bundled into the client build by Expo.
