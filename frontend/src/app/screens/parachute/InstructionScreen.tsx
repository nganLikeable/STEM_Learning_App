import { parachuteActivity } from "@/lib/activityPhaseDescriptions";
import Instruction from "@/src/components/workflow/InstructionTemplate";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export const instructionData = {
  instruction: 
`Drop a toy from a set height, build a parachute, and see how much you can slow it down.
  What you'll do:
- Drop the toy without a parachute to record a baseline
- Build a parachute from provided materials
- Drop from the same height and compare the results
- Redesign and retest — up to 3 prototypes in 20 minutes
- Upload your videos, results, and team reflections`,

  tools: [
    "Mobile phone with STEMM Lab app",
    "Small toy (e.g. army toy soldier)",
    "Table or elevated surface",
    "Paper or plastic",
    "String",
    "Scissors",
    "Tape",
  ],

  formulas: ["Net Force = Weight − Drag Force", "g-force = Δv/t_contact ÷ 9.8", "Drag Force = Weight − Net Force"],
  journeyParams: {
    titles: parachuteActivity.phases.map((p) => p.title),
    descriptions: parachuteActivity.phases.map((p) => p.title),
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
        activityId={1}
        instruction={instructionData.instruction}
        title="Parachute Drop Challenge"
        subtitle="Engineering + Physics"
        emoji="🪂"
        tools={instructionData.tools}
        formulas={instructionData.formulas}
        journeyParams={instructionData.journeyParams}
        predictionPath="/screens/parachute/PredictionScreen"
      />
    </SafeAreaView>
  );
}
