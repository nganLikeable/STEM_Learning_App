import { useAppTheme } from "@/hooks/useAppTheme";
import Instruction from "@/src/components/workflow/InstructionTemplate";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const instructionData = {
  instruction:
`Build a structure that can survive a simulated earthquake — then improve it.
  What you'll do:
- Fold paper or cardboard to create an anti-vibration base layer
- Place a flat cardboard platform on top
- Put the phone in the centre and activate vibration mode in the app
- Modify your structure (add pillars or folds) to reduce movement
- Redesign and retest — up to 3 prototypes`,

  tools: [
    "Cardboard",
    "Paper",
    "Scissors",
    "Sticky tape",
    "Plastic/paper cups",
    "Mobile phone with vibration sensor",
  ],

  formulas: [
    "Damping = fold count + pillar support",
    "Vibration absorption",
    "Structure stability",
  ],
  journeyParams: {
    titles: ["Phase 1", "Phase 2", "Phase 3"],
    descriptions: ["gi do", "gi do", "gi do"],
    pathIDs: [
      "/screens/earthquake/EarthquakeScreen?design=1",
      "/screens/earthquake/EarthquakeScreen?design=2",
      "/screens/earthquake/EarthquakeScreen?design=3",
    ],
  },
};

export default function InstructionScreen() {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <Instruction
        activityId={4}
        instruction={instructionData.instruction}
        image={require("../../../../assets/images/activityCards/vibration-platform.png")}
        tools={instructionData.tools}
        formulas={instructionData.formulas}
        journeyParams={instructionData.journeyParams}
        setupPath="/screens/earthquake/DesignInputScreen"
        predictionPath="/screens/earthquake/PredictionScreen"
      />
    </SafeAreaView>
  );
}
