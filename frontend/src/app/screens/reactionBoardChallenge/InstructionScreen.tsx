import Instruction from "@/src/components/InstructionTemplate";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const instructionData = {
  instruction:
    "Measure reaction time, coordination, and improvement through digital and physical challenges. Phase 1: Tap the screen as quickly as the hidden button appears and record reaction time. Phase 2: Repeat using your non-dominant hand. Phase 3: Trace a moving shape on the screen and review accuracy and delay.",

  tools: ["Mobile phone with STEMM Lab app", "Clear working space"],

  diagramImage:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",

  diagramTitle: "Reaction Performance",

  legendItems: [
    { color: "#4CBF7C", label: "Dominant Hand" },
    { color: "#E87C4C", label: "Non-Dominant Hand" },
  ],

  formulas: [
    "Reaction Time (ms)",
    "Average Reaction: 200-300ms",
    "Coordination score",
  ],
  journeyParams: {
    titles: ["Phase 1", "Phase 2", "Phase 3"],
    descriptions: ["gi do", "gi do", "gi do"],
    pathIDs: [
      "/screens/reactionBoardChallenge/ReactionBoardGameScreen",
      "/screens/reactionBoardChallenge/ReactionBoardGameScreen",
      "/screens/reactionBoardChallenge/ReactionBoardGameScreen",
    ],
  },
};

export default function InstructionScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Instruction
        activityId={6}
        instruction={instructionData.instruction}
        title="Reaction Board Challenge"
        subtitle="Neuroscience + Mathematics"
        emoji="⚡"
        tools={instructionData.tools}
        diagramImage={instructionData.diagramImage}
        diagramTitle={instructionData.diagramTitle}
        legendItems={instructionData.legendItems}
        formulas={instructionData.formulas}
        journeyParams={instructionData.journeyParams}
        predictionPath="/screens/reactionBoardChallenge/PredictionScreen"
      />
    </SafeAreaView>
  );
}
