import EarthquakeActivity from "@/src/features/earthquake/EarthquakeActivity";
import { useLocalSearchParams } from "expo-router";

export default function EarthquakeScreen() {
  const { design } = useLocalSearchParams<{ design: string }>();
  const designNumber = Number(design) as 1 | 2 | 3;
  return <EarthquakeActivity designNumber={designNumber} />;
}
