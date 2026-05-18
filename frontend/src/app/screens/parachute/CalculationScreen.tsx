import { parachuteCalculate } from "@/lib/parachute";
import { setActivity1 } from "@/src/services/firestore";
import { useTeamStore } from "@/src/store/team-store";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

// for rendering the corresponding stage
type Step = "INPUT" | "CALCULATE" | "RESULT";

export default function CalculationFlow() {
  // get teamId to store
  const { teamId } = useTeamStore();
  console.log("teamId from store:", teamId);

  // read params markedTime to prefill
  const { markedTime } = useLocalSearchParams<{
    markedTime?: string | string[];
  }>();
  const markedTimeValue = Array.isArray(markedTime)
    ? markedTime[0]
    : markedTime;
  useEffect(() => {
    if (markedTime !== undefined) {
      setInput((prev) => ({
        ...prev,
        time: markedTime.toString(),
      }));
    }
  }, [markedTime]);
  // user input of experiment units
  const [input, setInput] = useState({
    mass: "",
    time: markedTimeValue ?? "",
    distance: "",
  });

  // stage of flow, starting with entering parameters
  const [step, setStep] = useState("INPUT");
  const [error, setError] = useState("");

  const [userCalculation, setUserCalculation] = useState({
    velocity: "",
    acceleration: "",
    netForce: "",
    dragForce: "",
  });

  // for counting correct/incorrect answers
  const [fieldResults, setFieldResults] = useState({
    velocity: null as boolean | null,
    acceleration: null as boolean | null,
    netForce: null as boolean | null,
    dragForce: null as boolean | null,
  });

  // correct answers
  const [correct, setCorrect] = useState(0);

  // validate input - not empty
  const isExperimentInputValid = () => {
    return (
      input.time !== "" &&
      input.distance !== "" &&
      input.mass !== "" &&
      input.time !== "0" &&
      input.distance !== "0" &&
      input.mass !== "0"
    );
  };

  const isCaculationInputValid = () => {
    return (
      userCalculation.acceleration !== "" &&
      userCalculation.dragForce !== "" &&
      userCalculation.netForce !== "" &&
      userCalculation.velocity !== ""
    );
  };

  // INPUT step: data entry
  if (step === "INPUT") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView>
          <View style={styles.container}>
            <Text style={styles.header}>
              Step 1: Enter Experiment Parameters
            </Text>
            <Text style={styles.text}>
              Based on your experiment set up, please enter the following
              parameters:{" "}
            </Text>
            <Text style={styles.label}>Time (s)</Text>
            <TextInput
              style={styles.input}
              value={input.time}
              onChangeText={(t) => {
                setInput({ ...input, time: t });
                setError("");
              }}
              keyboardType="numeric"
            />
            <Text style={styles.label}>Mass (kg)</Text>

            <TextInput
              style={styles.input}
              onChangeText={(t) => {
                setInput({ ...input, mass: t });
                setError("");
              }}
              keyboardType="numeric"
            />
            <Text style={styles.label}>Distance (m)</Text>

            <TextInput
              style={styles.input}
              onChangeText={(t) => {
                setInput({ ...input, distance: t });
                setError("");
              }}
              keyboardType="numeric"
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Button
              title="Next step"
              onPress={() => {
                if (!isExperimentInputValid()) {
                  setError("Please fill in all the fields!");
                  return;
                }
                setStep("CALCULATE");
                setError("");
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Step 2: Calculate
  if (step === "CALCULATE") {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView>
          <Text style={styles.header}>Step 2: Calculate</Text>
          <Text style={styles.text}>
            Please calculate these units and enter your answers. Click on
            Instruction to view the Formulas
          </Text>
          <SafeAreaView style={styles.summaryBox}>
            <Text>
              Mass: {input.mass}kg | Dist: {input.distance}m | Time:{" "}
              {input.time}s
            </Text>
          </SafeAreaView>

          <Text style={styles.header}>Velocity (m/s)</Text>
          <TextInput
            style={styles.input}
            onChangeText={(t) => {
              setUserCalculation({ ...userCalculation, velocity: t });
              setError("");
            }}
            keyboardType="numeric"
          />

          <Text style={styles.header}>Acceleration (m/s²)</Text>
          <TextInput
            style={styles.input}
            onChangeText={(t) => {
              setUserCalculation({ ...userCalculation, acceleration: t });
              setError("");
            }}
            keyboardType="numeric"
          />

          <Text style={styles.header}>Net Force (N)</Text>
          <TextInput
            style={styles.input}
            onChangeText={(t) => {
              setUserCalculation({ ...userCalculation, netForce: t });
              setError("");
            }}
            keyboardType="numeric"
          />

          <Text style={styles.header}>Drag Force (N)</Text>
          <TextInput
            style={styles.input}
            onChangeText={(t) => {
              setUserCalculation({ ...userCalculation, dragForce: t });
              setError("");
            }}
            keyboardType="numeric"
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Button
            title="Submit & Check your answers"
            onPress={() => {
              if (!isCaculationInputValid()) {
                setError("Please fill in all the calculations!");
                return;
              }
              validate();
              setStep("RESULT");
            }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const result = () => {
    const t = parseFloat(input.time);
    const d = parseFloat(input.distance);
    const m = parseFloat(input.mass);

    return parachuteCalculate({ time: t, distance: d, mass: m });
  };

  async function validate() {
    const t = parseFloat(input.time);
    const d = parseFloat(input.distance);
    const m = parseFloat(input.mass);

    const result = parachuteCalculate({ time: t, distance: d, mass: m });

    const entered = {
      velocity: parseFloat(userCalculation.velocity),
      acceleration: parseFloat(userCalculation.acceleration),
      netForce: parseFloat(userCalculation.netForce),
      dragForce: parseFloat(userCalculation.dragForce),
    };

    // accept small rounding differences
    const EPS = 0.05;
    // function to check if answer is correct or not
    const nearlyEqual = (a: number, b: number) => Math.abs(a - b) <= EPS;

    const validationMap = {
      velocity: nearlyEqual(
        parseFloat(userCalculation.velocity),
        result.velocity,
      ),
      acceleration: nearlyEqual(
        parseFloat(userCalculation.acceleration),
        result.acceleration,
      ),
      netForce: nearlyEqual(
        parseFloat(userCalculation.netForce),
        result.netForce,
      ),
      dragForce: nearlyEqual(
        parseFloat(userCalculation.dragForce),
        result.dragForce,
      ),
    };

    setFieldResults(validationMap);

    const correctCount = Object.values(validationMap).filter(
      (f) => f === true,
    ).length;
    setCorrect(correctCount);

    // save to firestore
    try {
      await setActivity1(
        teamId,
        { time: t, distance: d, mass: m },
        {
          velocity: parseFloat(userCalculation.velocity),
          acceleration: parseFloat(userCalculation.acceleration),
          netForce: parseFloat(userCalculation.netForce),
          dragForce: parseFloat(userCalculation.dragForce),
        },
        validationMap,
        correctCount,
      );
      console.log("Saved successfully");
    } catch (e) {
      console.error("Failed to save:", e);
    }
  }

  if (step === "RESULT") {
    const correctValues = result();
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <Text style={styles.header}>Score: {correct} / 4</Text>

          <View style={styles.summaryBox}>
            <Text>
              Velocity: {userCalculation.velocity} (Correct:{" "}
              {correctValues.velocity.toFixed(2)})
            </Text>
            <Text>
              Acceleration: {userCalculation.acceleration} (Correct:{" "}
              {correctValues.acceleration.toFixed(2)})
            </Text>
            <Text>
              Net Force: {userCalculation.netForce} (Correct:{" "}
              {correctValues.netForce.toFixed(2)})
            </Text>
            <Text>
              Drag Force: {userCalculation.dragForce} (Correct:{" "}
              {correctValues.dragForce.toFixed(2)})
            </Text>
          </View>

          {/* for debugging  */}
          <Button
            title="Try Again"
            onPress={() => {
              setFieldResults({
                velocity: null,
                acceleration: null,
                netForce: null,
                dragForce: null,
              });
              setUserCalculation({
                velocity: "",
                acceleration: "",
                netForce: "",
                dragForce: "",
              });
              setInput({ time: "", mass: "", distance: "" });
              setStep("INPUT");
            }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  label: {},
  text: {},
  header: {},
  summaryBox: {},
  error: {
    color: "red",
  },
});
