import { Platform } from "react-native";

// ── Replace with your real AdMob IDs from the AdMob console ──────────────────
// Android App ID goes in app.json (see plugin config below).
// Ad Unit IDs are used at runtime here.

export const ADMOB_IDS = {
  // Interstitial shown before the parachute activity starts
  PARACHUTE_INTERSTITIAL: Platform.select({
    android: "ca-app-pub-3940256099942544/1033173712", // Google test ID — replace when Android unit ID is ready
    ios:     "ca-app-pub-2582985000106933/4355348440",
    default: "ca-app-pub-3940256099942544/1033173712",
  })!,
};

// Google's test IDs for development (safe to use before real IDs are ready)
export const TEST_IDS = {
  INTERSTITIAL_ANDROID: "ca-app-pub-3940256099942544/1033173712",
  INTERSTITIAL_IOS:     "ca-app-pub-3940256099942544/4411468910",
};
