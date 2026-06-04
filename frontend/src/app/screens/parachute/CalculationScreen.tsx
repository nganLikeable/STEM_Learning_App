import { useAppTheme } from "@/hooks/useAppTheme";
import { parachuteCalculate } from "@/lib/parachute";
import { setActivity1 } from "@/src/services/activity";
import { advanceSessionById, getActiveSession } from "@/src/services/session";
import { useSessionStore } from "@/src/store/session-store";
import { useTeamStore } from "@/src/store/team-store";
import { playPhaseCompleteSound } from "@/src/utils/playSound";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = "INPUT" | "CALCULATE" | "RESULT";

const ACCENT = "#6b76ee";

export default function CalculationFlow() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const { teamId } = useTeamStore();
  const { sessionId } = useSessionStore(); // Access globally tracking path state container
  // track the session document locally to inspect it on completion
  const [sessionData, setSessionData] = useState<any>(null);

  const { markedTime, video, journeyData } = useLocalSearchParams<{
    markedTime?: string | string[];
    video?: string;
    journeyData?: string;
  }>();
  const markedTimeValue = Array.isArray(markedTime)
    ? markedTime[0]
    : markedTime;

  useEffect(() => {
    if (markedTime !== undefined) {
      setInput((prev) => ({ ...prev, time: markedTime.toString() }));
    }
  }, [markedTime]);

  const [input, setInput] = useState({
    mass: "",
    time: markedTimeValue ?? "",
    distance: "",
  });
  const [step, setStep] = useState<Step>("INPUT");
  const [error, setError] = useState("");

  const [userCalculation, setUserCalculation] = useState({
    velocity: "",
    acceleration: "",
    netForce: "",
    dragForce: "",
  });

  const [fieldResults, setFieldResults] = useState({
    velocity: null as boolean | null,
    acceleration: null as boolean | null,
    netForce: null as boolean | null,
    dragForce: null as boolean | null,
  });

  const [correct, setCorrect] = useState(0);

  const isExperimentInputValid = () =>
    input.time !== "" &&
    input.distance !== "" &&
    input.mass !== "" &&
    input.time !== "0" &&
    input.distance !== "0" &&
    input.mass !== "0";

  const isCaculationInputValid = () =>
    userCalculation.acceleration !== "" &&
    userCalculation.dragForce !== "" &&
    userCalculation.netForce !== "" &&
    userCalculation.velocity !== "";

  const getResult = () => {
    const t = parseFloat(input.time);
    const d = parseFloat(input.distance);
    const m = parseFloat(input.mass);
    return parachuteCalculate({ time: t, distance: d, mass: m });
  };

  async function validate() {
    const t = parseFloat(input.time);
    const d = parseFloat(input.distance);
    const m = parseFloat(input.mass);
    const calculated = parachuteCalculate({ time: t, distance: d, mass: m });

    const EPS = 0.05;
    const nearlyEqual = (a: number, b: number) => Math.abs(a - b) <= EPS;

    const validationMap = {
      velocity: nearlyEqual(
        parseFloat(userCalculation.velocity),
        calculated.velocity,
      ),
      acceleration: nearlyEqual(
        parseFloat(userCalculation.acceleration),
        calculated.acceleration,
      ),
      netForce: nearlyEqual(
        parseFloat(userCalculation.netForce),
        calculated.netForce,
      ),
      dragForce: nearlyEqual(
        parseFloat(userCalculation.dragForce),
        calculated.dragForce,
      ),
    };

    setFieldResults(validationMap);
    const correctCount = Object.values(validationMap).filter(
      (f) => f === true,
    ).length;
    setCorrect(correctCount);

    const pointsAwarded = correctCount * 20;

    try {
      if (!teamId) throw new Error("Missing teamId.");

      // 1. Fetch current runtime continuous session tracking
      const activeSession = await getActiveSession(teamId, 1);
      const targetsSessionId = sessionId || activeSession?.id;

      if (!targetsSessionId)
        throw new Error("No running structural session found");

      // 2. Save individual experiment document metrics tagged back to global run ID
      const activityDocId = await setActivity1(
        teamId,
        1,
        targetsSessionId,
        { time: t, distance: d, mass: m },
        {
          velocity: parseFloat(userCalculation.velocity),
          acceleration: parseFloat(userCalculation.acceleration),
          netForce: parseFloat(userCalculation.netForce),
          dragForce: parseFloat(userCalculation.dragForce),
        },
        validationMap,
        pointsAwarded, // Points score awarded on activity validation loop
        video ?? undefined,
      );
      const updatedSessionDoc = await advanceSessionById(
        targetsSessionId,
        activityDocId,
        pointsAwarded,
        3,
      );
      console.log("Saved successfully", updatedSessionDoc);
      setSessionData(updatedSessionDoc);
      playPhaseCompleteSound();
    } catch (e) {
      console.error("Failed to save architecture flow results:", e);
    }
  }

  async function handleFinish() {
    try {
      if (!teamId) throw new Error("Missing teamId.");

      const pointsAwarded = correct * 20;

      if (sessionData?.completed) {
        router.replace("/screens/parachute/PickBestDesignScreen");
        return;
      }

      // fallback
      if (journeyData) {
        router.replace({
          pathname: "/journey",
          params: { journeyData },
        } as any);
        return;
      }

      router.replace("/screens/parachute/InstructionScreen");
    } catch (err) {
      console.error("Failed to complete session pipeline:", err);
    }
  }

  // ── INPUT ─────────────────────────────────────────────────────────────────
  if (step === "INPUT") {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.primary }]} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <PageHeader stepNum={1} subtitle="Enter Experiment Parameters" />

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={styles.cardTitle}>Experiment Parameters</Text>
            <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
              Based on your experiment setup, enter the values below.
            </Text>

            <InputField
              label="Time (s)"
              value={input.time}
              onChangeText={(t) => {
                setInput({ ...input, time: t });
                setError("");
              }}
              prefilled={!!markedTimeValue}
            />
            <InputField
              label="Mass (kg)"
              onChangeText={(t) => {
                setInput({ ...input, mass: t });
                setError("");
              }}
            />
            <InputField
              label="Distance (m)"
              onChangeText={(t) => {
                setInput({ ...input, distance: t });
                setError("");
              }}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <Pressable
            style={styles.primaryBtn}
            onPress={() => {
              if (!isExperimentInputValid()) {
                setError("Please fill in all the fields.");
                return;
              }
              setStep("CALCULATE");
              setError("");
            }}
          >
            <Text style={styles.primaryBtnText}>Continue →</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── CALCULATE ─────────────────────────────────────────────────────────────
  if (step === "CALCULATE") {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.primary }]} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <PageHeader stepNum={2} subtitle="Calculate & Verify" />

          <View style={[styles.summaryPill, { backgroundColor: colors.surface }]}>
            <SummaryChip label="Mass" value={`${input.mass} kg`} />
            <View style={[styles.pillDivider, { backgroundColor: colors.border }]} />
            <SummaryChip label="Dist" value={`${input.distance} m`} />
            <View style={[styles.pillDivider, { backgroundColor: colors.border }]} />
            <SummaryChip label="Time" value={`${input.time} s`} />
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={styles.cardTitle}>Your Calculations</Text>
            <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
              Use the formulas from the instruction screen.
            </Text>

            <InputField
              label="Velocity (m/s)"
              onChangeText={(t) => {
                setUserCalculation({ ...userCalculation, velocity: t });
                setError("");
              }}
            />
            <InputField
              label="Acceleration (m/s²)"
              onChangeText={(t) => {
                setUserCalculation({ ...userCalculation, acceleration: t });
                setError("");
              }}
            />
            <InputField
              label="Net Force (N)"
              onChangeText={(t) => {
                setUserCalculation({ ...userCalculation, netForce: t });
                setError("");
              }}
            />
            <InputField
              label="Drag Force (N)"
              onChangeText={(t) => {
                setUserCalculation({ ...userCalculation, dragForce: t });
                setError("");
              }}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <Pressable
            style={styles.primaryBtn}
            onPress={async () => {
              if (!isCaculationInputValid()) {
                setError("Please fill in all the calculations.");
                return;
              }
              await validate();
              setStep("RESULT");
            }}
          >
            <Text style={styles.primaryBtnText}>Submit & Check Answers</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (step === "RESULT") {
    const correctValues = getResult();
    const scoreColor =
      correct === 4 ? "#16a34a" : correct >= 2 ? "#d97706" : "#dc2626";

    const fields: {
      key: keyof typeof fieldResults;
      label: string;
      unit: string;
      correctVal: number;
      userVal: string;
    }[] = [
      {
        key: "velocity",
        label: "Velocity",
        unit: "m/s",
        correctVal: correctValues.velocity,
        userVal: userCalculation.velocity,
      },
      {
        key: "acceleration",
        label: "Acceleration",
        unit: "m/s²",
        correctVal: correctValues.acceleration,
        userVal: userCalculation.acceleration,
      },
      {
        key: "netForce",
        label: "Net Force",
        unit: "N",
        correctVal: correctValues.netForce,
        userVal: userCalculation.netForce,
      },
      {
        key: "dragForce",
        label: "Drag Force",
        unit: "N",
        correctVal: correctValues.dragForce,
        userVal: userCalculation.dragForce,
      },
    ];

    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.primary }]} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.scoreBanner, { borderColor: scoreColor, backgroundColor: colors.surface }]}>
            <Text style={[styles.scoreBannerLabel, { color: colors.textSecondary }]}>YOUR SCORE</Text>
            <Text style={[styles.scoreBannerScore, { color: scoreColor }]}>
              {correct} / 4
            </Text>
            <Text style={[styles.scoreBannerSub, { color: colors.textSecondary }]}>
              {correct === 4
                ? "Perfect — all answers correct!"
                : `${4 - correct} answer${4 - correct > 1 ? "s" : ""} need${4 - correct === 1 ? "s" : ""} review.`}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={styles.cardTitle}>Results Breakdown</Text>
            {fields.map(({ key, label, unit, correctVal, userVal }) => {
              const isCorrect = fieldResults[key];
              const rowBg = isCorrect
                ? isDark ? "#14532d33" : "#F0FDF4"
                : isDark ? "#7f1d1d33" : "#FFF1F2";
              const rowBorder = isCorrect ? "#86EFAC" : "#FCA5A5";
              return (
                <View
                  key={key}
                  style={[styles.resultRow, { backgroundColor: rowBg, borderColor: rowBorder }]}
                >
                  <View style={styles.resultRowLeft}>
                    <Text style={[styles.resultLabel, { color: colors.text }]}>{label}</Text>
                    <Text style={[styles.resultYourAnswer, { color: colors.textSecondary }]}>
                      Your answer: {userVal} {unit}
                    </Text>
                    {!isCorrect && (
                      <Text style={styles.resultCorrectAnswer}>
                        Correct: {correctVal.toFixed(2)} {unit}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.resultIcon, { color: isCorrect ? "#16a34a" : "#dc2626" }]}>
                    {isCorrect ? "✓" : "✗"}
                  </Text>
                </View>
              );
            })}
          </View>

          <Pressable style={styles.primaryBtn} onPress={handleFinish}>
            <Text style={styles.primaryBtnText}>Finish</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

