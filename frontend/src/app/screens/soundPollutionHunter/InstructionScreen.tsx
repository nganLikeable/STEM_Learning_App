import Instruction from "@/src/components/InstructionTemplate";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const instructionData = {
  instruction:
    "Measure and compare sound levels in different classroom activities. Measure noise from different actions (dropping objects, talking, walking, stamping your feet). Record sound levels and locations. Map loud and quiet zones.",

  tools: [
    "Mobile phone with STEMM Lab app",
  ],

  diagramImage:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",

  diagramTitle: "Sound Levels and Risk",

  legendItems: [
    { color: "#4CBF7C", label: "Safe (0-60 dB)" },
    { color: "#E8B44C", label: "Caution (60-85 dB)" },
    { color: "#E84C7C", label: "Harmful (85+ dB)" },
  ],

  formulas: ["Sound Level (dB)", "0-30 dB: Safe", "85-90 dB: Risk", "110+ dB: Severe damage"],
    journeyParams: {
    titles: ['Phase 1', 'Phase 2', 'Phase 3'],
    descriptions: ['gi do', 'gi do', 'gi do'],
    pathIDs: [
      '/screens/parachute/VideoRecorderScreen',
      '/screens/parachute/VideoRecorderScreen',
      '/screens/parachute/VideoRecorderScreen',
    ],
  }
};

export default function InstructionScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Instruction
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
      />
    </SafeAreaView>
  );
}
