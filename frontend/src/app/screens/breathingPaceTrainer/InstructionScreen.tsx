import Instruction from "@/src/components/InstructionTemplate";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const instructionData = {
  instruction:
    "Analyse breathing patterns at rest and after exercise. Place the phone gently on your chest and record your breathing at rest. Perform light exercise (jog one minute on the spot or do 100 star jumps). Record your breathing again and compare the results.",

  tools: ["Mobile phone with STEMM Lab app", "Flat surface or mat"],

  diagramImage:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",

  diagramTitle: "Breathing Rate Response",

  legendItems: [
    { color: "#4C9BE8", label: "Resting Rate" },
    { color: "#E84C7C", label: "After Exercise" },
  ],

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
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Instruction
        activityId={7}
        instruction={instructionData.instruction}
        title="Breathing Pace Trainer"
        subtitle="Medical Science"
        emoji="🫁"
        tools={instructionData.tools}
        diagramImage={instructionData.diagramImage}
        diagramTitle={instructionData.diagramTitle}
        legendItems={instructionData.legendItems}
        formulas={instructionData.formulas}
        journeyParams={instructionData.journeyParams}
        predictionPath="/screens/breathingPaceTrainer/PredictionScreen"
      />
    </SafeAreaView>
  );
}
