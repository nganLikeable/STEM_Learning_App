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
import { useAppStore } from "../store/app-store";

// Tells expo-router which route group to treat as the default/anchor (the tab navigator)
export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  const setTeamId = useTeamStore((state) => state.setTeamId);
  const introSeen = useAppStore((state) => state.introSeen);

  // Subscribe to Firebase auth state
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  // Guard — redirect based on auth + intro state
  useEffect(() => {
    if (!authReady) return;

    // Show intro until the user taps Log In / Sign Up
    if (!introSeen && (segments[0] as string) !== 'intro') {
      router.replace('/intro');
      return;
    }

    if ((segments[0] as string) === 'intro') return;

    const inAuth =
      segments[0] === "login" ||
      segments[0] === "register" ||
      segments[0] === "onboarding";

    if (!user && !inAuth) {
      router.replace("/login");
    } else if (user && (segments[0] === "login" || segments[0] === "register")) {
      getUserProfile(user.uid).then((snap) => {
        if (snap.exists()) {
          const profile = snap.data();
          if (profile?.teamId) setTeamId(profile.teamId);
          router.replace("./(tabs)");
        } else {
          router.replace("./onboarding");
        }
      });
    }
  }, [user, authReady, introSeen, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="intro" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
