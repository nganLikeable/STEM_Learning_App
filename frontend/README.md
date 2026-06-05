# STEM Learning App (Expo Frontend)

This folder contains the React Native / Expo frontend for the CSE3MAD project. It is the main user-facing application where students register, join teams, complete STEM activities, and view their team scores.

## What the app does

- User authentication and onboarding
- Team creation and joining
- Activity-based STEM challenges
- Leaderboard and team score tracking
- Avatar selection and profile management

## Main technologies

- Expo SDK 54
- React Native 0.81.5
- TypeScript
- Expo Router
- Firebase Authentication and Firestore
- Zustand
- Jest for automated tests

## Quick start

From the `frontend/` folder:

```bash
npm install
npm start
```

Useful variants:

```bash
npm run android
npm run ios
npm run web
npm test
npm run lint
```

## Project layout

```text
src/app/           # Route screens and Expo Router pages
src/components/    # Shared UI components
src/features/      # Activity-specific features
src/services/      # Firebase and app service wrappers
src/store/         # Zustand stores
hooks/             # Reusable hooks
assets/            # Images, icons, and sound assets
```

## Notes for contributors

- The project uses file-based routing via Expo Router.
- Firebase credentials and Expo settings are configured in the frontend project files.
- The full design overview and architecture notes are available in the repository root `Design.md`.

## Troubleshooting

- If the app fails to start, remove the existing Expo cache and reinstall dependencies:
  ```bash
  npx expo start --clear
  rm -rf node_modules package-lock.json
  npm install
  ```
- For browser-based testing, use:
  ```bash
  npm run web
  ```
