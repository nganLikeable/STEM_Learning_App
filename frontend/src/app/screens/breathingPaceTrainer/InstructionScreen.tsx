import { useAppTheme } from "@/hooks/useAppTheme";
import Instruction from "@/src/components/workflow/InstructionTemplate";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const instructionData = {
  instruction:
`Measure how your breathing changes before and after exercise — and see the science in your own lungs.
What you'll do:
- Place the phone on your chest and record your breathing at rest
- Do 1 minute of light exercise (jog on the spot or 100 star jumps)
- Record your breathing again with the phone on your chest
- Compare your rest and exercise breathing rates`,

  tools: ["Mobile phone with STEMM Lab app", "Flat surface or mat"],

  formulas: [
    "Breathing at Rest: ~6-12 breaths/min",
    "After Exercise: 20-30+ breaths/min",
    "Respiratory Rate increases with activity",
  ],
  journeyParams: {
    titles: ["Phase 1", "Phase 2", "Phase 3"],
    descriptions: ["gi do", "gi do", "gi do"],
    pathIDs: [
      "/screens/breathingPaceTrainer/BreathTrackerScreen",
      "/screens/breathingPaceTrainer/BreathTrackerScreen",
      "/screens/breathingPaceTrainer/BreathTrackerScreen",
    ],
  },
};

export default function InstructionScreen() {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <Instruction
        activityId={7}
        instruction={instructionData.instruction}
        image={require("../../../../assets/images/activityCards/breathing-measurement.png")}
        tools={instructionData.tools}
        formulas={instructionData.formulas}
        journeyParams={instructionData.journeyParams}
        predictionPath="/screens/breathingPaceTrainer/PredictionScreen"
      />
    </SafeAreaView>
  );
}
