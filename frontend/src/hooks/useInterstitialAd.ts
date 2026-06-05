import { useCallback, useEffect, useRef, useState } from "react";
import { TurboModuleRegistry } from "react-native";
import { ADMOB_IDS } from "@/src/constants/admob";

// TurboModuleRegistry.get() returns null without throwing (unlike getEnforcing).
// We use it to check availability BEFORE ever touching the package, so the
// native-module error is never fired in development / un-built environments.
const IS_ADMOB_AVAILABLE = !!TurboModuleRegistry.get("RNGoogleMobileAdsModule");

export function useParachuteInterstitial() {
  const adRef      = useRef<any>(null);
  const resolveRef = useRef<(() => void) | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!IS_ADMOB_AVAILABLE) {
      console.log("[AdMob] native module not linked — do an EAS build to enable ads");
      return;
    }

    const unsubs: Array<() => void> = [];
    const { InterstitialAd, AdEventType } = require("react-native-google-mobile-ads");

    const ad = InterstitialAd.createForAdRequest(
      ADMOB_IDS.PARACHUTE_INTERSTITIAL,
      { requestNonPersonalizedAdsOnly: false },
    );

    unsubs.push(
      ad.addAdEventListener(AdEventType.LOADED, () => {
        console.log("[AdMob] loaded ✓");
        setIsLoaded(true);
      }),
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        setIsLoaded(false);
        resolveRef.current?.();
        resolveRef.current = null;
        ad.load();
      }),
      ad.addAdEventListener(AdEventType.ERROR, (e: unknown) => {
        console.warn("[AdMob] error", e);
        resolveRef.current?.();
        resolveRef.current = null;
      }),
    );

    adRef.current = ad;
    ad.load();
    console.log("[AdMob] loading...");

    return () => unsubs.forEach(u => u());
  }, []);

  const showAd = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!adRef.current || !isLoaded) {
        resolve();
        return;
      }
      resolveRef.current = resolve;
      adRef.current.show();
    });
  }, [isLoaded]);

  return { showAd, isLoaded };
}
