import { useAppTheme } from "@/hooks/useAppTheme";
import Instruction from "@/src/components/workflow/InstructionTemplate";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const instructionData = {
  instruction:
`Hunt for loud and quiet zones in your classroom by measuring real sound levels.
  What you'll do:
- Drop a book from 20 cm onto the table and record the sound level
- Drop the same book from 1 m onto the floor and record again
- Drop a full water bottle from 20 cm onto the table
- Compare all three readings and see what's safe or harmful`,

  tools: ["Mobile phone with STEMM Lab app"],

  formulas: [
    "Sound Level (dB)",
    "0-30 dB: Safe",
    "85-90 dB: Risk",
    "110+ dB: Severe damage",
  ],
  journeyParams: {
    titles: [
      "Phase 1: Drop a book on the table (20cm)",
      "Phase 2: Drop a book on the ground (1m)",
      "Phase 3: Drop a bottle full of water on the table (20cm)",
    ],
    descriptions: [
      "Place the phone on the table, then gently drop a book from approximately 20cm near the phone to measure the sound dB level.",
      "Place the phone near the testing area, then drop a book from approximately 1 meter above the ground to record the sound dB level.",
      "Place the phone close to the table, then drop a full bottle of water from approximately 20cm onto the table to measure the sound dB level.",
    ],
    pathIDs: [
      "/screens/soundPollutionHunter/SoundMeasureTrackingScreen",
      "/screens/soundPollutionHunter/SoundMeasureTrackingScreen",
      "/screens/soundPollutionHunter/SoundMeasureTrackingScreen",
    ],
  },
};

export default function InstructionScreen() {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <Instruction
        activityId={2}
        instruction={instructionData.instruction}
        title="Sound Pollution Hunter"
        subtitle="Environmental Science"
        emoji="🔊"
        tools={instructionData.tools}
        formulas={instructionData.formulas}
        journeyParams={instructionData.journeyParams}
        predictionPath="/screens/soundPollutionHunter/PredictionScreen"
      />
    </SafeAreaView>
  );
}
