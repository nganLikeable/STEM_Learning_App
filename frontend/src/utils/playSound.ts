import { Audio } from "expo-av";

export async function playPhaseCompleteSound(): Promise<void> {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/sounds/success_phase.mp3"),
    );
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch {
    // never block user flow on sound failure
  }
}
