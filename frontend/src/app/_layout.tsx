// React core + hooks for side effects and state management
import React, { useEffect, useState } from "react";

// Stack: stack navigator; useRouter: programmatic navigation; useSegments: reads current URL segments
import { Stack, useRouter, useSegments } from "expo-router";

// Wraps the app so gesture-based interactions (swipe, drag) work correctly on both platforms
import { GestureHandlerRootView } from "react-native-gesture-handler";

// getAuth: gets the Firebase Auth instance; onAuthStateChanged: listens for login/logout events
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getUserProfile } from "../services/firestore";

// Required import to activate Reanimated's JS thread before the app renders
import "react-native-reanimated";

// Initialises Firebase app (side-effect import — must run before any Firebase calls)
import "../services/firebase";
import { useTeamStore } from "../store/team-store";

// Tells expo-router which route group to treat as the default/anchor (the tab navigator)
export const unstable_settings = {
  anchor: "(tabs)",
};

/**
 * RootLayout — top-level layout component mounted once for the entire app.
 * Responsibilities:
 *   1. Subscribe to Firebase auth state changes.
 *   2. Redirect unauthenticated users to /login.
 *   3. Redirect authenticated users away from auth screens to the tab navigator.
 *   4. Register every top-level screen in the Stack navigator.
 */
export default function RootLayout() {
  // router: used to programmatically navigate between screens
  const router = useRouter();

  // segments: array of the current URL path parts, e.g. ['login'] or ['(tabs)', 'index']
  const segments = useSegments();

  // authReady: false until Firebase has responded at least once (prevents redirect flicker on cold start)
  const [authReady, setAuthReady] = useState(false);

  // user: the currently signed-in Firebase user object, or null if logged out
  const [user, setUser] = useState<any>(null);

  // save to zustand for global access of teamId
  const setTeamId = useTeamStore((state) => state.setTeamId);

  /**
   * Effect 1 — Subscribe to Firebase auth state.
   * Runs once on mount. onAuthStateChanged fires immediately with the current
   * user (or null), then again whenever the user signs in or out.
   * Returns the unsubscribe function so the listener is cleaned up on unmount.
   */
  useEffect(() => {
    // Get the Firebase Auth instance tied to the default app
    const auth = getAuth();

    // Subscribe: callback receives the user object (or null when signed out)
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u); // store the user (or null) in state
      setAuthReady(true); // mark that Firebase has responded — safe to redirect now
    });

    // Cleanup: unsubscribe when the component unmounts to avoid memory leaks
    return unsub;
  }, []); // empty deps → run only once on mount

  /**
   * Effect 2 — Guard/redirect logic, runs whenever auth state or route changes.
   * Rules:
   *   - Not ready yet → do nothing (avoids premature redirect on app launch)
   *   - No user + not on an auth screen → send to /login
   *   - User logged in + still on an auth screen → send to the tab navigator
   */
  useEffect(() => {
    // Wait until Firebase has confirmed the initial auth state
    if (!authReady) return;

    // Auth-only screens: login, register, and onboarding are all publicly accessible
    const inAuth =
      segments[0] === "login" ||
      segments[0] === "register" ||
      segments[0] === "onboarding";

    if (!user && !inAuth) {
      router.replace("/login");
    } else if (
      user &&
      (segments[0] === "login" || segments[0] === "register")
    ) {
      // Cold start: user already logged in — check if they completed onboarding
      getUserProfile(user.uid).then((snap) => {
        // if snap exists - setTeamId to zustand
        if (snap.exists()) {
          const profile = snap.data();
          if (profile?.teamId) {
            setTeamId(profile.teamId);
            // console.log(profile.teamId);
          }
          router.replace("./(tabs)");
        } else {
          router.replace("./onboarding");
        }
      });
    }
  }, [user, authReady, segments]); // re-run whenever user, readiness, or route changes

  return (
    // GestureHandlerRootView must wrap the entire tree for gesture support
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Stack navigator — manages the navigation history (push/pop/replace) */}
      <Stack>
        {/* Main app tabs — headerShown:false so the tab bar controls its own header */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Login screen — no header, full-screen card layout */}
        <Stack.Screen name="login" options={{ headerShown: false }} />

        {/* Register screen — no header, full-screen card layout */}
        <Stack.Screen name="register" options={{ headerShown: false }} />

        {/* Onboarding screen — collects name, grade, and team info after first login */}
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
