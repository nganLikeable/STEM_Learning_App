import Instruction from "@/src/components/InstructionTemplate";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const instructionData = {
  instruction:
    "Measure and compare sound levels in different classroom activities. Measure noise from different actions (dropping objects, talking, walking, stamping your feet). Record sound levels and locations. Map loud and quiet zones.",

  tools: ["Mobile phone with STEMM Lab app"],

  diagramImage:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",

  diagramTitle: "Sound Levels and Risk",

  legendItems: [
    { color: "#4CBF7C", label: "Safe (0-60 dB)" },
    { color: "#E8B44C", label: "Caution (60-85 dB)" },
    { color: "#E84C7C", label: "Harmful (85+ dB)" },
  ],

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
      "Phase 3: Drop a full filled of bottle of water on the table (20cm)",
    ],
    descriptions: [
      "Place the phone on the table, then gently drop a book from approximately 20cm near the phone to measure the sound dB level.",
      "Place the phone near the testing area, then drop a book from approximately 1 meter above the ground to record the sound dB level.",
      "Place the phone close to the table, then drop a full bottle of water from approximately 20cm onto the table to measure the sound dB level.",
    ],
    pathIDs: [
      "/SoundMeasureTrackingScreen",
      "/screens/soundPollutionHunter/SoundMeasureTrackingScreen",
      "/screens/soundPollutionHunter/SoundMeasureTrackingScreen",
    ],
  },
};

export default function InstructionScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Instruction
        activityId={2}
        instruction={instructionData.instruction}
        title="Sound Pollution Hunter"
        subtitle="Environmental Science"
        emoji="🔊"
        tools={instructionData.tools}
        diagramImage={instructionData.diagramImage}
        diagramTitle={instructionData.diagramTitle}
        legendItems={instructionData.legendItems}
        formulas={instructionData.formulas}
        journeyParams={instructionData.journeyParams}
        predictionPath="/screens/soundPollutionHunter/PredictionScreen"
      />
    </SafeAreaView>
  );
}
