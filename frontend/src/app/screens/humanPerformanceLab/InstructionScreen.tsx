import { useAppTheme } from "@/hooks/useAppTheme";
import { humanPerformanceActivity } from "@/lib/activityPhaseDescriptions";
import Instruction from "@/src/components/workflow/InstructionTemplate";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const instructionData = {
  instruction:
`Discover how your body moves by measuring speed, smoothness, and coordination.
What you'll do:
- Hold the phone firmly in one hand and activate the vibration sensor
- Perform the guided stretching movements slowly and steadily
- Record the vibration data for each movement
- Review your speed, smoothness, and range-of-motion results`,

  tools: ["Mobile phone with STEMM Lab app", "Open space to move safely"],

  formulas: [
    "Vibration = Movement smoothness",
    "Speed vs Coordination",
    "Range of motion",
  ],
  journeyParams: {
    titles: humanPerformanceActivity.phases.map((phase) => phase.title),
    descriptions: humanPerformanceActivity.phases.map((phase) => phase.title),
    pathIDs: [
      "/screens/humanPerformanceLab/HumanPerformanceScreen?phase=1",
      "/screens/humanPerformanceLab/HumanPerformanceScreen?phase=2",
      "/screens/humanPerformanceLab/HumanPerformanceScreen?phase=3",
    ],
  },
};

export default function InstructionScreen() {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <Instruction
        activityId={5}
        instruction={instructionData.instruction}
        image={require("../../../../assets/images/activityCards/circular-motion.png")}
        tools={instructionData.tools}
        formulas={instructionData.formulas}
        journeyParams={instructionData.journeyParams}
        predictionPath="/screens/humanPerformanceLab/PredictionScreen"
      />
    </SafeAreaView>
  );
}
