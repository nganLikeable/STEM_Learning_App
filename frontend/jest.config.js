/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  // stub out Firebase so ESM packages never get parsed by Jest
  moduleNameMapper: {
    "^firebase/(.*)$": "<rootDir>/src/__tests__/__mocks__/firebase.ts",
    "^./firestore$": "<rootDir>/src/__tests__/__mocks__/firebase.ts",
    "^../services/firestore$": "<rootDir>/src/__tests__/__mocks__/firebase.ts",
    "^expo-router$": "<rootDir>/src/__tests__/__mocks__/expo-router.ts",
    "^@/hooks/useAppTheme$": "<rootDir>/src/__tests__/__mocks__/useAppTheme.ts",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
