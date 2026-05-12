import Instruction from "@/src/components/InstructionTemplate";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const instructionData = {
  instruction:
    "Investigate how the human body moves by measuring speed, smoothness, and coordination during controlled stretching activities. Hold the phone firmly in one hand and activate the vibration sensor. Perform guided movements slowly as shown in the app and record the vibration. Review speed, smoothness, and range-of-motion data.",

  tools: [
    "Mobile phone with STEMM Lab app",
    "Open space to move safely",
  ],

  diagramImage:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",

  diagramTitle: "Movement Patterns",

  legendItems: [
    { color: "#4C9BE8", label: "Smooth Movement" },
    { color: "#E84C7C", label: "Jerky Movement" },
  ],

  formulas: ["Vibration = Movement smoothness", "Speed vs Coordination", "Range of motion"],
  journeyParams: {
    titles: ['Phase 1', 'Phase 2', 'Phase 3'],
    descriptions: ['gi do', 'gi do', 'gi do'],
    pathIDs: [
      'dienPathVaoDay',
      'dienPathVaoDay',
      'dienPathVaoDay',
    ],
  }
};

export default function InstructionScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Instruction
        instruction={instructionData.instruction}
        title="Human Performance Lab"
        subtitle="Medical Science + Biomechanics"
        emoji="🏃"
        tools={instructionData.tools}
        diagramImage={instructionData.diagramImage}
        diagramTitle={instructionData.diagramTitle}
        legendItems={instructionData.legendItems}
        formulas={instructionData.formulas}
        journeyParams={instructionData.journeyParams}
      />
    </SafeAreaView>
  );
}
