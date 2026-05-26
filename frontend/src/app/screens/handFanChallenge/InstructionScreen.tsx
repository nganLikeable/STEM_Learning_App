import Instruction from "@/src/components/workflow/InstructionTemplate";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const instructionData = {
  instruction:
    "Test how air movement affects flexible materials. Stand paper upright on a table. Fan air from 30 cm away and observe movement. Repeat with different fan designs and fan distances (15cm, 30cm, 45cm). Repeat with cardboard instead of paper.",

  tools: [
    "Paper and cardboard",
    "Scissors",
    "Mobile phone",
    "Sticky Tape",
    "STEMM Mobile App",
  ],

  diagramImage:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",

  diagramTitle: "Fan Force Diagram",

  legendItems: [
    { color: "#4C9BE8", label: "Air Force →" },
    { color: "#7C5CBF", label: "Material Stiffness" },
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
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Instruction
        activityId={3}
        instruction={instructionData.instruction}
        title="Hand Fan Challenge"
        subtitle="Physics – Air Movement"
        emoji="💨"
        tools={instructionData.tools}
        diagramImage={instructionData.diagramImage}
        diagramTitle={instructionData.diagramTitle}
        legendItems={instructionData.legendItems}
        formulas={instructionData.formulas}
        journeyParams={instructionData.journeyParams}
        predictionPath="/screens/handFanChallenge/PredictionScreen"
      />
    </SafeAreaView>
  );
}
