import { useAppTheme } from "@/hooks/useAppTheme";
import Instruction from "@/src/components/workflow/InstructionTemplate";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const instructionData = {
  instruction:
`Test how fast your brain and body respond — and see if switching hands makes a difference.
  What you'll do:
- Tap the screen as fast as you can when the hidden button appears (dominant hand)
- Repeat the same test using your non-dominant hand
- Trace a moving shape on the screen and review your accuracy and delay
- Compare all three rounds to see how you improve`,

  tools: ["Mobile phone with STEMM Lab app", "Clear working space"],

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
  const { colors } = useAppTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <Instruction
        activityId={6}
        instruction={instructionData.instruction}
        image={require("../../../../assets/images/activityCards/reaction-time.png")}
        tools={instructionData.tools}
        formulas={instructionData.formulas}
        journeyParams={instructionData.journeyParams}
        predictionPath="/screens/reactionBoardChallenge/PredictionScreen"
      />
    </SafeAreaView>
  );
}
