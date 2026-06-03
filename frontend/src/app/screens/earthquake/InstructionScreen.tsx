import { useAppTheme } from "@/hooks/useAppTheme";
import { earthquakeActivity } from "@/lib/activityPhaseDescriptions";
import Instruction from "@/src/components/workflow/InstructionTemplate";
import { getActiveSession } from "@/src/services/session";
import { useTeamStore } from "@/src/store/team-store";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const instructionData = {
  instruction: `Build a structure that can survive a simulated earthquake — then improve it.
What you'll do:
- Fold paper or cardboard to create an anti-vibration base layer
- Place a flat cardboard platform on top
- Put the phone in the centre and activate vibration mode in the app
- Modify your structure (add pillars or folds) to reduce movement
- Redesign and retest — up to 3 prototypes`,

  tools: [
    "Cardboard",
    "Paper",
    "Scissors",
    "Sticky tape",
    "Plastic/paper cups",
    "Mobile phone with vibration sensor",
  ],

  formulas: [
    "Damping = fold count + pillar support",
    "Vibration absorption",
    "Structure stability",
  ],
  journeyParams: {
    titles: earthquakeActivity.phases.map((p) => p.title),
    descriptions: earthquakeActivity.phases.map((p) => p.title),
    pathIDs: [
      "/screens/earthquake/EarthquakeScreen?design=1",
      "/screens/earthquake/EarthquakeScreen?design=2",
      "/screens/earthquake/EarthquakeScreen?design=3",
    ],
  },
};

export default function InstructionScreen() {
  const { colors } = useAppTheme();
  const { teamId } = useTeamStore();

  const [journeyParams, setJourneyParams] = useState(
    instructionData.journeyParams,
  );

  useEffect(() => {
    const loadDesigns = async () => {
      if (!teamId) return;

      try {
        const activeSession = await getActiveSession(teamId);
        const savedDesigns = activeSession?.designs ?? [];

        if (savedDesigns.length === 3) {
          setJourneyParams({
            ...instructionData.journeyParams,
            titles: savedDesigns.map((d) => d.title.trim()),
          });
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadDesigns();
  }, [teamId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <Instruction
        activityId={4}
        instruction={instructionData.instruction}
        image={require("../../../../assets/images/activityCards/vibration-platform.png")}
        tools={instructionData.tools}
        formulas={instructionData.formulas}
        journeyParams={journeyParams}
        setupPath="/screens/earthquake/DesignInputScreen"
        predictionPath="/screens/earthquake/PredictionScreen"
      />
    </SafeAreaView>
  );
}
