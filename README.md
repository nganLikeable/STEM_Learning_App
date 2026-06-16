# CSE3MAD Project

CSE3MAD is a team-based STEM learning mobile application built with React Native and Expo. The app lets students join or create teams, complete interactive science and engineering challenges, earn points, and track progress on a live leaderboard.

<img width="207" height="448" alt="IMG_4043" src="https://github.com/user-attachments/assets/18f2e358-8de6-47eb-897c-e337158f0d04" />
<img width="207" height="448" alt="IMG_4112" src="https://github.com/user-attachments/assets/695cffce-3223-47c1-adcf-282f64a9551f" />
<img width="207" height="448" alt="IMG_4110" src="https://github.com/user-attachments/assets/b275b39c-8611-43ab-ab75-af01f96063ab" />
<img width="207" height="448" alt="IMG_4161" src="https://github.com/user-attachments/assets/436f15fd-86a3-4463-b792-f266e0ed0688" />
<img width="207" height="448" alt="IMG_4153" src="https://github.com/user-attachments/assets/ad4ecc81-abf0-4de8-846b-49426a77c661" />
<img width="207" height="448" alt="IMG_4230" src="https://github.com/user-attachments/assets/e8421b17-a6e5-4731-85e0-b7813e90e7ed" />
<img width="207" height="448" alt="IMG_4124" src="https://github.com/user-attachments/assets/9a5f7b00-4b7e-440d-af27-3ad8b9a625c1" />

## Demo
https://drive.google.com/drive/u/1/folders/1UqAyhNdow2MPMba7X7sBXyQJa-ThT_DS 

## What this project contains

- Frontend mobile app in `frontend/` built with Expo Router, TypeScript, Firebase Auth, Firestore, and Zustand.
- Activity-based gameplay with challenge screens, team management, avatar selection, and progress tracking.
- A design reference in `Design.md` that documents the app architecture, navigation flow, and data model.

## Current status

- The main app implementation is in the `frontend/` folder.
- The `backend/` folder is currently only a placeholder for environment configuration and is not yet a separate service.

## Tech stack

- React Native + Expo
- TypeScript
- Expo Router
- Firebase Authentication and Firestore
- Zustand for state management
- Jest for unit tests

## Quick start

1. Change into the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npm start
   ```
   Or for a web preview:
   ```bash
   npm run web
   ```

## Useful commands

```bash
npm test
npm run lint
npm run reset-project
```

## Project structure

```text
frontend/          # Expo mobile application
  src/app/          # Screens and file-based routes
  src/components/   # Reusable UI components
  src/features/     # Activity-specific logic and screens
  src/services/     # Firebase and app services
  src/store/        # Zustand stores
backend/           # Reserved for future backend work
Design.md          # Design and architecture notes
```

## Notes

- The app uses Firebase credentials and Expo configuration stored in the frontend project.
- If you need to run the app on a device or emulator, use Expo Go or a development build as described in the frontend README.