// ── Sub-components ───────────────────────────────────────────────────────────

function PageHeader({ stepNum, subtitle }: { stepNum: number; subtitle: string }) {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>STEP {stepNum} OF 2</Text>
      </View>
      <Text style={styles.pageEmoji}>🪂</Text>
      <Text style={styles.pageHeading}>{subtitle}</Text>
      <Text style={styles.pageSub}>Parachute Drop Challenge</Text>
    </View>
  );
}

function InputField({
  label, value, onChangeText, prefilled,
}: {
  label: string; value?: string; onChangeText: (t: string) => void; prefilled?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.inputBox,
          { backgroundColor: colors.primary, borderColor: colors.border, color: colors.text },
          prefilled && styles.inputBoxPrefilled,
        ]}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder="0.00"
        placeholderTextColor={colors.textSecondary}
      />
      {prefilled && <Text style={styles.prefilledNote}>Pre-filled from your video</Text>}
    </View>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.chip}>
      <Text style={[styles.chipLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.chipValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 48, gap: 16 },

  pageHeader: {
    backgroundColor: ACCENT,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  stepBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  stepBadgeText: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  pageEmoji: { fontSize: 44, marginBottom: 8 },
  pageHeading: { fontSize: 20, fontWeight: "800", color: "#fff", textAlign: "center" },
  pageSub: { fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 },

  card: { borderRadius: 16, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: ACCENT, marginBottom: 4 },
  cardSub: { fontSize: 13, marginBottom: 16 },

  summaryPill: {
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  pillDivider: { width: 1, height: 28, marginHorizontal: 12 },
  chip: { flex: 1, alignItems: "center" },
  chipLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
  chipValue: { fontSize: 15, fontWeight: "700", marginTop: 2 },

  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  inputBox: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
  },
  inputBoxPrefilled: { borderColor: ACCENT },
  prefilledNote: { fontSize: 11, color: ACCENT, marginTop: 4 },

  errorText: { color: "#dc2626", fontSize: 13, marginTop: 4 },

  primaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 15, letterSpacing: 1 },

  scoreBanner: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
  },
  scoreBannerLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  scoreBannerScore: { fontSize: 56, fontWeight: "800", marginVertical: 4 },
  scoreBannerSub: { fontSize: 14, textAlign: "center" },

  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
  },
  resultRowCorrect: { backgroundColor: "#F0FDF4", borderColor: "#86EFAC" },
  resultRowWrong: { backgroundColor: "#FFF1F2", borderColor: "#FCA5A5" },
  resultRowLeft: { flex: 1, gap: 2 },
  resultLabel: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  resultYourAnswer: { fontSize: 13 },
  resultCorrectAnswer: { fontSize: 13, color: "#16a34a", fontWeight: "600" },
  resultIcon: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 12,
  },
});
