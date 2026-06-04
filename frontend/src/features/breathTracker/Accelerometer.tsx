import { Accelerometer } from "expo-sensors";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
export default function AccelerometerModule() {
  const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0 });
  const [subscription, setSubscription] = useState<ReturnType<
    typeof Accelerometer.addListener
  > | null>(null);

  // breaths per minute
  const [bpm, setBpm] = useState(0);

  // store timestamp to detect peaks
  const [timestamp, setTimestamp] = useState<number | null>(null);

  // ref of previous slope, indicating a change of direction
  const prevSlope = useRef(0);

  // ref of previous filtered z value, for computing slope and smoothing sigals
  const prevFilteredZ = useRef(0);

  // smoothing
  const filter = 0.1;

  // on mount
  const subscribe = () => {
    Accelerometer.setUpdateInterval(300); // update frequency
    setSubscription(Accelerometer.addListener(setData));
  };

  // on unmount
  const unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>x: {x}</Text>
      <Text style={styles.text}>y: {y}</Text>
      <Text style={styles.text}>z: {z}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    textAlign: "center",
  },
});
