import { useAppTheme } from "@/hooks/useAppTheme";
import Instruction from "@/src/components/workflow/InstructionTemplate";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const instructionData = {
  instruction:
`Find out how fan design and distance affect how much a material bends.
What you'll do:
- Stand paper upright on a table
- Fan air from 30 cm away and observe how it moves
- Try different fan designs and distances (15 cm, 30 cm, 45 cm)
- Swap paper for cardboard and repeat
- Record and compare your results each time`,

  tools: [
    "Paper and cardboard",
    "Scissors",
    "Mobile phone",
    "Sticky Tape",
    "STEMM Mobile App",
  ],

  formulas: [
    "F ≈ k · θ",
    "k = stiffness coefficient",
    "θ = bend angle (radians)",
  ],
  journeyParams: {
    titles: ["Phase 1", "Phase 2", "Phase 3"],
    descriptions: ["gi do", "gi do", "gi do"],
    pathIDs: [
      "/screens/handFanChallenge/HandFanTrackingScreen",
      "/screens/handFanChallenge/HandFanTrackingScreen",
      "/screens/handFanChallenge/HandFanTrackingScreen",
    ],
  },
};

export default function InstructionScreen() {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <Instruction
        activityId={3}
        instruction={instructionData.instruction}
        image={require("../../../../assets/images/activityCards/air-fan-experiment.png")}
        tools={instructionData.tools}
        formulas={instructionData.formulas}
        journeyParams={instructionData.journeyParams}
        predictionPath="/screens/handFanChallenge/PredictionScreen"
      />
    </SafeAreaView>
  );
}
