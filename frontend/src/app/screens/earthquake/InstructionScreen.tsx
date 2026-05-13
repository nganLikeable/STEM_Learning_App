import Instruction from "@/src/components/InstructionTemplate";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const instructionData = {
  instruction:
    "Design structures that withstand vibration, simulating earthquakes. Build an anti-vibration layer by folding paper/cardboard. Place a flat cardboard platform on top. Place the phone in the center and activate vibration mode on the STEMM App. Modify the structure to reduce movement by adding more pillars or folds.",

  tools: [
    "Cardboard",
    "Paper",
    "Scissors",
    "Sticky tape",
    "Plastic/paper cups",
    "Mobile phone with vibration sensor",
  ],

  diagramImage:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",

  diagramTitle: "Vibration Damping Structure",

  legendItems: [
    { color: "#E87C4C", label: "Support Pillars" },
    { color: "#4CBF7C", label: "Damping Layer" },
  ],

  formulas: [
    "Damping = fold count + pillar support",
    "Vibration absorption",
    "Structure stability",
  ],
  journeyParams: {
    titles: ["Phase 1", "Phase 2", "Phase 3"],
    descriptions: ["gi do", "gi do", "gi do"],
    pathIDs: ["", "", ""],
  },
};

export default function InstructionScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Instruction
        instruction={instructionData.instruction}
        title="Earthquake-Resistant Structure"
        subtitle="Engineering + Earth Science"
        emoji="🌍"
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
