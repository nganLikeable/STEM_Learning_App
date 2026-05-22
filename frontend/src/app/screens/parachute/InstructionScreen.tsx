import Instruction from "@/src/components/InstructionTemplate";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const instructionData = {
  instruction:
    "Design, build, and test a parachute for a small toy to reduce its landing speed and impact force. Drop the toy without a parachute and record the fall as a baseline test. Build a parachute using provided materials. Drop the toy from the same height and record the fall. Review speed and landing accuracy results. Redesign and test up to three prototypes within 20 minutes. Upload videos, results, and team reflections.",

  tools: [
    "Mobile phone with STEMM Lab app",
    "Small toy (e.g. army toy soldier)",
    "Table or elevated surface",
    "Paper or plastic",
    "String",
    "Scissors",
    "Tape",
  ],

  diagramImage:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",

  diagramTitle: "Forces Acting on the Toy",

  legendItems: [
    { color: "#E84C7C", label: "Drag Force ↑" },
    { color: "#4C9BE8", label: "Weight ↓" },
  ],

  formulas: [
    "Net Force = Weight − Drag Force",
    "g-force = Δv/t_contact ÷ 9.8",
    "Drag Force = Weight − Net Force",
  ],
  journeyParams: {
    titles: ["Design 1", "Design 2", "Design 3"],
    descriptions: [
      "Without a parachute",
      "Use plastic with 4 strings tied to the toy",
      "Use plastic with 8 strings tied to the toy",
    ],
    pathIDs: [
      "/screens/parachute/VideoRecorderScreen",
      "/screens/parachute/VideoRecorderScreen",
      "/screens/parachute/VideoRecorderScreen",
    ],
  },
};

export default function InstructionScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Instruction
        instruction={instructionData.instruction}
        title="Parachute Drop Challenge"
        subtitle="Engineering + Physics"
        emoji="🪂"
        tools={instructionData.tools}
        diagramImage={instructionData.diagramImage}
        diagramTitle={instructionData.diagramTitle}
        legendItems={instructionData.legendItems}
        formulas={instructionData.formulas}
        journeyParams={instructionData.journeyParams}
        predictionPath="/screens/parachute/PredictionScreen"
      />
    </SafeAreaView>
  );
}
